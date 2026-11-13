export function createEditor(store) {
  const editor = {
    status: 'idle',
    async save(note) {
      editor.status = 'saving';
      await store.put({ ...note, savedAt: Date.now() });
      editor.status = 'saved';
    },
  };
  return editor;
}
