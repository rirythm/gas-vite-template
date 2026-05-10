# GAS Vite Template

[日本語](./README.ja.md)

A Google Apps Script template powered by Node.js, pnpm, Vite 8, Rolldown, and Oxc/oxlint.

## Features

- Bundles Apps Script server code into `dist/Code.js` with the Vite 8 Rolldown build pipeline
- Inlines the HtmlService UI into `dist/index.html` so clasp can push the build output directly
- Separates `src/server`, `src/client`, and `src/shared`
- Includes TypeScript type checking, Vitest, Oxc-based oxlint, and Prettier
- Syncs only build artifacts to Apps Script through a `.clasp.json` with `rootDir: "dist"`

## Requirements

- Node.js `>=22.12.0`
- pnpm `10.x`
- A Google account with the Google Apps Script API enabled

If you use mise, `.mise.toml` pins the Node.js and pnpm versions.

## Setup

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Usage Guides

### Web App

Use this when you want `doGet` to serve the HtmlService UI as a web app.

```sh
pnpm clasp:login
pnpm clasp:create
pnpm deploy:web
```

The default `webapp.access` is `MYSELF`. If you widen access, update `webapp.access` in `public/appsscript.json`.
Because `executeAs` is `USER_DEPLOYING`, review authorization checks and exposed server functions before publishing to a wider audience.

To update an existing web app URL:

```sh
pnpm redeploy:web
```

If your project has multiple deployments, choose the deployment explicitly.

```sh
DEPLOYMENT_ID=AKfycb... pnpm redeploy:web
```

### Container-Bound Sheets App

Use this when you want a custom menu and sidebar bound to a spreadsheet.

```sh
pnpm clasp:login
pnpm clasp:create:sheets
pnpm push
pnpm open:container
```

The sample `onOpen` and `showSidebar` functions use `SpreadsheetApp.getUi()`, so they work as-is for Sheets-bound projects.

### Docs, Slides, Forms

Create container-bound projects for Docs, Slides, or Forms with:

```sh
pnpm clasp:create:docs
pnpm clasp:create:slides
pnpm clasp:create:forms
```

For these containers, update the UI API in `src/server/index.ts`. For example, Docs projects should use `DocumentApp.getUi()`.

### Script Only

You can also use this template without a web app or HtmlService UI.

```sh
pnpm clasp:create:standalone
pnpm push:script
```

In this mode, `dist` contains only `Code.js` and `appsscript.json`, and the `webapp` manifest field is removed. If you do not need HtmlService at all, you can also remove:

- `doGet` from `gasEntrypoints([...])` in `vite.server.config.ts`
- `doGet` and `renderIndex` from `src/server/index.ts`
- `src/client` and `vite.client.config.ts`

### Client Assets

HtmlService does not serve Vite's `assets/` directory as normal static files. This template inlines JS/CSS into `dist/index.html` and removes the generated `assets/` directory.

For images and icons, choose one of these approaches:

- Use small assets that Vite can inline as data URLs in CSS/JS
- Inline SVG directly in components, HTML, or CSS
- Reference trusted external assets over HTTPS
- Reference public Google Drive images with `https://drive.google.com/uc?export=view&id=FILE_ID`
- Fetch private or access-controlled Google Drive images from Apps Script and return them as data URLs
- Add a dedicated Apps Script endpoint for larger images

Large image imports from `src/client` may not be inlined into the HTML and can become broken references.
The Google Drive `uc` URL is convenient, but the file must be shared so the client can read it. For private images or user-specific authorization, add the necessary Drive scope and fetch the file on the server side with an Apps Script function such as `DriveApp.getFileById()`.

## Create Scripts

Available create scripts:

- `pnpm clasp:create:standalone`
- `pnpm clasp:create:sheets`
- `pnpm clasp:create:docs`
- `pnpm clasp:create:slides`
- `pnpm clasp:create:forms`

## Existing Apps Script Project

To connect this template to an existing Apps Script project, first clone that project into a separate directory so you can inspect and back it up. `clasp push` overwrites remote files with matching names.

```sh
mkdir ../apps-script-backup
cd ../apps-script-backup
pnpm dlx @google/clasp clone YOUR_SCRIPT_ID
```

`clasp clone` creates a `.clasp.json` with the `scriptId`.

```json
{
  "scriptId": "YOUR_SCRIPT_ID"
}
```

After reviewing the cloned project, create `.clasp.json` in this template and set the cloned `scriptId` plus `rootDir: "dist"`. You can copy `.clasp.json.example` as a starting point.

```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "dist"
}
```

Then run:

```sh
pnpm push
pnpm open
```

## Scripts

