---
id: commits-38d14a40
auditor: commits
severity: advisory
category: reliability
area: .github/dependabot.yml
status: open
found: 2026-10-27
location: .github/dependabot.yml:33
location_sha: b7f72c2577da7c76
---

# 42 of 50 recent releases were empty

## Problem

Lockfile-only, `resolutions`-only and `packageManager`-only updates are titled `chore(deps)`, which `index.cjs` releases
as a patch. None of those files reach a consumer: npm and Yarn ignore a published library's lockfile and `resolutions`,
and `packageManager` only affects this repo.

## Evidence

For each tag dated after 2026-09-25 across the nine repos, the diff from the previous tag was checked for any change to
a file in the `files` whitelist, README/LICENSE, or package.json
`dependencies`/`peerDependencies`/`engines`/`exports`/`main`/`bin`/`files`: 42 of 50 releases changed none of them (all
of config-checker's six; semantic-release v3.0.1-v3.0.9). Their triggering commits: e.g. stylelint v1.4.9-v1.4.14,
eslint v2.0.1-v2.0.5, markdownlint v2.0.1-v2.0.6 are all `chore(deps): bump <transitive>` or `chore(deps): update
yarn`/`undici [security]`. Dependabot is configured `versioning-strategy: lockfile-only` with `commit-message: prefix:
"chore(deps)"` here and in base-configs; #237 (here, 2026-09-30) and base-configs #589 changed that prefix from
`chore(actions)` to `chore(deps)` deliberately. commitlint #204 used the non-releasing `chore(lockfile)` for the same
kind of change.

## Impact

Each empty release opens a Renovate PR in base-configs and every dependent, so a single transitive advisory produces a
cascade of PRs and releases with no behaviour change.

## Fix

Owner decision. If empty releases are not wanted: set the Dependabot prefix to `chore(lockfile)` and add to the shared
preset (ivuorinen/renovate-config) `{"matchDepTypes": ["packageManager"], "commitMessagePrefix": "chore(tooling): "}`
and `{"matchDepTypes": ["resolutions"], "commitMessagePrefix": "chore(lockfile): "}`. If they are wanted (to signal that
a fixed tree was tested), record that reason in `.github/dependabot.yml` and close this as accepted.
