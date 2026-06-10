# Config

![Config](apps/web/public/og.png)

![Glinter](https://glinter.jannael.com/badge.svg)
![Bun](https://img.shields.io/badge/Bun-000000.svg?style=flat&logo=Bun&logoColor=ffffff)
![Typescript](https://img.shields.io/badge/Typescript-3b82f6.svg?style=flat&logo=Typescript&logoColor=ffffff)
![ESLint](https://img.shields.io/badge/ESLint-4b32c3.svg?style=flat&logo=ESLint&logoColor=ffffff)
![Prettier](https://img.shields.io/badge/Prettier-f59e0b.svg?style=flat-square&logo=Prettier&logoColor=ffffff)
![Husky](https://img.shields.io/badge/Husky-000000.svg?style=flat&logo=Husky&logoColor=ffffff)

One command to get your linter and formatter set up.

## Quick Start

```bash
bunx @jannael/config
```

## What is Config?

One command to set up your linter, formatter, editor config, and Husky + lint-staged — you only have to choose your technologies.

It keeps a consistent code style: single quotes, no semicolons, and `printWidth: 150`.

**Available linters:** oxlint, biome, eslint
**Available formatters:** oxfmt, biome, prettier

One of the main goals of `config` is full compatibility across selected technologies. When multiple linters or formatters support all your technologies, it lets you choose which one to use.

## Supported technologies

- Astro
- HTML
- JavaScript
- Lit
- Next.js
- React
- React Native
- Solid
- Tailwind CSS
- TypeScript
- Vue

## License

[MIT](LICENSE)
