// node --test skill-evals/babysit-pr/test-pr-events.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, "../../skills/git/babysit-pr/scripts/pr-events.mjs");

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pr-events-"));
  const fake = path.join(dir, "gh");
  fs.writeFileSync(
    fake,
    `#!/bin/sh
if [ "$1" = pr ]; then echo '{"url":"https://github.com/o/r/pull/7"}'; exit 0; fi
cat "${dir}/pr.json"
`,
  );
  fs.chmodSync(fake, 0o755);
  const env = { ...process.env, BABYSIT_PR_GH: fake, BABYSIT_PR_STATE_DIR: path.join(dir, "state") };
  const write = (pr) => fs.writeFileSync(path.join(dir, "pr.json"), JSON.stringify({ data: { repository: { pullRequest: pr } } }));
  return { dir, env, write };
}

function pr({ head = "a1", checks = [], threads = [], comments = [], reviews = [], mergeable = "MERGEABLE" } = {}) {
  return {
    state: "OPEN",
    headRefOid: head,
    mergeable,
    commits: { nodes: [{ commit: { statusCheckRollup: { contexts: { nodes: checks } } } }] },
    reviews: { nodes: reviews },
    reviewThreads: { nodes: threads },
    comments: { nodes: comments },
  };
}

const run = (env, ...args) => {
  const r = spawnSync("node", [script, ...args], { env, encoding: "utf8" });
  return { code: r.status, json: JSON.parse(r.stdout.trim().split("\n").pop()) };
};

test("a check moving to in progress is not an event; its completion is", () => {
  const { env, write } = setup();
  write(pr({ checks: [{ __typename: "CheckRun", name: "ci", status: "QUEUED", conclusion: null }] }));
  assert.equal(run(env, "mark", "7").code, 0);
  write(pr({ checks: [{ __typename: "CheckRun", name: "ci", status: "IN_PROGRESS", conclusion: null }] }));
  assert.equal(run(env, "wait", "7", "--interval", "0.1", "--idle-minutes", "0.01").code, 10);
  write(pr({ checks: [{ __typename: "CheckRun", name: "ci", status: "COMPLETED", conclusion: "FAILURE" }] }));
  const r = run(env, "wait", "7", "--interval", "0.1", "--idle-minutes", "5");
  assert.equal(r.code, 0);
  assert.deepEqual(r.json.changes, [{ kind: "check", id: "ci", change: "updated", from: "PENDING", to: "FAILURE" }]);
});

test("an event that arrives while no wait runs is reported by the next wait", () => {
  const { env, write } = setup();
  write(pr());
  run(env, "mark", "7");
  write(pr({ threads: [{ id: "T1", isResolved: false, comments: { totalCount: 1 } }] }));
  const r = run(env, "wait", "7", "--interval", "0.1", "--idle-minutes", "5");
  assert.equal(r.code, 0);
  assert.equal(r.json.changes[0].kind, "thread");
  // The reported state is now recorded: the same state does not wake again.
  assert.equal(run(env, "wait", "7", "--interval", "0.1", "--max-minutes", "0.005").code, 11);
});

test("new comments, reviews, pushes, and conflicts each wake the wait", () => {
  const { env, write } = setup();
  write(pr());
  run(env, "mark", "7");
  write(pr({ head: "b2", mergeable: "CONFLICTING", comments: [{ id: "C1", updatedAt: "t", author: { login: "u" } }], reviews: [{ id: "R1", state: "CHANGES_REQUESTED", author: { login: "u" } }] }));
  const kinds = run(env, "wait", "7", "--interval", "0.1").json.changes.map((c) => c.kind).sort();
  assert.deepEqual(kinds, ["comment", "head", "mergeable", "review"]);
});

test("idle is measured from the last recorded change, not from each wait", () => {
  const { env, write } = setup();
  write(pr());
  run(env, "mark", "7");
  assert.equal(run(env, "wait", "7", "--interval", "0.1", "--max-minutes", "0.005").code, 11);
  const r = run(env, "wait", "7", "--interval", "0.1", "--idle-minutes", "0.005");
  assert.equal(r.code, 10);
  assert.equal(r.json.event, "idle");
});

test("only one wait runs per pull request", async () => {
  const { env, write } = setup();
  write(pr());
  run(env, "mark", "7");
  const first = spawn("node", [script, "wait", "7", "--interval", "0.1", "--max-minutes", "0.1"], { env });
  await new Promise((r) => setTimeout(r, 500));
  const second = run(env, "wait", "7", "--interval", "0.1");
  assert.equal(second.code, 3);
  assert.equal(second.json.pid, first.pid);
  first.kill("SIGTERM");
  await new Promise((r) => first.on("exit", r));
  // The lock is released when the first wait ends.
  assert.equal(run(env, "wait", "7", "--interval", "0.1", "--max-minutes", "0.005").code, 11);
});

test("a rerun's restart and unknown mergeability do not wake; the rerun's result does", () => {
  const { env, write } = setup();
  const ci = (status, conclusion) => [{ __typename: "CheckRun", name: "ci", status, conclusion }];
  write(pr({ checks: ci("COMPLETED", "FAILURE") }));
  run(env, "mark", "7");
  write(pr({ checks: ci("IN_PROGRESS", null), mergeable: "UNKNOWN" }));
  assert.equal(run(env, "wait", "7", "--interval", "0.1", "--max-minutes", "0.005").code, 11);
  write(pr({ checks: ci("COMPLETED", "SUCCESS") }));
  const r = run(env, "wait", "7", "--interval", "0.1");
  assert.equal(r.code, 0);
  assert.deepEqual(r.json.changes, [{ kind: "check", id: "ci", change: "updated", from: "FAILURE", to: "SUCCESS" }]);
});

test("checks that share a name are tracked separately", () => {
  const { env, write } = setup();
  const two = (a, b) => [
    { __typename: "CheckRun", name: "build", status: "COMPLETED", conclusion: a },
    { __typename: "CheckRun", name: "build", status: "COMPLETED", conclusion: b },
  ];
  write(pr({ checks: two("SUCCESS", "SUCCESS") }));
  run(env, "mark", "7");
  write(pr({ checks: two("FAILURE", "SUCCESS") }));
  const r = run(env, "wait", "7", "--interval", "0.1", "--max-minutes", "0.01");
  assert.equal(r.code, 0);
  assert.equal(r.json.changes[0].to, "FAILURE");
});
