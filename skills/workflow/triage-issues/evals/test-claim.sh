#!/usr/bin/env bash
set -euo pipefail

script=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)/scripts/claim.sh
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT

git init -q --bare "$scratch/remote.git"
git init -q "$scratch/seed"
git -C "$scratch/seed" -c user.name=Test -c user.email=test@example.com commit -q --allow-empty -m seed
git -C "$scratch/seed" remote add origin "$scratch/remote.git"
git -C "$scratch/seed" push -q origin HEAD:main
git -C "$scratch/remote.git" symbolic-ref HEAD refs/heads/main
git clone -q "$scratch/remote.git" "$scratch/one"
git clone -q "$scratch/remote.git" "$scratch/two"

read -r first token <<< "$("$script" claim --repo "$scratch/one" --issue 'linear:TEAM-12')"
[[ "$first" =~ ^[0-9a-f]{40,64}$ && -n "$token" ]]

if "$script" claim --repo "$scratch/two" --issue 'linear:TEAM-12' >/dev/null 2>&1; then
  echo 'second claimant acquired an owned issue' >&2
  exit 1
fi

"$script" claim --repo "$scratch/two" --issue 'linear:TEAM-13' >/dev/null

if "$script" release --repo "$scratch/two" --issue 'linear:TEAM-12' --expected "$first" --token bogus >/dev/null 2>&1; then
  echo 'another checkout released an unowned claim' >&2
  exit 1
fi

renewed=$("$script" renew --repo "$scratch/one" --issue 'linear:TEAM-12' --expected "$first" --token "$token")
[[ "$renewed" != "$first" ]]
if "$script" release --repo "$scratch/one" --issue 'linear:TEAM-12' --expected "$first" --token "$token" >/dev/null 2>&1; then
  echo 'stale owner revision released a renewed claim' >&2
  exit 1
fi

"$script" release --repo "$scratch/one" --issue 'linear:TEAM-12' --expected "$renewed" --token "$token"
read -r second second_token <<< "$("$script" claim --repo "$scratch/two" --issue 'linear:TEAM-12')"
[[ "$second" != "$renewed" ]]

read -r stale stale_token <<< "$(GIT_COMMITTER_DATE='2000-01-01T00:00:00Z' \
  "$script" claim --repo "$scratch/one" --issue 'linear:TEAM-14')"
read -r recovered recovered_token <<< "$("$script" recover --repo "$scratch/two" \
  --issue 'linear:TEAM-14' --expected "$stale")"
[[ "$recovered" != "$stale" && "$recovered_token" != "$stale_token" ]]
if "$script" renew --repo "$scratch/one" --issue 'linear:TEAM-14' \
  --expected "$stale" --token "$stale_token" >/dev/null 2>&1; then
  echo 'abandoned owner renewed after recovery' >&2
  exit 1
fi

"$script" claim --repo "$scratch/one" --issue 'linear:TEAM-15' \
  > "$scratch/race-one" 2> "$scratch/race-one-error" &
first_pid=$!
"$script" claim --repo "$scratch/two" --issue 'linear:TEAM-15' \
  > "$scratch/race-two" 2> "$scratch/race-two-error" &
second_pid=$!
first_status=0
second_status=0
wait "$first_pid" || first_status=$?
wait "$second_pid" || second_status=$?
if [[ "$first_status" -eq "$second_status" ]]; then
  echo 'simultaneous claims did not produce exactly one owner' >&2
  exit 1
fi

echo 'claim behavior passed'
