#!/usr/bin/env bash
set -euo pipefail

die() {
  printf 'resolve-follow-ups: %s\n' "$1" >&2
  exit 64
}

usage() {
  cat >&2 <<'EOF'
Usage:
  resolve-follow-ups.sh list --repo PATH [--limit COUNT]
  resolve-follow-ups.sh identity --repo PATH --follow-up PATH [--remote NAME]
  resolve-follow-ups.sh prepare --repo PATH --follow-up PATH --worktree PATH --branch NAME [--remote NAME]
  resolve-follow-ups.sh mark --repo PATH --follow-up PATH --base-sha SHA --outcome OUTCOME [--detail TEXT]
  resolve-follow-ups.sh clear --repo PATH --follow-up PATH --base-sha SHA
  resolve-follow-ups.sh cleanup --repo PATH --worktree PATH [--base-sha SHA] [--remote NAME]
EOF
  exit 64
}

require_value() {
  local flag=$1
  local value=${2-}
  [[ -n "$value" ]] || die "$flag requires a value"
}

validate_follow_up() {
  local path=$1
  local field
  for field in 'Symptom' 'Observed evidence' 'Suspected cause' 'What was tried' 'Proposed next step'; do
    grep -Eq "^\\*\\*${field}\\*\\*: .+" "$path" || return 1
  done
}

repo_root_for() {
  local repo=$1
  git -C "$repo" rev-parse --show-toplevel 2>/dev/null \
    || die "not a Git repository: $repo"
}

