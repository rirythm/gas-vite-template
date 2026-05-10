# GAS Vite Template

[English](./README.md)

Node.js, pnpm, Vite 8, Rolldown, Oxc/oxlint を使う Google Apps Script テンプレートです。

## Features

- Vite 8 の Rolldown ビルドで GAS サーバーコードを `dist/Code.js` にバンドル
- HtmlService UI を `dist/index.html` にインライン化して clasp でそのまま push
- `src/server`, `src/client`, `src/shared` の分離
- TypeScript 型チェック、Vitest、Oxc ベースの oxlint、Prettier
- `.clasp.json` の `rootDir: "dist"` 前提でビルド成果物だけを Apps Script に同期

## Requirements

- Node.js `>=22.12.0`
- pnpm `10.x`
- Google Apps Script API を有効化済みの Google アカウント

mise を使う場合は、`.mise.toml` で Node.js と pnpm のバージョンを固定できます。

## Setup

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Usage Guides

### Web App

`doGet` で HtmlService UI を配信する Web アプリとして使う場合:

```sh
pnpm clasp:login
pnpm clasp:create
pnpm deploy:web
```

初期状態の `webapp.access` は `MYSELF` です。公開範囲を広げる場合は、`public/appsscript.json` の `webapp.access` を変更してください。
`executeAs` は `USER_DEPLOYING` なので、公開範囲を広げる前に認可チェックと公開関数の内容を必ず見直してください。

2 回目以降、同じ Web アプリ URL のまま更新する場合:

```sh
pnpm redeploy:web
```

複数の deployment がある場合は、更新先を明示してください。

```sh
DEPLOYMENT_ID=AKfycb... pnpm redeploy:web
```

### Container-Bound Sheets App

スプレッドシートに紐付いたメニュー/サイドバーとして使う場合:

```sh
pnpm clasp:login
pnpm clasp:create:sheets
pnpm push
pnpm open:container
```

サンプルの `onOpen` / `showSidebar` は `SpreadsheetApp.getUi()` を使うため、Sheets バインドではそのまま動きます。

### Docs, Slides, Forms

Docs/Slides/Forms に紐付ける場合:

```sh
pnpm clasp:create:docs
pnpm clasp:create:slides
pnpm clasp:create:forms
```

この場合は `src/server/index.ts` の UI API を対象コンテナに合わせて置き換えてください。たとえば Docs なら `DocumentApp.getUi()` を使います。

### Script Only

Web アプリや HtmlService UI を使わず、GAS のスクリプトだけを管理する用途にも使えます。

```sh
pnpm clasp:create:standalone
pnpm push:script
```

この場合、`dist` には `Code.js` と `appsscript.json` だけが生成され、`appsscript.json` から `webapp` も削除されます。不要なら次も整理してください。

- `vite.server.config.ts` の `gasEntrypoints([...])` から `doGet` を削除
- `src/server/index.ts` から `doGet` / `renderIndex` を削除
- `src/client` と `vite.client.config.ts` を削除

### Client Assets

HtmlService は Vite の `assets/` ディレクトリを通常の静的ファイルとして配信しません。このテンプレートの client build は JS/CSS を `dist/index.html` に inline 化し、生成された `assets/` は削除します。

画像やアイコンを使う場合は、次のいずれかを選んでください。

- CSS/JS に data URL として inline される小さな asset を使う
- SVG をコンポーネントや HTML/CSS に直接 inline する
- 信頼できる HTTPS URL の外部 asset を参照する
- 公開してよい Google Drive 画像を `https://drive.google.com/uc?export=view&id=FILE_ID` で参照する
- 非公開または権限管理が必要な Google Drive 画像を Apps Script で取得して data URL として返す
- 大きな画像は Apps Script 側で取得・配信する処理を別途用意する

