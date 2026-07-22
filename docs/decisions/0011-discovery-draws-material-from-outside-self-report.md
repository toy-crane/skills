# Discovery draws material from outside self-report

`discover-opportunity` is the window for finding opportunities the user does
not yet know they have. As first written it interviewed the user about their
experiences and reflected patterns back. That method shares its form with
`shape-idea`'s interview — extract what lives in the user's head, mirror it
— so discovery ran like a lighter shaping session in practice. The two
skills' roles never overlapped (decision 0008 drew that boundary correctly),
but their method did, and the skill's only remaining differentiator was
stance: a blank-page entry point and a guard against premature convergence.

The deeper flaw is that recall cannot produce the unrecognized. Self-report
passes through the user's own filter of what already seems significant,
while opportunities hide precisely in what they dismiss as ordinary. A
skill whose concept is "discover what I did not know" cannot rely on the
user telling it things.

Discovery now inverts the roles: the skill sources the material and the
user judges it. Two sources sit outside self-report. The user's own traces
— repositories and commit history, published writing, notes, past session
records, opened only by agreement — reveal repetition, persistence, and
rare intersections as evidence-backed observations, exploiting revealed
preference over stated preference. Current external change, checked only
for patterns that resonate, supplies why that knowledge matters now.
Interviewing remains for probing reactions and for what traces cannot
show. The discovery signal is recognition, not recollection.

## Considered Options

- **Keep the recall-based interview** (rejected): capability-wise it
  duplicates the interviewing muscle `shape-idea` already has; a stance
  difference alone is too thin to be a skill's whole substance.
- **Pull discovery downstream** — opportunity qualification, candidate
  selection, a sharpened handoff contract (rejected): that turns the skill
  into shaping's preparation step, the opposite motion from a discovery
  window.
- **Merge into `shape-idea`** (rejected): decision 0008's reason stands —
  convergence discipline biases blank-page exploration toward premature
  specs.
- **Fix a mining procedure** — enumerate steps: scan repos, then notes,
  then search (rejected): decision 0009 keeps skills thin; a constraint on
  material sources suffices and survives model improvement.

## Consequences

Discovery's opening move becomes agreeing on trace scope rather than
asking the first interview question. The skill needs read access the user
explicitly grants; nothing personal is read without that agreement. Evals
expect the session to ground observations in real traces when the user
offers none. Handoff, stopping conditions, and the boundary with
`shape-idea` are unchanged. The plugin bumps to 0.12.0.
