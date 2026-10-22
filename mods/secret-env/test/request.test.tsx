import { expect, test } from 'claude-code/testing'

import { PANE, ROOT, until, world } from './world'

const REQUEST = {
  tool: 'mcp__secret-env__request_secret',
  name: 'STRIPE_SECRET_KEY',
  purpose: 'Stripe 테스트 결제 호출',
  file: '.env.local',
}

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
