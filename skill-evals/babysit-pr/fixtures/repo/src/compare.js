// The comparison shell: one alternative on the stage at a time.
export function createComparison(alternatives, stage) {
  let current = 0;
  stage.render(alternatives[current]);

  function show(index) {
    if (!Number.isInteger(index) || index < 0 || index >= alternatives.length) {
      return current;
    }
    const offset = stage.scrollTop;
    current = index;
    stage.render(alternatives[current]);
    stage.scrollTop = Math.min(offset, stage.scrollHeight);
    return current;
  }

  return { show, current: () => current };
}
