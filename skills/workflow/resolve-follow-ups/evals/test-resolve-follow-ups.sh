#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
SKILL_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
DISPATCHER="$SKILL_DIR/scripts/resolve-follow-ups.sh"

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

assert_eq() {
  local expected=$1
  local actual=$2
  local message=$3
  if [[ "$expected" != "$actual" ]]; then
    printf 'Expected:\n%s\nActual:\n%s\n' "$expected" "$actual" >&2
    fail "$message"
  fi
}

new_repo() {
  local root=$1
  git -C "$root" init -q
  git -C "$root" config user.email eval@example.com
  git -C "$root" config user.name 'Resolve Follow-ups Eval'
  mkdir -p "$root/docs/follow-ups"
}

write_follow_up() {
  local path=$1
  local title=$2
  cat >"$path" <<EOF
# $title

**Symptom**: $title happened.

**Observed evidence**: Running ./verify.sh exits 1 in the fixture.

**Suspected cause**: The fixture value may be stale.

**What was tried**: Restarting left the value unchanged.

**Proposed next step**: Run ./verify.sh and repair the fixture value.
EOF
}

commit_at() {
  local root=$1
  local date=$2
  local message=$3
  git -C "$root" add docs/follow-ups
  GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" \
    git -C "$root" commit -qm "$message"
}

test_list_limits_candidates_and_reports_invalid_items() {
  local sandbox
  sandbox=$(mktemp -d)
  local repo="$sandbox/repo"
  mkdir -p "$repo"
  new_repo "$repo"

  write_follow_up "$repo/docs/follow-ups/first.md" 'First symptom'
  commit_at "$repo" '2026-01-01T00:00:00Z' 'docs: record first follow-up'
  write_follow_up "$repo/docs/follow-ups/second.md" 'Second symptom'
  commit_at "$repo" '2026-01-02T00:00:00Z' 'docs: record second follow-up'
  write_follow_up "$repo/docs/follow-ups/third.md" 'Third symptom'
  commit_at "$repo" '2026-01-03T00:00:00Z' 'docs: record third follow-up'
  write_follow_up "$repo/docs/follow-ups/fourth.md" 'Fourth symptom'
  commit_at "$repo" '2026-01-04T00:00:00Z' 'docs: record fourth follow-up'
  printf '# Missing required fields\n' >"$repo/docs/follow-ups/invalid.md"
  commit_at "$repo" '2026-01-05T00:00:00Z' 'docs: record invalid follow-up'

  local actual
  actual=$(
    "$DISPATCHER" list --repo "$repo" --limit 3 \
      | sed "s#$repo/##"
  )
  local expected=$'candidate\tdocs/follow-ups/first.md\ncandidate\tdocs/follow-ups/second.md\ncandidate\tdocs/follow-ups/third.md\ninvalid-follow-up\tdocs/follow-ups/invalid.md'
  assert_eq "$expected" "$actual" 'list should select the three oldest valid follow-ups and report invalid files'

  local all_items
  all_items=$(
    "$DISPATCHER" list --repo "$repo" \
      | sed "s#$repo/##"
  )
  local expected_all=$'candidate\tdocs/follow-ups/first.md\ncandidate\tdocs/follow-ups/second.md\ncandidate\tdocs/follow-ups/third.md\ncandidate\tdocs/follow-ups/fourth.md\ninvalid-follow-up\tdocs/follow-ups/invalid.md'
  assert_eq "$expected_all" "$all_items" \
    'unbounded list should expose the ordered backlog so skipped attempts do not starve newer candidates'
  rm -rf "$sandbox"
}

