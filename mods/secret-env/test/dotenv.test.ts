import { expect, test } from 'claude-code/testing'

import { readValue, removeKey, upsertKey } from '../hooks/dotenv'

test('adding a key to an empty file writes one line', () => {
  expect(upsertKey('', 'STRIPE_SECRET_KEY', 'sk_test_51Q8xK2')).toBe(
    'STRIPE_SECRET_KEY=sk_test_51Q8xK2\n',
  )
})

test('replacing a key changes only its line and keeps the rest in order', () => {
  const before = '# payments\nNEXT_PUBLIC_URL=http://localhost:3000\nSTRIPE_SECRET_KEY=old\nDEBUG=1'
  expect(upsertKey(before, 'STRIPE_SECRET_KEY', 'sk_new')).toBe(
    '# payments\nNEXT_PUBLIC_URL=http://localhost:3000\nSTRIPE_SECRET_KEY=sk_new\nDEBUG=1',
  )
})

test('adding a key to a file without a trailing newline starts a new line', () => {
  expect(upsertKey('DEBUG=1', 'OPENAI_API_KEY', 'sk-proj-9x')).toBe(
    'DEBUG=1\nOPENAI_API_KEY=sk-proj-9x\n',
  )
})

test('a value with spaces or quotes is written double-quoted and read back whole', () => {
  const text = upsertKey('', 'GREETING', 'say "hi" now')
  expect(text).toBe('GREETING="say \\"hi\\" now"\n')
  expect(readValue(text, 'GREETING')).toBe('say "hi" now')
})

test('reading a key handles export, single quotes, and a missing key', () => {
  const text = "export A=plain\nB='single quoted'\nC=x # note\n"
  expect(readValue(text, 'A')).toBe('plain')
  expect(readValue(text, 'B')).toBe('single quoted')
  expect(readValue(text, 'C')).toBe('x')
  expect(readValue(text, 'MISSING')).toBe(undefined)
})

test('removing a key drops only its line', () => {
  expect(removeKey('A=1\nSTRIPE_SECRET_KEY=sk\nB=2\n', 'STRIPE_SECRET_KEY')).toBe('A=1\nB=2\n')
})
