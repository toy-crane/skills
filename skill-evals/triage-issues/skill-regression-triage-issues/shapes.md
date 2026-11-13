# Where the stand-ins' shapes come from

The stand-ins in `fake-gh.mjs` and `fake-mcp.mjs` answer with the fields that
real responses carry. Those fields were read once, read-only, on 2026-11-14.
Nothing was written to GitHub, Linear, or Slack, and no issue or thread that
Robo watches was touched.

## GitHub CLI (`gh` 2.x, an issue in one of the owner's repositories)

`gh issue view <n> --json number,title,state,stateReason,labels,body,comments,createdAt,updatedAt,url,closedAt,assignees`:

```json
{
  "number": 907, "title": "…", "state": "CLOSED", "stateReason": "COMPLETED",
  "labels": [{ "id": "LA_…", "name": "in-review", "description": "…", "color": "bfbfbf" }],
  "createdAt": "2026-11-13T15:14:25Z", "updatedAt": "…", "closedAt": "…",
  "url": "https://github.com/<owner>/<repo>/issues/907", "assignees": [], "body": "…",
  "comments": [{
    "id": "IC_…", "author": { "login": "…" }, "authorAssociation": "OWNER", "body": "…",
    "createdAt": "…", "includesCreatedEdit": false, "isMinimized": false, "minimizedReason": "",
    "reactionGroups": [], "url": "…#issuecomment-…", "viewerDidAuthor": true
  }]
}
```

Without `--json`, `gh issue view` prints `title:`, `state:`, `author:`,
`labels:`, `comments:`, `assignees:`, `projects:`, `milestone:`, `number:`,
then `--` and the body. `gh label list --json name,color,description` returns
an array of those three fields.

## Linear MCP server

`list_issues` returns `{ issues: [...], hasNextPage, cursor }`. Each issue
carries `id` (the identifier, such as `FLY-183`), `uuid`, `title`,
`description` (cut at about 500 characters with `… (truncated, use
\`get_issue\` for full description)`), `priority: { value, name }`, `url`,
`gitBranchName`, `createdAt`, `updatedAt`, `archivedAt`, `completedAt`,
`startedAt`, `canceledAt`, `dueDate` (`YYYY-MM-DD` or null), the `sla*`
fields, `status` (a name such as `Backlog`), `statusType`, `labels` (an array
of names), `createdBy`, `createdById`, `assignee`, `assigneeId`, `team`, and
`teamId`. A nonempty `fields` selection returns only those keys plus `id`.

`list_comments` returns `{ comments: [...], hasNextPage }`. Each comment
carries `id`, `body`, `attachments`, `createdAt`, `updatedAt`, `parentId`,
`resolvedAt`, `quotedText`, `author: { id, name }`, and `onBehalfOf`.

`get_issue` returns the same issue shape with the full description, plus
`attachments` and `documents`, and `relations: { blocks, blockedBy,
relatedTo, duplicateOf }` when `includeRelations` is set. `save_issue`
returns that shape without the relations. `save_comment` returns the comment
shape. `list_issue_labels` returns `{ labels: [{ id, name, color,
description, archivedAt }], hasNextPage }`.

The argument shapes the stand-in accepts are the ones real triage runs sent,
read from the owner's Robo session transcripts: `get_issue` with `id`,
`fields`, and `includeRelations`; `list_issues` with `team`, `state`,
`limit`, `fields`, and `orderBy`; `list_comments` with `issueId`, `limit`,
and `orderBy`; `save_comment` with `issueId` or `parentId` and `body`; and
`save_issue` with `id`, `addLabels`, `removeLabels`, `state`, `duplicateOf`,
`links`, and `patch` operations `append`, `replace`, and `replace_range`.

## Slack

No real Slack call was read. The stand-in `slack` server offers one
`slack_send_message` tool and only records what was sent; in a failing
scenario it answers with a 403 `not_in_channel` error.
