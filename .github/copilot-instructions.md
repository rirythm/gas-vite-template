# Copilot Instructions

Follow the repository guidelines in [AGENTS.md](../AGENTS.md).

Key points:

- Use `pnpm`.
- Keep Apps Script server code in `src/server`, HtmlService client code in `src/client`, and shared code in `src/shared`.
- When adding Apps Script callable functions, update `gasEntrypoints([...])` in `vite.server.config.ts`.
- Keep `google.script.run` calls behind the allowlist in `src/client/api.ts`.
- Do not commit `.clasp.json`, `.clasprc.json`, `.env*`, `dist/`, `node_modules/`, `.pnpm-store/`, or `*.tsbuildinfo`.
- Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` for meaningful code changes.

