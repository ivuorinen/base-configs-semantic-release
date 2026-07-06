# @ivuorinen/semantic-release-config <!-- omit in toc -->

[![npm package][npm-badge]][npm-link] [![license MIT][license-badge]][license-link] [![ivuorinen's Code Style][style-badge]][style-link]

> ivuorinen's shareable configuration for [`semantic-release`][semantic-release-link].

## Table of Contents <!-- omit in toc -->

- [Plugins](#plugins)
- [Release Rules](#release-rules)
- [Installation](#installation)
- [Configuration](#configuration)
- [GitHub Actions](#github-actions)
- [Documentations](#documentations)
- [Contributing](#contributing)
- [License](#license)

## Plugins

This shareable configuration uses the following plugins:

- [`@semantic-release/commit-analyzer`][sr-commit-analyzer-link] — determines version bumps using the [Conventional Commits][conventionalcommits-link] preset
- [`@semantic-release/release-notes-generator`][sr-release-notes-generator-link] — generates release notes with typed sections
- [`@semantic-release/npm`][sr-npm-link] — publishes to npm
- [`@semantic-release/github`][sr-github-link] — creates GitHub releases

## Release Rules

This config is designed to work with [Renovate][renovate-link] commit conventions:

| Commit pattern        | Example                                   | Release    |
|-----------------------|-------------------------------------------|------------|
| `feat: ...`           | `feat: add new option`                    | minor      |
| `fix: ...`            | `fix: resolve parsing error`              | patch      |
| `chore(deps)!: ...`   | `chore(deps)!: update X (1.0.0 → 2.0.0)`  | minor      |
| `chore(deps): ...`    | `chore(deps): update X (1.0.0 → 1.1.0)`   | patch      |
| `chore(actions): ...` | `chore(actions): update actions/checkout` | no release |

## Installation

Install `this config` as a _`devDependencies`_:

```sh
# npm
npm install @ivuorinen/semantic-release-config --save-dev

# Yarn
yarn add @ivuorinen/semantic-release-config --dev
```

After installing it, a _`.releaserc.json`_ file will be created automatically in the project's root folder with the following configuration:

```json
{
  "extends": ["@ivuorinen/semantic-release-config"]
}
```

## Configuration

Ensure that your CI configuration has the following **_secret_** environment variables set:

- [`GH_TOKEN`][gh-token-link] with [`public_repo`][gh-scopes-link] access or `GITHUB_TOKEN`.
- [`NPM_TOKEN`][npm-token-link]

See each [plugin](#plugins) documentation for required installation and configuration steps.

## GitHub Actions

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      id-token: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          always-auth: true
          node-version: 20
          registry-url: "https://registry.npmjs.org"

      - name: Install Dependencies
        run: npm ci

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

## Documentations

Read the [semantic-release docs][semantic-release-docs-link] for more information.

## Contributing

If you are interested in helping contribute, please take a look at our [contribution guidelines][contributing-link] and open an [issue][issue-link] or [pull request][pull-request-link].

## License

Distributed under the MIT License. See [LICENSE][license-link] for more information.

[contributing-link]: ./CONTRIBUTING.md
[conventionalcommits-link]: https://www.conventionalcommits.org
[gh-scopes-link]: https://docs.github.com/en/developers/apps/scopes-for-oauth-apps#available-scopes
[gh-token-link]: https://github.com/settings/tokens/new?scopes=public_repo
[issue-link]: https://github.com/ivuorinen/base-configs-semantic-release/issues
[license-badge]: https://img.shields.io/github/license/ivuorinen/base-configs-semantic-release?style=flat-square&labelColor=292a44&color=663399
[license-link]: ./LICENSE
[npm-badge]: https://img.shields.io/npm/v/@ivuorinen/semantic-release-config?style=flat-square&labelColor=292a44&color=663399
[npm-link]: https://www.npmjs.com/package/@ivuorinen/semantic-release-config
[npm-token-link]: https://docs.npmjs.com/about-access-tokens
[pull-request-link]: https://github.com/ivuorinen/base-configs-semantic-release/pulls
[renovate-link]: https://docs.renovatebot.com/
[semantic-release-docs-link]: https://semantic-release.gitbook.io/
[semantic-release-link]: https://github.com/semantic-release/semantic-release
[sr-commit-analyzer-link]: https://github.com/semantic-release/commit-analyzer
[sr-github-link]: https://github.com/semantic-release/github
[sr-npm-link]: https://github.com/semantic-release/npm
[sr-release-notes-generator-link]: https://github.com/semantic-release/release-notes-generator
[style-badge]: https://img.shields.io/badge/code_style-ivuorinen%E2%80%99s-663399.svg?labelColor=292a44&style=flat-square
[style-link]: https://github.com/ivuorinen/base-configs-semantic-release
