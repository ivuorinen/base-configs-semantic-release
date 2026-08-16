import type { Options } from "semantic-release";

/**
 * ESM declarations for `wrapper.mjs`, which does `export default config`.
 *
 * Paired with index.d.cts under the matching `exports` condition. A single
 * shared `.d.ts` cannot type both halves of a dual-format package: whichever
 * module system it is not written for gets a declaration in the wrong shape.
 *
 * Typed `Options`, not `GlobalConfig`; see index.d.ts for why.
 */
declare const config: Options;

export default config;