- `pnpm dev`: preview the HtmlService UI with the Vite dev server
- `pnpm build`: generate `dist/index.html`, `dist/Code.js`, and `dist/appsscript.json`
- `pnpm build:script`: generate only `dist/Code.js` and `dist/appsscript.json`
- `pnpm typecheck`: run TypeScript type checking
- `pnpm lint`: run oxlint
- `pnpm test`: run Vitest
- `pnpm push`: build and run `clasp push`
- `pnpm push:script`: run a script-only build and then `clasp push`
- `pnpm deploy`: build and run `clasp deploy`
- `pnpm deploy:web`: build, push, and create a new web app deployment
- `pnpm redeploy:web`: build, push, create a version, and update an existing web app deployment
- `pnpm open:container`: open the bound Sheets/Docs/Slides/Forms file

## Project Layout

```txt
src/
  client/   HtmlService UI
  server/   Apps Script entrypoints
  shared/   shared types and pure functions
build/      small Vite helper plugins
public/     appsscript.json
dist/       generated files pushed by clasp
```

## Apps Script Entry Points

Apps Script cannot directly execute ES module exports, so this template declares callable Apps Script functions with `gasEntrypoints([...])` in `vite.server.config.ts`. During the server build, wrapper functions are appended to `Code.js` so they can be called by `google.script.run` and triggers.

```ts
gasEntrypoints(["doGet", "onOpen", "showSidebar", "getRuntimeInfo", "ping"]);
```

Add new Apps Script functions to this array as needed. Entrypoint names must be valid JavaScript identifiers. Invalid or duplicate names fail the build.

### Entry Point Examples

Handle a web app POST request:

```ts
export const doPost = (event: GoogleAppsScript.Events.DoPost) =>
  ContentService.createTextOutput(JSON.stringify({ ok: true, body: event.postData.contents }))
    .setMimeType(ContentService.MimeType.JSON);
```

Handle a Sheets form submit trigger:

```ts
export const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  console.log(JSON.stringify(event.values));
};
```

Run a scheduled or installable trigger:

```ts
export const runScheduledJob = () => {
  console.log('scheduled job');
};
```

Also add the function names to `gasEntrypoints([...])` in `vite.server.config.ts`.

```ts
gasEntrypoints(["doGet", "doPost", "onFormSubmit", "runScheduledJob"]);
```

If you add functions callable from the client through `google.script.run`, update the allowlist in `src/client/api.ts`. Do not pass user input directly as a function name.

## Container-Bound Projects

This template supports container-bound projects. The sample `onOpen` and `showSidebar` functions use the Spreadsheet UI API. For Docs, Slides, or Forms, replace that API with the matching container UI API.

`doGet` and the `webapp` manifest field are used for web app deployments. They can remain in a container-bound project, but you can remove them if you only need menus, sidebars, or dialogs.

## OAuth Scopes

`public/appsscript.json` explicitly declares the scope used by the sample code.

- `https://www.googleapis.com/auth/script.container.ui`: custom menus, sidebars, and dialogs

When you add features that read or write Sheets, Docs, Drive, Gmail, or other services, add only the required scopes. Review scopes whenever features change and remove scopes that are no longer needed.

## Security Checklist

Before publishing or adding data access features, review the following:

- Confirm that `webapp.access` and `webapp.executeAs` in `public/appsscript.json` match your use case
- Add server-side authorization checks before using `ANYONE` or domain-wide access
- Keep `oauthScopes` minimal and remove unused scopes after feature changes
- Put only intentionally exposed functions in `gasEntrypoints([...])`
- Keep `google.script.run` calls in `src/client/api.ts` behind an allowlist and never use user input as a function name
- Validate the type, length, and format of server function inputs before passing them to Spreadsheet, Drive, Gmail, or other services
- Do not log tokens, personal information, mail addresses, or business data bodies
- Do not leave personal names, mail addresses, local machine paths, or private sample data in README files, tests, fixtures, or config files
- Do not commit `.clasp.json`, `.clasprc.json`, `.env*`, or generated `dist/` files
- After dependency updates, run `pnpm install --lockfile-only`, then `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`

CI uses Gitleaks to detect leaked secrets. To run Gitleaks locally, install it with Homebrew or another supported method, then run:

```sh
gitleaks dir .
gitleaks git -v .
```

## Deployment Notes

`pnpm deploy:web` creates a new deployment. To keep the existing published web app URL, use `pnpm redeploy:web`.

`pnpm redeploy:web` updates the only non-HEAD deployment when exactly one exists. If multiple deployments are found, it fails instead of choosing automatically. Set `DEPLOYMENT_ID` to choose the deployment explicitly.

## Notes

- Vite 8 was released on 2026-03-12 and uses Rolldown as the default bundler.
- Vite 8 requires Node.js `^20.19.0 || >=22.12.0`. This template targets Node.js 22.12 or newer.
- Review `webapp.access` in `public/appsscript.json` before changing the deployment audience.

## GitHub Publishing

After creating the GitHub repository, enable Template repository in the repository settings if you want others to use it as a template.

`package.json` points to `rirythm/gas-vite-template`.

Do not include these in GitHub:

- `node_modules/`
- `.pnpm-store/`
- `dist/`
- `.clasp.json`
- `.clasprc.json`
- `.env`, `.env.*`
- `*.tsbuildinfo`
- log/cache/coverage files
