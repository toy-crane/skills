import { expect, test } from 'claude-code/testing'

import { normalizePath } from '../hooks/paths'

test('POSIX paths resolve . and .. against the project root', () => {
  expect(normalizePath('/work/shop/./.env.local', '/work/shop')).toBe('/work/shop/.env.local')
  expect(normalizePath('.env.local', '/work/shop')).toBe('/work/shop/.env.local')
  expect(normalizePath('/work/other/../shop/.env.local', '/work/shop')).toBe('/work/shop/.env.local')
})

test('Windows paths with backslashes and drive letters compare equal to their relative form', () => {
  const root = 'C:\\work\\shop'
  expect(normalizePath('C:\\work\\shop\\.env.local', root)).toBe(normalizePath('.env.local', root))
  expect(normalizePath('c:/work/shop/./.env.local', root)).toBe(normalizePath('.env.local', root))
})
