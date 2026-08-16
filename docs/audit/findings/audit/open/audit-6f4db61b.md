---
id: audit-6f4db61b
auditor: audit
severity: advisory
category: security
area: .github/workflows/publish.yml
status: open
found: 2026-08-16
---

# ACCEPTED: publish runs without a GitHub Environment so the OIDC subject keeps matching npm, do not re-file this

## Problem

The publish job reads `secrets.PAT` without a dedicated GitHub Environment.
zizmor's `secrets-outside-env` audit reports this at High confidence, and it is
suppressed in `.github/zizmor.yml` rather than fixed.

This supersedes the earlier resolution of `audit-a6526808`, which added `environment: npm-publish` and was later renamed to `release`. That gate has been deliberately removed.

## Evidence

The job declares no environment, only the reason it does not:

```yaml
# .github/workflows/publish.yml:44-52
    needs:
      - Linter
      - test
    # Deliberately no `environment:`. Declaring one adds `:environment:<name>`
    # to the OIDC token's subject claim, and npm's trusted publisher for this
    # package was established from a publish.yml that had no environment at all
    # (rekor logIndex 2429132485, commit 563f77a).
```

The signing certificate for the last published release binds an identity with no environment component:

```text
SAN: https://github.com/ivuorinen/base-configs-semantic-release/.github/workflows/publish.yml@refs/heads/main
OID 1.3.6.1.4.1.57264.1.5:  ivuorinen/base-configs-semantic-release
OID 1.3.6.1.4.1.57264.1.10: 563f77aa5fb3f60df7ce19f82c45c39329a77e7c
```

The workflow at that commit confirms the absence was real, not merely unrecorded:

```text
$ git show 563f77a:.github/workflows/publish.yml | grep -n 'environment:'
(no output)
```

npm confirms the artifact published from that identity carries provenance:

```text
latest: 2.0.7
attestations: {"provenance":{"predicateType":"https://slsa.dev/provenance/v1"}}
```

## Impact

None accepted knowingly, and the residual exposure is small.

What an Environment would buy is a guard against a future trigger change
widening who can reach the secret. That risk is low here: `publish.yml` triggers
only on `push` to `main`, and `NPM_TOKEN` no longer exists at all since the job
authenticates to npm via OIDC trusted publishing, so `secrets.PAT` is the single
remaining secret in the job.

What it would cost is concrete. A GitHub job that declares `environment: <name>`
gets `:environment:<name>` appended to the OIDC token's `sub` claim. npm matches
trusted-publisher requests against that claim. The trusted publisher for this
package was established from a workflow with no environment, so introducing one
risks the next release failing registry authentication — with a symptom that
reads as "trusted publishing suddenly stopped working" rather than as a workflow
change.

The sibling `base-configs-commitlint` does combine `environment: release` with
trusted publishing successfully, so the pattern is viable; it is this package's
registry-side entry that has not been confirmed to tolerate the added claim.

## Fix

No action. Do not add `environment:` to the publish job on the strength of a zizmor report alone — verify the npm trusted publisher entry first.

To adopt an environment later, in this order:

1. On npmjs.com, edit the trusted publisher for `@ivuorinen/semantic-release-config` to pin the environment name.
2. Add `environment: <name>` to the publish job.
3. Move `PAT` into that environment and restrict its deployment branches to `main`.
4. Remove the `secrets-outside-env` ignore from `.github/zizmor.yml`.
5. Confirm the next release publishes green before deleting the repository-level secret.

Doing step 2 before step 1 breaks publishing.
