export function searchNotes(notes, query, status) {
  const q = query.trim().toLowerCase();
  return notes.filter((note) => {
    if (status && note.status !== status) return false;
    if (q.length < 2) return true;
    return note.title.toLowerCase().includes(q);
  });
}
