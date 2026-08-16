// Compile fixture, not a runtime test — `node --test` only collects *.test.mjs.
// Resolves the package by its own name (self-reference), so it exercises the
// real `exports` map exactly as a consumer would, rather than the file paths.
// This is the ESM half: it must match the `import` condition and index.d.mts.
import config from "@ivuorinen/semantic-release-config";

void config.branches;
void config.plugins;
