#!/usr/bin/env bash

set -euo pipefail

task_repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
task_repeats=${1:-2}
task_workers=${2:-6}
task_eval_filename=${TASK_TRIGGER_EVAL_FILE:-trigger-evals.json}
shift $(( $# >= 2 ? 2 : $# ))
if [ "$#" -gt 0 ]; then
  task_skills=("$@")
else
  task_skills=(commit pull push pr merge)
fi

task_eval_root=$(mktemp -d)
cleanup_trigger_eval() {
  find "$task_eval_root" -depth -delete 2>/dev/null || true
}
trap cleanup_trigger_eval EXIT

mkdir -p "$task_eval_root/.claude/skills"
git init -q "$task_eval_root"

task_cases="$task_eval_root/cases.tsv"
task_results="$task_eval_root/results.jsonl"
: > "$task_cases"

for task_skill in "${task_skills[@]}"; do
  task_skill_path="$task_repo_root/skills/$task_skill"
  task_eval_path="$task_skill_path/evals/$task_eval_filename"
  test -f "$task_skill_path/SKILL.md"
  test -f "$task_eval_path"
  ln -s "$task_skill_path" "$task_eval_root/.claude/skills/$task_skill"
  jq -r --arg skill "$task_skill" \
    '.[] | [$skill, (.should_trigger | tostring), (.query | @base64)] | @tsv' \
    "$task_eval_path" >> "$task_cases"
done

run_trigger_case() {
  task_skill=$1
  task_should_trigger=$2
  task_query_base64=$3
  task_run=$4
  task_query=$(python3 -c \
    'import base64, sys; print(base64.b64decode(sys.argv[1]).decode())' \
    "$task_query_base64")

  task_claude_args=(
    -p "$task_query"
    --setting-sources project
    --tools default
    --max-turns 1
    --output-format stream-json
    --verbose
  )
  if [ -n "${TASK_CLAUDE_MODEL:-}" ]; then
    task_claude_args+=(--model "$TASK_CLAUDE_MODEL")
  fi

  task_stream=$(cd "$task_eval_root" && \
    claude "${task_claude_args[@]}" 2>/dev/null || true)
  task_selected=$(printf '%s\n' "$task_stream" | jq -r '
    select(.type == "assistant")
    | .message.content[]?
    | select(.type == "tool_use" and .name == "Skill")
    | .input.skill
  ' | head -n 1)

  jq -nc \
    --arg skill "$task_skill" \
    --arg query "$task_query" \
    --argjson should_trigger "$task_should_trigger" \
    --argjson run "$task_run" \
    --arg selected "$task_selected" \
    '{skill: $skill, query: $query, should_trigger: $should_trigger,
      run: $run, selected: $selected}'
}
export -f run_trigger_case
export task_eval_root

{
  for task_run in $(seq 1 "$task_repeats"); do
    while IFS=$'\t' read -r task_skill task_should_trigger task_query_base64; do
      printf '%s\t%s\t%s\t%s\n' \
        "$task_skill" "$task_should_trigger" "$task_query_base64" "$task_run"
    done < "$task_cases"
  done
} | xargs -P "$task_workers" -n 4 bash -c 'run_trigger_case "$@"' _ \
  > "$task_results"

jq -s '
  group_by([.skill, .query])
  | map(
      . as $runs
      | ($runs[0].skill) as $skill
      | ($runs[0].should_trigger) as $should_trigger
      | ([ $runs[] | select(.selected == $skill) ] | length) as $matches
      | ($runs | length) as $run_count
      | {
          skill: $skill,
          query: $runs[0].query,
          should_trigger: $should_trigger,
          matches: $matches,
          runs: $run_count,
          selections: [ $runs[].selected ],
          pass: (if $should_trigger
            then ($matches * 2 >= $run_count)
            else ($matches * 2 < $run_count)
          end)
        }
    )
  | . as $cases
  | {
      overall: {
        total: ($cases | length),
        passed: ([ $cases[] | select(.pass) ] | length),
        failed: ([ $cases[] | select(.pass | not) ] | length)
      },
      by_skill: [
        $cases
        | group_by(.skill)[]
        | {
            skill: .[0].skill,
            total: length,
            passed: ([ .[] | select(.pass) ] | length),
            failed: ([ .[] | select(.pass | not) ] | length)
          }
      ],
      failures: [ $cases[] | select(.pass | not) ]
    }
' "$task_results"
