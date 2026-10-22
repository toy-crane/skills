// Replaces every known secret value inside any JSON-shaped value.

export const HIDDEN = '[hidden]'
const MIN_LENGTH = 4

export function scrub<T>(value: T, secrets: readonly string[]): T {
  const needles = secrets
    .filter(one => one.length >= MIN_LENGTH)
    .sort((a, b) => b.length - a.length)
  if (needles.length === 0) return value

  const walk = (node: unknown): unknown => {
    if (typeof node === 'string') {
      return needles.reduce((text, needle) => text.split(needle).join(HIDDEN), node)
    }
    if (Array.isArray(node)) return node.map(walk)
    if (node !== null && typeof node === 'object') {
      return Object.fromEntries(Object.entries(node).map(([key, one]) => [key, walk(one)]))
    }
    return node
  }

  return walk(value) as T
}
