import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Form, ManagedKey, Saved } from '../types'
import { readValue, upsertKey } from './dotenv'
import { scrub } from './scrub'

const PANE = 'secret-env'
const TOOL = 'request_secret'
const formAtom = atom({ plugin: 'secret-env', key: 'form' } as const, null as Form | null)
const savedAtom = atom({ plugin: 'secret-env', key: 'saved' } as const, null as Saved | null)

let root = ''
let keys: ManagedKey[] = []
let secrets: string[] = []
// The value being typed lives only here, never in session state.
let draft = ''
let outcome: 'saved' | 'cancelled' | undefined

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    root = await $.session.root()
    keys = ((await $.store.get(`keys:${root}`)) as ManagedKey[] | undefined) ?? []
    secrets = []
    for (const key of keys) {
      const value = readValue(await $.fs.read(`${root}/${key.file}`), key.name)
      if (value !== undefined) secrets.push(value)
    }
    await $.tool.register({
      name: TOOL,
      description:
        'Ask the user to type a secret (API key, token) into a pane. The value is written to the given .env file and is never shown to you; refer to it by name. Waits until the user saves or cancels.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Environment variable name, e.g. STRIPE_SECRET_KEY' },
          purpose: { type: 'string', description: 'What the key is for, shown to the user' },
          file: { type: 'string', description: 'The .env file relative to the project root, e.g. .env.local' },
        },
        required: ['name', 'purpose', 'file'],
      },
      isDeferred: false,
    })
    return next(e)
  })

  on('tool.call', { tool: `mcp__secret-env__${TOOL}` }, async ($, e, next) => {
    const input = e as unknown as { name: string; purpose: string; file: string }
    draft = ''
    outcome = undefined
    await update($, savedAtom, () => null)
    await update($, formAtom, () => ({
      source: 'claude',
      name: input.name,
      file: input.file,
      purpose: input.purpose,
      isUnignored: false,
      exists: false,
    }))
    await $.ui.open({ id: PANE, title: '비밀 키 입력', focus: true })
    while (outcome === undefined && !next.signal.aborted) {
      await $.process.run(['/bin/sleep', '0.3'])
    }
    return {
      result:
        outcome === 'saved'
          ? `The user saved ${input.name} to ${input.file}. Its value is hidden from you; use it by name.`
          : `The user cancelled entering ${input.name}.`,
    }
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined) return ran
    return { ...ran, result: scrub(ran.result, secrets), text: scrub(ran.text, secrets) }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Input, Button } = $.ui.resolve(e)
    const form = await read($, formAtom)
    if (form === null) return <Text dimColor>관리 중인 키가 없습니다.</Text>

    const save = async () => {
      const path = `${root}/${form.file}`
      const before = await $.fs.read(path).catch(() => '')
      await $.fs.write(path, upsertKey(before, form.name, draft))
      secrets.push(draft)
      draft = ''
      outcome = 'saved'
      await update($, formAtom, () => null)
      await update($, savedAtom, () => ({ name: form.name, file: form.file }))
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text>키 이름  {form.name}</Text>
          {form.purpose !== undefined && <Text>용도  {form.purpose}</Text>}
          <Text>저장 위치  {form.file}</Text>
        </Box>
        <Input key="value" label="값" value={draft} onInput={value => (draft = value)} onSubmit={() => void save()} />
        <Text dimColor>Claude에게는 전달되지 않습니다.</Text>
        <Box flexDirection="row" gap={1}>
          <Button key="save" label="저장" variant="primary" onPress={() => void save()} />
        </Box>
      </Box>
    )
  })
}
