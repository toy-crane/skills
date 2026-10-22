import { expect, test } from 'claude-code/testing'

import { scrub } from '../hooks/scrub'

test('every string inside a tool result has the secret replaced, shape kept', () => {
  const result = {
    stdout: 'key=sk_test_51Q8xK2 len=16',
    lines: ['a', 'Bearer sk_test_51Q8xK2'],
    code: 0,
    nested: { ok: true, note: null },
  }
  expect(scrub(result, ['sk_test_51Q8xK2'])).toEqual({
    stdout: 'key=[hidden] len=16',
    lines: ['a', 'Bearer [hidden]'],
    code: 0,
    nested: { ok: true, note: null },
  })
})

test('a longer secret that contains a shorter one is hidden whole', () => {
  expect(scrub('abc12345-xyz abc12345', ['abc12345', 'abc12345-xyz'])).toBe('[hidden] [hidden]')
})

test('values shorter than four characters are left alone', () => {
  expect(scrub('DEBUG=1 on', ['1', 'on'])).toBe('DEBUG=1 on')
})
