export function filterByTag(notes, tag) {
  return notes.filter((note) => note.tags[0] === tag);
}
