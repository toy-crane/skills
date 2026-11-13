// Note shape: { id: string, title: string, status: 'open' | 'done', tags: string[], due: string | null }
// Every note is created through createNote, so title is always a string and tags always an array.
export function createNote(id, title, { status = 'open', tags = [], due = null } = {}) {
  return { id, title: String(title), status, tags: [...tags], due };
}
