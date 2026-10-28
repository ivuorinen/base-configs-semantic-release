"use strict";

/* eslint no-console: "off", no-undefined: "off" -- CLI app that gives users feedback */

const { writeStarterConfig } = require("@ivuorinen/config-checker");

// This script runs on every consumer install. Nothing it does is worth failing
// that install over: the config works without .releaserc.json, which a consumer
// can write by hand or replace with --extends. writeStarterConfig never throws:
// it falls back to the working directory when INIT_CWD is unset, creates the
// file with "wx" so a config a concurrent install wrote is never overwritten,
// and returns a failed write (EACCES on a root-owned workspace, EROFS in a
// read-only container build, ENOSPC) for this script to report and exit 0.
const result = writeStarterConfig(
  "release",
  ".releaserc.json",
  JSON.stringify({ extends: ["@ivuorinen/semantic-release-config"] }, undefined, 2),
);

if (result.status === "found") {
  console.log("semantic-release-config: Found existing semantic-release config file, skipping creation.");
  console.log("semantic-release-config: If you want to create a new config file, please remove the existing one.");
  console.log(`semantic-release-config: Found config files at: ${result.found.join(", ")}`);
} else if (result.status === "failed") {
  console.log(`semantic-release-config: could not write ${result.filePath} (${result.error.code || result.error.message}).`);
  console.log('semantic-release-config: create it manually with {"extends": ["@ivuorinen/semantic-release-config"]}.');
}
