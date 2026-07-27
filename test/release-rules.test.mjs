import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

import { analyzeCommits } from "@semantic-release/commit-analyzer";

const require = createRequire(import.meta.url);
const config = require("../index.cjs");

const analyzerOptions = config.plugins.find(
  (plugin) =>
    Array.isArray(plugin) && plugin[0] === "@semantic-release/commit-analyzer",
)[1];

// The release each commit pattern must produce. Guards two regressions:
// dropping the breaking chore(deps) rule silently downgrades it to patch, and
// a global `{ breaking: true }` rule would make chore(actions)! cut a major.
const cases = [
  ["chore(deps)!: update stylelint (16.26.1 -> 17.0.0)", "major"],
  ["chore(deps): update stylelint (16.26.1 -> 16.26.2)", "patch"],
  ["chore(actions)!: update actions/checkout (v7 -> v8)", null],
  ["chore(actions): update actions/checkout (v7.0.0 -> v7.0.1)", null],
  ["feat!: drop node 20", "major"],
  ["feat: add an option", "minor"],
  ["fix: something", "patch"],
];

for (const [message, expected] of cases) {
  test(`${message} -> ${expected}`, async () => {
    const release = await analyzeCommits(analyzerOptions, {
      commits: [{ hash: "abc1234", message }],
      logger: { log: () => {} },
    });

    assert.equal(release, expected);
  });
}
