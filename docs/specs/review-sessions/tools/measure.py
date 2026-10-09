#!/usr/bin/env python3
"""Reproduce the tables in research.md from extract.py's output.

Usage: python3 -I measure.py sessions.jsonl [split-iso-timestamp]
The split timestamp (UTC, e.g. 2026-10-09T00:00:00) separates before/after
counts for the skill-delegation table. Sessions whose cwd is under /private or
/var (skill evals, scratch runs) are excluded as non-work.
"""
import json, re, sys, collections, statistics
S = [json.loads(l) for l in open(sys.argv[1])]
SPLIT = sys.argv[2] if len(sys.argv) > 2 else None

def real(s):
    c = s.get("cwd") or ""
    return bool(c) and not (c.startswith("/private/") or c.startswith("/var/"))
S = [s for s in S if real(s)]
C = [s for s in S if s["harness"] == "claude"]
def bash(s): return [e for e in s["events"] if e["k"] == "tool" and e["name"] == "Bash"]
def raws(s): return [e.get("raw", "") for e in bash(s)]
def errs(s): return [e for e in s["events"] if e["k"] == "err"]
def count(pred):
    sess = ev = 0
    for s in C:
        n = sum(1 for e in s["events"] if pred(e)); sess += bool(n); ev += n
    return sess, ev

print("## base rates")
print("claude real", len(C), "tool calls", sum(s["n_tool"] for s in C), "errors", sum(s["n_err"] for s in C), "user turns", sum(s["n_user_text"] for s in C))
X = [s for s in S if s["harness"] == "codex"]
print("codex real", len(X), "by (originator, thread_source)", collections.Counter((s["entrypoint"], s.get("thread_source")) for s in X).most_common())

print("\n## signal table (sessions, events)")
SIG = {
 "harness: sleep+tail blocked": lambda e: e["k"]=="err" and "Blocked: sleep" in e.get("text",""),
 "harness: edit/write before read": lambda e: e["k"]=="err" and "has not been read yet" in e.get("text",""),
 "harness: file modified since read": lambda e: e["k"]=="err" and "modified since read" in e.get("text",""),
 "worktree guard: too complex to verify": lambda e: e["k"]=="err" and "isolated in the worktree" in e.get("text",""),
 "shell: relative cd after cwd persisted": lambda e: e["k"]=="err" and re.search(r"no such file or directory: (apps|src|docs|supabase|scripts|packages)", e.get("text","")) is not None,
 "shell: cwd deleted after worktree removal": lambda e: e["k"]=="err" and "was deleted; shell cwd recovered" in e.get("text",""),
 "zsh glob: no matches found": lambda e: e["k"]=="err" and "no matches found" in e.get("text",""),
 "browser pane: any tool error": lambda e: e["k"]=="err" and e["tool"].startswith("mcp__Claude_Browser__"),
 "browser pane: navigation denied/failed": lambda e: e["k"]=="err" and "denied or failed" in e.get("text",""),
 "browser pane: launch.json missing": lambda e: e["k"]=="err" and "No .claude" in e.get("text","") and "launch" in e.get("text",""),
 "auto-mode classifier denial": lambda e: e["k"]=="err" and "auto mode classifier" in e.get("text",""),
 "user rejected tool use": lambda e: e["k"]=="err" and "doesn't want to proceed" in e.get("text",""),
 "gh --json unknown field": lambda e: e["k"]=="err" and "Unknown JSON field" in e.get("text",""),
 "code-review skill not model-invocable": lambda e: e["k"]=="err" and "disable-model-invocation" in e.get("text",""),
 "claim.sh usage error": lambda e: e["k"]=="err" and re.search(r"triage claim: (missing value|issue has no claim)", e.get("text","")) is not None,
}
for k, p in SIG.items():
    a, b = count(p); print(f"{k:45s} {a:5d} {b:6d}")

print("\n## sleep+tail block → next tool within 5 events")
sw = collections.Counter()
for s in C:
    ev = s["events"]
    for i, e in enumerate(ev):
        if e["k"] == "err" and "Blocked: sleep" in e.get("text", ""):
            nxt = [x["name"] for x in ev[i+1:i+6] if x["k"] == "tool"]
            sw["Monitor" if "Monitor" in nxt else "Bash again" if "Bash" in nxt else "other"] += 1
print(sw.most_common())

print("\n## skill delegation: command run vs skill loaded" + (f" (split at {SPLIT})" if SPLIT else ""))
CHECKS = [("gh pr create", r"gh pr create", "pr", None), ("git rebase (merge sessions)", r"git rebase", "pull", "merge")]
for label, pat, skill, require in CHECKS:
    rx = re.compile(pat)
    for part, pred in (("before", lambda s: (s["start"] or "") < (SPLIT or "9")), ("after", lambda s: SPLIT and (s["start"] or "") >= SPLIT)):
        ss = [s for s in C if pred(s) and (require is None or require in s["skills"]) and any(rx.search(r) for r in raws(s))]
        print(f"{label:30s} {part:6s} sessions={len(ss):4d} without {skill}={sum(1 for s in ss if skill not in s['skills']):4d}")
        if not SPLIT: break

