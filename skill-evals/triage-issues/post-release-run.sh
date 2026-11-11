#!/usr/bin/env bash
# End-to-end run of the post-release check flow with real headless Claude Code sessions:
# merge opens a check issue, triage leaves it alone before its due date, then runs it
# after, under each Notifications setting, and once more with a summary.
# The tracker is local (fixtures/post-release/scripts/tracker.mjs) and GitHub is a
# stand-in (fixtures/post-release/bin/gh) that reports PR #12 as already merged.
#
# usage: post-release-run.sh <out-dir> [stage...]
#   stages: merge pre-due due-none due-notify due-fail summary (default: all, in order)
#   prepare: build the merged workspace only, without running Claude
set -euo pipefail

here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo=$(CDPATH= cd -- "$here/../.." && pwd)
fixture="$here/fixtures/post-release"
out=${1:?usage: post-release-run.sh <out-dir> [stage...]}
shift
stages=("$@")
[[ ${#stages[@]} -gt 0 ]] || stages=(merge pre-due due-none due-notify due-fail summary)
mkdir -p "$out"
out=$(CDPATH= cd -- "$out" && pwd)
model=${MODEL:-claude-opus-5-5}
today=$(date -u +%F)
yesterday=$(date -u -v-1d +%F 2>/dev/null || date -u -d yesterday +%F)
soon=$(date -u -v+3d +%F 2>/dev/null || date -u -d '+3 days' +%F)

skills=(triage-issues merge pr pull clean-branches)

setup() { # fresh workspace with PR #12 merged on main and its implementation issue open
  local ws=$1
  mkdir -p "$ws"
  cp -R "$fixture/." "$ws/"
  for s in "${skills[@]}"; do
    mkdir -p "$ws/.claude/skills"
    cp -R "$(cd "$repo/.claude/skills/$s" && pwd -P)" "$ws/.claude/skills/$s"
  done
  (
    cd "$ws"
    printf '.tracker/\n.notifications/\n.gh/\n.notify-broken\ndata/ops.db\n' > .gitignore
    sqlite3 data/ops.db < data/seed.sql
    git init -q -b main
    git config user.name fixture && git config user.email fixture@localhost
    git init -q --bare -b main "$ws.origin.git"
    git remote add origin "$ws.origin.git"
    git add -A && git commit -qm 'docs(specs): add reply-card spec'
    git push -q origin main
    git checkout -qb feat/reply-card
    echo "export const replyCard = (text) => /보낼 말|words to send/.test(text) && !/\?$/.test(text);" > app/reply.js
    git commit -qam 'feat(reply): offer a reply card only for words to send' \
      -m 'Spec-Folder: docs/specs/reply-card/'
    git push -q origin feat/reply-card
    head=$(git rev-parse HEAD)
    git checkout -q main
    git merge -q --no-ff feat/reply-card -m 'Merge pull request #12 from acme/feat/reply-card'
    git push -q origin main
    merge=$(git rev-parse HEAD)
    mkdir -p .gh
    jq -n --arg head "$head" --arg merge "$merge" --arg at "$(date -u +%FT%TZ)" '{
      number: 12, title: "feat(reply): offer a reply card only for words to send",
      url: "https://github.com/acme/reply-app/pull/12", state: "MERGED", isDraft: false,
      mergedAt: $at, mergeCommit: {oid: $merge}, headRefName: "feat/reply-card",
      headRefOid: $head, baseRefName: "main", mergeable: "UNKNOWN",
      body: "Offer a reply card only when the user asks for words to send.\n\nIssue: local:1\nCloses local:1",
      commits: [{oid: $head, messageHeadline: "feat(reply): offer a reply card only for words to send",
                 messageBody: "Spec-Folder: docs/specs/reply-card/"}]}' > .gh/pr-12.json
    printf '<!-- triage-issues:spec:start -->\n## Spec\n\nReply card request check: docs/specs/reply-card/\n<!-- triage-issues:spec:end -->\n' > /tmp/spec-body.$$
    node scripts/tracker.mjs create --title 'Reply card request check' --label in-progress --body-file /tmp/spec-body.$$ >/dev/null
    rm -f /tmp/spec-body.$$
  )
}

run_claude() { # <ws> <name> <prompt>
  local ws=$1 name=$2 prompt=$3
  (
    cd "$ws"
    PATH="$ws/bin:$PATH" claude -p "$prompt" --model "$model" --max-budget-usd 5 \
      --permission-mode acceptEdits \
      --allowedTools Read Edit Write Glob Grep Skill \
        'Bash(node:*)' 'Bash(sqlite3:*)' 'Bash(git:*)' 'Bash(gh:*)' 'Bash(bash:*)' \
        'Bash(python3:*)' 'Bash(cat:*)' 'Bash(ls:*)' 'Bash(date:*)' 'Bash(mktemp:*)' \
        'Bash(jq:*)' 'Bash(printf:*)' 'Bash(echo:*)' 'Bash(grep:*)' 'Bash(sed:*)' \
        'Bash(rm:*)' 'Bash(head:*)' 'Bash(tail:*)' 'Bash(test:*)' 'Bash(wc:*)' \
      > "$out/$name.out.md" 2> "$out/$name.err" || echo "claude exited $?" >> "$out/$name.err"
    { echo "# tracker after $name"; node scripts/tracker.mjs list --state all
      echo; echo "# notifications"; ls .notifications 2>/dev/null && cat .notifications/* 2>/dev/null || echo none
    } > "$out/$name.state.md"
  )
}

check_issue_id() { # id of the post-release check issue in <ws>
  (cd "$1" && node scripts/tracker.mjs list --state all --label post-release-check | jq -r '.[0].id // empty')
}

set_notifications() { # <ws> <line>
  python3 - "$1/docs/issue-tracker.md" "$2" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text()
p.write_text(s.replace("Notifications: None.", sys.argv[2]))
PY
  # Land the change on main, as a project would.
  (cd "$1" && git commit -qam 'docs(issue-tracker): copy triage reports to the team channel' && git push -q origin main)
}

for stage in "${stages[@]}"; do
  case "$stage" in
    prepare)
      rm -rf "$out/ws-prepare" "$out/ws-prepare.origin.git"
      setup "$out/ws-prepare" ;;
    merge)
      rm -rf "$out/ws-merge" "$out/ws-merge.origin.git"
      setup "$out/ws-merge"
      cp -R "$out/ws-merge" "$out/ws-merge.before"
      run_claude "$out/ws-merge" merge \
        '/merge PR #12 (https://github.com/acme/reply-app/pull/12) is already merged on GitHub. Finish its post-merge steps in this checkout.' ;;
    pre-due|due-none|due-notify|due-fail)
      ws="$out/ws-$stage"
      rm -rf "$ws" "$ws.origin.git"
      cp -R "$out/ws-merge" "$ws"
      cp -R "$out/ws-merge.origin.git" "$ws.origin.git"
      (cd "$ws" && git remote set-url origin "$ws.origin.git")
      id=$(check_issue_id "$ws")
      if [[ "$stage" != pre-due ]]; then
        [[ -n "$id" ]] || { echo "no check issue to run in $stage" >&2; exit 1; }
        # Stand in for the passing week: move the due date, in the field and the body, to yesterday.
        (cd "$ws" && node scripts/tracker.mjs due "$id" "$yesterday" >/dev/null
         node scripts/tracker.mjs view "$id" | jq -r .body | sed "s/^Due: .*/Due: $yesterday/" > .due-body
         node scripts/tracker.mjs body "$id" --body-file .due-body >/dev/null && rm .due-body)
      fi
      case "$stage" in
        due-notify) set_notifications "$ws" 'Notifications: `node scripts/notify.mjs --file <report.md>` copies the report to the team channel.' ;;
        due-fail) set_notifications "$ws" 'Notifications: `node scripts/notify.mjs --file <report.md>` copies the report to the team channel.'
                  touch "$ws/.notify-broken" ;;
      esac
      run_claude "$ws" "$stage" '/triage-issues' ;;
    summary)
      ws="$out/ws-summary"
      rm -rf "$ws" "$ws.origin.git"
      cp -R "$out/ws-due-none" "$ws"
      cp -R "$out/ws-due-none.origin.git" "$ws.origin.git"
      (cd "$ws" && git remote set-url origin "$ws.origin.git"
       printf '<!-- triage-issues:check:start -->\n## Post-release check\n\nSpec-Folder: docs/specs/onboarding-copy/\nMerged: https://github.com/acme/reply-app/pull/9 at 2026-11-07T02:00:00Z\nMerge-Commit: 0000000\nDue: %s\n\n- Metric: onboarding completion.\n- Pass: at least 60%%.\n- Period: 7 days after release.\n- Measurement: `docs/specs/onboarding-copy/check.sql`.\n- If not met: restore the old copy.\n<!-- triage-issues:check:end -->\n' "$soon" > /tmp/soon.$$
       node scripts/tracker.mjs create --title 'Post-release check: Onboarding copy' --label post-release-check --due "$soon" --body-file /tmp/soon.$$ >/dev/null
       rm -f /tmp/soon.$$)
      run_claude "$ws" summary '/triage-issues 요약 포함' ;;
    *) echo "unknown stage: $stage" >&2; exit 2 ;;
  esac
done
echo "results in $out (today $today)"
