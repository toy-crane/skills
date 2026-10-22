// Line-level edits of .env files that leave every other line as it was.

const KEY_LINE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/
const BARE = /^[A-Za-z0-9_\-.\/+:@,=~]*$/

function keyOf(line: string): string | undefined {
  return KEY_LINE.exec(line)?.[1]
}

// How a value is spelled on its line: bare when it can be, else double-quoted.
export function encodeValue(value: string): string {
  if (BARE.test(value)) return value
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
}

function decodeValue(raw: string): string {
  const text = raw.trim()
  if (text.startsWith('"')) {
    let out = ''
    for (let i = 1; i < text.length; i++) {
      const ch = text[i]
      if (ch === '"') break
      if (ch === '\\' && i + 1 < text.length) {
        const esc = text[++i]
        out += esc === 'n' ? '\n' : esc
      } else {
        out += ch
      }
    }
    return out
  }
  if (text.startsWith("'")) {
    const end = text.indexOf("'", 1)
    return text.slice(1, end < 0 ? undefined : end)
  }
  return text.replace(/\s+#.*$/, '')
}

export function upsertKey(text: string, name: string, value: string): string {
  const line = `${name}=${encodeValue(value)}`
  const lines = text.split('\n')
  const at = lines.findIndex(one => keyOf(one) === name)
  if (at >= 0) {
    lines[at] = line
    return lines.join('\n')
  }
  const head = text === '' || text.endsWith('\n') ? text : `${text}\n`
  return `${head}${line}\n`
}

export function removeKey(text: string, name: string): string {
  return text
    .split('\n')
    .filter(line => keyOf(line) !== name)
    .join('\n')
}

export function readValue(text: string, name: string): string | undefined {
  for (const line of text.split('\n')) {
    const match = KEY_LINE.exec(line)
    if (match?.[1] === name) return decodeValue(match[2] ?? '')
  }
  return undefined
}
