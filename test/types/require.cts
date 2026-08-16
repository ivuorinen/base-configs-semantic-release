// Compile fixture, not a runtime test — `node --test` only collects *.test.mjs.
// The CJS half, and the case that was actually broken: with a single shared
// index.d.ts this failed with TS1471 ("only resolves to an ES module") and
// TS2339 on every property. It must match the `require` condition and
// index.d.cts, whose `export =` is what makes this form legal.
import config = require("@ivuorinen/semantic-release-config");

void config.branches;
void config.plugins;