test_prepare_fetches_and_verifies_the_remote_default_branch() {
  local sandbox
  sandbox=$(mktemp -d)
  local repo="$sandbox/repo"
  local remote="$sandbox/remote.git"
  local publisher="$sandbox/publisher"
  local worker="$sandbox/worker"
  mkdir -p "$repo"
  new_repo "$repo"
  write_follow_up "$repo/docs/follow-ups/first.md" 'First symptom'
  dd if=/dev/zero bs=1024 count=256 2>/dev/null \
    | tr '\0' x >>"$repo/docs/follow-ups/first.md"
  commit_at "$repo" '2026-01-01T00:00:00Z' 'docs: record first follow-up'
  git -C "$repo" branch -M main
  git init -q --bare "$remote"
  git -C "$remote" symbolic-ref HEAD refs/heads/main
  git -C "$repo" remote add origin "$remote"
  git -C "$repo" push -qu origin main

  git clone -q "$remote" "$publisher"
  git -C "$publisher" config user.email eval@example.com
  git -C "$publisher" config user.name 'Resolve Follow-ups Eval'
  printf 'remote update\n' >"$publisher/remote-update.txt"
  git -C "$publisher" add remote-update.txt
  GIT_AUTHOR_DATE='2026-01-02T00:00:00Z' GIT_COMMITTER_DATE='2026-01-02T00:00:00Z' \
    git -C "$publisher" commit -qm 'test: advance remote main'
  git -C "$publisher" push -qu origin main
  local remote_sha
  remote_sha=$(git -C "$publisher" rev-parse HEAD)

  local identity
  identity=$(
    "$DISPATCHER" identity \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md
  )
  local identity_prefix=$'eligible\tdocs/follow-ups/first.md\t'"$remote_sha"$'\t'
  [[ "$identity" == "$identity_prefix"* ]] \
    || fail 'identity should resolve an eligible follow-up against fresh remote state without creating a worker'
  local identity_key=${identity##*$'\t'}

  local actual
  actual=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --worktree "$worker" \
      --branch codex/fix-first
  )
  local prefix=$'prepared\t'"$worker"$'\tcodex/fix-first\t'"$remote_sha"$'\t'
  [[ "$actual" == "$prefix"* ]] \
    || fail 'prepare should report the verified worktree, branch, and fresh base SHA'
  local attempt_key=${actual##*$'\t'}
  [[ "$attempt_key" =~ ^[0-9a-f]{40,64}$ ]] \
    || fail 'prepare should report a stable hexadecimal attempt identity'
  assert_eq "$identity_key" "$attempt_key" \
    'identity and prepare should use the same attempt identity'
  assert_eq "$remote_sha" "$(git -C "$worker" rev-parse HEAD)" \
    'prepared worktree should start at the fetched remote default branch'

  local recorded
  recorded=$(
    "$DISPATCHER" mark \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --base-sha "$remote_sha" \
      --outcome not-reproduced
  )
  assert_eq $'recorded\t'"$attempt_key"$'\tnot-reproduced' "$recorded" \
    'mark should persist a non-PR outcome under the current attempt identity'

  git -C "$repo" worktree remove "$worker"
  git -C "$repo" branch -D codex/fix-first >/dev/null

  local skipped
  skipped=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --worktree "$worker" \
      --branch codex/fix-first
  )
  assert_eq $'skipped-unchanged\tdocs/follow-ups/first.md\t'"$remote_sha"$'\t'"$attempt_key"$'\tnot-reproduced' "$skipped" \
    'prepare should skip an unchanged attempt that already reached a non-PR outcome'
  [[ ! -e "$worker" ]] || fail 'skipped attempt should not create a worktree'
  local skipped_identity
  skipped_identity=$(
    "$DISPATCHER" identity \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md
  )
  assert_eq $'skipped-unchanged\tdocs/follow-ups/first.md\t'"$remote_sha"$'\t'"$attempt_key"$'\tnot-reproduced' "$skipped_identity" \
    'identity should skip the same unchanged attempt without creating a worktree'

  local pull_request_url='https://github.com/example/repo/pull/123'
  local recorded_pr
  recorded_pr=$(
    "$DISPATCHER" mark \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --base-sha "$remote_sha" \
      --outcome pull-request \
      --detail "$pull_request_url"
  )
  assert_eq $'recorded\t'"$attempt_key"$'\tpull-request\t'"$pull_request_url" "$recorded_pr" \
    'mark should retain an open pull request URL for duplicate suppression'
  local skipped_pr
  skipped_pr=$(
    "$DISPATCHER" identity \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md
  )
  assert_eq $'skipped-unchanged\tdocs/follow-ups/first.md\t'"$remote_sha"$'\t'"$attempt_key"$'\tpull-request\t'"$pull_request_url" "$skipped_pr" \
    'identity should expose the existing pull request instead of starting a duplicate worker'

  local cleared
  cleared=$(
    "$DISPATCHER" clear \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --base-sha "$remote_sha"
  )
  assert_eq $'cleared\t'"$attempt_key" "$cleared" \
    'clear should remove only the exact attempt identity selected for retry'
  local eligible_again
  eligible_again=$(
    "$DISPATCHER" identity \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md
  )
  assert_eq $'eligible\tdocs/follow-ups/first.md\t'"$remote_sha"$'\t'"$attempt_key" "$eligible_again" \
    'cleared pull request state should make the exact unchanged attempt eligible again'

  printf '\nAdditional current evidence.\n' >>"$publisher/docs/follow-ups/first.md"
  git -C "$publisher" add docs/follow-ups/first.md
  GIT_AUTHOR_DATE='2026-01-03T00:00:00Z' GIT_COMMITTER_DATE='2026-01-03T00:00:00Z' \
    git -C "$publisher" commit -qm 'docs: add current reproduction evidence'
  git -C "$publisher" push -qu origin main
  local changed_sha
  changed_sha=$(git -C "$publisher" rev-parse HEAD)
  local changed_worker="$sandbox/changed-worker"
  local changed
  changed=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --worktree "$changed_worker" \
      --branch codex/fix-first-changed
  )
  [[ "$changed" == $'prepared\t'"$changed_worker"$'\tcodex/fix-first-changed\t'"$changed_sha"$'\t'* ]] \
    || fail 'a changed remote base should create a fresh attempt and worktree'
  [[ "${changed##*$'\t'}" != "$attempt_key" ]] \
    || fail 'a changed remote base should produce a new attempt identity'

  git -C "$repo" worktree remove "$changed_worker"
  git -C "$repo" branch -D codex/fix-first-changed >/dev/null
  rm -rf "$sandbox"
}