print("\n## browser pane: error rate by first browser tool")
by = collections.defaultdict(lambda: [0, 0, 0])
for s in C:
    first = None; calls = er = 0
    for e in s["events"]:
        if e["k"] == "tool" and e["name"].startswith("mcp__Claude_Browser__"):
            calls += 1; first = first or e["name"].replace("mcp__Claude_Browser__", "")
        if e["k"] == "err" and e["tool"].startswith("mcp__Claude_Browser__"): er += 1
    if first: by[first][0] += 1; by[first][1] += calls; by[first][2] += er
for k, (n, c, e) in sorted(by.items(), key=lambda kv: -kv[1][0]): print(f"{k:16s} sessions={n:4d} calls={c:5d} errors={e:4d} per100={100*e/max(1,c):5.1f}")

print("\n## worktree guard blocks by session kind and loaded skill")
def kind(s):
    fp = s.get("first_prompt") or ""; cwd = s.get("cwd") or ""
    if "<scheduled-task" in fp: return "scheduled-task"
    if re.search(r"/robo-", cwd) or fp.startswith("`triage-issues` Skill") or fp.startswith("`shape-idea` Skill로 이슈"): return "robo-launched"
    return "interactive"
bk = collections.Counter(); bs = collections.Counter()
for s in C:
    n = sum(1 for e in errs(s) if "isolated in the worktree" in e.get("text", ""))
    if n:
        bk[kind(s)] += n
        for x in set(s["skills"]): bs[x] += n
print("by kind:", bk.most_common(), "by skill:", bs.most_common(6))

print("\n## agent-device")
tot = sum(sum(1 for r in raws(s) if "agent-device" in r) for s in C)
per = sorted(x for x in (sum(1 for r in raws(s) if "agent-device" in r) for s in C) if x)
press = sleep = settle = 0
for s in C:
    for r in raws(s):
        if re.search(r"agent-device\s+(press|tap|type|fill|swipe)", r):
            press += 1; sleep += bool(re.search(r"\bsleep\b", r)); settle += "--settle" in r
wrap = sum(1 for s in C if any(re.search(r"/tmp/\S*(ad-ios|ad-android|agent-device|-ad\.sh|ad\.sh)", r) for r in raws(s)))
print(f"sessions={len(per)} calls={tot} median/session={statistics.median(per) if per else 0} press={press} press+sleep={sleep} press+settle={settle} tmp-wrapper-sessions={wrap}")

print("\n## pr evidence composition")
print("montage/ffmpeg sessions:", sum(1 for s in C if any(re.search(r"\bmontage\b|ffmpeg", r) for r in raws(s))), "video-recording sessions:", sum(1 for s in C if any(re.search(r"recordVideo|screenrecord", r) for r in raws(s))))

print("\n## user corrections and interrupts")
STRONG = re.compile(r"(아니[,. ]|아니야|아냐|아닌데|그게 아니|틀렸|잘못|하지 ?마|말고|되돌|롤백|revert|undo|\bwrong\b|\bstop\b|다시 해|다시해|원래대로|왜 .*(했|한|하는)|안 (했|됐|돼|되))")
strong = [(s["id"], e) for s in C for e in [x for x in s["events"] if x["k"] == "user"][1:] if e["len"] <= 350 and STRONG.search(e["text"])]
print("strong-marker mid-session turns:", len(strong), "sessions:", len({i for i, _ in strong}))
intr = [(s, i) for s in C for i, e in enumerate(s["events"]) if e["k"] == "user" and e["text"].startswith("[Request interrupted by user")]
print("interrupts:", len(intr), "sessions:", len({s["id"] for s, _ in intr}))
ask = [s for s in C if any(e["k"] == "tool" and e["name"] == "AskUserQuestion" for e in s["events"])]
print("AskUserQuestion sessions:", len(ask), "with rejection:", sum(1 for s in ask if any(e["tool"] == "AskUserQuestion" for e in errs(s))))

print("\n## merge: after the /merge turn")
rows = []
for s in C:
    ev = s["events"]; idx = [i for i, e in enumerate(ev) if e["k"] == "user" and e["text"].strip().startswith("/merge")]
    if not idx: continue
    tail = ev[idx[-1]:]
    rows.append((sum(1 for e in tail if e["k"] == "tool" and e["name"] == "Bash" and any(h.startswith(("git", "gh")) for h in (e.get("heads") or []))),
                 sum(1 for e in tail[1:] if e["k"] == "user" and not e["text"].startswith("[Request interrupted"))))
if rows:
    print("sessions:", len(rows), "median git/gh calls:", statistics.median(r[0] for r in rows), "zero user turns after:", sum(1 for r in rows if r[1] == 0))
