import { expect, test } from 'claude-code/testing'

import { PANE, ROOT, until, world } from './world'

const REQUEST = {
  tool: 'mcp__secret-env__request_secret',
  name: 'STRIPE_SECRET_KEY',
  purpose: 'Stripe 테스트 결제 호출',
  file: '.env.local',
} as const

test('a key Claude asks for is typed in the pane, saved to the file, and never returned', async ($, on) => {
  const w = world(on, { files: { '.env.local': 'NEXT_PUBLIC_URL=http://localhost:3000\n' } })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call(REQUEST)
  await until(() => w.opened.includes('secret-env'))

  const ui = await $.ui.mount(PANE)
  expect((await ui.find({ type: 'Text', text: /Stripe 테스트 결제 호출/ }))).toBeDefined()
  await ui.input({ key: 'value', text: 'sk_test_51Q8xK2LmZq', kind: 'change' })
  await ui.press({ key: 'save' })
  const ran = await asked

  expect(w.files.get(`${ROOT}/.env.local`)).toBe(
    'NEXT_PUBLIC_URL=http://localhost:3000\nSTRIPE_SECRET_KEY=sk_test_51Q8xK2LmZq\n',
  )
  expect(JSON.stringify(ran)).not.toContain('sk_test_51Q8xK2LmZq')
  expect(ran.result).toContain('STRIPE_SECRET_KEY')
  expect(ran.result).toContain('.env.local')
  await ui.unmount()
})

test('cancelling leaves the file untouched and tells Claude only that it was cancelled', async ($, on) => {
  const w = world(on, { files: { '.env.local': 'DEBUG=1\n' } })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call(REQUEST)
  await until(() => w.opened.includes('secret-env'))
  const ui = await $.ui.mount(PANE)
  await ui.input({ key: 'value', text: 'sk_test_typed_then_cancelled', kind: 'change' })
  await ui.press({ key: 'cancel' })
  const ran = await asked

  expect(w.files.get(`${ROOT}/.env.local`)).toBe('DEBUG=1\n')
  expect(ran.result).toBe('The user cancelled entering STRIPE_SECRET_KEY.')
  expect(w.closed).toContain('secret-env')
  await ui.unmount()
})

test('a value saved through the pane is hidden from the next tool result and remembered by name', async ($, on) => {
  const w = world(on, { files: { '.env.local': '' } })
  on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'key=sk_live_9fK2xQ', stderr: '', interrupted: false } }))
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call(REQUEST)
  await until(() => w.opened.includes('secret-env'))
  const ui = await $.ui.mount(PANE)
  await ui.input({ key: 'value', text: 'sk_live_9fK2xQ', kind: 'change' })
  await ui.press({ key: 'save' })
  await asked

  const ran = await $.tool.call({ tool: 'Bash', command: 'echo key=$STRIPE_SECRET_KEY' })
  expect((ran.result as { stdout: string }).stdout).toBe('key=[hidden]')

  // A new session knows the key only by name and reads the value back from the file.
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  const later = await $.tool.call({ tool: 'Bash', command: 'echo key=$STRIPE_SECRET_KEY' })
  expect((later.result as { stdout: string }).stdout).toBe('key=[hidden]')
  await ui.unmount()
})

test('a file git would commit gets a warning, and saving adds it to .gitignore first', async ($, on) => {
  const w = world(on, { files: { '.gitignore': 'node_modules\n' }, ignored: ['.env'] })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call(REQUEST)
  await until(() => w.opened.includes('secret-env'))
  const ui = await $.ui.mount(PANE)
  expect(await ui.find({ type: 'Text', text: /\.gitignore에 없습니다/ })).toBeDefined()
  expect((await ui.find({ type: 'Button', key: 'save' }))?.text).toBe('.gitignore에 추가하고 저장')
  await ui.input({ key: 'value', text: 'sk_test_51Q8xK2LmZq', kind: 'change' })
  await ui.press({ key: 'save' })
  await asked

  expect(w.files.get(`${ROOT}/.gitignore`)).toBe('node_modules\n.env.local\n')
  expect(w.files.get(`${ROOT}/.env.local`)).toBe('STRIPE_SECRET_KEY=sk_test_51Q8xK2LmZq\n')
  await ui.unmount()
})

test('a name already in the file asks before replacing, then changes only that line', async ($, on) => {
  const w = world(on, { files: { '.env.local': 'A=1\nSTRIPE_SECRET_KEY=sk_test_old\nB=2\n' } })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call(REQUEST)
  await until(() => w.opened.includes('secret-env'))
  const ui = await $.ui.mount(PANE)
  expect(await ui.find({ type: 'Text', text: /이미 있습니다/ })).toBeDefined()
  expect((await ui.find({ type: 'Button', key: 'save' }))?.text).toBe('새 값으로 바꾸기')
  await ui.input({ key: 'value', text: 'sk_test_new_51Q8', kind: 'change' })
  await ui.press({ key: 'save' })
  await asked

  expect(w.files.get(`${ROOT}/.env.local`)).toBe('A=1\nSTRIPE_SECRET_KEY=sk_test_new_51Q8\nB=2\n')
  await ui.unmount()
})

test('saving with an empty value keeps the pane open and says what is missing', async ($, on) => {
  const w = world(on, { files: { '.env.local': '' } })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call(REQUEST)
  await until(() => w.opened.includes('secret-env'))
  const ui = await $.ui.mount(PANE)
  await ui.press({ key: 'save' })
  expect(await ui.find({ type: 'Text', text: /값을 입력해 주세요/ })).toBeDefined()
  expect(w.files.get(`${ROOT}/.env.local`)).toBe('')

  await ui.press({ key: 'cancel' })
  await asked
  await ui.unmount()
})

test('a request for a file outside the project or not a .env file is refused without opening the pane', async ($, on) => {
  const w = world(on)
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const outside = await $.tool.call({ ...REQUEST, file: '../other/.env' })
  const notEnv = await $.tool.call({ ...REQUEST, file: 'config.json' })

  expect(outside.result).toContain('must be a .env file inside the project')
  expect(notEnv.result).toContain('must be a .env file inside the project')
  expect(w.opened).toEqual([])
})

test('on a phone, which has no text field, the pane says where to enter the key', async ($, on) => {
  const w = world(on, { files: { '.env.local': '' } })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const asked = $.tool.call(REQUEST)
  await until(() => w.opened.includes('secret-env'))
  const phone = await $.ui.mount({ ...PANE, surface: 'mobile' })
  expect(await phone.find({ type: 'Text', text: /데스크톱 앱이나 터미널/ })).toBeDefined()
  await phone.unmount()

  const desk = await $.ui.mount(PANE)
  await desk.press({ key: 'cancel' })
  await asked
  await desk.unmount()
})
