# Contributing to @ivuorinen/semantic-release-config

Thank you for your interest in contributing! This guide will help you get started.

## Ways to Contribute

- Report bugs or unexpected release behavior
- Suggest new release rules or plugin configurations
- Improve documentation
- Submit pull requests with fixes or enhancements

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Yarn](https://yarnpkg.com/) 4.x (enabled via corepack)
- [pre-commit](https://pre-commit.com/) for git hooks

### Setup

1. Fork and clone the repository:

   ```sh
   git clone https://github.com/<your-username>/base-configs-semantic-release.git
   cd base-configs-semantic-release
   ```

2. Install dependencies:

   ```sh
   corepack enable
   yarn install
   ```

3. Install pre-commit hooks:

   ```sh
   pre-commit install
   ```

## Development Workflow

1. Create a feature branch from `main`:

   ```sh
   git checkout -b feat/your-change
   ```

2. Make your changes. The key files are:
   - `index.cjs` — the shared semantic-release configuration
   - `wrapper.mjs` — ESM wrapper that re-exports `index.cjs`
   - `scripts/postinstall.cjs` — auto-creates `.releaserc.json` in consuming projects

3. Verify the config loads correctly:

   ```sh
   node -e "console.log(JSON.stringify(require('./index.cjs'), null, 2))"
   ```

## Code Quality

Pre-commit hooks run automatically on each commit and enforce:

- Trailing whitespace removal
- YAML and JSON validation
- Markdown linting ([markdownlint](https://github.com/DavidAnson/markdownlint))
- GitHub Actions validation ([actionlint](https://github.com/rhysd/actionlint))
- No private keys in commits

You can run all checks manually:

```sh
pre-commit run --all-files
```

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/).
Commit messages determine how versions are bumped automatically:

| Prefix            | Example                                      | Version bump |
| ----------------- | -------------------------------------------- | ------------ |
| `feat:`           | `feat: add preset config option`             | minor        |
| `fix:`            | `fix: correct release rule matching`         | patch        |
| `chore(deps):`    | `chore(deps): update semantic-release`       | patch        |
| `chore(deps)!:`   | `chore(deps)!: update X (1.0.0 -> 2.0.0)`    | minor        |
| `docs:`           | `docs: update README examples`               | no release   |
| `chore(actions):` | `chore(actions): update checkout action`     | no release   |

## Pull Request Process

1. Target the `main` branch
2. Provide a clear description of your changes
3. Link any related issues
4. Ensure pre-commit hooks pass

## Release Process

Releases are fully automated. When a pull request is merged to `main`:

1. [semantic-release](https://github.com/semantic-release/semantic-release) analyzes commit messages
2. A version bump is determined based on the commit types
3. The package is published to [npm](https://www.npmjs.com/package/@ivuorinen/semantic-release-config)
4. A [GitHub release](https://github.com/ivuorinen/base-configs-semantic-release/releases) is created with generated notes

You do not need to manually bump versions or create tags.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE.md).
