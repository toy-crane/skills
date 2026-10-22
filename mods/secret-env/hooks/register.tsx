import { atom, read, update } from 'claude-code'
import type { EngineInterface as Engine, Register } from 'claude-code'

import type { Form, ManagedKey, Saved } from '../types'
import { encodeValue, readValue, removeKey, upsertKey } from './dotenv'
import { MIN_LENGTH, scrub } from './scrub'

const PANE = 'secret-env'
const TOOL = 'request_secret'
const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/
const ENV_FILE = /^(?!\/)(?!.*(^|\/)\.\.(\/|$))(.*\/)?\.env[^/]*$/

const formAtom = atom({ plugin: 'secret-env', key: 'form' } as const, null as Form | null)
const savedAtom = atom({ plugin: 'secret-env', key: 'saved' } as const, null as Saved | null)
const keysAtom = atom({ plugin: 'secret-env', key: 'keys' } as const, [] as ManagedKey[])
const deletingAtom = atom({ plugin: 'secret-env', key: 'deleting' } as const, null as string | null)

let root = ''
let keys: ManagedKey[] = []
let secrets: string[] = []
// What is typed in the pane lives only in these, never in session state.
let draft = ''
let draftName = ''
let draftFile = '.env'
let outcome: 'saved' | 'cancelled' | undefined
let isWaiting = false

// Read through a call so the wait loop's narrowing does not stick to the variable.
const outcomeNow = () => outcome

const keyId = (key: { file: string; name: string }) => `${key.file}:${key.name}`

async function readText($: Engine, path: string): Promise<string | undefined> {
  return $.fs.read(path).catch(() => undefined)
}

async function loadSecrets($: Engine) {
  const values: string[] = []
  for (const key of keys) {
    const text = await readText($, `${root}/${key.file}`)
    const value = text === undefined ? undefined : readValue(text, key.name)
    // The file may spell the value quoted and escaped; hide that spelling as well.
    if (value !== undefined) values.push(value, encodeValue(value))
  }
  secrets = values
}

async function setKeys($: Engine, next: ManagedKey[]) {
  keys = next
  await $.store.set(`keys:${root}`, keys)
  await update($, keysAtom, () => keys)
}

// Whether git would commit the file (exit 1 from check-ignore), and whether the name is already set.
async function conflictsOf($: Engine, name: string, file: string) {
  const check = await $.process
    .run(['git', 'check-ignore', '-q', file], { cwd: root })
    .catch(() => undefined)
  const text = await readText($, `${root}/${file}`)
  return {
    isUnignored: check?.exitCode === 1,
    exists: text !== undefined && readValue(text, name) !== undefined,
  }
}

async function addToGitignore($: Engine, file: string) {
  const path = `${root}/.gitignore`
  const text = (await readText($, path)) ?? ''
  const head = text === '' || text.endsWith('\n') ? text : `${text}\n`
  await $.fs.write(path, `${head}${file}\n`)
}

async function writeKey($: Engine, form: Form, value: string) {
  if (form.isUnignored) await addToGitignore($, form.file)
  const path = `${root}/${form.file}`
  await $.fs.write(path, upsertKey((await readText($, path)) ?? '', form.name, value))
  await setKeys($, [
    ...keys.filter(key => keyId(key) !== keyId(form)),
    { name: form.name, file: form.file, savedAt: await $.clock.now() },
  ])
  await loadSecrets($)
}

async function deleteKey($: Engine, id: string) {
  const key = keys.find(one => keyId(one) === id)
  if (key === undefined) return
  const path = `${root}/${key.file}`
  const text = await readText($, path)
  if (text !== undefined) await $.fs.write(path, removeKey(text, key.name))
  await setKeys($, keys.filter(one => one !== key))
  await loadSecrets($)
}

// The managed key names kept in the file at `path`, absolute or relative to the project.
function managedIn(path: string): string[] {
  const absolute = path.startsWith('/') ? path : `${root}/${path}`
  return keys.filter(key => `${root}/${key.file}` === absolute).map(key => key.name)
}

function saveLabel(form: Form): string {
  if (form.isUnignored) return form.exists ? '.gitignore에 추가하고 바꾸기' : '.gitignore에 추가하고 저장'
  return form.exists ? '새 값으로 바꾸기' : '저장'
}

