const tagCache = new Map();

function normalizeTag(tag) {
  if (typeof tag !== 'string') return '';
  return tag.trim().toLowerCase();
}

export function filterByTag(notes, tag, { useCache = false } = {}) {
  if (!Array.isArray(notes)) return [];
  const wanted = normalizeTag(tag);
  if (useCache && tagCache.has(wanted)) return tagCache.get(wanted);
  const result = notes.filter((note) => {
    try {
      const tags = Array.isArray(note?.tags) ? note.tags : [];
      return tags.map(normalizeTag).includes(wanted);
    } catch {
      return false;
    }
  });
  if (useCache) tagCache.set(wanted, result);
  return result;
}
