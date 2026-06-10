# AGENTS.md — @jannael/config

## What this is

Interactive CLI (`bun run dist/index.js`) that configures linters + formatters for JS/TS projects. User picks technologies → CLI computes compatible tool intersection.

## Commands

| Command             | What                                               |
| ------------------- | -------------------------------------------------- |
| `bun run build`     | Bundle `apps/cli/index.ts` → `dist/index.js` (Bun) |

After changes: `bun run build && bun run test`.

## Architecture (hexagonal)

`domain/` is the port interface. `app/` has use-case classes + the `Command` orchestrator. `infra/` provides the concrete `Repository` implementation. All methods use object params (`{ key: value }`) for readability.

```
apps/cli/
├── index.ts                 → entry point (prints ASCII, wires DI)
├── domain/
│   └── repository.ts        → Repository interface (the port)
├── configs/
│   ├── index.ts             → technology/linter/formatter display names
│   ├── types.d.ts           → Linters, Formatters union types
│   ├── techs/*.json         → per-tech linter/formatter compatibility matrices
│   ├── editor-extensions.ts → VS Code extension recommendations
│   └── commands.json        → shell commands per tool
├── app/
│   ├── command.ts           → class Command: main orchestrator (constructor DI + execute())
│   └── *.use-case.ts        → individual use cases (get-linter, get-formatter, write-config, etc.)
├── infra/
│   ├── infra.ts             → class Repository implements domain/Repository
│   ├── pm-detector.ts       → package manager detection (lockfile → cache, fallback → multiselect)
│   └── generators/          → per-tool config file generators (biome, eslint, prettier, etc.)
└── utils/
    ├── multiselect.ts       → @clack/prompts multiselect wrapper
    ├── select.ts            → @clack/prompts select wrapper
    ├── confirm.ts           → @clack/prompts confirm wrapper
    └── print.ts             → colored console output
```

## Style (hardcoded in generators)

- `semi: false`, `singleQuote: true`, `printWidth: 100`
- ESLint: flat config
- Biome: `semicolons: "asNeeded"`, single quotes
- Oxlint/Oxfmt: equivalent

## Toolchain quirks

- **Bun only** — `bun install`, `bun run build`. Not Node/npm.
- **Path aliases:** `@/*` → `./apps/cli/*`, `print` → `./apps/cli/utils/print`, `configs` → `./apps/cli/configs/index`
- **Lockfile:** `bun.lock` (not package-lock.json)
- **bunfig.toml:** `minimumReleaseAge = 86400`, `exact = true` — pins exact versions, may delay fresh package installs
- **prepublishOnly:** runs `bun run build`
- **apps/web/** is a separate Astro app with its own `bun.lock`, `bunfig.toml`, and `node_modules`

## Git

Conventional commits (feat:, fix:, chore:, refactor:, docs:).

## OpenCode

`.opencode/` has its own `package.json` (`@opencode-ai/plugin`) and `.gitignore` that also ignores `package.json` + lockfiles inside it (the package.json is intentionally untracked).
