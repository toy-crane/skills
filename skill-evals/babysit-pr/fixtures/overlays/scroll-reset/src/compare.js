// The comparison shell: one alternative on the stage at a time.
export function createComparison(alternatives, stage) {
  let current = 0;
  stage.render(alternatives[current]);

  function show(index) {
    if (!Number.isInteger(index) || index < 0 || index >= alternatives.length) {
      return current;
    }
    current = index;
    stage.render(alternatives[current]);
    stage.scrollTop = 0;
    return current;
  }

  return { show, current: () => current };
}
