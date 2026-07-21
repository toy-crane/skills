# Official agent context installs at stack confirmation and at project setup

Models err on fast-moving frameworks and services. Vercel's agent evals
on Next.js 16 APIs absent from training data pass 53% with no
documentation, and a skill alone does not fix it: agents left the
installed skill uninvoked in 56% of runs, while an always-loaded
AGENTS.md pointing at bundled version-matched docs passed 100%. Supabase
documented the same failure class (skipped RLS, invented CLI commands)
and measured 42–71% rising to 71–88% with its official skill. Vendors
now ship agent-facing context themselves, each in the form it chooses:
skills (supabase/agent-skills, expo/skills), an AGENTS.md codemod plus
docs bundled into the npm package (Next.js 16.2), MCP servers.

The pipeline transfers decisions — spec.md, plan.md — but nothing
transfers capability, and acquisition cannot be left to the agent's
initiative: the 56% figure is what retrieval left to the model looks
like. Two explicit paths close the gap.

Inside the pipeline, `shape-idea` and `draft-plan` each gain one
constraint: when the work lands on a framework or hosted service, check
whether its vendor publishes official agent context and install what is
missing into the target project in the form the vendor recommends. Each
skill carries the constraint independently because either can run
without the other; the action is idempotent, so whichever runs first
does the work and the other passes through.

Outside the pipeline, `add-stack-context` covers project setup: a
user-invoked skill (`disable-model-invocation: true`, like
discover-opportunity) that surveys the stack a project declares and
installs each vendor's official context. It exists for the
initialization moment — a fresh project, or an existing one adopting
agent workflows — which no pipeline skill visits. User-triggered
vertical tasks are also precisely where Vercel's evals show skills
working.

Both paths share the same limits: official sources only, community
skills out of scope, and the vendor's recommended form wins — skill,
codemod, bundled docs, MCP — so vendor lists and install commands never
get hardcoded here. The implementing session needs no change: installs
ride the project as files and are discovered automatically.

## Considered Options

- **Workflow constraint only, defer the skill** (rejected): the
  initialization moment sits outside shaping and planning, so the
  pipeline constraint never fires there; waiting for repeated observed
  failures (the [decision 0009](0009-thin-skills-over-fixed-procedures.md)
  bar for fixed procedures) fits steps inside a skill, not the
  deliberate, user-initiated equipping that setup help is.
- **Let the pipeline hooks invoke the skill instead of restating the
  rule** (rejected): skills.sh installs skills individually, so a user
  holding only shape-idea may not hold add-stack-context; each hook
  restates the one-sentence rule inline and stays self-sufficient.
- **Leave it all outside the workflow as a habit** (rejected):
  acquisition then depends on someone remembering or on agent-initiated
  retrieval, the mechanism measured failing in 56% of runs.
- **Hook build-prototype too** (rejected): the prototype touches no
  framework or service by design — one dummy-data HTML file, no network.
- **Name it `install-platform-guidance`** (rejected): three words and 25
  characters against a set of two-word commands, and "platform"
  misdescribes Next.js or Expo, which are frameworks; "stack" names what
  a project actually declares. **`add-stack-docs`** (rejected): docs
  undersells skills and MCP servers, while "context" covers every form
  vendors ship. **`setup-project`** (rejected): overpromises scaffolding
  and configuration. **`add-platform-skills`** (rejected): the context
  is often not a skill. add-stack-context names the literal action and
  collides with no built-in slash command in Claude Code or Codex.

## Consequences

Wherever the stack gets settled — shaping, planning, or a deliberate
setup run — the target project comes out carrying its vendors' official
context for every later session. shape-idea and draft-plan each grow one
sentence; add-stack-context ships as a published skill (plugin.json
entry, README link, `scripts/link-skills.sh` re-run from the main
checkout after merge). The plugin bumps to 0.11.0.

Evidence: [Vercel's evals](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals),
[Supabase's announcement](https://supabase.com/blog/supabase-agent-skills),
[Next.js 16.2](https://nextjs.org/blog/next-16-2-ai).
