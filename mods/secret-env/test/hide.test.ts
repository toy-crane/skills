import { expect, test } from 'claude-code/testing'

import { ROOT, world } from './world'

test('a key saved in an earlier session stays hidden in every tool result', async ($, on) => {
  world(on, {
    files: { '.env.local': 'NEXT_PUBLIC_URL=http://localhost:3000\nSTRIPE_SECRET_KEY=sk_test_51Q8xK2LmZq\n' },
    store: { [`keys:${ROOT}`]: [{ name: 'STRIPE_SECRET_KEY', file: '.env.local', savedAt: 1792640000000 }] },
  })
  on('tool.call', { tool: 'Bash' }, () => ({
    result: { stdout: 'STRIPE_SECRET_KEY=sk_test_51Q8xK2LmZq', stderr: '', interrupted: false },
    text: 'STRIPE_SECRET_KEY=sk_test_51Q8xK2LmZq',
  }))

  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  const ran = await $.tool.call({ tool: 'Bash', command: 'grep STRIPE .env.local' })

  expect(ran.text).toBe('STRIPE_SECRET_KEY=[hidden]')
  expect((ran.result as { stdout: string }).stdout).toBe('STRIPE_SECRET_KEY=[hidden]')
})

test('a managed key whose file is gone does not stop the session from starting', async ($, on) => {
  world(on, { store: { [`keys:${ROOT}`]: [{ name: 'GONE_KEY', file: '.env.removed', savedAt: 1792640000000 }] } })
  on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'ok', stderr: '', interrupted: false } }))

  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  const ran = await $.tool.call({ tool: 'Bash', command: 'true' })

  expect((ran.result as { stdout: string }).stdout).toBe('ok')
})