relative_follow_up_path() {
  local repo_root=$1
  local follow_up=$2
  local candidate
  case "$follow_up" in
    /*) candidate=$follow_up ;;
    *) candidate="$repo_root/$follow_up" ;;
  esac

  [[ -f "$candidate" ]] || die "follow-up does not exist: $follow_up"
  local parent
  parent=$(CDPATH= cd -- "$(dirname -- "$candidate")" && pwd -P)
  [[ "$parent" == "$repo_root/docs/follow-ups" ]] \
    || die 'follow-up must be a Markdown file directly under docs/follow-ups/'
  [[ "$candidate" == *.md ]] || die 'follow-up must use the .md extension'
  printf 'docs/follow-ups/%s\n' "$(basename -- "$candidate")"
}

remote_default_branch() {
  local repo_root=$1
  local remote=$2
  local branch
  branch=$(
    git -C "$repo_root" ls-remote --symref "$remote" HEAD 2>/dev/null \
      | awk '$1 == "ref:" && $2 ~ /^refs\/heads\// { sub(/^refs\/heads\//, "", $2); print $2; exit }'
  )
  [[ -n "$branch" ]] || die "cannot resolve the default branch for remote: $remote"
  printf '%s\n' "$branch"
}

git_common_dir() {
  local repo_root=$1
  local common
  common=$(git -C "$repo_root" rev-parse --git-common-dir)
  case "$common" in
    /*) printf '%s\n' "$common" ;;
    *) (CDPATH= cd -- "$repo_root/$common" && pwd -P) ;;
  esac
}

attempt_key_at_base() {
  local repo_root=$1
  local relative=$2
  local base_sha=$3
  git -C "$repo_root" cat-file -e "$base_sha:$relative" 2>/dev/null \
    || die "follow-up is not present at base SHA: $relative"
  local blob_sha
  blob_sha=$(git -C "$repo_root" rev-parse "$base_sha:$relative")
  printf '%s\n%s\n%s\n' "$relative" "$base_sha" "$blob_sha" \
    | git -C "$repo_root" hash-object --stdin
}

resolve_attempt() {
  local repo=$1
  local follow_up=$2
  local remote=$3
  local repo_root
  repo_root=$(repo_root_for "$repo")
  local relative
  relative=$(relative_follow_up_path "$repo_root" "$follow_up")
  local default_branch
  default_branch=$(remote_default_branch "$repo_root" "$remote")

  git -C "$repo_root" fetch --prune "$remote" \
    "+refs/heads/$default_branch:refs/remotes/$remote/$default_branch" >/dev/null
  local base_sha
  base_sha=$(git -C "$repo_root" rev-parse "refs/remotes/$remote/$default_branch^{commit}")
  git -C "$repo_root" cat-file -e "$base_sha:$relative" 2>/dev/null \
    || die "follow-up is not present on $remote/$default_branch: $relative"

  local field
  for field in 'Symptom' 'Observed evidence' 'Suspected cause' 'What was tried' 'Proposed next step'; do
    git -C "$repo_root" show "$base_sha:$relative" \
      | grep -Eq "^\\*\\*${field}\\*\\*: .+" \
      || die "follow-up on $remote/$default_branch is missing: $field"
  done

  local attempt_key
  attempt_key=$(attempt_key_at_base "$repo_root" "$relative" "$base_sha")
  local common_dir
  common_dir=$(git_common_dir "$repo_root")
  local attempt_file="$common_dir/resolve-follow-ups/attempts/$attempt_key"
  if [[ -f "$attempt_file" ]]; then
    local prior_outcome
    local prior_detail
    prior_outcome=$(sed -n '1p' "$attempt_file")
    prior_detail=$(sed -n '2p' "$attempt_file")
    printf 'skipped-unchanged\t%s\t%s\t%s\t%s' \
      "$relative" "$base_sha" "$attempt_key" "$prior_outcome"
    if [[ -n "$prior_detail" ]]; then
      printf '\t%s' "$prior_detail"
    fi
    printf '\n'
    return 0
  fi
  printf 'eligible\t%s\t%s\t%s\n' "$relative" "$base_sha" "$attempt_key"
}

identity_attempt() {
  local repo=''
  local follow_up=''
  local remote=origin

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --repo|--follow-up|--remote)
        require_value "$1" "${2-}"
        case "$1" in
          --repo) repo=$2 ;;
          --follow-up) follow_up=$2 ;;
          --remote) remote=$2 ;;
        esac
        shift 2
        ;;
      *)
        die "unknown identity option: $1"
        ;;
    esac
  done

  [[ -n "$repo" ]] || die 'identity requires --repo'
  [[ -n "$follow_up" ]] || die 'identity requires --follow-up'
  resolve_attempt "$repo" "$follow_up" "$remote"
}

list_follow_ups() {
  local repo=''
  local limit=0

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --repo)
        require_value "$1" "${2-}"
        repo=$2
        shift 2
        ;;
      --limit)
        require_value "$1" "${2-}"
        limit=$2
        shift 2
        ;;
      *)
        die "unknown list option: $1"
        ;;
    esac
  done

  [[ -n "$repo" ]] || die 'list requires --repo'
  [[ "$limit" =~ ^[0-9]+$ ]] || die '--limit must be a non-negative integer'

  local repo_root
  repo_root=$(repo_root_for "$repo")
  local follow_up_dir="$repo_root/docs/follow-ups"
  [[ -d "$follow_up_dir" ]] || exit 0

  local temp_dir
  temp_dir=$(mktemp -d)
  local candidates="$temp_dir/candidates"
  local invalid="$temp_dir/invalid"
  : >"$candidates"
  : >"$invalid"

  local path
  while IFS= read -r path; do
    local relative=${path#"$repo_root"/}
    [[ "$relative" != *$'\t'* && "$relative" != *$'\n'* ]] \
      || die "follow-up path contains a tab or newline: $relative"
    if validate_follow_up "$path"; then
      local discovered_at
      discovered_at=$(
        git -C "$repo_root" log --diff-filter=A --format=%ct -- "$relative" \
          | tail -n 1
      )
      [[ -n "$discovered_at" ]] || discovered_at=0
      printf '%020d\t%s\n' "$discovered_at" "$relative" >>"$candidates"
    else
      printf '%s\n' "$relative" >>"$invalid"
    fi
  done < <(find "$follow_up_dir" -maxdepth 1 -type f -name '*.md' -print | sort)

  sort -k1,1 -k2,2 "$candidates" \
    | awk -F '\t' -v limit="$limit" 'limit == 0 || NR <= limit { print "candidate\t" $2 }'
  sort "$invalid" | sed 's/^/invalid-follow-up\t/'
  rm -rf "$temp_dir"
}

prepare_worker() {
  local repo=''
  local follow_up=''
  local worktree=''
  local branch=''
  local remote=origin

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --repo|--follow-up|--worktree|--branch|--remote)
        require_value "$1" "${2-}"
        case "$1" in
          --repo) repo=$2 ;;
          --follow-up) follow_up=$2 ;;
          --worktree) worktree=$2 ;;
          --branch) branch=$2 ;;
          --remote) remote=$2 ;;
        esac
        shift 2
        ;;
      *)
        die "unknown prepare option: $1"
        ;;
    esac
  done

  [[ -n "$repo" ]] || die 'prepare requires --repo'
  [[ -n "$follow_up" ]] || die 'prepare requires --follow-up'
  [[ -n "$worktree" ]] || die 'prepare requires --worktree'
  [[ -n "$branch" ]] || die 'prepare requires --branch'
  git check-ref-format --branch "$branch" >/dev/null 2>&1 \
    || die "invalid branch name: $branch"
  [[ ! -e "$worktree" ]] || die "worktree path already exists: $worktree"
  [[ -d "$(dirname -- "$worktree")" ]] \
    || die "worktree parent does not exist: $(dirname -- "$worktree")"

  local identity
  identity=$(resolve_attempt "$repo" "$follow_up" "$remote")
  local status relative base_sha attempt_key prior_outcome
  IFS=$'\t' read -r status relative base_sha attempt_key prior_outcome <<<"$identity"
  if [[ "$status" == 'skipped-unchanged' ]]; then
    printf '%s\n' "$identity"
    return 0
  fi
  [[ "$status" == 'eligible' ]] || die "unexpected identity status: $status"

  local repo_root
  repo_root=$(repo_root_for "$repo")

  git -C "$repo_root" show-ref --verify --quiet "refs/heads/$branch" \
    && die "branch already exists: $branch"
  git -C "$repo_root" worktree add -q -b "$branch" "$worktree" "$base_sha"
  local actual_sha
  actual_sha=$(git -C "$worktree" rev-parse HEAD)
  if [[ "$actual_sha" != "$base_sha" ]]; then
    git -C "$repo_root" worktree remove --force "$worktree" >/dev/null 2>&1 || true
    git -C "$repo_root" branch -D "$branch" >/dev/null 2>&1 || true
    die "prepared worktree HEAD $actual_sha does not match base $base_sha"
  fi

  printf 'prepared\t%s\t%s\t%s\t%s\n' \
    "$worktree" "$branch" "$base_sha" "$attempt_key"
}

mark_attempt() {
  local repo=''
  local follow_up=''
  local base_sha=''
  local outcome=''
  local detail=''

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --repo|--follow-up|--base-sha|--outcome|--detail)
        require_value "$1" "${2-}"
        case "$1" in
          --repo) repo=$2 ;;
          --follow-up) follow_up=$2 ;;
          --base-sha) base_sha=$2 ;;
          --outcome) outcome=$2 ;;
          --detail) detail=$2 ;;
        esac
        shift 2
        ;;
      *)
        die "unknown mark option: $1"
        ;;
    esac
  done

  [[ -n "$repo" ]] || die 'mark requires --repo'
  [[ -n "$follow_up" ]] || die 'mark requires --follow-up'
  [[ -n "$base_sha" ]] || die 'mark requires --base-sha'
  case "$outcome" in
    not-reproduced|needs-shaping|blocked) ;;
    pull-request)
      [[ -n "$detail" ]] || die 'pull-request outcome requires --detail with the pull request URL'
      ;;
    *) die 'mark outcome must be pull-request, not-reproduced, needs-shaping, or blocked' ;;
  esac
  [[ "$detail" != *$'\t'* && "$detail" != *$'\n'* ]] \
    || die 'mark detail cannot contain a tab or newline'

  local repo_root
  repo_root=$(repo_root_for "$repo")
  local relative
  relative=$(relative_follow_up_path "$repo_root" "$follow_up")
  local resolved_base
  resolved_base=$(git -C "$repo_root" rev-parse "$base_sha^{commit}" 2>/dev/null) \
    || die "base SHA is not a commit: $base_sha"
  [[ "$resolved_base" == "$base_sha" ]] \
    || die 'mark requires the full resolved base SHA returned by prepare'
  local attempt_key
  attempt_key=$(attempt_key_at_base "$repo_root" "$relative" "$base_sha")
  local common_dir
  common_dir=$(git_common_dir "$repo_root")
  local attempt_dir="$common_dir/resolve-follow-ups/attempts"
  mkdir -p "$attempt_dir"
  local temp_file="$attempt_dir/.${attempt_key}.$$"
  printf '%s\n%s\n' "$outcome" "$detail" >"$temp_file"
  mv "$temp_file" "$attempt_dir/$attempt_key"
  printf 'recorded\t%s\t%s' "$attempt_key" "$outcome"
  if [[ -n "$detail" ]]; then
    printf '\t%s' "$detail"
  fi
  printf '\n'
}

clear_attempt() {
  local repo=''
  local follow_up=''
  local base_sha=''

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --repo|--follow-up|--base-sha)
        require_value "$1" "${2-}"
        case "$1" in
          --repo) repo=$2 ;;
          --follow-up) follow_up=$2 ;;
          --base-sha) base_sha=$2 ;;
        esac
        shift 2
        ;;
      *)
        die "unknown clear option: $1"
        ;;
    esac
  done

  [[ -n "$repo" ]] || die 'clear requires --repo'
  [[ -n "$follow_up" ]] || die 'clear requires --follow-up'
  [[ -n "$base_sha" ]] || die 'clear requires --base-sha'

  local repo_root
  repo_root=$(repo_root_for "$repo")
  local relative
  relative=$(relative_follow_up_path "$repo_root" "$follow_up")
  local resolved_base
  resolved_base=$(git -C "$repo_root" rev-parse "$base_sha^{commit}" 2>/dev/null) \
    || die "base SHA is not a commit: $base_sha"
  [[ "$resolved_base" == "$base_sha" ]] \
    || die 'clear requires the full resolved base SHA returned by identity or prepare'
  local attempt_key
  attempt_key=$(attempt_key_at_base "$repo_root" "$relative" "$base_sha")
  local common_dir
  common_dir=$(git_common_dir "$repo_root")
  local attempt_file="$common_dir/resolve-follow-ups/attempts/$attempt_key"
  [[ -f "$attempt_file" ]] || die "attempt identity is not recorded: $attempt_key"
  rm "$attempt_file"
  printf 'cleared\t%s\n' "$attempt_key"
}

cleanup_worker() {
  local repo=''
  local worktree=''
  local remote=origin
  local base_sha=''

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --repo|--worktree|--remote|--base-sha)
        require_value "$1" "${2-}"
        case "$1" in
          --repo) repo=$2 ;;
          --worktree) worktree=$2 ;;
          --remote) remote=$2 ;;
          --base-sha) base_sha=$2 ;;
        esac
        shift 2
        ;;
      *)
        die "unknown cleanup option: $1"
        ;;
    esac
  done

  [[ -n "$repo" ]] || die 'cleanup requires --repo'
  [[ -n "$worktree" ]] || die 'cleanup requires --worktree'
  [[ -d "$worktree" ]] || die "worktree does not exist: $worktree"

  local repo_root
  repo_root=$(repo_root_for "$repo")
  local worker_root
  worker_root=$(repo_root_for "$worktree")
  [[ "$worker_root" != "$repo_root" ]] \
    || die 'cleanup refuses to remove the repository root'
  [[ "$(git_common_dir "$worker_root")" == "$(git_common_dir "$repo_root")" ]] \
    || die 'cleanup target does not belong to the repository'
  [[ -z "$(git -C "$worker_root" status --porcelain)" ]] \
    || die 'cleanup requires a clean worker worktree'

  local branch
  branch=$(git -C "$worker_root" symbolic-ref --quiet --short HEAD) \
    || die 'cleanup requires a named worker branch'
  local head
  head=$(git -C "$worker_root" rev-parse HEAD)
  local safe_no_change=false
  if [[ -n "$base_sha" ]]; then
    local resolved_base
    resolved_base=$(git -C "$repo_root" rev-parse "$base_sha^{commit}" 2>/dev/null) \
      || die "base SHA is not a commit: $base_sha"
    [[ "$resolved_base" == "$base_sha" ]] \
      || die 'cleanup requires the full resolved base SHA returned by identity or prepare'
    if [[ "$head" == "$base_sha" ]]; then
      safe_no_change=true
    fi
  fi
  local remote_head
  remote_head=$(
    git -C "$repo_root" ls-remote "$remote" "refs/heads/$branch" 2>/dev/null \
      | awk 'NR == 1 { print $1 }'
  )
  local safe_published=false
  if [[ -n "$remote_head" && "$remote_head" == "$head" ]]; then
    safe_published=true
  fi
  if [[ "$safe_no_change" != true && "$safe_published" != true ]]; then
    if [[ -n "$remote_head" ]]; then
      die "published branch HEAD $remote_head does not match worker HEAD $head"
    fi
    die "worker is neither unchanged at its verified base nor published to $remote: $branch"
  fi

  git -C "$repo_root" worktree remove "$worker_root"
  git -C "$repo_root" update-ref -d "refs/heads/$branch" "$head"
  printf 'cleaned\t%s\t%s\t%s\n' "$worktree" "$branch" "$head"
}

main() {
  local command=${1-}
  [[ -n "$command" ]] || usage
  shift

  case "$command" in
    list)
      list_follow_ups "$@"
      ;;
    identity)
      identity_attempt "$@"
      ;;
    prepare)
      prepare_worker "$@"
      ;;
    mark)
      mark_attempt "$@"
      ;;
    clear)
      clear_attempt "$@"
      ;;
    cleanup)
      cleanup_worker "$@"
      ;;
    *)
      die "unknown command: $command"
      ;;
  esac
}

main "$@"
