---
name: User Coding Preferences
description: Sarim's preferences for code style, architecture, and workflow
type: feedback
---

- One component per file — don't define multiple function components in a single route/file.
- Keep types in separate files (e.g. `src/types/cloudflare.ts`), not inline in API files.
- Use framework-provided APIs (createClientOnlyFn, createIsomorphicFn, createServerFn) instead of manual `typeof window` checks.
- Discuss architecture decisions before coding — don't just start writing files.
- Uses bun as package manager.
