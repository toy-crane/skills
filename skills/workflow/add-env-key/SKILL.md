---
name: add-env-key
description: Get a key the user must issue or supply, such as an API key, token, or password, into the project's .env file without the value passing through chat or the model's context. Opens the vendor's issuance page, collects the value through the secret-env mod's input pane when the session has it, and otherwise opens the file in the user's editor with the key line ready. Use when work needs such a key that the project does not have yet, or when the user asks to add, set, or put an API key or token into .env.
---

# Add an env key

Put one key the user must bring from outside, such as an API key, access
token, or password, into the dotenv file the project reads, and confirm it
landed. The value never enters chat or your context: never ask for it, accept
it pasted into chat, or print or read the line that holds it. If the user
pastes one into chat anyway, do not repeat it; tell them it is now in the
conversation and suggest rotating it.

A value you can decide yourself, such as `PORT=3000`, is not this skill's
work: write it directly.

## Decide the key

Settle three things from the project before asking the user for anything:

- **Name**: the variable the code or the library already reads, such as
  `STRIPE_SECRET_KEY`. Prefer the name the code references; otherwise the
  vendor's documented default.
- **File**: the dotenv file the project's tooling loads, by its convention
  (`.env.local` for Next.js and Vite, `.env` otherwise). With no convention,
  use `.env` at the project root.
- **Issuance page**: the vendor's console page where this key is created,
  from its official documentation. When no page creates it directly, use the
  documentation page that explains how to get it.

When several keys are needed, take them one at a time, in the order the work
needs them.

## Open the issuance page

Open the issuance page in the user's default browser, and also write its URL
in chat, since a user following remotely cannot see a browser on this
machine. Creating the key in their account is the user's step.

## Collect the value

**When the session offers the secret-env mod's tool** (named
`request_secret`; it asks the user for a secret in a pane beside the chat,
writes it to a dotenv file, and hides the value from every tool result),
call it with the name, a one-line purpose that says what the key is for, and
the file relative to the project root. The tool returns once the user saves
or cancels. It warns about `.gitignore` and confirms overwriting an existing
key by itself.

**Otherwise**, use the editor path:

1. If the file sits inside a Git repository and `git check-ignore` does not
   match it, warn the user that the key would be committable and offer to add
   the file to `.gitignore` before going on. Do not proceed with an
   unignored file unless the user explicitly chooses to.
2. Run `node <this skill's folder>/scripts/env-key.mjs add <file> <NAME>`. It
   adds an empty `NAME=` line, creates the file when missing, and leaves an
   existing `NAME` line and every other line untouched.
3. Open the file in the user's editor: the editor CLI the project or the user
   evidently uses, or the system's default text editor. If none opens, give
   the file path and the line to fill in chat.
4. Tell the user once that on this path the value is not hidden from you if
   you later read the file, and that installing the secret-env mod
   (`/plugin install secret-env@toycrane`) keeps it hidden.
5. Wait for the user to say they are done.

## Confirm it landed

Run `node <this skill's folder>/scripts/env-key.mjs check <file> <NAME>`. It
prints only `set` or `empty`. On `empty`, tell the user the line is still
empty and wait again. On the mod path, the tool's saved result is the
confirmation.

If the user cancels, change nothing further and ask whether the work can go
on without the key.

Finish by reporting the key name, the file, and that it is set, then continue
the work that needed it.
