import type { Options } from "semantic-release";

/**
 * CommonJS declarations for `index.cjs`, which does `module.exports = {...}`.
 *
 * `export =` rather than `export default`: a CJS consumer writing
 * `import config = require("@ivuorinen/semantic-release-config")` resolves the
 * `require` condition, and pointing that at an ESM-shaped declaration fails
 * with TS1471 ("only resolves to an ES module") plus TS2339 on every property.
 * Package `type` is `module`, so a plain `.d.ts` is read as ESM and cannot
 * serve this side — hence the separate `.d.cts`.
 *
 * Typed `Options`, not `GlobalConfig`; see index.d.ts for why.
 */
declare const config: Options;

export = config;
