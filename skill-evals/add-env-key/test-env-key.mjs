// node --test skill-evals/add-env-key/test-env-key.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, "../../skills/workflow/add-env-key/scripts/env-key.mjs");

const tmpFile = (content) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "env-key-"));
  const file = path.join(dir, ".env.local");
  if (content !== undefined) fs.writeFileSync(file, content);
  return file;
};
const run = (...args) => {
  const r = spawnSync("node", [script, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout + r.stderr };
};

test("add creates a missing file holding only the empty key line", () => {
  const file = tmpFile();
  assert.equal(run("add", file, "STRIPE_SECRET_KEY").code, 0);
  assert.equal(fs.readFileSync(file, "utf8"), "STRIPE_SECRET_KEY=\n");
});

test("add appends the key line and leaves every other line in order", () => {
  const file = tmpFile("# local\nPORT=3000\nDB_URL=postgres://x");
  assert.equal(run("add", file, "OPENAI_API_KEY").code, 0);
  assert.equal(fs.readFileSync(file, "utf8"), "# local\nPORT=3000\nDB_URL=postgres://x\nOPENAI_API_KEY=\n");
});

test("add run twice gives the same file as add run once", () => {
  const file = tmpFile("PORT=3000\n");
  run("add", file, "RESEND_API_KEY");
  run("add", file, "RESEND_API_KEY");
  assert.equal(fs.readFileSync(file, "utf8"), "PORT=3000\nRESEND_API_KEY=\n");
});

test("add keeps an existing line for the key, value included", () => {
  const before = "A=1\nexport RESEND_API_KEY=re_live_abc\nB=2\n";
  const file = tmpFile(before);
  assert.equal(run("add", file, "RESEND_API_KEY").code, 0);
  assert.equal(fs.readFileSync(file, "utf8"), before);
});

test("add does not treat a commented-out key as present", () => {
  const file = tmpFile("# RESEND_API_KEY=old\n");
  run("add", file, "RESEND_API_KEY");
  assert.equal(fs.readFileSync(file, "utf8"), "# RESEND_API_KEY=old\nRESEND_API_KEY=\n");
});

test("add rejects a name that is not a variable name and leaves the file alone", () => {
  const file = tmpFile("A=1\n");
  assert.notEqual(run("add", file, "BAD NAME").code, 0);
  assert.equal(fs.readFileSync(file, "utf8"), "A=1\n");
});

const secret = "sk_live_9f8e7d6c5b4a";
for (const [label, content] of [
  ["a plain value", `OPENAI_API_KEY=${secret}\n`],
  ["a quoted value", `OPENAI_API_KEY="${secret}"\n`],
  ["an export prefix", `export OPENAI_API_KEY=${secret}\n`],
]) {
  test(`check answers only set for ${label}`, () => {
    const r = run("check", tmpFile(content), "OPENAI_API_KEY");
    assert.equal(r.code, 0);
    assert.equal(r.out, "set\n");
  });
}

for (const [label, content] of [
  ["an empty value", "OPENAI_API_KEY=\n"],
  ["empty quotes", 'OPENAI_API_KEY=""\n'],
  ["only spaces", "OPENAI_API_KEY=   \n"],
  ["only an inline comment", "OPENAI_API_KEY= # paste here\n"],
  ["no line for the key", "PORT=3000\n"],
  ["a commented-out key", `# OPENAI_API_KEY=${secret}\n`],
]) {
  test(`check answers only empty for ${label}`, () => {
    const r = run("check", tmpFile(content), "OPENAI_API_KEY");
    assert.equal(r.code, 0);
    assert.equal(r.out, "empty\n");
  });
}

test("check answers empty when the file does not exist", () => {
  assert.equal(run("check", tmpFile(), "OPENAI_API_KEY").out, "empty\n");
});

test("check output never carries the value or its length", () => {
  const r = run("check", tmpFile(`A=1\nOPENAI_API_KEY=${secret}\n`), "OPENAI_API_KEY");
  assert.ok(!r.out.includes(secret.slice(0, 4)));
  assert.ok(!r.out.includes(String(secret.length)));
});
