#!/usr/bin/env bash

set -euo pipefail

task_repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
# Usage: run-tdd-comparison.sh [baseline-ref] [runs] [workers]
# Runs the tdd skill at baseline-ref and in the working tree on the same
# comparison tasks, then scores both. Set TASK_CLAUDE_MODEL to pin the model and
# TASK_RESULTS_ROOT to keep results somewhere other than a new temp folder.
task_baseline_ref=${1:-$(git -C "$task_repo_root" merge-base HEAD main)}
task_runs=${2:-3}
task_workers=${3:-4}
task_compare_root="$task_repo_root/skills/workflow/tdd/evals/compare"
task_results_root=${TASK_RESULTS_ROOT:-$(mktemp -d "${TMPDIR:-/tmp}/tdd-comparison.XXXXXX")}
mkdir -p "$task_results_root"

# Stage each arm's skill: only SKILL.md and agent metadata, never the evals.
task_skill_root="$task_results_root/skills"
mkdir -p "$task_skill_root/baseline" "$task_skill_root/revised"
git -C "$task_repo_root" archive "$task_baseline_ref" skills/workflow/tdd/SKILL.md \
  | tar -x -O > "$task_skill_root/baseline/SKILL.md"
cp "$task_repo_root/skills/workflow/tdd/SKILL.md" "$task_skill_root/revised/SKILL.md"
printf 'baseline: %s\n' "$(git -C "$task_repo_root" rev-parse --short "$task_baseline_ref")" \
  > "$task_results_root/arms.txt"
printf 'revised: working tree at %s\n' "$(git -C "$task_repo_root" rev-parse --short HEAD)" \
  >> "$task_results_root/arms.txt"

run_comparison_case() {
  task_arm=$1
  task_name=$2
  task_run=$3
  task_run_dir="$task_results_root/$task_arm/$task_name/$task_run"
  task_workspace="$task_run_dir/workspace"
  mkdir -p "$task_run_dir"
  cp -R "$task_compare_root/$task_name/workspace" "$task_workspace"
  mkdir -p "$task_workspace/.claude/skills/tdd"
  cp "$task_skill_root/$task_arm/SKILL.md" "$task_workspace/.claude/skills/tdd/SKILL.md"
  git -C "$task_workspace" init -q
  git -C "$task_workspace" add -A
  git -C "$task_workspace" -c user.name=eval -c user.email=eval@example.com \
    commit -q -m fixture

  # Both arms get the same words; neither names an order.
  case "$task_name" in
    feature) task_prompt='/tdd docs/spec.md에 적힌 배송비 계산 기능을 구현해줘.' ;;
    bug) task_prompt='/tdd docs/bug.md에 보고된 버그를 고쳐줘.' ;;
  esac

  task_claude_args=(
    -p "$task_prompt"
    --setting-sources project
    --output-format stream-json
    --verbose
    --max-budget-usd "${TASK_MAX_BUDGET_USD:-5}"
    --allowedTools Read Edit Write Glob Grep "Bash(node:*)" "Bash(npm:*)" "Bash(ls:*)" "Bash(cat:*)" "Bash(mkdir:*)"
  )
  if [ -n "${TASK_CLAUDE_MODEL:-}" ]; then
    task_claude_args+=(--model "$TASK_CLAUDE_MODEL")
  fi
  set +e
  (cd "$task_workspace" && claude "${task_claude_args[@]}") \
    > "$task_run_dir/trace.jsonl" 2> "$task_run_dir/stderr.txt"
  printf '%s\n' "$?" > "$task_run_dir/exit-status"
  set -e
}
export -f run_comparison_case
export task_results_root task_compare_root task_skill_root

{
  for task_run in $(seq 1 "$task_runs"); do
    for task_name in feature bug; do
      for task_arm in baseline revised; do
        printf '%s %s %s\n' "$task_arm" "$task_name" "$task_run"
      done
    done
  done
} | xargs -P "$task_workers" -n 3 bash -c 'run_comparison_case "$@"' _

node "$task_compare_root/score.mjs" "$task_results_root" --grade
printf 'results: %s\n' "$task_results_root" >&2
