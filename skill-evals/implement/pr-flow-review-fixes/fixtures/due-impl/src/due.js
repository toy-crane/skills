export function sortByDue(notes) {
  return [...notes].sort((a, b) => {
    if (a.due === b.due) return 0;
    if (a.due === null) return -1;
    if (b.due === null) return 1;
    return a.due < b.due ? -1 : 1;
  });
}
