import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import wrapped from "../wrapper.mjs";

const require = createRequire(import.meta.url);
const config = require("../index.cjs");
const pkg = require("../package.json");

const pluginName = (plugin) => (Array.isArray(plugin) ? plugin[0] : plugin);
const optionsFor = (name) => config.plugins.find((p) => Array.isArray(p) && p[0] === name)[1];

test("releases from main only", () => {
  assert.deepStrictEqual(config.branches, ["main"]);
});

// CLAUDE.md calls plugin order a gotcha: commit-analyzer must decide the bump
// before release-notes-generator renders it, and both must precede publishing.
test("plugin chain is exactly the documented order", () => {
  assert.deepStrictEqual(config.plugins.map(pluginName), [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github",
  ]);
});

// The conventionalcommits preset is what parses the `!` in `chore(deps)!:`.
// Dropping conventional-changelog-conventionalcommits makes this silently fall
// back to angular, which cannot.
test("both analyzing plugins use the conventionalcommits preset", () => {
  assert.strictEqual(optionsFor("@semantic-release/commit-analyzer").preset, "conventionalcommits");
  assert.strictEqual(optionsFor("@semantic-release/release-notes-generator").preset, "conventionalcommits");
});

test("release rules are exactly the three intended rules, in order", () => {
  assert.deepStrictEqual(optionsFor("@semantic-release/commit-analyzer").releaseRules, [
    { breaking: true, type: "chore", scope: "deps", release: "major" },
    { type: "chore", scope: "deps", release: "patch" },
    { type: "chore", scope: "actions", release: false },
  ]);
});

// A bare `{ breaking: true }` rule would make chore(actions)! cut a major, and a
// bare `{ type: "chore" }` rule would make every chore release. Both must stay scoped.
test("no release rule matches without a scope", () => {
  for (const rule of optionsFor("@semantic-release/commit-analyzer").releaseRules) {
    assert.ok(Object.hasOwn(rule, "scope"), `unscoped release rule: ${JSON.stringify(rule)}`);
  }
});

test("release-notes sections and hidden types are complete", () => {
  assert.deepStrictEqual(optionsFor("@semantic-release/release-notes-generator").presetConfig.types, [
    { type: "feat", section: "Features" },
    { type: "fix", section: "Bug Fixes" },
    { type: "perf", section: "Performance" },
    { type: "revert", section: "Reverts" },
    { type: "chore", section: "Maintenance" },
    { type: "docs", hidden: true },
    { type: "style", hidden: true },
    { type: "refactor", hidden: true },
    { type: "test", hidden: true },
    { type: "build", hidden: true },
    { type: "ci", hidden: true },
  ]);
});

test("every commit type that cuts a release is visible in the notes", () => {
  const types = optionsFor("@semantic-release/release-notes-generator").presetConfig.types;
  for (const type of ["feat", "fix", "perf", "chore"]) {
    const entry = types.find((t) => t.type === type);
    assert.ok(entry, `${type} missing from release-notes types`);
    assert.ok(!entry.hidden, `${type} can cut a release but is hidden from the notes`);
  }
});

test("the ESM wrapper exposes the same config object as the CJS entry point", () => {
  assert.deepStrictEqual(wrapped, config);
});

// The exports map is only useful if the files it names actually ship.
test("every entry point declared in package.json exists on disk", () => {
  const declared = [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.exports)];
  for (const entry of declared) {
    const resolved = fileURLToPath(new URL(`../${entry.replace(/^\.\//u, "")}`, import.meta.url));
    assert.ok(fs.existsSync(resolved), `${entry} is declared in package.json but missing`);
  }
});

test("every declared entry point is inside the published files allowlist", () => {
  const shipped = new Set(pkg.files);
  for (const entry of [pkg.main, pkg.module, pkg.types]) {
    const name = entry.replace(/^\.\//u, "");
    const covered = shipped.has(name) || [...shipped].some((f) => f.endsWith("/*") && name.startsWith(f.slice(0, -1)));
    assert.ok(covered, `${name} would not be published — add it to package.json "files"`);
  }
});

// types must resolve before import/require, or TypeScript consumers never see it.
test("the exports map declares types first", () => {
  assert.strictEqual(Object.keys(pkg.exports)[0], "types");
});
