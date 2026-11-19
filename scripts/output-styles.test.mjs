// Run with: node --test scripts/output-styles.test.mjs
// Guards docs/specs/at-a-glance-korean-register/ criteria 3 and 4:
// at-a-glance carries natural-korean's register rules verbatim, and scopes
// them to Korean replies only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(root + path, "utf8");

// natural-korean's four register sections run from this heading to the end.
const FIRST_REGISTER_HEADING = "## 독자와 목표";

function registerSections(text) {
  const start = text.indexOf(FIRST_REGISTER_HEADING);
  assert.notEqual(start, -1, `missing "${FIRST_REGISTER_HEADING}"`);
  return text.slice(start).trimEnd();
}

test("at-a-glance ends with natural-korean's register sections, character for character", () => {
  const source = registerSections(read("output-styles/natural-korean.md"));
  const copy = registerSections(read("output-styles/at-a-glance.md"));
  assert.equal(copy, source);
});

test("at-a-glance scopes the register sections to Korean replies", () => {
  const text = read("output-styles/at-a-glance.md");
  const before = text.slice(0, text.indexOf(FIRST_REGISTER_HEADING));
  assert.match(
    before,
    /## Korean replies\n\n[^\n#]*applies? only when the reply is in\s+Korean/,
  );
});
