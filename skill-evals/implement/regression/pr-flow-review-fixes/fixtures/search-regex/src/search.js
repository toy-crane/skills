export function searchNotes(notes, query, status) {
  const q = query.trim();
  const pattern = new RegExp(q, 'i');
  return notes.filter((note) => {
    if (status && note.status !== status) return false;
    return pattern.test(note.title);
  });
}
