import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../scripts/postinstall.cjs", import.meta.url));

const EXPECTED = { extends: ["@ivuorinen/semantic-release-config"] };

/**
 * Run the postinstall script in a throwaway directory.
 * @param {Object} [options] Test setup.
 * @param {string|null} [options.initCwd] `"cwd"` points INIT_CWD at the temp dir,
 *   `null` unsets it entirely (the case that used to crash), any other string is
 *   used verbatim.
 * @param {Record<string, string>} [options.seed] Files to create before running,
 *   keyed by path relative to the temp dir.
 * @returns {{dir: string, status: number, stdout: string, stderr: string,
 *   exists: boolean, read: Function, cleanup: Function}} The spawn result plus
 *   helpers for the written config file.
 */
function runPostinstall({ initCwd = "cwd", seed } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sr-config-postinstall-"));
  if (seed) {
    for (const [name, contents] of Object.entries(seed)) {
      fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
      fs.writeFileSync(path.join(dir, name), contents);
    }
  }

  const env = { ...process.env };
  delete env.INIT_CWD;
  if (initCwd === "cwd") {
    env.INIT_CWD = dir;
  } else if (initCwd !== null) {
    env.INIT_CWD = initCwd;
  }

  const result = spawnSync(process.execPath, [script], { cwd: dir, env, encoding: "utf8" });
  const releasercPath = path.join(dir, ".releaserc.json");

  return {
    dir,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    exists: fs.existsSync(releasercPath),
    read: () => fs.readFileSync(releasercPath, "utf8"),
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}

test("writes .releaserc.json into INIT_CWD when no config exists", () => {
  const run = runPostinstall();
  try {
    assert.strictEqual(run.status, 0);
    assert.ok(run.exists, ".releaserc.json should have been created");
    assert.deepStrictEqual(JSON.parse(run.read()), EXPECTED);
  } finally {
    run.cleanup();
  }
});

// Regression guard: config-checker reads process.env.INIT_CWD with no fallback of
// its own, so calling it without an explicit path threw ERR_INVALID_ARG_TYPE and
// exited 1 — aborting the consumer's install.
test("falls back to process.cwd() when INIT_CWD is unset instead of crashing", () => {
  const run = runPostinstall({ initCwd: null });
  try {
    assert.strictEqual(run.status, 0, `expected exit 0, got ${run.status}: ${run.stderr}`);
    assert.doesNotMatch(run.stderr, /ERR_INVALID_ARG_TYPE|TypeError/u);
    assert.ok(run.exists, ".releaserc.json should have been created in cwd");
    assert.deepStrictEqual(JSON.parse(run.read()), EXPECTED);
  } finally {
    run.cleanup();
  }
});

test("leaves an existing .releaserc.json untouched", () => {
  const original = '{\n  "extends": ["something-else"]\n}\n';
  const run = runPostinstall({ seed: { ".releaserc.json": original } });
  try {
    assert.strictEqual(run.status, 0);
    assert.strictEqual(run.read(), original, "existing config must not be overwritten");
    assert.match(run.stdout, /Found existing semantic-release config file/u);
  } finally {
    run.cleanup();
  }
});

// config-checker recognises many filenames, not just .releaserc.json. If detection
// only matched the file we write, every one of these projects would get a second,
// conflicting config.
for (const name of ["release.config.js", ".releaserc.yml", ".config/releaserc.json"]) {
  test(`detects an existing ${name} and creates nothing`, () => {
    const run = runPostinstall({ seed: { [name]: "{}\n" } });
    try {
      assert.strictEqual(run.status, 0);
      assert.ok(!run.exists, `.releaserc.json must not be created alongside ${name}`);
      assert.match(run.stdout, /skipping creation/u);
    } finally {
      run.cleanup();
    }
  });
}

test("INIT_CWD wins over the process working directory", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "sr-config-target-"));
  const run = runPostinstall({ initCwd: target });
  try {
    assert.strictEqual(run.status, 0);
    assert.ok(fs.existsSync(path.join(target, ".releaserc.json")), "should write to INIT_CWD");
    assert.ok(!run.exists, "should not write to the process cwd");
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
    run.cleanup();
  }
});

test("is idempotent — a second run neither fails nor rewrites", () => {
  const first = runPostinstall();
  try {
    assert.strictEqual(first.status, 0);
    const contents = first.read();

    const second = spawnSync(process.execPath, [script], {
      cwd: first.dir,
      env: { ...process.env, INIT_CWD: first.dir },
      encoding: "utf8",
    });

    assert.strictEqual(second.status, 0);
    assert.strictEqual(first.read(), contents);
  } finally {
    first.cleanup();
  }
});

// The script runs as a postinstall hook, so a non-zero exit aborts the
// consumer's entire `npm install`. An unwritable target — a read-only container
// build, a root-owned workspace — must degrade to a message, never to a throw.
// Skipped for root, which ignores the mode bits and would write anyway.
test("a read-only target degrades to a message instead of failing the install", { skip: process.getuid?.() === 0 ? "runs as root; mode bits are not enforced" : false }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sr-config-readonly-"));
  fs.chmodSync(dir, 0o555);
  try {
    const result = spawnSync(process.execPath, [script], {
      cwd: dir,
      env: { ...process.env, INIT_CWD: dir },
      encoding: "utf8",
    });

    assert.strictEqual(result.status, 0, `postinstall must not fail the install; stderr: ${result.stderr}`);
    assert.ok(!fs.existsSync(path.join(dir, ".releaserc.json")), "nothing should have been written");
    assert.match(result.stdout, /could not write/u);
  } finally {
    fs.chmodSync(dir, 0o755);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
