#!/usr/bin/env bash
# Stop only Portless child processes whose routes belong to the current
# worktree branch. Other runners are left for the invoking agent to handle.

set -uo pipefail

command -v portless >/dev/null 2>&1 || exit 0

task_git_dir=$(git rev-parse --git-dir 2>/dev/null) || exit 0
task_common_dir=$(git rev-parse --git-common-dir 2>/dev/null) || exit 0
[ "$task_git_dir" = "$task_common_dir" ] && exit 0

task_branch=$(git branch --show-current 2>/dev/null) || exit 0
[ -z "$task_branch" ] && exit 0

task_segment=${task_branch##*/}
task_prefix=$(printf '%s' "$task_segment" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9-]/-/g; s/-+/-/g; s/^-+//; s/-+$//')
[ -z "$task_prefix" ] && exit 0

task_pids=$(portless list 2>/dev/null \
  | sed $'s/\x1b\\[[0-9;]*m//g' \
  | grep -E "^[[:space:]]*https://${task_prefix}\\." \
  | grep -oE 'pid [0-9]+' \
  | awk '{print $2}' \
  | sort -u)
[ -z "$task_pids" ] && exit 0

printf "Stopping development server(s) owned by worktree branch '%s':\n" "$task_branch"
for task_pid in $task_pids; do
  printf '  - pid %s\n' "$task_pid"
  kill -TERM -- "$task_pid" 2>/dev/null || true
done

portless prune >/dev/null 2>&1 || true
