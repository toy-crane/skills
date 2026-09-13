# Comparison shows one alternative at a time

Governing decision contract: [build-prototype](../../decisions/build-prototype.md)
owns the comparison shell's control set, layer separation, and the rejection of
a combined side-by-side view. This spec applies that contract to the shipped
`build-prototype` skill and its comparison template.

## Problem

A `compare.html` opens in a combined view that places its two or three
alternatives side by side. Reviews happen in narrow preview panes (the Claude
Code desktop side panel and the web preview), where that row squeezes each
alternative below product width or scrolls horizontally. Since a comparison
holds everything fixed except the governing choice, the copies are nearly
identical and the reviewer has to hunt for the difference across them.

## User-visible outcomes

- Opening a comparison shows the first alternative alone, at its full
  viewport width, with no other alternative visible.
- The reviewer switches alternatives in place; the selected state, viewport,
  and theme stay the same across the switch, so the same coordinate is shown
  with only the governing difference changed.
- The variant selector lists only the alternatives by their titles. No
  combined option exists anywhere in the shell.
- A comparison with a single alternative shows no variant selector, as today.
- Every other comparison behavior is unchanged: situation label, state
  presets and their synchronization, viewport cycle, theme toggle, contract
  comment, per-alternative product navigation, and the temporary lifecycle of
  `compare.html`.

## Approved scope

- The comparison template shipped with `build-prototype`.
- The `build-prototype` skill text where it describes the comparison controls.
- Skill evaluation fixtures and expectations that assert or exercise the
  combined view, so they match the new behavior.
- The plugin version bump that lets installed plugin users receive the change.

## Acceptance criteria

- A comparison with two or three alternatives, opened fresh, renders exactly
  one alternative and its title label is not shown as a row label.
- The variant selector offers exactly the alternative titles, with no option
  that shows more than one alternative, and programmatic switching to a
  nonexistent alternative falls back to the first alternative.
- Switching alternatives with the selector or the shortcut preserves the
  selected state preset, the viewport preset, and the selected theme.
- At each viewport preset the visible alternative has the same width the
  product prototype shell gives a single screen at that preset; nothing
  scrolls horizontally at the 390 or 768 presets when the pane is at least
  that wide.
- A single-alternative comparison hides the variant selector.
- Every shell shortcut still works: the existing viewport and theme keys, plus
  the new alternative-switching key.
- The skill text, template contract comment, and evals no longer describe or
  expect a combined view, and the existing comparison evals still pass their
  other assertions.

## Settled constraints and rationale

- One alternative at a time, switched in place. Alternatives differ only on
  the governing choice, so showing them at the same coordinate is the fastest
  way to see that difference; a combined view has no width to live in and
  adds nothing switching does not.
- No combined view remains as an opt-in and no vertical stacking replaces it.
  The user chose removal over retention because the combined view has not
  been used; stacking only trades horizontal for vertical scrolling.
- Per-alternative navigation, state semantics, and layer separation from the
  product prototype are unchanged; this work touches only how alternatives
  are presented.

## Assumptions

- Switching shortcut: `v` cycles to the next alternative, mirroring `m` for
  viewport and `t` for theme, and `1`, `2`, `3` select an alternative directly.
  Cheap to change if the user prefers other keys.
- The first alternative in document order is the one shown on open, which
  keeps the author's ordering meaningful.
- The alternative's title still appears in the selector but not as a label
  above the product pixels, since only one is visible and the selector
  already names it.

## Off limits

- The product prototype shell (`shell.html`) and its screen selector; the
  decision is about the comparison layer only.
- The comparison lifecycle: creation per decision, integration of the chosen
  result, deletion afterwards, and the rule that no prototype is built merely
  to demonstrate integration.
- Existing approved prototypes and specs in other projects; installed copies
  update through the normal skills.sh and plugin channels.

## Deferred points

- None. All implementation-relevant behavior is settled above.

## Remaining risks

- A comparison of a short multi-view flow where the alternatives differ in
  structure loses the ability to glance at both structures at once. The
  reviewer switches instead. If this proves costly in practice, the decision
  contract names it as the condition to reconsider a combined view.
- Existing eval fixtures that embed the combined view are updated by hand;
  an assertion that silently depended on it could pass for the wrong reason.
  Rerunning the comparison evals after the change is the guard.
