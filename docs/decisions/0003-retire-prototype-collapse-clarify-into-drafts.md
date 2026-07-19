# The prototype skill retires from the published set; clarify's moves collapse into the draft

Prototype leaves the repo ahead of a rebuild on a new base, reversing 0001's consequence
that it stays for direct invocation. Since 0001 already removed clarify's routing to it,
the two skills shared no textual edge — retiring prototype orphans nothing, and keeping a
skill we intend to rebuild from scratch would keep shipping semantics already decided to
be replaced to plugin subscribers.

In the same stroke clarify names its four proposing moves — recommended answers,
assumptions, rendered variants, structural mirroring — with one pretrained concept, the
draft: put forward a concrete candidate for the user to correct, because people mark up
a draft more reliably than they fill a blank page. The
word makes the assumption-with-veto move the explicit default for low-risk decisions, so
questions are spent only on branches that are expensive to get wrong, and the interview
naturally shifts from interrogation toward assumption review as model capability grows —
the same clause absorbs more decisions without the text changing.

## Considered Options

- **Keep prototype until the rebuild lands** — rejected: subscribers would keep
  installing semantics slated for replacement, and the rebuild owes nothing to the old
  text.
- **Describe each proposing move separately (status quo)** — rejected: four sites
  restating one mechanism; a leading word says it once and recruits priors the model
  already holds.
- **"Straw man" as the leading word** — rejected: precise for expendable-proposal
  semantics, but outside Anglo standards culture the fallacy reading dominates, and a
  leading word must anchor the humans who read and fork a published skill, not only the
  model.
- **"Lazy consensus" as the leading word** — rejected: covers the assumption-veto move
  but not variants or structural mirroring.

## Consequences

0001's "prototype stays in the repo" consequence is superseded; its visual-medium
decision for clarify stands unchanged. The plugin drops to two skills and bumps to
0.4.0. A future prototype returns as a fresh skill under its own decision record.
