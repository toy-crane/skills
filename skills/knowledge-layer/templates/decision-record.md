# Decision Record Format

Decision records live in `docs/decisions/`, one file per decision, named by slug
alone: `event-sourced-orders.md`. The slug is the record's permanent address.

Create the `docs/decisions/` directory lazily, only when the first decision record is needed.

## Template

```md
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

A decision record can be a single paragraph. Record the decision and its reason;
do not add empty sections.

## Optional sections

Include these only when needed.

- **Status** frontmatter (`proposed | accepted | deprecated | superseded by <slug>`)
- **Considered Options** when rejected alternatives are worth remembering
- **Consequences** when downstream effects are not obvious

## Naming and supersession

Name the file for its claim in kebab-case, with no number or date prefix. When a
record overturns an earlier one, cite the earlier slug in the body, leave that
file unchanged, and replace its index line with the new record's line.
