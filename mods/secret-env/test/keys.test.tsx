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

test('changing the file after a warning checks the new file before saving', async ($, on) => {
  const w = world(on, { files: { ...FILES, '.gitignore': 'node_modules\n' }, store: STORED, ignored: ['.env', '.env.local'] })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  await $.command.run(SLASH)

  const ui = await $.ui.mount(PANE)
  await ui.press({ key: 'add' })
  await ui.input({ key: 'name', text: 'OPENAI_API_KEY', kind: 'change' })
  await ui.input({ key: 'value', text: 'sk-proj-new77', kind: 'change' })
  await ui.press({ key: 'save' })
  expect((await ui.find({ type: 'Button', key: 'save' }))?.text).toBe('새 값으로 바꾸기')

  await ui.input({ key: 'file', text: '.env.prod', kind: 'change' })
  await ui.press({ key: 'save' })

  expect(w.files.get(`${ROOT}/.env.prod`)).toBe(undefined)
  expect((await ui.find({ type: 'Button', key: 'save' }))?.text).toBe('.gitignore에 추가하고 저장')
  await ui.unmount()
})

test('the list draws on the terminal, desktop, and VS Code alike', async ($, on) => {
  world(on, { files: FILES, store: STORED })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  await $.command.run(SLASH)

  for (const surface of ['terminal', 'desktop', 'vscode'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Text', text: /STRIPE_SECRET_KEY/ })).toBeDefined()
    expect(await ui.find({ type: 'Button', key: 'delete:.env.local:STRIPE_SECRET_KEY' })).toBeDefined()
    await ui.unmount()
  }
})

test('running /secret-env again returns to the list even if an add form was left open', async ($, on) => {
  world(on, { files: FILES, store: STORED })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  await $.command.run(SLASH)
  const first = await $.ui.mount(PANE)
  await first.press({ key: 'add' })
  await first.unmount()

  await $.command.run(SLASH)
  const again = await $.ui.mount(PANE)
  expect(await again.find({ type: 'Button', key: 'add' })).toBeDefined()
  await again.unmount()
})

test('a key whose file cannot be read stays listed and hidden, and the pane says why', async ($, on) => {
  const w = world(on, { files: FILES, store: STORED })
  on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'sk-proj-9xQ2wL', stderr: '', interrupted: false } }))
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  await $.command.run(SLASH)
  const ui = await $.ui.mount(PANE)

  // The file turns unreadable after the session loaded its value.
  w.unreadable.add('.env')
  await ui.press({ key: 'delete:.env:OPENAI_API_KEY' })
  await ui.press({ key: 'confirm-delete' })

  expect(w.files.get(`${ROOT}/.env`)).toBe(FILES['.env'])
  const drawn = JSON.stringify(await ui.drawn())
  expect(drawn).toContain('OPENAI_API_KEY')
  expect(drawn).toContain('지우지 못했습니다')
  const ran = await $.tool.call({ tool: 'Bash', command: 'cat .env' })
  expect((ran.result as { stdout: string }).stdout).toBe('[hidden]')
  await ui.unmount()
})
