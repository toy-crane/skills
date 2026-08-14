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
  actual=$("$DISPATCHER" list --repo "$repo" --limit 3)
  local expected=$'candidate\tdocs/follow-ups/first.md\ncandidate\tdocs/follow-ups/second.md\ncandidate\tdocs/follow-ups/third.md\ninvalid-follow-up\tdocs/follow-ups/invalid.md'
  assert_eq "$expected" "$actual" \
    'list should select the three oldest valid follow-ups and report invalid files'

  local all_items
  all_items=$("$DISPATCHER" list --repo "$repo")
  local expected_all=$'candidate\tdocs/follow-ups/first.md\ncandidate\tdocs/follow-ups/second.md\ncandidate\tdocs/follow-ups/third.md\ncandidate\tdocs/follow-ups/fourth.md\ninvalid-follow-up\tdocs/follow-ups/invalid.md'
  assert_eq "$expected_all" "$all_items" \
    'unbounded list should expose the ordered backlog so skipped attempts do not starve newer candidates'
  rm -rf "$sandbox"
}

test_attempt_claims_are_atomic_and_terminal_state_is_immutable() {
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
  identity=$("$DISPATCHER" identity --repo "$repo" --follow-up docs/follow-ups/first.md)
  local identity_prefix=$'eligible\tdocs/follow-ups/first.md\t'"$remote_sha"$'\t'
  [[ "$identity" == "$identity_prefix"* ]] \
    || fail 'identity should resolve an eligible follow-up against fresh remote state'
  local identity_key=${identity##*$'\t'}

  local prepared
  prepared=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --worktree "$worker" \
      --branch codex/fix-first
  )
  local status prepared_path prepared_branch base_sha attempt_key owner
  IFS=$'\t' read -r status prepared_path prepared_branch base_sha attempt_key owner <<<"$prepared"
  assert_eq 'prepared' "$status" 'prepare should create an owned worker'
  assert_eq "$worker" "$prepared_path" 'prepare should report its exact worktree'
  assert_eq 'codex/fix-first' "$prepared_branch" 'prepare should report its exact branch'
  assert_eq "$remote_sha" "$base_sha" 'prepare should use the fetched remote default branch'
  assert_eq "$identity_key" "$attempt_key" 'identity and prepare should share one attempt key'
  [[ "$owner" =~ ^[A-Za-z0-9._-]+$ ]] || fail 'prepare should return an owner token'
  assert_eq "$remote_sha" "$(git -C "$worker" rev-parse HEAD)" \
    'prepared worktree should start at the fetched remote default branch'

  local duplicate_worker="$sandbox/duplicate-worker"
  local duplicate
  duplicate=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --worktree "$duplicate_worker" \
      --branch codex/fix-first-duplicate
  )
  assert_eq $'skipped-unchanged\tdocs/follow-ups/first.md\t'"$base_sha"$'\t'"$attempt_key"$'\tclaimed\t'"$owner" "$duplicate" \
    'a second sweep should observe the atomic claim instead of creating a duplicate worker'
  [[ ! -e "$duplicate_worker" ]] || fail 'duplicate claim should not create another worktree'
  if git -C "$repo" show-ref --verify --quiet refs/heads/codex/fix-first-duplicate; then
    fail 'duplicate claim should not create another branch'
  fi

  if "$DISPATCHER" mark \
    --repo "$repo" \
    --follow-up docs/follow-ups/first.md \
    --base-sha "$base_sha" \
    --owner not-the-owner \
    --outcome blocked >/dev/null 2>&1; then
    fail 'mark should reject a worker that does not own the attempt claim'
  fi

  local recorded
  recorded=$(
    "$DISPATCHER" mark \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --base-sha "$base_sha" \
      --owner "$owner" \
      --outcome not-reproduced
  )
  assert_eq $'recorded\t'"$attempt_key"$'\tnot-reproduced' "$recorded" \
    'the claim owner should record one terminal outcome'
  if "$DISPATCHER" mark \
    --repo "$repo" \
    --follow-up docs/follow-ups/first.md \
    --base-sha "$base_sha" \
    --owner "$owner" \
    --outcome blocked >/dev/null 2>&1; then
    fail 'a terminal outcome should not be overwritten by a later result'
  fi
  local skipped
  skipped=$("$DISPATCHER" identity --repo "$repo" --follow-up docs/follow-ups/first.md)
  assert_eq $'skipped-unchanged\tdocs/follow-ups/first.md\t'"$base_sha"$'\t'"$attempt_key"$'\tnot-reproduced' "$skipped" \
    'identity should expose the immutable terminal outcome'
  if "$DISPATCHER" clear \
    --repo "$repo" \
    --follow-up docs/follow-ups/first.md \
    --base-sha "$base_sha" >/dev/null 2>&1; then
    fail 'clear should preserve ownership while the bound worktree still exists'
  fi

  "$DISPATCHER" cleanup \
    --repo "$repo" \
    --worktree "$worker" \
    --attempt-key "$attempt_key" \
    --owner "$owner" >/dev/null
  local cleared
  cleared=$(
    "$DISPATCHER" clear \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --base-sha "$base_sha"
  )
  assert_eq $'cleared\t'"$attempt_key" "$cleared" \
    'clear should remove only the exact terminal attempt selected for retry'

  local claim_one="$sandbox/claim-one"
  local claim_two="$sandbox/claim-two"
  "$DISPATCHER" claim \
    --repo "$repo" \
    --follow-up docs/follow-ups/first.md \
    --base-sha "$base_sha" >"$claim_one" &
  local claim_one_pid=$!
  "$DISPATCHER" claim \
    --repo "$repo" \
    --follow-up docs/follow-ups/first.md \
    --base-sha "$base_sha" >"$claim_two" &
  local claim_two_pid=$!
  wait "$claim_one_pid"
  wait "$claim_two_pid"

  local claimed skipped_claim
  if [[ "$(sed -n '1s/\t.*//p' "$claim_one")" == 'claimed' ]]; then
    claimed=$(<"$claim_one")
    skipped_claim=$(<"$claim_two")
  else
    claimed=$(<"$claim_two")
    skipped_claim=$(<"$claim_one")
  fi
  local claim_status claim_key second_owner
  IFS=$'\t' read -r claim_status claim_key second_owner <<<"$claimed"
  assert_eq 'claimed' "$claim_status" 'exactly one overlapping native worker should claim the attempt'
  assert_eq "$attempt_key" "$claim_key" 'claim should reserve the requested attempt identity'
  assert_eq $'skipped-unchanged\tdocs/follow-ups/first.md\t'"$base_sha"$'\t'"$attempt_key"$'\tclaimed\t'"$second_owner" "$skipped_claim" \
    'the overlapping native worker should observe the winning owner token'

  local native_worker="$sandbox/native-worker"
  git -C "$repo" worktree add -q -b codex/native-first "$native_worker" "$base_sha"
  local bound
  bound=$(
    "$DISPATCHER" bind \
      --repo "$repo" \
      --attempt-key "$attempt_key" \
      --owner "$second_owner" \
      --worktree "$native_worker" \
      --branch codex/native-first
  )
  local native_root
  native_root=$(CDPATH= cd -- "$native_worker" && pwd -P)
  assert_eq $'bound\t'"$attempt_key"$'\t'"$native_root"$'\tcodex/native-first' "$bound" \
    'a native runtime worktree should be bound to the exact winning claim'
  "$DISPATCHER" cleanup \
    --repo "$repo" \
    --worktree "$native_worker" \
    --attempt-key "$attempt_key" \
    --owner "$second_owner" >/dev/null

  local pull_request_url='https://github.com/example/repo/pull/123'
  "$DISPATCHER" mark \
    --repo "$repo" \
    --follow-up docs/follow-ups/first.md \
    --base-sha "$base_sha" \
    --owner "$second_owner" \
    --outcome pull-request \
    --detail "$pull_request_url" >/dev/null
  local skipped_pr
  skipped_pr=$("$DISPATCHER" identity --repo "$repo" --follow-up docs/follow-ups/first.md)
  assert_eq $'skipped-unchanged\tdocs/follow-ups/first.md\t'"$base_sha"$'\t'"$attempt_key"$'\tpull-request\t'"$pull_request_url" "$skipped_pr" \
    'identity should expose the existing pull request instead of starting a duplicate worker'
  "$DISPATCHER" clear \
    --repo "$repo" \
    --follow-up docs/follow-ups/first.md \
    --base-sha "$base_sha" >/dev/null

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
  local changed_status changed_path changed_branch changed_base changed_key changed_owner
  IFS=$'\t' read -r changed_status changed_path changed_branch changed_base changed_key changed_owner <<<"$changed"
  assert_eq 'prepared' "$changed_status" 'a changed remote base should create a fresh attempt'
  assert_eq "$changed_sha" "$changed_base" 'fresh attempt should use the changed remote base'
  [[ "$changed_key" != "$attempt_key" ]] || fail 'changed base should produce a new attempt identity'
  "$DISPATCHER" cleanup \
    --repo "$repo" \
    --worktree "$changed_worker" \
    --attempt-key "$changed_key" \
    --owner "$changed_owner" >/dev/null

  rm -rf "$sandbox"
}

