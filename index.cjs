"use strict";

// Both analyzing plugins load the conventionalcommits preset from preset.mjs by
// absolute path, not by name, so they get this package's own dependency rather
// than whichever copy a consumer's tree hoists to its root (see preset.mjs).
const preset = require.resolve("./preset.mjs");

module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        config: preset,
        releaseRules: [
          { breaking: true, type: "chore", scope: "deps", release: "major" },
          { type: "chore", scope: "deps", release: "patch" },
          { type: "chore", scope: "actions", release: false },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        config: preset,
      },
    ],
    "@semantic-release/npm",
    "@semantic-release/github",
  ],
};
