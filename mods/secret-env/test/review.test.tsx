import { expect, test } from 'claude-code/testing'

import { PANE, ROOT, until, world } from './world'

const ASK = { tool: 'mcp__secret-env__request_secret', name: 'STRIPE_SECRET_KEY', purpose: 'Stripe 테스트 결제 호출' } as const
const STORED = { [`keys:${ROOT}`]: [{ name: 'STRIPE_SECRET_KEY', file: '.env.local', savedAt: 1792647120000 }] }
const FILES = { '.env.local': 'STRIPE_SECRET_KEY=sk_test_51Q8xK2LmZq\n' }

test('a target whose name gitignore would read as a comment is escaped and then really ignored', async ($, on) => {
  const w = world(on, { files: { '.gitignore': 'node_modules\n' }, ignored: [] })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call({ ...ASK, file: '#private/.env' })
  await until(() => w.opened.includes('secret-env'))
  const ui = await $.ui.mount(PANE)
  await ui.input({ key: 'value', text: 'sk_test_51Q8xK2LmZq', kind: 'change' })
  await ui.press({ key: 'save' })
  await asked

  expect(w.files.get(`${ROOT}/.gitignore`)).toBe('node_modules\n\\#private/.env\n')
  expect(w.files.get(`${ROOT}/#private/.env`)).toBe('STRIPE_SECRET_KEY=sk_test_51Q8xK2LmZq\n')
  await ui.unmount()
})

test('saving stops when the new .gitignore line still does not cover the file', async ($, on) => {
  const w = world(on, { files: { '.gitignore': '' }, ignored: [], stubborn: ['.env.local'] })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call({ ...ASK, file: '.env.local' })
  await until(() => w.opened.includes('secret-env'))
  const ui = await $.ui.mount(PANE)
  await ui.input({ key: 'value', text: 'sk_test_51Q8xK2LmZq', kind: 'change' })
  await ui.press({ key: 'save' })

  expect(w.files.get(`${ROOT}/.env.local`)).toBe(undefined)
  expect(await ui.find({ type: 'Text', text: /저장하지 못했습니다/ })).toBeDefined()
  await ui.press({ key: 'cancel' })
  await asked
  await ui.unmount()
})

test('while a managed file cannot be read, tool results are withheld rather than passed unhidden', async ($, on) => {
  const w = world(on, { files: FILES, store: STORED })
  w.unreadable.add('.env.local')
  on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'sk_test_51Q8xK2LmZq', stderr: '', interrupted: false } }))
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const blocked = await $.tool.call({ tool: 'Bash', command: 'cat .env.local' })
  expect(blocked.deny).toContain('.env.local')

  w.unreadable.delete('.env.local')
  const later = await $.tool.call({ tool: 'Bash', command: 'cat .env.local' })
  expect((later.result as { stdout: string }).stdout).toBe('[hidden]')
})

test('on Windows the request waits with a command Windows has', async ($, on) => {
  const w = world(on, { files: { '.env.local': '' }, env: { OS: 'Windows_NT' } })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call({ ...ASK, file: '.env.local' })
  await until(() => w.ran.some(argv => argv[0] === 'powershell'))
  const ui = await $.ui.mount(PANE)
  await ui.press({ key: 'cancel' })
  await asked

  expect(w.ran.some(argv => argv[0] === '/bin/sleep')).toBe(false)
  await ui.unmount()
})

test('Write is refused for a managed file named through ./ or a symbolic link', async ($, on) => {
  world(on, { files: FILES, store: STORED, links: { '/work/link-to-shop/.env.local': `${ROOT}/.env.local` } })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const dotted = await $.tool.call({ tool: 'Write', file_path: `${ROOT}/./.env.local`, content: 'X=1\n' })
  const linked = await $.tool.call({ tool: 'Write', file_path: '/work/link-to-shop/.env.local', content: 'X=1\n' })

  expect(dotted.deny).toContain('STRIPE_SECRET_KEY')
  expect(linked.deny).toContain('STRIPE_SECRET_KEY')
})

test('a target using backslashes or a drive letter is refused', async ($, on) => {
  const w = world(on)
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const back = await $.tool.call({ ...ASK, file: '.env\\..\\..\\outside.txt' })
  const drive = await $.tool.call({ ...ASK, file: 'C:\\other\\.env' })

  expect(back.result).toContain('must be a .env file inside the project')
  expect(drive.result).toContain('must be a .env file inside the project')
  expect(w.opened).toEqual([])
})

test('an Edit that renames a managed key without touching its = is refused', async ($, on) => {
  world(on, { files: FILES, store: STORED })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const renamed = await $.tool.call({
    tool: 'Edit',
    file_path: `${ROOT}/.env.local`,
    old_string: 'STRIPE_SECRET_KEY',
    new_string: 'RENAMED_KEY',
  })

  expect(renamed.deny).toContain('STRIPE_SECRET_KEY')
})

test('a saved value stays hidden this session even when recording its name fails', async ($, on) => {
  const w = world(on, { files: { '.env.local': '' }, isStoreBroken: true })
  on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'sk_live_9fK2xQ', stderr: '', interrupted: false } }))
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call({ ...ASK, file: '.env.local' })
  await until(() => w.opened.includes('secret-env'))
  const ui = await $.ui.mount(PANE)
  await ui.input({ key: 'value', text: 'sk_live_9fK2xQ', kind: 'change' })
  await ui.press({ key: 'save' })
  await ui.press({ key: 'cancel' })
  await asked

  const ran = await $.tool.call({ tool: 'Bash', command: 'cat .env.local' })
  expect((ran.result as { stdout: string }).stdout).toBe('[hidden]')
  await ui.unmount()
})