test_cleanup_requires_exact_attempt_ownership() {
  local sandbox
  sandbox=$(mktemp -d)
  local repo="$sandbox/repo"
  local remote="$sandbox/remote.git"
  mkdir -p "$repo"
  new_repo "$repo"
  write_follow_up "$repo/docs/follow-ups/first.md" 'First symptom'
  write_follow_up "$repo/docs/follow-ups/second.md" 'Second symptom'
  write_follow_up "$repo/docs/follow-ups/third.md" 'Third symptom'
  commit_at "$repo" '2026-01-01T00:00:00Z' 'docs: record cleanup follow-ups'
  git -C "$repo" branch -M main
  git init -q --bare "$remote"
  git -C "$remote" symbolic-ref HEAD refs/heads/main
  git -C "$repo" remote add origin "$remote"
  git -C "$repo" push -qu origin main

  local first_worker="$sandbox/first-worker"
  local first
  first=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/first.md \
      --worktree "$first_worker" \
      --branch codex/fix-first
  )
  local s1 p1 b1 base1 key1 owner1
  IFS=$'\t' read -r s1 p1 b1 base1 key1 owner1 <<<"$first"

  local second_worker="$sandbox/second-worker"
  local second
  second=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/second.md \
      --worktree "$second_worker" \
      --branch codex/fix-second
  )
  local s2 p2 b2 base2 key2 owner2
  IFS=$'\t' read -r s2 p2 b2 base2 key2 owner2 <<<"$second"

  if "$DISPATCHER" cleanup \
    --repo "$repo" \
    --worktree "$second_worker" \
    --attempt-key "$key1" \
    --owner "$owner1" >/dev/null 2>&1; then
    fail 'cleanup should refuse another worker even when it shares the same base SHA'
  fi
  [[ -d "$second_worker" ]] || fail 'ownership mismatch should preserve the other worker'

  git -C "$repo" remote set-url origin "$sandbox/unavailable.git"
  "$DISPATCHER" cleanup \
    --repo "$repo" \
    --worktree "$second_worker" \
    --attempt-key "$key2" \
    --owner "$owner2" >/dev/null
  [[ ! -e "$second_worker" ]] \
    || fail 'owned no-change cleanup should not depend on remote availability'
  git -C "$repo" remote set-url origin "$remote"

  local unavailable_output
  git -C "$repo" remote set-url origin "$sandbox/unavailable.git"
  if unavailable_output=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/third.md \
      --worktree "$sandbox/unavailable-worker" \
      --branch codex/unavailable-base 2>&1
  ); then
    fail 'prepare should stop when the remote default branch cannot be resolved'
  fi
  [[ "$unavailable_output" == *'cannot resolve the default branch for remote: origin'* ]] \
    || fail 'prepare should report the unavailable remote as an explicit base blocker'
  [[ ! -e "$sandbox/unavailable-worker" ]] \
    || fail 'remote-base failure should not create a worktree'
  git -C "$repo" remote set-url origin "$remote"

  local blocked_parent="$sandbox/blocked-parent"
  mkdir -p "$blocked_parent"
  chmod 500 "$blocked_parent"
  if "$DISPATCHER" prepare \
    --repo "$repo" \
    --follow-up docs/follow-ups/third.md \
    --worktree "$blocked_parent/worker" \
    --branch codex/failed-create >/dev/null 2>&1; then
    chmod 700 "$blocked_parent"
    fail 'prepare should fail when the worktree directory cannot be created'
  fi
  chmod 700 "$blocked_parent"
  if git -C "$repo" show-ref --verify --quiet refs/heads/codex/failed-create; then
    fail 'failed worktree creation should not leave a local branch that blocks retries'
  fi
  local third_identity
  third_identity=$("$DISPATCHER" identity --repo "$repo" --follow-up docs/follow-ups/third.md)
  [[ "$third_identity" == $'eligible\tdocs/follow-ups/third.md\t'* ]] \
    || fail 'failed worktree creation should release its attempt claim'

  local hooks="$sandbox/hooks"
  mkdir -p "$hooks"
  cat >"$hooks/post-checkout" <<'EOF'
