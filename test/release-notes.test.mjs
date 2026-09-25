import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

import { generateNotes } from "@semantic-release/release-notes-generator";

const require = createRequire(import.meta.url);
const config = require("../index.cjs");

const notesOptions = config.plugins.find(
  (plugin) =>
    Array.isArray(plugin) &&
    plugin[0] === "@semantic-release/release-notes-generator",
)[1];

// Renders notes with the writer semantic-release ships, so a preset major that
// writer cannot render fails here instead of at release time. The
// conventionalcommits 10.0–10.3 presets rendered only the version heading under
// conventional-changelog-writer 8, and 10.4 throws "Missing helper".
test("release notes list commits under their sections", async () => {
  const commit = (message, hash) => ({
    hash: hash.repeat(40),
    message,
    committerDate: "2026-09-26T00:00:00Z",
  });

  const notes = await generateNotes(notesOptions, {
    cwd: process.cwd(),
    options: {
      repositoryUrl:
        "https://github.com/ivuorinen/base-configs-semantic-release.git",
    },
    lastRelease: { gitTag: "v1.0.0", version: "1.0.0" },
    nextRelease: { gitTag: "v2.0.0", version: "2.0.0" },
    commits: [
      commit("feat: add an option", "a"),
      commit("fix!: raise the floor\n\nBREAKING CHANGE: engines raised", "b"),
      commit("docs: a hidden entry", "c"),
    ],
    logger: { log() {}, error() {} },
  });

  assert.match(notes, /### Features[\s\S]*add an option/u);
  assert.match(notes, /### Bug Fixes[\s\S]*raise the floor/u);
  assert.match(notes, /BREAKING CHANGES[\s\S]*engines raised/u);
  assert.doesNotMatch(notes, /a hidden entry/u);
});