function savedWhen(ms: number): string {
  const at = new Date(ms)
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`
}

function refusal(name: string, file: string): string | undefined {
  if (!NAME.test(name)) return `${name} is not a valid environment variable name.`
  if (!ENV_FILE.test(file)) return `${file} must be a .env file inside the project, such as .env or .env.local.`
  return undefined
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    root = await $.session.root()
    keys = ((await $.store.get(`keys:${root}`)) as ManagedKey[] | undefined) ?? []
    await update($, keysAtom, () => keys)
    await loadSecrets($)
    await $.command.register({
      name: 'secret-env',
      description: 'List, add, or delete the secret keys Claude cannot see',
    })
    await $.tool.register({
      name: TOOL,
      description:
        'Ask the user to type a secret (API key, token) into a pane beside the chat. The value is written to the given .env file and never shown to you; refer to it by its variable name. Waits until the user saves or cancels.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Environment variable name, e.g. STRIPE_SECRET_KEY' },
          purpose: { type: 'string', description: 'What the key is for, shown to the user' },
          file: {
            type: 'string',
            description: 'The .env file relative to the project root that the app reads, e.g. .env.local',
          },
        },
        required: ['name', 'purpose', 'file'],
      },
      isDeferred: false,
    })
    return next(e)
  })

  on('command.run', { command: 'secret-env' }, async $ => {
    await update($, savedAtom, () => null)
    await update($, deletingAtom, () => null)
    if (!isWaiting) await update($, formAtom, () => null)
    await $.ui.open({ id: PANE, title: '비밀 키', focus: true })
    return { text: '비밀 키 패널을 열었습니다.' }
  })

  on('tool.call', { tool: 'mcp__secret-env__request_secret' }, async ($, e, next) => {
    const input = e as unknown as { name: string; purpose: string; file: string }
    const refused = refusal(input.name, input.file)
    if (refused !== undefined) return { result: refused }
    if (isWaiting) return { result: 'Another key request is still open in the pane; wait for it first.' }

    isWaiting = true
    draft = ''
    outcome = undefined
    try {
      const conflicts = await conflictsOf($, input.name, input.file)
      await update($, savedAtom, () => null)
      const asked: Form = { source: 'claude', name: input.name, file: input.file, purpose: input.purpose, ...conflicts }
      await update($, formAtom, () => asked)
      await $.ui.open({ id: PANE, title: '비밀 키 입력', focus: true })
      // Each sleep is a $ call, so the wait does not spend the hook's own time budget.
      while (outcome === undefined && !next.signal.aborted) {
        await $.process.run(['/bin/sleep', '0.3'])
      }
    } finally {
      isWaiting = false
      draft = ''
      if (outcome === undefined) {
        outcome = 'cancelled'
        await update($, formAtom, () => null)
        await $.ui.close({ id: PANE })
      }
    }
    const ended = outcomeNow()
    return {
      result:
        ended === 'saved'
          ? `The user saved ${input.name} to ${input.file}. Its value is hidden from you; use it by name.`
          : `The user cancelled entering ${input.name}.`,
    }
  })

  // Claude never knows a managed value, so any rewrite of its line would destroy it.
  on('tool.call', { tool: 'Write' }, ($, e, next) => {
    const guarded = managedIn(e.file_path)
    return guarded.length > 0
      ? { deny: `${e.file_path} holds ${guarded.join(', ')}, which only the user can change. Use Edit on other lines.` }
      : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'secret-env could not check this file.' }))

  on('tool.call', { tool: 'Edit' }, ($, e, next) => {
    const touched = managedIn(e.file_path).filter(name => {
      const line = new RegExp(`(^|\\n)\\s*(export\\s+)?${name}\\s*=`)
      return line.test(e.old_string) || line.test(e.new_string)
    })
    return touched.length > 0
      ? { deny: `${touched.join(', ')} can only be changed by the user. Ask them to run /secret-env.` }
      : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'secret-env could not check this edit.' }))

  // Every tool result, from the main loop or a subagent, passes here on its way to the model.
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined) return ran
    return { ...ran, result: scrub(ran.result, secrets), text: scrub(ran.text, secrets) }
  }).catch(($, e, next) =>
    // Fail closed: a result that could not be scrubbed is withheld, never passed on.
    next.called ? { deny: 'secret-env could not hide secrets in this result, so it was withheld.' } : next(e),
  )

  on('ui.close', { id: PANE }, async ($, e, next) => {
    if (isWaiting && outcome === undefined) {
      outcome = 'cancelled'
      await update($, formAtom, () => null)
    }
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const elements = $.ui.resolve(e)
    const { Box, Text, Button } = elements
    // The phone surface has no text field, so keys are entered elsewhere.
    const Input = e.surface !== 'mobile' && 'Input' in elements ? elements.Input : undefined
    const form = await read($, formAtom)
    const saved = await read($, savedAtom)

    if (form !== null && Input === undefined) {
      return (
        <Text>
          {form.name} 입력은 이 화면에서 할 수 없습니다. 데스크톱 앱이나 터미널에서 이 패널을 열어 주세요.
        </Text>
      )
    }

    if (form !== null && Input !== undefined) {
      const save = async () => {
        const current = { ...form, ...(form.source === 'user' ? { name: draftName.trim(), file: draftFile.trim() } : {}) }
        const missing =
          current.name === ''
            ? '키 이름을 입력해 주세요.'
            : draft === ''
              ? '값을 입력해 주세요.'
              : draft.length < MIN_LENGTH
                ? `값은 ${MIN_LENGTH}자 이상이어야 가릴 수 있습니다.`
                : undefined
        const invalid = missing ?? (refusal(current.name, current.file) && '키 이름이나 저장 위치가 올바르지 않습니다.')
        if (invalid) {
          await update($, formAtom, () => ({ ...form, error: invalid }))
          return
        }
        const target = keyId(current)
        if (current.source === 'user' && current.checked !== target) {
          const conflicts = await conflictsOf($, current.name, current.file)
          if (conflicts.isUnignored || conflicts.exists) {
            await update($, formAtom, () => ({ ...current, ...conflicts, checked: target, error: undefined }))
            return
          }
          Object.assign(current, conflicts)
        }
        await writeKey($, current, draft)
        draft = ''
        await update($, formAtom, () => null)
        if (current.source === 'claude') {
          outcome = 'saved'
          await update($, savedAtom, () => ({ name: current.name, file: current.file }))
        }
      }

      const cancel = async () => {
        draft = ''
        await update($, formAtom, () => null)
        if (form.source === 'claude') {
          outcome = 'cancelled'
          await $.ui.close({ id: PANE })
        }
      }

      return (
        <Box flexDirection="column" gap={1}>
          {form.source === 'claude' ? (
            <Box flexDirection="column">
              <Text>키 이름  {form.name}</Text>
              {form.purpose !== undefined && <Text>용도  {form.purpose}</Text>}
              <Text>저장 위치  {form.file}</Text>
            </Box>
          ) : (
            <Box flexDirection="column" gap={1}>
              <Input key="name" label="키 이름" placeholder="OPENAI_API_KEY" value={draftName} onInput={(v: string) => (draftName = v)} onSubmit={save} />
              <Input key="file" label="저장 위치" value={draftFile} onInput={(v: string) => (draftFile = v)} onSubmit={save} />
            </Box>
          )}
          <Input key="value" label="값" autoFocus value={draft} onInput={(v: string) => (draft = v)} onSubmit={save} />
          <Text dimColor>Claude에게는 전달되지 않습니다.</Text>
          {form.isUnignored && (
            <Text>{form.file}이 .gitignore에 없습니다. 이대로 저장하면 키가 커밋될 수 있습니다.</Text>
          )}
          {form.exists && <Text>{form.file}에 {form.name}가 이미 있습니다. 저장하면 새 값으로 바뀝니다.</Text>}
          {form.error !== undefined && <Text>{form.error}</Text>}
          <Box flexDirection="row" gap={1}>
            <Button key="save" label={saveLabel(form)} variant="primary" onPress={save} />
            <Button key="cancel" label="취소" onPress={cancel} />
          </Box>
        </Box>
      )
    }

    if (saved !== null) {
      return (
        <Box flexDirection="column" gap={1}>
          <Text>{saved.name}를 {saved.file}에 저장했습니다.</Text>
          <Text dimColor>Claude가 보는 모든 도구 결과에서 이 값은 [hidden]으로 바뀝니다.</Text>
          <Button key="close" label="닫기" onPress={() => $.ui.close({ id: PANE })} />
        </Box>
      )
    }

    const list = await read($, keysAtom)
    const deleting = await read($, deletingAtom)
    const startAdding = async () => {
      draft = ''
      draftName = ''
      draftFile = '.env'
      await update($, formAtom, () => ({ source: 'user', name: '', file: '.env', isUnignored: false, exists: false }))
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Text dimColor>이 프로젝트에서 관리하는 키입니다. 값은 여기서도 보여 주지 않습니다.</Text>
        {list.length === 0 && (
          <Text dimColor>아직 저장한 키가 없습니다. 새 키를 추가하거나, Claude가 요청할 때 입력하면 여기에 나타납니다.</Text>
        )}
        {list.map(key => (
          <Box flexDirection="column">
            <Box flexDirection="row" gap={1}>
              <Text bold>{key.name}</Text>
              <Text dimColor>
                {key.file} · {savedWhen(key.savedAt)}
              </Text>
              <Button key={`delete:${keyId(key)}`} label="삭제" onPress={() => update($, deletingAtom, () => keyId(key))} />
            </Box>
            {deleting === keyId(key) && (
              <Box flexDirection="row" gap={1}>
                <Text>{key.file}에서 지웁니다.</Text>
                <Button
                  key="confirm-delete"
                  label="지우기"
                  variant="primary"
                  onPress={async () => {
                    await deleteKey($, keyId(key))
                    await update($, deletingAtom, () => null)
                  }}
                />
                <Button key="cancel-delete" label="취소" onPress={() => update($, deletingAtom, () => null)} />
              </Box>
            )}
          </Box>
        ))}
        <Button key="add" label="새 키 추가" variant="primary" onPress={startAdding} />
      </Box>
    )
  })
}
