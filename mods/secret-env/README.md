# secret-env

A Claude Code mod for secret keys Claude should use but never see.

When Claude needs an API key, it asks for it by name. A pane opens beside the
chat with the key's name, what it is for, and the `.env` file it goes to. You
type the value there and save. The value is written to that file, so your app
reads it the usual way, whether Claude started the app or you did. Claude only
learns that the key was saved.

From then on, every tool result Claude reads, from Bash, Read, Grep, or a
subagent, shows `[hidden]` wherever the value appears. That still holds in
later sessions: the mod remembers each key by name and file, never by value,
and reads the value back from the file when a session starts.

## Install

```
/plugin install secret-env@toycrane
```

Run it in a terminal session. Add the marketplace first with
`/plugin marketplace add toy-crane/skills` if you have not.

## Use

- Claude calls `request_secret` with a name, a purpose, and a `.env` file. Save
  or cancel in the pane; closing the pane or interrupting Claude cancels too.
- `/secret-env` opens the list of keys this project manages. Add a key, or
  delete one, which removes its line from the file.
- When the file is not covered by `.gitignore`, the pane warns you and offers
  to add it before saving. A name that already exists is replaced only after
  you confirm.
- Claude cannot change a managed key's line with Write or Edit. It can still
  edit the other lines of the same file.

## What it does not protect

- The value sits in the `.env` file as plain text. With the mod off or failed
  to load, Claude reads it like any other file.
- Only the exact value is hidden. A command that encodes it or prints part of
  it gets past the filter, and Claude can still run commands that use the key.
- Values shorter than four characters are not hidden.
- The text field does not mask what you type; mind screen sharing.
- The phone app has no text field, so enter keys from the desktop app or a
  terminal.

## Develop

```
claude plugin test mods/secret-env
claude plugin validate mods/secret-env --strict
claude --plugin-dir mods/secret-env
```
