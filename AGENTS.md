# AGENTS.md — @jannael/config

## What this is

Interactive CLI (`bun run dist/index.js`) that configures linters + formatters for JS/TS projects. Tech-first workflow: user picks technologies → CLI computes compatible tool intersection.

## Commands

| Command             | What                                                      |
| ------------------- | --------------------------------------------------------- |
| `bun run build`     | Bundle `apps/cli/index.ts` → `dist/index.js` (Bun target) |
| `bun run lint`      | ESLint flat config check                                  |
| `bun run fmt`       | Prettier --write                                          |
| `bun run fmt:check` | Prettier --check                                          |

**Known gotcha:** `bun run copy-template` in build script has no corresponding script — the second half of the build command (`&& bun run copy-template`) will fail. Run just `bun build ./apps/cli/index.ts --outfile=./dist/index.js --target=bun`.

## Architecture

```
apps/cli/
├── index.ts         → entry + orchestration
├── resolver.ts      → intersection logic (set intersection on `data/*.json` keys)
├── installer.ts     → `execSync` install via chosen package manager
├── ascii.ts         → splash art
├── generators/     → writes config files (eslint.config.js, .prettierrc, biome.json, .oxlintrc.json, .oxfmtrc.json)
└── data/           → 16 JSON files: per-tech linter/formatter compatibility
```

**Resolver logic:** intersection of linter/formatter keys across all selected tech JSON files. If only one option survives, auto-select it.

**Data file shape** (`apps/cli/data/*.json`):

```json
{ "linter": { "eslint": { "plugins": [...] }, "oxlint": {}, "biome": {} },
  "formatter": { "prettier": { "plugins": [...] }, "oxfmt": {}, "biome": {} } }
```

## Style rules (hardcoded in generators)

- semi: false, singleQuote: true, printWidth: 100
- ESLint: flat config (`eslint.config.js`)
- Biome: `semicolons: "asNeeded"`, single quotes
- Oxlint/Oxfmt: equivalent config

## Toolchain

- **Runtime:** Bun >=1.0 (required — `bunfig.toml` sets minimum release age 86400s)
- **TS config:** `module: Preserve`, `moduleResolution: bundler`, `noEmit`, `verbatimModuleSyntax`
- **Path aliases:** `@/*` → `./apps/cli/*`, `data` → `./apps/cli/data/index.ts`
- **Peer dep:** TypeScript 6.0.3
- **Lint:** ESLint 10 + typescript-eslint + plugins (astro, tailwindcss)
- **Format:** Prettier 3 + prettier-plugin-tailwindcss
- **Deps:** `@clack/prompts` (interactive CLI), `gradient-string` (ascii art)
- **Lockfile:** bun.lock (not package-lock.json)

## Supported tools

- **Linters:** eslint, oxlint, biome
- **Formatters:** prettier, oxfmt, biome
- **Techs:** angular, astro, javascript, lit, next, nuxt, qwik, react, react-native, remix, solid, svelte, sveltekit, tailwind, typescript, vue

## Git

- No conventional commit standard observed. Existing messages are plain English lowercase.

## OpenCode config

`.opencode/` dir has its own `package.json` (`@opencode-ai/plugin`) and is gitignored (via `.opencode/.gitignore` that also ignores `package.json` and lockfiles inside it).
