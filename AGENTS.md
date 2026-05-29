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


## Architecture

Hex architecture. `domain/` is pure (types + resolver logic, zero I/O). `app/` defines ports (interfaces) and the orchestration use case. `infra/` provides adapters (@clack/prompts, file system, child_process).

```
apps/cli/
├── index.ts              → thin entry: wires infra adapters → calls use case
├── domain/
│   ├── types.ts          → PackageManager, TechConfig, ResolveResult, CollectedPlugins
│   ├── resolver.ts       → resolve(), collectPlugins(), getAllDeps() (pure)
│   └── data/             → 16 JSON files: per-tech linter/formatter compatibility
├── app/
│   ├── ports.ts          → Terminal, ConfigWriter, PackageInstaller interfaces
│   └── configure-project.ts → orchestration use case (depends only on domain + ports)
└── infra/
    ├── terminal.ts       → @clack/prompts adapter (implements Terminal)
    ├── config-writer.ts  → composes generators (implements ConfigWriter)
    ├── installer.ts      → execSync install (implements PackageInstaller)
    ├── pm-detector.ts    → auto-detect package manager from argv/env
    ├── ascii.ts          → gradient-string splash art
    ├── eslint.ts         → generates eslint.config.js
    ├── prettier.ts       → generates .prettierrc
    ├── biome.ts          → generates biome.json
    ├── oxlint.ts         → generates .oxlintrc.json
    └── oxfmt.ts          → generates .oxfmtrc.json
```

**Resolver logic:** intersection of linter/formatter keys across all selected tech JSON files. If only one option survives, auto-select it.

**Data file shape** (`domain/data/*.json`):

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
- **Path aliases:** `@/*` → `./apps/cli/*`, `data` → `./apps/cli/domain/data/index.ts`
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
