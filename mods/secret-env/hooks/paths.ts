// One spelling per path, on POSIX and Windows alike, so guards compare files rather than strings.

const DRIVE = /^([A-Za-z]):/

export function normalizePath(path: string, root: string): string {
  const slashed = (one: string) => one.replace(/\\/g, '/')
  const isAbsolute = (one: string) => one.startsWith('/') || DRIVE.test(one)
  const joined = isAbsolute(slashed(path)) ? slashed(path) : `${slashed(root)}/${slashed(path)}`
  const drive = DRIVE.exec(joined)?.[1]
  const parts: string[] = []
  for (const part of joined.replace(DRIVE, '').split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  // Windows drive letters and paths are case-insensitive.
  return drive === undefined ? `/${parts.join('/')}` : `${drive.toLowerCase()}:/${parts.join('/')}`.toLowerCase()
}
