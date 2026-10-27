import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const config = require("../index.cjs");

const root = fileURLToPath(new URL("..", import.meta.url));
const optionsFor = (name) => config.plugins.find((p) => Array.isArray(p) && p[0] === name)[1];

/**
 * Rebuild the layout a consumer's install produces: the plugin at the project
 * root, next to a conventional-changelog-conventionalcommits that is not this
 * package's dependency. In an `@ivuorinen/base-configs` install that is the 10.x
 * `@commitlint/config-conventional` hoists; here it is a stand-in that throws, so
 * loading it in any way fails the test. The plugin is copied, not linked,
 * because Node resolves a symlink to its real path, which would put it back
 * next to this repository's own preset. Its dependencies are linked from here.
 * @param {import("node:test").TestContext} t Removes the project after the test.
 * @param {string} plugin The plugin package to place at the project root.
 * @returns {{project: string, entry: string}} The project directory and the
 *   file URL of the copied plugin's entry point.
 */
function consumerTree(t, plugin) {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "sr-consumer-"));
  t.after(() => fs.rmSync(project, { recursive: true, force: true }));

  const nodeModules = path.join(project, "node_modules");
  const target = path.join(nodeModules, plugin);
  fs.cpSync(path.join(root, "node_modules", plugin), target, { recursive: true });

  const { dependencies } = JSON.parse(fs.readFileSync(path.join(target, "package.json"), "utf8"));
  for (const dependency of Object.keys(dependencies)) {
    const link = path.join(nodeModules, dependency);
    fs.mkdirSync(path.dirname(link), { recursive: true });
    fs.symlinkSync(fs.realpathSync(path.join(root, "node_modules", dependency)), link, "dir");
  }

  const hoisted = path.join(nodeModules, "conventional-changelog-conventionalcommits");
  fs.mkdirSync(hoisted);
  fs.writeFileSync(
    path.join(hoisted, "package.json"),
    JSON.stringify({
      name: "conventional-changelog-conventionalcommits",
      version: "10.4.1",
      type: "module",
      exports: "./index.js",
    }),
  );
  fs.writeFileSync(
    path.join(hoisted, "index.js"),
    'export default () => { throw new Error("loaded the hoisted preset, not this package\'s"); };\n',
  );

  return { project, entry: pathToFileURL(path.join(target, "index.js")).href };
}

const context = (cwd) => ({
  cwd,
  options: { repositoryUrl: "https://github.com/ivuorinen/base-configs-semantic-release.git" },
  lastRelease: { gitTag: "v1.0.0", version: "1.0.0" },
  nextRelease: { gitTag: "v2.0.0", version: "2.0.0" },
  commits: [
    { hash: "a".repeat(40), message: "feat: add an option", committerDate: "2026-09-26T00:00:00Z" },
    { hash: "b".repeat(40), message: "chore(deps)!: update x (1.0.0 -> 2.0.0)", committerDate: "2026-09-26T00:00:00Z" },
  ],
  logger: { log() {}, error() {} },
});

test("commit-analyzer in a consumer's tree uses this package's preset", async (t) => {
  const { project, entry } = consumerTree(t, "@semantic-release/commit-analyzer");
  const { analyzeCommits } = await import(entry);

  assert.strictEqual(await analyzeCommits(optionsFor("@semantic-release/commit-analyzer"), context(project)), "major");
});

test("release-notes-generator in a consumer's tree uses this package's preset", async (t) => {
  const { project, entry } = consumerTree(t, "@semantic-release/release-notes-generator");
  const { generateNotes } = await import(entry);

  const notes = await generateNotes(optionsFor("@semantic-release/release-notes-generator"), context(project));
  assert.match(notes, /### Features[\s\S]*add an option/u);
  assert.match(notes, /### Maintenance[\s\S]*update x/u);
});
