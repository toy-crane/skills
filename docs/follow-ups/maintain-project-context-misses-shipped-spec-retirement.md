# maintain-project-context rarely activates on a shipped-spec retirement prompt

**Symptom**: A prompt asking to preserve reusable decisions, retire
confirmed-shipped spec folders, and tidy stale agent instructions and the
decision index activates no skill at all in most runs. The prompt names three
of the skill's own surfaces and its explicit retirement trigger, so it should be
one of the clearest positives in the suite.

**Observed evidence**: Claude Code 2.1.267, 2026-09-13. In the 22-case
three-way run (`scripts/run-claude-trigger-evals.sh 2 8 babysit-specs
maintain-project-context shape-idea`) this was the only failing case, at 0 of 2.
An isolated 6-run repeat scored 1 of 6, with selections
`['', '', '', '', 'maintain-project-context', '']`; the empty strings mean no
Skill tool was called at all, not that another skill won. The failing query is
"출하가 확인된 spec들을 치우기 전에 재사용할 결정은 보존하고, 오래된 agent
지침과 decision index까지 함께 정비해줘."

**Suspected cause**: The description's activation half is one long sentence
listing file names, so the retirement trigger ("Also use for confirmed
shipped-spec retirement") sits after it and may carry little weight. Not
confirmed against a reworded description.

**What was tried**: A controlled before-and-after on the same case, 6 runs each,
established that the `babysit-specs` redirect clause added to the description on
2026-09-13 is not the cause: the pre-change description scored 1 of 6 on that
case and the post-change description scored 1 of 6. The clause was kept and
nothing else was changed.

**Proposed next step**: Reword the retirement trigger so it names the user's
action rather than the artifact, and rerun the isolated case at 6 repeats
against the current wording as the control. Treat 1 of 6 as the baseline to
beat. Keep the three-way run as the regression check, since `babysit-specs`
scored 10 of 10 on it and must not regress.
