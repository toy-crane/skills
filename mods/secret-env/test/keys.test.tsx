import { expect, test } from 'claude-code/testing'

import { PANE, ROOT, world } from './world'

const SLASH = {
  command: 'secret-env',
  args: '',
  origin: { kind: 'composer' },
  presentation: { isFullscreen: false, columns: 120 },
} as const

const STORED = {
  [`keys:${ROOT}`]: [
    { name: 'STRIPE_SECRET_KEY', file: '.env.local', savedAt: 1792647120000 },
    { name: 'OPENAI_API_KEY', file: '.env', savedAt: 1792281600000 },
  ],
}
const FILES = {
  '.env.local': 'STRIPE_SECRET_KEY=sk_test_51Q8xK2LmZq\n',
  '.env': 'DEBUG=1\nOPENAI_API_KEY=sk-proj-9xQ2wL\n',
}

test('/secret-env lists each key by name and file without its value', async ($, on) => {
  const w = world(on, { files: FILES, store: STORED })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  await $.command.run(SLASH)
  expect(w.opened).toContain('secret-env')

  const ui = await $.ui.mount(PANE)
  const drawn = JSON.stringify(await ui.drawn())
  expect(drawn).toContain('STRIPE_SECRET_KEY')
  expect(drawn).toContain('.env.local')
  expect(drawn).toContain('OPENAI_API_KEY')
  expect(drawn).not.toContain('sk_test_51Q8xK2LmZq')
  expect(drawn).not.toContain('sk-proj-9xQ2wL')
  await ui.unmount()
})

test('deleting a key asks once, removes its line, and stops hiding it', async ($, on) => {
  const w = world(on, { files: FILES, store: STORED })
  on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'sk-proj-9xQ2wL', stderr: '', interrupted: false } }))
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  await $.command.run(SLASH)

  const ui = await $.ui.mount(PANE)
  await ui.press({ key: 'delete:.env:OPENAI_API_KEY' })
  expect(w.files.get(`${ROOT}/.env`)).toBe(FILES['.env'])
  await ui.press({ key: 'confirm-delete' })

  expect(w.files.get(`${ROOT}/.env`)).toBe('DEBUG=1\n')
  expect(JSON.stringify(await ui.drawn())).not.toContain('OPENAI_API_KEY')
  const ran = await $.tool.call({ tool: 'Bash', command: 'cat .env' })
  expect((ran.result as { stdout: string }).stdout).toBe('sk-proj-9xQ2wL')
  await ui.unmount()
})

test('a key added from the list is saved to the chosen file and listed', async ($, on) => {
  const w = world(on, { files: FILES, store: STORED })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  await $.command.run(SLASH)

  const ui = await $.ui.mount(PANE)
  await ui.press({ key: 'add' })
  await ui.input({ key: 'name', text: 'RESEND_API_KEY', kind: 'change' })
  await ui.input({ key: 'value', text: 're_9fK2LmZq', kind: 'change' })
  await ui.press({ key: 'save' })

  expect(w.files.get(`${ROOT}/.env`)).toBe('DEBUG=1\nOPENAI_API_KEY=sk-proj-9xQ2wL\nRESEND_API_KEY=re_9fK2LmZq\n')
  const drawn = JSON.stringify(await ui.drawn())
  expect(drawn).toContain('RESEND_API_KEY')
  expect(drawn).not.toContain('re_9fK2LmZq')
  await ui.unmount()
})

test('a key added to a file git would commit is saved only after confirming the .gitignore change', async ($, on) => {
  const w = world(on, { files: { ...FILES, '.gitignore': 'node_modules\n' }, store: STORED, ignored: [] })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  await $.command.run(SLASH)

  const ui = await $.ui.mount(PANE)
  await ui.press({ key: 'add' })
  await ui.input({ key: 'name', text: 'RESEND_API_KEY', kind: 'change' })
  await ui.input({ key: 'value', text: 're_9fK2LmZq', kind: 'change' })
  await ui.press({ key: 'save' })

  expect(w.files.get(`${ROOT}/.env`)).toBe(FILES['.env'])
  expect((await ui.find({ type: 'Button', key: 'save' }))?.text).toBe('.gitignore에 추가하고 저장')
  await ui.press({ key: 'save' })

  expect(w.files.get(`${ROOT}/.gitignore`)).toBe('node_modules\n.env\n')
  expect(w.files.get(`${ROOT}/.env`)).toContain('RESEND_API_KEY=re_9fK2LmZq')
  await ui.unmount()
})

test('with no saved keys the list says how to add the first one', async ($, on) => {
  world(on)
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  await $.command.run(SLASH)

  const ui = await $.ui.mount(PANE)
  expect(await ui.find({ type: 'Text', text: /아직 저장한 키가 없습니다/ })).toBeDefined()
  await ui.unmount()
})
