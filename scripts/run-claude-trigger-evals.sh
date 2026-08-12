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
  task_skill_link="$task_repo_root/.claude/skills/$task_skill"
  test -d "$task_skill_link"
  task_skill_path=$(cd "$task_skill_link" && pwd -P)
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

  task_case_dir=$(mktemp -d "$task_eval_root/case.XXXXXX")
  task_stdout="$task_case_dir/stdout.jsonl"
  task_stderr="$task_case_dir/stderr.txt"
  set +e
  (cd "$task_eval_root" && claude "${task_claude_args[@]}") \
    >"$task_stdout" 2>"$task_stderr"
  task_status=$?
  set -e

  task_stream_valid=true
  if ! jq -e . "$task_stdout" >/dev/null 2>&1; then
    task_stream_valid=false
  fi
  task_result_subtype=$(jq -r '
    select(.type == "result") | .subtype // "unknown"
  ' "$task_stdout" 2>/dev/null | tail -n 1)
  task_result_is_error=$(jq -r '
    select(.type == "result") | (.is_error // false)
  ' "$task_stdout" 2>/dev/null | tail -n 1)
  task_assistant_error=$(jq -r '
    select(.type == "assistant" and .error != null) | .error
  ' "$task_stdout" 2>/dev/null | tail -n 1)
  task_selected=$(jq -r '
    select(.type == "assistant")
    | .message.content[]?
    | select(.type == "tool_use" and .name == "Skill")
    | .input.skill
  ' "$task_stdout" 2>/dev/null | head -n 1)
  task_error=$(tr '\n' ' ' < "$task_stderr" | cut -c1-600)
  if [ -z "$task_error" ] && [ -n "$task_assistant_error" ]; then
    task_error="$task_assistant_error"
  fi

  task_valid=false
  if [ "$task_stream_valid" = true ] \
    && [ -z "$task_assistant_error" ] \
    && { { [ "$task_status" -eq 0 ] \
        && [ "$task_result_subtype" = success ] \
        && [ "$task_result_is_error" != true ]; } \
      || [ "$task_result_subtype" = error_max_turns ]; }; then
    task_valid=true
  elif [ -z "$task_error" ]; then
    task_error="claude exited $task_status with result subtype ${task_result_subtype:-missing}"
  fi

  jq -nc \
    --arg skill "$task_skill" \
    --arg query "$task_query" \
    --argjson should_trigger "$task_should_trigger" \
    --argjson run "$task_run" \
    --arg selected "$task_selected" \
    --argjson valid "$task_valid" \
    --argjson exit_status "$task_status" \
    --arg result_subtype "${task_result_subtype:-missing}" \
    --arg result_is_error "${task_result_is_error:-missing}" \
    --arg error "$task_error" \
    '{skill: $skill, query: $query, should_trigger: $should_trigger,
      run: $run, selected: $selected, valid: $valid,
      exit_status: $exit_status, result_subtype: $result_subtype,
      result_is_error: $result_is_error, error: $error}'
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

task_summary=$(jq -s '
  group_by([.skill, .query])
  | map(
      . as $runs
      | ($runs[0].skill) as $skill
      | ($runs[0].should_trigger) as $should_trigger
      | ([ $runs[] | select(.valid) ]) as $valid_runs
      | ([ $runs[] | select(.valid | not) ]) as $invalid_runs
      | ([ $valid_runs[] | select(.selected == $skill) ] | length) as $matches
      | ($runs | length) as $run_count
      | {
          skill: $skill,
          query: $runs[0].query,
          should_trigger: $should_trigger,
          matches: $matches,
          runs: $run_count,
          valid_runs: ($valid_runs | length),
          invalid_runs: ($invalid_runs | length),
          selections: [ $valid_runs[].selected ],
          infrastructure_errors: [
            $invalid_runs[]
            | {run, exit_status, result_subtype, result_is_error, error}
          ],
          pass: (if ($invalid_runs | length) > 0
            then null
            elif $should_trigger
            then ($matches * 2 >= $run_count)
            else ($matches * 2 < $run_count)
            end)
        }
    )
  | . as $cases
  | {
      overall: {
        total: ($cases | length),
        scored: ([ $cases[] | select(.pass != null) ] | length),
        passed: ([ $cases[] | select(.pass == true) ] | length),
        failed: ([ $cases[] | select(.pass == false) ] | length),
        invalid: ([ $cases[] | select(.pass == null) ] | length)
      },
      by_skill: [
        $cases
        | group_by(.skill)[]
        | {
            skill: .[0].skill,
            total: length,
            scored: ([ .[] | select(.pass != null) ] | length),
            passed: ([ .[] | select(.pass == true) ] | length),
            failed: ([ .[] | select(.pass == false) ] | length),
            invalid: ([ .[] | select(.pass == null) ] | length)
          }
      ],
      failures: [ $cases[] | select(.pass == false) ],
      invalid: [ $cases[] | select(.pass == null) ]
    }
' "$task_results")

printf '%s\n' "$task_summary"
if [ "$(printf '%s\n' "$task_summary" | jq -r '.overall.invalid')" -ne 0 ]; then
  printf 'Trigger eval is invalid because one or more Claude invocations failed.\n' >&2
  exit 2
fi