test_cleanup_requires_a_clean_published_worker() {
  local sandbox
  sandbox=$(mktemp -d)
  local repo="$sandbox/repo"
  local remote="$sandbox/remote.git"
  local worker="$sandbox/worker"
  mkdir -p "$repo"
  new_repo "$repo"
  write_follow_up "$repo/docs/follow-ups/first.md" 'First symptom'
  commit_at "$repo" '2026-01-01T00:00:00Z' 'docs: record first follow-up'
  git -C "$repo" branch -M main
  git init -q --bare "$remote"
  git -C "$remote" symbolic-ref HEAD refs/heads/main
  git -C "$repo" remote add origin "$remote"
  git -C "$repo" push -qu origin main

  local prepared
  prepared=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --worktree "$worker" \
      --branch codex/fix-first
  )
  local base_sha
  base_sha=$(printf '%s\n' "$prepared" | awk -F '\t' '{ print $4 }')

  local empty_worker="$sandbox/empty-worker"
  "$DISPATCHER" prepare \
    --repo "$repo" \
    --follow-up docs/follow-ups/first.md \
    --worktree "$empty_worker" \
    --branch codex/no-change >/dev/null
  git -C "$repo" remote set-url origin "$sandbox/unavailable.git"
  "$DISPATCHER" cleanup \
    --repo "$repo" \
    --worktree "$empty_worker" \
    --base-sha "$base_sha" \
    --remote origin >/dev/null
  [[ ! -e "$empty_worker" ]] || fail 'cleanup should remove a clean worker that never moved beyond its verified base'
  if git -C "$repo" show-ref --verify --quiet refs/heads/codex/no-change; then
    fail 'cleanup should remove the local branch for an unpublished no-change worker'
  fi

  local unavailable_output
  if unavailable_output=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --worktree "$sandbox/unavailable-worker" \
      --branch codex/unavailable-base 2>&1
  ); then
    fail 'prepare should stop when the remote default branch cannot be resolved'
  fi
  [[ "$unavailable_output" == *'cannot resolve the default branch for remote: origin'* ]] \
    || fail 'prepare should report the unavailable remote as an explicit base blocker'
  [[ ! -e "$sandbox/unavailable-worker" ]] \
    || fail 'remote-base failure should not create a worktree'
  if git -C "$repo" show-ref --verify --quiet refs/heads/codex/unavailable-base; then
    fail 'remote-base failure should not create a local branch'
  fi
  git -C "$repo" remote set-url origin "$remote"

  local blocked_parent="$sandbox/blocked-parent"
  mkdir -p "$blocked_parent"
  chmod 500 "$blocked_parent"
  if "$DISPATCHER" prepare \
    --repo "$repo" \
    --follow-up docs/follow-ups/first.md \
    --worktree "$blocked_parent/worker" \
    --branch codex/failed-create >/dev/null 2>&1; then
    chmod 700 "$blocked_parent"
    fail 'prepare should fail when the worktree directory cannot be created'
  fi
  chmod 700 "$blocked_parent"
  if git -C "$repo" show-ref --verify --quiet refs/heads/codex/failed-create; then
    fail 'failed worktree creation should not leave a local branch that blocks retries'
  fi

  git -C "$worker" config user.email eval@example.com
  git -C "$worker" config user.name 'Resolve Follow-ups Eval'
  printf 'verified fix\n' >"$worker/fix.txt"
  git -C "$worker" add fix.txt
  git -C "$worker" commit -qm 'fix: resolve first symptom'

  if "$DISPATCHER" cleanup \
    --repo "$repo" \
    --worktree "$worker" \
    --remote origin >/dev/null 2>&1; then
    fail 'cleanup should refuse a worker whose HEAD is not published'
  fi
  [[ -d "$worker" ]] || fail 'refused cleanup should preserve the worker'

  git -C "$worker" push -qu origin codex/fix-first
  local head
  head=$(git -C "$worker" rev-parse HEAD)
  local cleaned
  cleaned=$(
    "$DISPATCHER" cleanup \
      --repo "$repo" \
      --worktree "$worker" \
      --remote origin
  )
  assert_eq $'cleaned\t'"$worker"$'\tcodex/fix-first\t'"$head" "$cleaned" \
    'cleanup should remove a clean worker after its exact HEAD is published'
  [[ ! -e "$worker" ]] || fail 'successful cleanup should remove the worktree directory'

  rm -rf "$sandbox"
}

test_list_limits_candidates_and_reports_invalid_items
test_prepare_fetches_and_verifies_the_remote_default_branch
test_cleanup_requires_a_clean_published_worker
printf 'PASS: resolve-follow-ups dispatcher\n'