大きな画像ファイルを `src/client` から通常 import すると、HTML に inline されず参照切れになる場合があります。
Google Drive の `uc` URL は便利ですが、対象ファイルをクライアントから読める共有設定にする必要があります。非公開画像や利用者ごとの権限確認が必要な画像では、Drive scope を追加したうえでサーバー側の Apps Script 関数から `DriveApp.getFileById()` などで取得してください。

## Create Scripts

利用できる create script は次の通りです。

- `pnpm clasp:create:standalone`
- `pnpm clasp:create:sheets`
- `pnpm clasp:create:docs`
- `pnpm clasp:create:slides`
- `pnpm clasp:create:forms`

## Existing Apps Script Project

既存の Apps Script に紐付ける場合は、まず別ディレクトリで clone して現在の内容を退避・確認してください。`clasp push` はリモート側の同名ファイルを上書きします。

```sh
mkdir ../apps-script-backup
cd ../apps-script-backup
pnpm dlx @google/clasp clone YOUR_SCRIPT_ID
```

`clasp clone` すると、clone 先には `scriptId` が入った `.clasp.json` が自動生成されます。

```json
{
  "scriptId": "YOUR_SCRIPT_ID"
}
```

内容を確認したら、このテンプレート側に `.clasp.json` を作成し、clone 先の `scriptId` と `rootDir: "dist"` を設定してください。`.clasp.json.example` をコピーして使っても構いません。

```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "dist"
}
```

その後:

```sh
pnpm push
pnpm open
```

## Scripts

- `pnpm dev`: HtmlService UI を Vite dev server で確認
- `pnpm build`: `dist/index.html`, `dist/Code.js`, `dist/appsscript.json` を生成
- `pnpm build:script`: `dist/Code.js`, `dist/appsscript.json` だけを生成
- `pnpm typecheck`: TypeScript の型チェック
- `pnpm lint`: oxlint
- `pnpm test`: Vitest
- `pnpm push`: build 後に clasp push
- `pnpm push:script`: script-only build 後に clasp push
- `pnpm deploy`: build 後に clasp deploy
- `pnpm deploy:web`: build, push, 新規 web app deployment 作成
- `pnpm redeploy:web`: build, push, version 作成, 既存 web app deployment 更新
- `pnpm open:container`: コンテナバインド先の Sheets/Docs/Slides/Forms を開く

## Project Layout

```txt
src/
  client/   HtmlService UI
  server/   Apps Script entrypoints
  shared/   server/client 共有型と純粋関数
build/      Vite 用の小さな補助プラグイン
public/     appsscript.json
dist/       clasp に push する生成物
```

## Apps Script Entry Points

GAS は ES module の `export` を直接実行できないため、`vite.server.config.ts` の `gasEntrypoints([...])` で GAS から呼ばれる関数名を明示します。ビルド時に `Code.js` の末尾へトップレベル関数が追加され、`google.script.run` やトリガーから呼べるようになります。

```ts
gasEntrypoints(["doGet", "onOpen", "showSidebar", "getRuntimeInfo", "ping"]);
```

新しい GAS 関数を追加するときも、この配列へ関数名を追加してください。
関数名は JavaScript の識別子として有効な名前だけを指定できます。不正な名前や重複した名前がある場合、ビルドは失敗します。

### Entry Point Examples

Web アプリの POST を受ける場合:

```ts
export const doPost = (event: GoogleAppsScript.Events.DoPost) =>
  ContentService.createTextOutput(JSON.stringify({ ok: true, body: event.postData.contents }))
    .setMimeType(ContentService.MimeType.JSON);
```

Sheets に紐付いたフォーム送信トリガーを使う場合:

```ts
export const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  console.log(JSON.stringify(event.values));
};
```

時間主導トリガーなど installable trigger から呼ぶ場合:

```ts
export const runScheduledJob = () => {
  console.log('scheduled job');
};
```

追加した関数名は `vite.server.config.ts` の `gasEntrypoints([...])` にも追加してください。