#!/usr/bin/env bash
git branch codex/hook-conflict HEAD >/dev/null 2>&1 || true
EOF
  chmod +x "$hooks/post-checkout"
  git -C "$repo" config core.hooksPath "$hooks"
  local raced_worker="$sandbox/raced-worker"
  if "$DISPATCHER" prepare \
    --repo "$repo" \
    --follow-up docs/follow-ups/third.md \
    --worktree "$raced_worker" \
    --branch codex/hook-conflict >/dev/null 2>&1; then
    fail 'prepare should stop when another process creates the branch during worktree setup'
  fi
  git -C "$repo" config --unset core.hooksPath
  [[ ! -e "$raced_worker" ]] \
    || fail 'post-creation setup failure should remove only the unbound worktree it created'
  git -C "$repo" show-ref --verify --quiet refs/heads/codex/hook-conflict \
    || fail 'prepare should preserve a branch created by another process during setup'
  third_identity=$("$DISPATCHER" identity --repo "$repo" --follow-up docs/follow-ups/third.md)
  [[ "$third_identity" == $'eligible\tdocs/follow-ups/third.md\t'* ]] \
    || fail 'safe post-creation failure should release the attempt claim for retry'

  cat >"$hooks/post-checkout" <<'EOF'
#!/usr/bin/env bash
git -c user.email=eval@example.com -c user.name='Resolve Follow-ups Eval' \
  commit --allow-empty -qm 'test: mutate prepared head'
