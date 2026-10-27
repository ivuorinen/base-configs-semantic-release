---
id: audit-3abdba4b
auditor: audit
severity: low
category: tests
area: .github/workflows/test.yml
status: open
found: 2026-10-27
location: .github/workflows/test.yml:33
location_sha: 70a71aea2492d549
---

# CI tests one of the Node lines engines admits

## Problem

The reusable test workflow runs on the single Node version in `.nvmrc` (v26). The 22.x and 24.x lines that `engines` admits never run the suite.

## Evidence

`test.yml:33` `node-version-file: ".nvmrc"`; `.nvmrc` is `v26`; `engines.node` is `^22.19.0 || >=24.10.0`.

## Impact

A dependency that raises its floor ships green and breaks consumers on 22.19 or 24.10, which README.md states are supported.

## Fix

Add a matrix `node-version: ["22.19.0", "24.10.0", "26"]` to test.yml and update ruleset 24025419, whose required check `Test / Test` changes name.

## Status — workflow changed, ruleset pending (2026-10-27)

`fix/audit-2026-10` f4f4197 runs test.yml on Node 22.19.0, 24.10.0 and 26; the
suite passes locally on 22.19.0 and 24.10.0 (45/45). Ruleset 24025419 still
requires `Test / Test`, which the matrix no longer produces; replace it with
`Test / Test (Node 22.19.0)`, `Test / Test (Node 24.10.0)` and
`Test / Test (Node 26)` when the branch is pushed, then resolve this finding.
