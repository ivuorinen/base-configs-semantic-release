import type { Options } from "semantic-release";

/**
 * The shared semantic-release configuration, consumed via `extends`.
 *
 * Typed as `Options`, not `GlobalConfig`: semantic-release defines
 * `GlobalConfig` as "options after normalization and defaults have been
 * applied", which this object is not. It is pre-normalization input that
 * semantic-release merges with the consumer's own settings, so none of the
 * defaults `GlobalConfig` implies — `tagFormat`, `repositoryUrl`, `ci` — are
 * present here. Typing it as the normalized shape would tell consumers those
 * fields are populated when reading one returns undefined.
 */
declare const config: Options;

export default config;
