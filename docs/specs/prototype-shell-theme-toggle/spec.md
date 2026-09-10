# Prototype shell theme toggle

## User-visible outcomes

- A reviewer opening a prototype built for a project that has a dark palette
  can switch the product surface between light and dark from the review bar,
  and can check any screen and any state in either theme.
- A reviewer opening a prototype whose project has no dark palette sees no
  theme control and no dark mode the project never chose.
- The review bar stays recognizable as chrome rather than product in both
  themes.
- A temporary comparison offers the same switch, so a decision about a
  dark-sensitive component can be judged in the theme it matters in.
- Two reviewers opening the same address see the same rendering, whatever their
  machines prefer.

## Approved scope

### The control

The prototype shell's review bar carries a fourth control that switches the
product surface between light and dark. It belongs beside the viewport cycle:
both vary how the whole surface renders, while the screen and state selectors
choose what it shows. It answers to a single-key shortcut in the same family as
the viewport cycle's key.

The control has two positions, light and dark. There is no position that
follows the reviewer's system preference.

### When the control appears

The control appears only when the prototype declares a dark token set beside
its light one. A prototype that declares only light tokens carries no theme
control, and its surface renders light.

A project that has a dark palette has it carried into the prototype the same
way its light tokens are carried today, without translation or invention. A
project that has none leaves the prototype with one theme.

The shell's built-in minimal palette declares only a light set. A prototype for
a project with no design system therefore has no theme control.

### What the switch changes

Switching the theme changes the product surface only. The review bar keeps its
fixed dark styling in both themes so the boundary between chrome and product
pixels stays visible.

Placeholder pictures follow the active theme. The current placeholder is a
fixed light-gray fill that glares against a dark surface.

### Initial and carried state

A prototype loads in light. The shell does not read the operating system or
browser color-scheme preference at any point.

The selected theme is carried across screen changes, state changes, and
viewport changes for as long as the page is open. It is not encoded in the
address, which continues to identify the screen alone, and it does not survive
a reload.

### Comparison

The temporary comparison surface carries the same control under the same
appearance rule. Switching between alternatives preserves the selected theme,
the way it already preserves the selected state and viewport.

### Chrome contract consistency

Wherever the project states or verifies that the review shell carries exactly
three controls, that statement changes with this work. The revised chrome rule
is already recorded in the project decision contract, updated during shaping;
the template contracts and the eval suite must end up describing the same
chrome.

## Observable acceptance criteria

- A prototype declaring both a light and a dark token set renders a theme
  control in the review bar.
- A prototype declaring only a light token set renders no theme control, and
  its surface renders light.
- Activating the control repaints every token-driven color on the product
  surface with the declared dark set; activating it again restores the light
  set.
- The review bar's own colors are identical before and after the switch.
- Placeholder pictures read as placeholders without glaring against the dark
  surface, and are unchanged against the light one.
- Selecting dark, then changing screen, state, and viewport in any order,
  leaves the surface dark.
- A prototype opened in a browser that prefers dark renders light.
- Reloading the address renders light regardless of the theme selected before
  the reload.
- The shortcut key toggles the theme and stays inert while focus is in an
  input, textarea, or select, matching the viewport shortcut.
- A comparison with two or three alternatives renders the theme control, and
  switching alternatives keeps the selected theme.
- A comparison with a single alternative renders the theme control under the
  same declared-dark rule that governs the prototype.
- The project decision contract, both template contract comments, and the eval
  assertions describe the same chrome.

## Settled constraints and rationale

- The chrome admits a theme toggle because it varies how the whole surface
  renders, the role the viewport cycle already plays. The chrome rejected
  before it — notes, badges, change tracking, screen tabs, state pills — either
  carried review semantics or grew wider as the surface grew. A theme toggle
  does neither. Confirmed by the user this session.
- The toggle appears only where a dark token set is declared, because the
  prototype must render in the project's own design system and surface approval
  is evidence for what is visible, not authority to invent behavior outside it.
  A shell-supplied dark palette would have reviewers approving a dark mode the
  project never decided on, and that approval would harden into an implicit
  requirement. Confirmed by the user this session.
- A prototype loads light rather than following the reviewer's system
  preference, so one address produces one rendering. Review depends on a shared
  screen, state, and viewport coordinate; a theme that varies per machine
  breaks it.
- The review bar keeps its fixed dark styling so the chrome-versus-product
  boundary the shell relies on does not dissolve when the product goes dark.

## Assumptions

Agent-chosen defaults, overridable. Each is cheap to reverse and visible on the
first render, so no variant was rendered for review: placing a control beside an
existing one is routine presentation rather than a decision judged by looking.

- The control is a button beside the viewport cycle rather than a select,
  matching the viewport control's form and width.
- Its shortcut is a single letter alongside the viewport cycle's key.
- The theme is absent from the address because the viewport cycle is absent
  from it too.
- The comparison surface receives the control in this same work rather than in
  a later change.
- A project shipping more than two themes still gets two positions here;
  additional themes stay out of scope until asked for.
- The narrow-viewport phone frame keeps its current fixed dark border. A dark
  palette whose background sits close to that border's color would leave the
  frame invisible against the page, which shows on the first dark render.

## Off-limits

- Product source outside the shaping paths was not touched this session. The
  two shell templates, the skill body, and the eval suite are implementation's
  to change; shaping wrote only the decision contract and this spec.
- Persisting the theme across reloads, in storage or in the address, is
  excluded. It would reintroduce the per-reviewer divergence the fixed light
  start exists to prevent.
- Generating a dark palette from light tokens is excluded, for the reason
  recorded above.
- Reading the reviewer's system color-scheme preference is excluded, for the
  reason recorded above.

## Deferred points

None. Both consequential branches were settled during shaping.

## Remaining risks

- Five assertions in the build-prototype eval suite state that the shell
  carries exactly the three current controls. Until they are reconciled they
  contradict the revised contract, and an unreconciled suite either fails or,
  worse, passes while asserting chrome the project no longer wants.
- Whether a project has a copyable dark palette is a judgment the builder makes
  at prototype time. A project whose dark tokens the builder does not find
  yields a prototype indistinguishable from one built for a project with no
  dark palette at all. Nothing in the artifact separates the two cases.
- Because the control is conditional, chrome now varies between prototypes. A
  reviewer used to seeing the control may read its absence as a defect rather
  than as a statement about the project.