```ts
gasEntrypoints(["doGet", "doPost", "onFormSubmit", "runScheduledJob"]);
```

クライアントから `google.script.run` で呼ぶ関数を増やす場合は、`src/client/api.ts` の allowlist も更新してください。ユーザー入力をそのまま関数名として渡す設計は避けてください。

## Container-Bound Projects

このテンプレートはコンテナバインドにも対応しています。ただしサンプルの `onOpen` / `showSidebar` は Spreadsheet 向けに `SpreadsheetApp.getUi()` を使っています。Docs/Slides/Forms に変える場合は、それぞれのコンテナに合う UI API に置き換えてください。

`doGet` と `webapp` manifest は Web アプリとしてデプロイする場合に使います。コンテナバインドのメニューやサイドバーだけを使う場合は残っていても大きな問題はありませんが、不要なら削除できます。

## OAuth Scopes

`public/appsscript.json` では、テンプレートのサンプルで使う範囲として次の scope を明示しています。

- `https://www.googleapis.com/auth/script.container.ui`: カスタムメニュー、サイドバー、ダイアログ

Sheets/Docs/Drive/Gmail などのデータを読む・書く機能を追加した場合は、必要な scope をここへ追加してください。scope は機能追加のたびにレビューし、不要になったものは削除する運用をおすすめします。

## Security Checklist

公開前、または Drive/Gmail/Sheets などのデータ操作を追加する前に、次を確認してください。

- `public/appsscript.json` の `webapp.access` と `webapp.executeAs` が用途に合っているか確認する
- `ANYONE` やドメイン公開にする場合は、サーバー側で利用者の認可チェックを追加する
- `oauthScopes` は必要最小限にし、機能削除後に不要な scope も削除する
- `vite.server.config.ts` の `gasEntrypoints([...])` には公開が必要な関数だけを入れる
- `src/client/api.ts` の `google.script.run` 呼び出しは allowlist 経由にし、ユーザー入力を関数名として使わない
- サーバー関数では受け取った値の型、長さ、形式を検証してから Spreadsheet/Drive/Gmail などへ渡す
- ログにメールアドレス、トークン、個人情報、業務データの本文を出さない
- README、テスト、サンプルデータ、設定ファイルに個人名、メールアドレス、ローカル環境固有のパスを残さない
- `.clasp.json`、`.clasprc.json`、`.env*`、生成済みの `dist/` を Git に含めない
- 依存関係更新時は `pnpm install --lockfile-only` 後に `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` を実行する

CI では Gitleaks を使って secret の混入を検出します。ローカルでも確認したい場合は、Homebrew などで Gitleaks をインストールしてから次を実行してください。

```sh
gitleaks dir .
gitleaks git -v .
```

## Deployment Notes

`pnpm deploy:web` は新しい deployment を作ります。公開済み URL を維持したい更新では `pnpm redeploy:web` を使ってください。

`pnpm redeploy:web` は non-HEAD deployment が 1 件だけの場合、その deployment を更新します。複数 deployment が見つかった場合は自動選択せずに失敗するため、`DEPLOYMENT_ID` を指定してください。

## Notes

- Vite 8 は 2026-03-12 に正式リリースされ、Rolldown を標準バンドラとして使います。
- Vite 8 の Node.js 要件は `^20.19.0 || >=22.12.0` です。このテンプレートは Node 22.12 以上に寄せています。
- `public/appsscript.json` の `webapp.access` は用途に合わせて必ず見直してください。

## GitHub Publishing

GitHub の template repository として公開する場合は、リポジトリ作成後に Settings で Template repository を有効化してください。

`package.json` の `repository.url` は `rirythm/gas-vite-template` を指しています。

GitHub に含めないもの:

- `node_modules/`
- `.pnpm-store/`
- `dist/`
- `.clasp.json`
- `.clasprc.json`
- `.env`, `.env.*`
- `*.tsbuildinfo`
- log/cache/coverage files
