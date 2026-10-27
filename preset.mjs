import createPreset from "conventional-changelog-conventionalcommits";

// The conventional-changelog preset that index.cjs hands to commit-analyzer and
// release-notes-generator by absolute path, through their `config` option.
//
// Naming the preset instead (`preset: "conventionalcommits"`) makes each plugin
// import conventional-changelog-conventionalcommits from its own install
// location first and the project root second. In a consumer's tree neither is
// this package's dependency: it is whichever copy npm or Yarn hoisted to the
// root. Every @ivuorinen/base-configs install hoists the 10.x that
// @commitlint/config-conventional depends on, and 10.x fails
// release-notes-generator 14 with "Missing helper", so the consumer's release
// failed. A path reaches this file in any tree, and the import above resolves
// from here, so the plugins always get the ^9 this package declares.

export const types = [
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
];

/**
 * Build the conventionalcommits preset with this package's release-notes
 * sections. The plugins call a `config` module with no arguments
 * (`presetConfig` only reaches a named `preset`), so the sections are bound
 * here rather than in index.cjs.
 * @returns {Object} The preset: parser and writer options for the plugins.
 */
export default function preset() {
  return createPreset({ types });
}
