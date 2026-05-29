# AGENTS.md — @jannael/config

## What this is

Interactive CLI (`bun run dist/index.js`) that configures linters + formatters for JS/TS projects. User picks technologies → CLI computes compatible tool intersection.

## Commands

| Command             | What                                               |
| ------------------- | -------------------------------------------------- |
| `bun run build`     | Bundle `apps/cli/index.ts` → `dist/index.js` (Bun) |
| `bun run lint`      | ESLint flat config check                           |
| `bun run fmt`       | Prettier --write                                   |
| `bun run fmt:check` | Prettier --check                                   |

No tests exist (no test framework configured).

## Architecture (hexagonal)

`domain/` is pure I/O-free logic (classes + ports). `app/` orchestrates use cases. `infra/` provides adapters. All methods use object params (`{ key: value }`) for readability.

```
apps/cli/
├── index.ts             → wires DI → calls new ConfigureProject(...).run()
├── domain/
│   ├── types.ts         → core types
│   ├── ports.ts         → Terminal, ConfigWriter, PackageInstaller, PackageManagerDetector interfaces
│   └── resolver.ts      → class Resolver: resolve(), collectPlugins(), getAllDeps() (pure)
├── data/
│   ├── index.ts         → technology/linter/formatter display names
│   └── *.json           → per-tech linter/formatter compatibility matrices
├── app/
│   └── configure-project.ts → class ConfigureProject (constructor DI + run())
└── infra/
    ├── terminal.ts      → class ClackTerminal implements Terminal (@clack/prompts)
    ├── config-writer.ts → class FileConfigWriter implements ConfigWriter
    ├── installer.ts     → class NpmInstaller implements PackageInstaller
    ├── pm-detector.ts   → class PmDetector implements PackageManagerDetector
    └── *.ts             → per-tool config generators
```

**Resolver:** intersection of linter/formatter keys across selected techs. If only one option survives, auto-select it.

## Style (hardcoded in generators)

- `semi: false`, `singleQuote: true`, `printWidth: 100`
- ESLint: flat config
- Biome: `semicolons: "asNeeded"`, single quotes
- Oxlint/Oxfmt: equivalent

## Toolchain quirks

- **Bun only** — `bun install`, `bun run build`. Not Node/npm.
- **Path aliases:** `@/*` → `./apps/cli/*`, `data` → `./apps/cli/data/index.ts`
- **Lockfile:** `bun.lock` (not package-lock.json)
- **bunfig.toml:** `minimumReleaseAge = 86400` — may delay fresh package installs
- **prepublishOnly:** runs `bun run build`
- **VSCode:** Prettier default formatter, format-on-save

## Git

Conventional commits (feat:, fix:, chore:, refactor:, docs:).

## OpenCode

`.opencode/` has its own `package.json` (`@opencode-ai/plugin`) and `.gitignore` that also ignores `package.json` + lockfiles inside it (the package.json is intentionally untracked).
