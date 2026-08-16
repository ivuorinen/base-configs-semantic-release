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
  // The three custom releaseRules in index.cjs.
  ["chore(deps)!: update stylelint (16.26.1 -> 17.0.0)", "major"],
  ["chore(deps): update stylelint (16.26.1 -> 16.26.2)", "patch"],
  ["chore(actions)!: update actions/checkout (v7 -> v8)", null],
  ["chore(actions): update actions/checkout (v7.0.0 -> v7.0.1)", null],

  // conventionalcommits preset defaults.
  ["feat!: drop node 20", "major"],
  ["feat: add an option", "minor"],
  ["fix: something", "patch"],
  ["perf: speed up parsing", "patch"],
  ["fix(deps): patch a transitive dependency", "patch"],

  // The `!` marker is not the only way to declare a break — the footer form must
  // reach the same rules, or a breaking change ships as a patch.
  ["feat: add thing\n\nBREAKING CHANGE: drops node 20", "major"],
  ["chore(deps): update x\n\nBREAKING CHANGE: peer range narrowed", "major"],

  // An unscoped chore must not release: the chore rules are scoped to deps and
  // actions on purpose, and `chore(release)` is semantic-release's own commit.
  ["chore: tidy up", null],
  ["chore(release): 1.1.23 [skip ci]", null],

  // Types that appear in release notes or nowhere, but never cut a release alone.
  ["revert: revert bad change", null],
  ["docs: update readme", null],
  ["style: reformat", null],
  ["refactor: rename a variable", null],
  ["test: add a case", null],
  ["build: change bundler", null],
  ["ci: tweak workflow", null],

  // Anything the preset cannot parse must be inert, not a default bump.
  ["not a conventional commit at all", null],
];

for (const [message, expected] of cases) {
  test(`${message.split("\n")[0]}${message.includes("BREAKING CHANGE") ? " + footer" : ""} -> ${expected}`, async () => {
    const release = await analyzeCommits(analyzerOptions, {
      commits: [{ hash: "abc1234", message }],
      logger: { log() {} },
    });

    assert.strictEqual(release, expected);
  });
}

// semantic-release analyzes a whole push, not one commit. The highest bump in the
// batch must win, or a breaking change hidden behind later chores ships as a patch.
test("the highest release in a batch wins", async () => {
  const release = await analyzeCommits(analyzerOptions, {
    commits: [
      { hash: "aaa1111", message: "fix: something" },
      { hash: "bbb2222", message: "chore(deps)!: update stylelint (16.26.1 -> 17.0.0)" },
      { hash: "ccc3333", message: "chore(actions): update actions/checkout (v7.0.0 -> v7.0.1)" },
    ],
    logger: { log() {} },
  });

  assert.strictEqual(release, "major");
});

test("a push of only non-releasing commits cuts nothing", async () => {
  const release = await analyzeCommits(analyzerOptions, {
    commits: [
      { hash: "aaa1111", message: "chore(actions): update actions/checkout (v7.0.0 -> v7.0.1)" },
      { hash: "bbb2222", message: "docs: update readme" },
      { hash: "ccc3333", message: "ci: tweak workflow" },
    ],
    logger: { log() {} },
  });

  assert.strictEqual(release, null);
});
