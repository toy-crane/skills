#!/usr/bin/env bash
set -euo pipefail

# Links every skill under this repo's skills/ directory into the global skill
# directories each agent harness reads:
#   - ~/.claude/skills  (Claude Code)
#   - ~/.agents/skills  (Codex and other Agent Skills-compatible harnesses)
#
# Each entry is a symlink into this repo, so editing a skill here is reflected
# everywhere immediately and a `git pull` keeps installed skills up to date.
# Re-run this after adding, removing, or renaming a skill.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
CANONICAL_REPO="$(dirname "$(git -C "$REPO" rev-parse --git-common-dir)")"
DESTS=("$HOME/.claude/skills" "$HOME/.agents/skills")

# Collect the repo's skills once (any SKILL.md under skills/), link into every
# destination under the skill's own folder name.
names=()
srcs=()
while IFS= read -r -d '' skill_md; do
  src="$(dirname "$skill_md")"
  names+=("$(basename "$src")")
  srcs+=("$src")
done < <(find "$REPO/skills" -name SKILL.md -print0)

is_current_skill() {
  local candidate="$1"
  local name

  for name in "${names[@]}"; do
    if [ "$candidate" = "$name" ]; then
      return 0
    fi
  done

  return 1
}

for DEST in "${DESTS[@]}"; do
  # If $DEST is itself a symlink into this repo, the per-skill symlinks would
  # land back inside the repo's own skills/ tree. Bail out instead.
  if [ -L "$DEST" ]; then
    resolved="$(readlink -f "$DEST")"
    case "$resolved" in
      "$REPO" | "$REPO"/*)
        echo "error: $DEST is a symlink into this repo ($resolved)." >&2
        echo "Remove it (rm \"$DEST\") and re-run; it will be recreated as a real dir." >&2
        exit 1
        ;;
    esac
  fi

  mkdir -p "$DEST"

  # Remove links created by this repository when their source skill was
  # removed or renamed. Leave every external link and real directory alone.
  for target in "$DEST"/*; do
    [ -L "$target" ] || continue
    source="$(readlink "$target")"

    case "$source" in
      "$REPO/skills/"* | "$CANONICAL_REPO/skills/"*) ;;
      *) continue ;;
    esac

    name="$(basename "$target")"
    if ! is_current_skill "$name"; then
      rm "$target"
      echo "removed stale $name link ($DEST)"
    fi
  done

  for i in "${!names[@]}"; do
    name="${names[$i]}"
    src="${srcs[$i]}"
    target="$DEST/$name"

    # Replace a pre-existing real directory (e.g. an older copy) with the link.
    if [ -e "$target" ] && [ ! -L "$target" ]; then
      rm -rf "$target"
    fi

    ln -sfn "$src" "$target"
    echo "linked $name -> $src ($DEST)"
  done
done
