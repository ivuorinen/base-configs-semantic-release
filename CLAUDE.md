# @ivuorinen/semantic-release-config

Shareable semantic-release configuration using the `conventionalcommits` preset, designed to align with Renovate bot commit conventions.

## Key Files

- `index.cjs` — the shared config (commit-analyzer rules, release-notes types, plugin chain)
- `wrapper.mjs` — ESM re-export of `index.cjs`
- `scripts/postinstall.cjs` — auto-creates `.releaserc.json` in consuming projects
- `.releaserc.json` — this repo's own release config, extends `./index.cjs`

## Verification

```sh
node -e "console.log(JSON.stringify(require('./index.cjs'), null, 2))"
```

No test suite — verify config loads and inspect the output.

## Commit Conventions

Uses Conventional Commits. Release rules:

- `feat:` → minor
- `fix:` → patch
- `chore(deps)!:` → minor (breaking dep update, but this package's API is unchanged)
- `chore(deps):` → patch
- `chore(actions):` → no release

## Release Pipeline

Merging to `main` triggers `semantic-release` via GitHub Actions (`publish.yml`):
commit-analyzer → release-notes-generator → npm publish → GitHub release.

No changelog file or git commit-back — release notes live on GitHub Releases only.

## Code Quality

Pre-commit hooks enforce: trailing whitespace, YAML/JSON validation, markdownlint, actionlint, no private keys.

```sh
pre-commit run --all-files
```

## Gotchas

- The `conventionalcommits` preset requires `conventional-changelog-conventionalcommits` as a direct dependency — without it the config silently falls back to angular
- The `angular` preset cannot parse the `!` in `chore(deps)!:` — commits become invisible to semantic-release
- Plugin order matters: commit-analyzer must come first, release-notes-generator second

---

## context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

### BLOCKED commands — do NOT attempt these

#### curl / wget — BLOCKED

Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:

- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

#### Inline HTTP — BLOCKED

Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:

- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

#### WebFetch — BLOCKED

WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:

- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

### REDIRECTED tools — use sandbox equivalents

#### Bash (>20 lines output)

Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:

- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

#### Read (for analysis)

If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

#### Grep (large results)

Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

### Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

### Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt.
Bash-type subagents are upgraded to general-purpose so they have access to MCP tools.
You do NOT need to manually instruct subagents about context-mode.

### Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

### ctx commands

| Command       | Action                                                       |
| ------------- | ------------------------------------------------------------ |
| `ctx stats`   | Display `ctx_stats` output verbatim                          |
| `ctx doctor`  | Run `ctx_doctor` shell command, display as checklist         |
| `ctx upgrade` | Run `ctx_upgrade` shell command, display as checklist        |
