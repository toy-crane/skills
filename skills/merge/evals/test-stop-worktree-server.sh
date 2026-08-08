#!/usr/bin/env bash

set -euo pipefail

task_helper=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/scripts/stop-worktree-server.sh
task_live_pids=()
task_passed=0

cleanup_eval_processes() {
  for task_pid in "${task_live_pids[@]}"; do
    kill -TERM -- "$task_pid" 2>/dev/null || true
  done
}
trap cleanup_eval_processes EXIT

start_eval_process() {
  sleep 300 &
  task_started_pid=$!
  task_live_pids+=("$task_started_pid")
}

assert_alive() {
  kill -0 "$1" 2>/dev/null || {
    printf 'expected pid %s to remain alive\n' "$1" >&2
    exit 1
  }
}

assert_stopped() {
  task_attempt=0
  while kill -0 "$1" 2>/dev/null && [ "$task_attempt" -lt 20 ]; do
    sleep 0.05
    task_attempt=$((task_attempt + 1))
  done
  if kill -0 "$1" 2>/dev/null; then
    printf 'expected pid %s to stop\n' "$1" >&2
    exit 1
  fi
}

git() {
  case "$*" in
    'rev-parse --git-dir') printf '%s\n' "$task_mock_git_dir" ;;
    'rev-parse --git-common-dir') printf '%s\n' "$task_mock_common_dir" ;;
    'branch --show-current') printf '%s\n' "$task_mock_branch" ;;
    *) return 1 ;;
  esac
}

portless() {
  case "${1:-}" in
    list) printf '%b' "$task_mock_routes" ;;
    prune) return 0 ;;
    *) return 1 ;;
  esac
}
export -f git portless

# A normal checkout is outside the helper's authority.
start_eval_process
task_normal_pid=$task_started_pid
task_mock_git_dir='.git'
task_mock_common_dir='.git'
task_mock_branch='feature/cart'
task_mock_routes="https://cart.app.localhost pid $task_normal_pid\n"
export task_mock_git_dir task_mock_common_dir task_mock_branch task_mock_routes
bash "$task_helper"
assert_alive "$task_normal_pid"
task_passed=$((task_passed + 1))

# Detached worktrees have no branch ownership signal and remain untouched.
start_eval_process
task_detached_pid=$task_started_pid
task_mock_git_dir='.git/worktrees/eval'
task_mock_common_dir='.git'
task_mock_branch=''
task_mock_routes="https://eval.app.localhost pid $task_detached_pid\n"
export task_mock_git_dir task_mock_common_dir task_mock_branch task_mock_routes
bash "$task_helper"
assert_alive "$task_detached_pid"
task_passed=$((task_passed + 1))

# Branch normalization, ANSI stripping, duplicate routes, and sibling apps all
# resolve to the worktree prefix; an unrelated route remains alive.
start_eval_process
task_owned_pid_one=$task_started_pid
start_eval_process
task_owned_pid_two=$task_started_pid
start_eval_process
task_unrelated_pid=$task_started_pid
task_mock_git_dir='.git/worktrees/feature-alpha'
task_mock_common_dir='.git'
task_mock_branch='team/Feature__Alpha'
task_mock_routes="\033[32mhttps://feature-alpha.web.localhost\033[0m pid $task_owned_pid_one\nhttps://feature-alpha.api.localhost pid $task_owned_pid_two\nhttps://feature-alpha.web.localhost pid $task_owned_pid_one\nhttps://other.web.localhost pid $task_unrelated_pid\n"
export task_mock_git_dir task_mock_common_dir task_mock_branch task_mock_routes
bash "$task_helper"
assert_stopped "$task_owned_pid_one"
assert_stopped "$task_owned_pid_two"
assert_alive "$task_unrelated_pid"
task_passed=$((task_passed + 1))

# A linked worktree with no matching route is a safe no-op.
start_eval_process
task_no_match_pid=$task_started_pid
task_mock_git_dir='.git/worktrees/no-match'
task_mock_common_dir='.git'
task_mock_branch='feature/no-match'
task_mock_routes="https://other.app.localhost pid $task_no_match_pid\n"
export task_mock_git_dir task_mock_common_dir task_mock_branch task_mock_routes
bash "$task_helper"
assert_alive "$task_no_match_pid"
task_passed=$((task_passed + 1))

# A branch segment that cannot produce a route prefix is also a safe no-op.
start_eval_process
task_empty_prefix_pid=$task_started_pid
task_mock_git_dir='.git/worktrees/empty-prefix'
task_mock_common_dir='.git'
task_mock_branch='team/___'
task_mock_routes="https://other.app.localhost pid $task_empty_prefix_pid\n"
export task_mock_git_dir task_mock_common_dir task_mock_branch task_mock_routes
bash "$task_helper"
assert_alive "$task_empty_prefix_pid"
task_passed=$((task_passed + 1))

printf 'stop-worktree-server evals passed: %s\n' "$task_passed"
