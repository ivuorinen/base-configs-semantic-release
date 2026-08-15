"use strict";

/* eslint no-console: "off", n/no-process-exit: "off", no-undefined: "off" -- CLI app that gives users feedback */

const fs = require("node:fs");
const path = require("node:path");
// noinspection NpmUsedModulesInstalled
const process = require("node:process");
const checkConfig = require("@ivuorinen/config-checker");

// This script runs on every consumer install. Nothing it does is worth failing
// that install over: the config works without .releaserc.json, which a consumer
// can write by hand or replace with --extends. So every step below degrades to
// a message and exit 0 — an uncaught throw here makes `npm install` exit
// non-zero and takes the consumer's whole dependency install down with it.

// config-checker reads process.env.INIT_CWD with no fallback of its own, so it
// throws when the script runs outside a package manager. Pass the path in.
const cwd = process.env.INIT_CWD || process.cwd();

let foundConfig;
try {
  foundConfig = checkConfig("release", cwd);
} catch (err) {
  // An unreadable or vanished cwd is the consumer's environment, not our bug.
  console.log(`semantic-release-config: could not scan ${cwd} for an existing config (${err.code || err.message}); skipping .releaserc.json creation.`);
  process.exit(0);
}

if (foundConfig.length > 0) {
  console.log("semantic-release-config: Found existing semantic-release config file, skipping creation.");
  console.log("semantic-release-config: If you want to create a new config file, please remove the existing one.");
  console.log(`semantic-release-config: Found config files at: ${foundConfig.join(", ")}`);
  process.exit(0);
}

const filePath = path.join(cwd, ".releaserc.json");
const fileConfigObject = {
  extends: ["@ivuorinen/semantic-release-config"],
};

try {
  fs.writeFileSync(filePath, JSON.stringify(fileConfigObject, undefined, 2), { flag: "wx" });
} catch (err) {
  // EEXIST is the benign race with the check above. Everything else — EACCES on
  // a root-owned workspace, EROFS in a read-only container build, ENOSPC — is
  // reported and swallowed, because none of them mean the package is unusable.
  if (err.code !== "EEXIST") {
    console.log(`semantic-release-config: could not write ${filePath} (${err.code || err.message}).`);
    console.log('semantic-release-config: create it manually with {"extends": ["@ivuorinen/semantic-release-config"]}.');
  }
}
