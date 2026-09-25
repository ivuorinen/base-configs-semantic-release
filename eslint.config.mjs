import { createRequire } from "node:module";

// Vendored from @ivuorinen/eslint-config (base-configs-eslint) to break a
// dependency cycle: that package uses this one as its release config, so a
// devDependency on it here made every major of either package force a major of
// the other through Renovate's `chore(deps)!` bumps. Same pattern as
// @ivuorinen/config-checker. ESLint v10 flat config uses native ESM resolution
// that does not honor NODE_PATH, so a bare `import` of these plugins fails
// under MegaLinter's bundled install; createRequire resolves them from the
// local node_modules.
//
// Kept in step with base-configs-eslint/index.cjs by hand. The one deliberate
// difference from the published 1.5.x config: no `ecmaVersion: 12` pin, which
// made newer syntax a fatal parse error (fixed upstream in the same change).
const require = createRequire(import.meta.url);
const globals = require("globals");
const configEslint = require("eslint-config-eslint");
const configPrettier = require("eslint-config-prettier");
const pluginJs = require("@eslint/js");

export default [
  ...configEslint,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
    rules: {
      "func-style": [
        "error",
        "declaration",
        {
          allowArrowFunctions: true,
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es2021,
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,
  configPrettier,
  {
    ignores: ["coverage/", "dist/", "lib/", "node_modules/"],
  },
];
