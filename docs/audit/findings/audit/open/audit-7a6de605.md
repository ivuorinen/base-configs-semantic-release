---
id: audit-7a6de605
auditor: audit
severity: advisory
category: maintainability
area: package.json
status: open
found: 2026-08-13
---

# ACCEPTED: semantic-release is a hard dependency by design, do not re-file this

## Problem

Not a defect. This records an owner decision so future audit runs do not re-file
`audit-823f9e96`, which proposed moving `semantic-release` from `dependencies` to
`peerDependencies`.

## Evidence

`package.json`:

```json
"dependencies": {
  "@ivuorinen/config-checker": "^2.2.17",
  "conventional-changelog-conventionalcommits": "^10.0.0",
  "semantic-release": "^25.0.5"
}
```

A bare consumer install pulls 301 packages for a 10 KB config. That cost is
known and accepted.

## Impact

None. The decision is deliberate: this package and the other `base-configs-*`
projects are "install this and get all the required tooling instantly". A
consumer adds one devDependency and has a working release pipeline with no
second install step. Making `semantic-release` a peer would move that step onto
every consumer, which is the outcome the design exists to avoid.

Recorded in `CLAUDE.md` under `## Dependency Policy`.

## Fix

None required. Do not convert `semantic-release` to a peer dependency.

The one part of `audit-823f9e96` that stands and remains applied: plugins that
`semantic-release` already ships are not declared here. `@semantic-release/github`
was the only one that was, inconsistently with `@semantic-release/npm` and
`@semantic-release/release-notes-generator`, which `index.cjs` names and which
were never declared. It stays removed -- a separate pin only creates drift when
`semantic-release` bumps its own plugin range.
