# Architecture Profile

Generated: 2026-09-25

Confidence: none — manual review required

## Detected Patterns

Detected: none.

No catalogued pattern reaches Low confidence. Structural evidence:

- Source is `index.cjs` (plugin chain and release rules), `wrapper.mjs` (ESM re-export), three declaration files
  (`index.d.ts`, `index.d.cts`, `index.d.mts`) and `scripts/postinstall.cjs` (install-time starter-file writer).
- Import edges: `wrapper.mjs` → `./index.cjs`; the declaration files → `semantic-release` types only;
  `scripts/postinstall.cjs` → `@ivuorinen/config-checker`. Plugins are referenced as strings in `index.cjs` and
  resolved by semantic-release, not imported.
- `package.json` `exports` pairs each module format with its own declaration (`import` → `index.d.mts` +
  `wrapper.mjs`; `require` → `index.d.cts` + `index.cjs`).
- `test/` consumes `../index.cjs`, `../wrapper.mjs` and the package's own name (type fixtures), plus
  `@semantic-release/commit-analyzer` for behavioral checks.

Shape, for orientation (descriptive, not a catalogued pattern): shareable-config package — declarative data behind a
dual-format, dual-declaration entry point, plus one install-time script.

## Detected Combination

None.

## Inferred Structural Rules

None.

## Ambiguities & Contradictions

None.
