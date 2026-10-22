import { expect, test } from 'claude-code/testing'

import { ROOT, world } from './world'

const STORED = { [`keys:${ROOT}`]: [{ name: 'STRIPE_SECRET_KEY', file: '.env.local', savedAt: 1792647120000 }] }
const FILES = { '.env.local': 'NEXT_PUBLIC_URL=http://localhost:3000\nSTRIPE_SECRET_KEY=sk_test_51Q8xK2LmZq\n' }

test('Claude cannot overwrite a file that holds a managed key', async ($, on) => {
  world(on, { files: FILES, store: STORED })
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const ran = await $.tool.call({ tool: 'Write', file_path: `${ROOT}/.env.local`, content: 'NEXT_PUBLIC_URL=x\n' })

  expect(ran.deny).toContain('STRIPE_SECRET_KEY')
})

test('Claude cannot edit the line of a managed key but may edit other lines', async ($, on) => {
  world(on, { files: FILES, store: STORED })
  on('tool.call', { tool: 'Edit' }, () => ({ result: { filePath: `${ROOT}/.env.local` } }))
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const blocked = await $.tool.call({
    tool: 'Edit',
    file_path: `${ROOT}/.env.local`,
    old_string: 'STRIPE_SECRET_KEY=[hidden]',
    new_string: 'STRIPE_SECRET_KEY=sk_other',
  })
  const allowed = await $.tool.call({
    tool: 'Edit',
    file_path: `${ROOT}/.env.local`,
    old_string: 'NEXT_PUBLIC_URL=http://localhost:3000',
    new_string: 'NEXT_PUBLIC_URL=http://localhost:4000',
  })

  expect(blocked.deny).toContain('STRIPE_SECRET_KEY')
  expect(allowed.deny).toBe(undefined)
})

test('Write and Edit on files without managed keys pass through', async ($, on) => {
  world(on, { files: FILES, store: STORED })
  on('tool.call', { tool: 'Write' }, () => ({ result: { type: 'create' } }))
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

  const ran = await $.tool.call({ tool: 'Write', file_path: `${ROOT}/src/app.ts`, content: 'export {}\n' })

  expect(ran.deny).toBe(undefined)
})
