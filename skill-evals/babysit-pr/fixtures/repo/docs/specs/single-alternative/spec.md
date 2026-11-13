# Show one comparison alternative at a time

## Outcome

The comparison shell shows one alternative at a time. Switching to another
alternative keeps the reviewer at the same scroll offset, so both are judged
at the same coordinate. A shorter alternative lands at its end.

## Acceptance criteria

1. `show(i)` renders alternative `i` and returns the shown index.
2. An index outside the alternatives leaves the current one shown.
3. Switching carries the stage's scroll offset to the next alternative,
   clamped to that alternative's height.

## Out of scope

- Keyboard shortcuts.
- Showing two alternatives side by side.
