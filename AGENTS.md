# Agent Guidelines

Use these guidelines when an AI coding agent works on this repository.

## Project Shape

- This is a Google Apps Script template built with Node.js, pnpm, Vite 8, Rolldown, TypeScript, Vitest, oxlint, Prettier, and clasp.
- Server-side Apps Script code lives in `src/server`.
- HtmlService client code lives in `src/client`.
- Shared types and pure functions live in `src/shared`.
- Vite helper plugins live in `build`.
- `public/appsscript.json` is the Apps Script manifest source.
- `dist` is generated output for clasp and must not be edited by hand.

## Package Manager

- Use `pnpm`.
- Do not create `package-lock.json`, `npm-shrinkwrap.json`, or `yarn.lock`.
- Keep `pnpm-lock.yaml` committed when dependencies change.

## Apps Script Entrypoints

- When adding a callable Apps Script function, export it from `src/server/index.ts`.
- Add the function name to `gasEntrypoints([...])` in `vite.server.config.ts`.
- Entrypoint names must be valid JavaScript identifiers.
- Expose only functions that need to be called by Apps Script, triggers, menus, or `google.script.run`.

## Client/Server Boundary

- Use `src/client/api.ts` for `google.script.run` calls.
- Keep client-callable server functions behind the allowlist in `src/client/api.ts`.
- Do not pass user input directly as a server function name.
- Validate server function inputs before using Spreadsheet, Drive, Gmail, or other Apps Script services.

## Security

- Keep OAuth scopes in `public/appsscript.json` minimal.
- Review `webapp.access` and `webapp.executeAs` before widening web app access.
- Do not commit `.clasp.json`, `.clasprc.json`, `.env*`, `dist/`, `node_modules/`, `.pnpm-store/`, or `*.tsbuildinfo`.
- Do not add secrets, tokens, private sample data, mail addresses, personal names, or local machine paths to source, docs, tests, fixtures, or config files.
- Do not log tokens, personal information, mail addresses, or business data bodies.

## Assets

- HtmlService does not serve Vite's generated `assets/` directory as normal static files.
- JS and CSS are inlined into `dist/index.html`; generated `assets/` is removed.
- Prefer small data URL assets, inline SVG, trusted HTTPS assets, or Apps Script-backed asset delivery.
- For Google Drive images, public files can use `https://drive.google.com/uc?export=view&id=FILE_ID`; private files should be fetched server-side with appropriate Drive scopes and authorization checks.

## Generated Files

- Do not edit generated files in `dist`.
- Do not commit build info files such as `*.tsbuildinfo`.
- If build output needs to change, edit source files and run the build.

## Verification

Run these before finishing meaningful code changes:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

For narrow documentation-only changes, a targeted read-through is usually enough.

## GitHub Actions

- CI runs Gitleaks, typecheck, lint, tests, and build.
- Keep workflow changes minimal and compatible with GitHub-hosted Ubuntu runners.
- This repository opts JavaScript actions into Node.js 24 with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`.

