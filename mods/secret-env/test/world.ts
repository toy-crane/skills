// A fake machine beneath the plugin: a project folder in memory, git, and the pane host.
import { mock } from 'claude-code/testing'
import type { On } from 'claude-code'

// The test environment has timers; the hooks typings leave them out.
declare function setTimeout(fn: (value?: unknown) => void, ms: number): unknown

export const ROOT = '/work/shop'
// 2026-10-22 14:32 KST
export const NOW = 1792647120000

export type World = {
  files: Map<string, string>
  opened: string[]
  closed: string[]
  // Project-relative paths that fail to read from now on.
  unreadable: Set<string>
  // Every argv the plugin ran.
  ran: string[][]
}

export function world(on: On, options: { files?: Record<string, string>; ignored?: string[]; store?: Record<string, unknown>; isGitBroken?: boolean
    tracked?: string[]
    // Paths a .gitignore line cannot cover, so check-ignore keeps answering 1.
    stubborn?: string[]
    // Symbolic links in the project: link path -> target path, both absolute.
    links?: Record<string, string>
    env?: Record<string, string>
  } = {}): World {
  const files = new Map(Object.entries(options.files ?? {}).map(([path, text]) => [`${ROOT}/${path}`, text]))
  const ignored = new Set(options.ignored ?? ['.env', '.env.local'])
  const state: World = { files, opened: [], closed: [], unreadable: new Set(), ran: [] }

  mock.store(on, options.store ?? {})
  mock.clock(on, { now: NOW })
  mock.env(on, options.env ?? {})
  on('session.root', () => ({ value: ROOT }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('fs.read', (_, e) => {
    if ([...state.unreadable].some(path => e.path === `${ROOT}/${path}`)) throw new Error('EACCES: permission denied')
    const text = files.get(e.path)
    if (text === undefined) throw new Error(`ENOENT: ${e.path}`)
    return { value: text }
  })
  on('fs.exists', (_, e) => ({ value: files.has(e.path) }))
  on('fs.stat', (_, e) => {
    const parts: string[] = []
    for (const part of e.path.split('/')) {
      if (part === '' || part === '.') continue
      if (part === '..') parts.pop()
      else parts.push(part)
    }
    const lexical = `/${parts.join('/')}`
    const real = options.links?.[lexical] ?? lexical
    if (!files.has(real)) throw new Error(`ENOENT: ${e.path}`)
    return { value: { kind: 'file', size: 0, mtimeMs: 0, isLink: real !== lexical, realPath: real } }
  })
  on('fs.write', (_, e) => {
    files.set(e.path, e.text)
    return { value: undefined }
  })
  on('process.run', async (_, e) => {
    state.ran.push([...e.argv])
    const [cmd, ...args] = e.argv
    // A real sleep, so a plugin polling with it leaves room for the test to act.
    if (cmd === '/bin/sleep' || cmd === 'powershell') await new Promise(r => setTimeout(r, 5))
    if (cmd === 'git' && options.isGitBroken) throw new Error('git: command not found')
    if (cmd === 'git' && args[0] === 'ls-files') {
      const isTracked = (options.tracked ?? []).includes(args[args.length - 1] ?? '')
      return { value: { exitCode: isTracked ? 0 : 1, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
    }
    if (cmd === 'git' && args[0] === 'check-ignore') {
      const file = args[args.length - 1] ?? ''
      // Lines starting with # are comments and ! negates; a backslash makes either literal.
      const rules = (files.get(`${ROOT}/.gitignore`) ?? '')
        .split('\n')
        .filter(line => line !== '' && !line.startsWith('#') && !line.startsWith('!'))
        .map(line => line.replace(/^\\/, ''))
      const isIgnored = !(options.stubborn ?? []).includes(file) && (ignored.has(file) || rules.includes(file))
      return { value: { exitCode: isIgnored ? 0 : 1, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
    }
    return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('tool.register', (_, e) => ({ value: { tool: `mcp__secret-env__${e.name}` } }))
  on('ui.open', (_, e) => {
    state.opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('ui.close', (_, e) => {
    state.closed.push(e.id)
    return { value: undefined }
  })
  return state
}

export const PANE = {
  plugin: 'secret-env',
  component: 'Pane',
  requestId: 'secret-env',
  surface: 'desktop',
  props: {
    title: 'Secret keys',
    isFocused: true,
    bodyColumns: 48,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

export async function until(check: () => boolean) {
  for (let i = 0; i < 200 && !check(); i++) await new Promise(r => setTimeout(r, 5))
  if (!check()) throw new Error('timed out waiting')
}
