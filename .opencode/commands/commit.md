---
description: Create semantic and atomic commits for staged changes
agent: build
model: opencode/mimo-v2.5-free
---

Analyze the current git status and staged changes. Create semantic, atomic commits following conventional commits format.

1. Run `git status` to see all changes
2. Run `git diff --cached` to see staged changes
3. Group related changes into logical commits using these types:
   - `feat:` new features or components
   - `fix:` bug fixes
   - `refactor:` code refactoring without changing functionality
   - `chore:` maintenance tasks, dependencies, config
   - `docs:` documentation changes
   - `style:` formatting, styling changes
   - `perf:` performance improvements
   - `test:` adding or modifying tests

4. For each logical group:
   - Stage only those files: `git add <files>`
   - Create a commit with a clear, concise message in imperative mood
   - Format: `<type>: <description>`
   - Keep commits atomic - one logical change per commit

5. After all commits, run `git status` to confirm everything is committed

Important:

- Never commit secrets, credentials, or .env files
- Keep commit messages under 72 characters
- Use present tense ("add feature" not "added feature")
- Be specific about what changed