printf 'hook dirtied worker\n' >post-checkout-dirty.txt
EOF
  chmod +x "$hooks/post-checkout"
  git -C "$repo" config core.hooksPath "$hooks"
  local mismatched_worker="$sandbox/mismatched-worker"
  local mismatch_output
  if mismatch_output=$(
    "$DISPATCHER" prepare \
      --repo "$repo" \
      --follow-up docs/follow-ups/third.md \
      --worktree "$mismatched_worker" \
      --branch codex/hook-mismatch 2>&1
  ); then
    fail 'prepare should stop when a creation hook changes the verified base'
  fi
  git -C "$repo" config --unset core.hooksPath
  [[ "$mismatch_output" == *'attempt-key '* && "$mismatch_output" == *'owner '* ]] \
    || fail 'an unsafe post-creation failure should expose recovery ownership in its error'
  third_identity=$("$DISPATCHER" identity --repo "$repo" --follow-up docs/follow-ups/third.md)
  [[ "$third_identity" == $'skipped-unchanged\tdocs/follow-ups/third.md\t'*$'\tblocked\t'* ]] \
    || fail 'an unremovable post-creation failure should become terminal instead of remaining claimed'

  git -C "$first_worker" config user.email eval@example.com
  git -C "$first_worker" config user.name 'Resolve Follow-ups Eval'
  printf 'verified fix\n' >"$first_worker/fix.txt"
  git -C "$first_worker" add fix.txt
  git -C "$first_worker" commit -qm 'fix: resolve first symptom'
  if "$DISPATCHER" cleanup \
    --repo "$repo" \
    --worktree "$first_worker" \
    --attempt-key "$key1" \
    --owner "$owner1" >/dev/null 2>&1; then
    fail 'cleanup should refuse an owned worker whose changed HEAD is not published'
  fi
  git -C "$first_worker" push -qu origin codex/fix-first
  local first_head
  first_head=$(git -C "$first_worker" rev-parse HEAD)
  local cleaned
  cleaned=$(
    "$DISPATCHER" cleanup \
      --repo "$repo" \
      --worktree "$first_worker" \
      --attempt-key "$key1" \
      --owner "$owner1"
  )
  assert_eq $'cleaned\t'"$first_worker"$'\tcodex/fix-first\t'"$first_head" "$cleaned" \
    'cleanup should remove the exact owned worker after its changed HEAD is published'
  [[ ! -e "$first_worker" ]] || fail 'successful cleanup should remove the owned worktree'

  rm -rf "$sandbox"
}

test_list_limits_candidates_and_reports_invalid_items
test_attempt_claims_are_atomic_and_terminal_state_is_immutable
test_cleanup_requires_exact_attempt_ownership
printf 'PASS: resolve-follow-ups dispatcher\n'
