const DATE = /^\d{4}-\d{2}-\d{2}$/;

function toTime(due) {
  if (typeof due !== 'string' || !DATE.test(due)) return Number.POSITIVE_INFINITY;
  const time = Date.parse(`${due}T00:00:00Z`);
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

export function sortByDue(notes, { stable = true, descending = false } = {}) {
  if (!Array.isArray(notes)) return [];
  try {
    const indexed = notes.map((note, index) => ({ note, index, time: toTime(note?.due) }));
    indexed.sort((a, b) => {
      if (a.time === b.time) return stable ? a.index - b.index : 0;
      const order = a.time < b.time ? -1 : 1;
      return descending ? -order : order;
    });
    return indexed.map((entry) => entry.note);
  } catch (error) {
    console.warn('sortByDue failed', error);
    return [...notes];
  }
}
