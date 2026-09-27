# Astro メジャーアップグレード計画

最終更新日: 2026-09-27

## 目標と進捗

Astro を **5.8.2 → 5.18.2 → 6.4.8 → 7.3.5** の順で更新し、メジャーを一つずつ検証する。全3ページの静的配信、見た目、MDX、画像、画面遷移を維持する。Tailwind CSS 4 への移行は別タスクとする。

- [x] 計画作成 — 状態: 完了。ローカルコードと公式一次情報を調査済み。
- [x] Phase 0: 基準点と型検査 — 状態: 完了。`npm run check` を以降の共通検証に追加。
- [x] Phase 1: Astro 5 系内の更新 — 状態: 完了。コミット `b902305`。
- [ ] Phase 2: Cloudflare adapter の整理 — 状態: 作業中。adapterなしの本番デプロイまで確認済み。未使用と確認できたWranglerの削除を残す。
- [ ] Phase 3: Tailwind 3 の PostCSS 接続 — 状態: 未着手。
- [ ] Phase 4: Astro 5 → 6 — 状態: 未着手。
- [ ] Phase 5: Astro 6 → 7 — 状態: 未着手。

## 現状スナップショット

以下は2026-09-26の調査値。実行時には再確認し、この表と進捗ログを更新する。

| 項目 | 宣言・実値 | 根拠 |
| --- | --- | --- |
| Astro | 宣言・lock `5.18.2` | `package.json:16`、`package-lock.json` |
| Cloudflare adapter | 削除済み | `astro.config.mjs`、`package.json` |
| MDX | 宣言・lock `4.3.14` | `package.json:14`、`package-lock.json` |
| Tailwind integration | 宣言 `^6.0.2`、lock `6.0.2` | `package.json:15`、`package-lock.json:218` |
| Tailwind CSS | 宣言 `^3.4.17`、lock `3.4.17` | `package.json:17`、`package-lock.json:10252` |
| Typography | 宣言 `^0.5.16`、lock `0.5.16` | `package.json:20`、`package-lock.json:2175` |
| Astro check | 宣言・lock `0.9.10` | `package.json`、`package-lock.json` |
| TypeScript | 宣言・lock `5.9.3` | `package.json`、`package-lock.json` |
| Wrangler | 直接依存 `3.107.3`を外部利用確認まで維持 | `package.json`、`package-lock.json` |
| Node.js | 指定・検証環境 `24.1.0` | `.node-version:1`、`mise exec node@24.1.0 -- node -v` |
| npm / lock形式 | 検証環境 `11.3.0` / lockfileVersion `3` | `mise exec node@24.1.0 -- npm -v`、`package-lock.json:4` |
| 作業ツリー | `master`、`origin/master` より先行 | `git status --short --branch` |

設定は `astro.config.mjs` の `tailwind()`・`mdx()` のみ。`output` 未指定の既定値は `static`（インストール済み `node_modules/astro/dist/core/config/schemas/base.js:73`）。`tsconfig.json:2` は `astro/tsconfigs/base`。`package.json:7` の build は `astro build` であり、型検査ではない。

| 利用機能 | コード根拠・検証対象 |
| --- | --- |
| 3ページ | `src/pages/index.astro:12`、`src/pages/me.mdx:1`、`src/pages/style.astro:5` |
| MDXのlayout・リンク差し替え | `src/pages/me.mdx:2`、`:8`、`src/layouts/ProfileMarkdownLayout.astro:9` |
| Image・ローカルJPEG | `src/pages/index.astro:7`、`:17`、`:132`、`src/layouts/ProfileMarkdownLayout.astro:23` |
| ClientRouter・アバター遷移 | `src/layouts/Layout.astro:2`、`:38`、`src/pages/index.astro:23` |
| Tailwindテーマ・typography・@apply | `tailwind.config.cjs:5`、`:7`、`:93`、`src/layouts/Layout.astro:53` |
| 本番反映 | Cloudflare Pages。GitHub `master` のpushで自動デプロイし、`npm run build` の `dist` を配信 |

`git ls-files src public .github '*wrangler*'` でページ・コンポーネント・画像・faviconを列挙した。`src` と `astro.config.mjs` に対する次の検索では、`astro:transitions` と `<style>` の2行が検出され、サーバーAPI等は検出されなかった。Cloudflare側の設定はPhase 2の本番検証でAPIとデプロイログから別途確認した。

```sh
rg -n '(Astro\.(glob|url|request|locals)|getStaticPaths|astro:content|astro:schema|astro:actions|astro:transitions|server:defer|prerender|experimental|<script|<style|href=.*#)' src astro.config.mjs --glob '!*.swo'
```

## 互換バージョン

npm registry の安定版と peerDependencies を確認した。Astro 7.3.5 は `latest`、公開日時は2026-09-24T09:15:47.814Z。実装前に公開状況を再確認し、目標を変える場合は表とコマンドを同時に更新する。

| 段階 | Astro | MDX | Cloudflareを保持する場合 | Node条件 |
| --- | --- | --- | --- | --- |
| 5系最新 | 5.18.2 | 4.3.14 (`astro ^5.0.0`) | 12.6.13 (`astro ^5.7.0`) | 現指定24.1.0で充足 |
| 6系最新 | 6.4.8 | 6.0.3 (`astro ^6.4.0`) | 13.7.0 (`astro ^6.3.0`, Wrangler `^4.83.0`) | `>=22.12.0` |
| 7系最新 | 7.3.5 | 8.0.2 (`astro ^7.2.10`) | 14.3.3 (`astro ^7.2.0`, Wrangler `^4.125.0`) | `>=22.12.0` |

MDX のメジャー番号は Astro と連動しない。MDX 5.0.6 も Astro `^6.0.0` を満たすため、統合まで一段ずつ更新するなら Phase 4 を MDX 4→5→6 の2コミットに分ける。MDX 6.0.3 の Sätteri 0.3.0 は optional peer で、既定は従来の unified。MDX 8.0.2 と Astro 7.3.5 はともに Sätteri 0.4.2 を依存に持つ。

`@astrojs/tailwind` の最新6.0.2は Astro `^3 || ^4 || ^5` のみをpeerに持つ。Astro 6・7対応版としてそのまま使わず、Phase 3でTailwind 3の公式PostCSS接続へ移す。[Astro metadata][npm-astro]、[MDX metadata][npm-mdx]、[Cloudflare metadata][npm-cloudflare]、[Tailwind integration metadata][npm-tailwind]。

## 運用ルール

各チェック項目の状態は「未着手 / 作業中 / 検証待ち / 完了 / 保留」を使う。完了時だけ `[x]` にし、進捗ログへ日付、コミット、実行環境、終了コード、画面確認の証拠を残す。調査上の互換性と実インストール・ビルド成功を区別する。

- 一つのPhaseを検証・コミットしてから次へ進む。Phase内で複数コミットに分けた場合も各境界を記録する。
- 各メジャー移行の完了後に、そのメジャーで利用可能になった新機能を公式一次情報から調査し、「本リポジトリで使えると便利そうな新機能」へ追記する。アップグレードの安定化と新機能採用は別コミットにし、Phase 5完了時に優先順位付きで提案する。
- 作業開始前からあるコミットや他の未コミット変更を保持する。`master`への反映は自動本番デプロイを伴うため、ローカル作業完了とは分ける。
- 指定バージョンの `npm install` / `npm uninstall` で `package.json` と `package-lock.json` を同時更新する。lockを削除して作り直さず、無関係な全体更新・`--force`・`--legacy-peer-deps` を混ぜない。
- 各更新後に `git diff -- package.json package-lock.json` と `npm ls` を確認する。同じNode/npmのクリーンな検証ディレクトリで `npm ci` による再現も確認する。
- 共通検証は `npm run check`、`npm run build`、`npm run dev` / `npm run preview`。合否は終了コードで判定し、警告は基準点と比較する。check導入前のPhase 0初回だけはbuildと画面確認を行う。
- PC・モバイルで `/`、`/me`、`/style` を直接開く。画像、色・フォント・typography、外部リンク、`/`→`/me`→戻る、アバター遷移を確認する。生成hashやCSS文字列の一致を成功条件にしない。
- ロールバックは依存宣言・lock・設定をコミット単位で揃えて戻し、`npm ci` と共通検証を行う。共有・レビュー済みの変更はrevertを新コミットとして積む。

## Phase 0 — 基準点と型検査

状態: 完了。Phase 1を先行して着手した後、必要性を再確認して再開した。互換構成: Astro 5.18.2、Node 24.1.0、check 0.9.10、TypeScript 5.9.3。

- [x] 状態: 完了 — 作業ツリーと実行Node/npmを再確認し、Nodeを `.node-version` に揃えた。
- [x] 状態: 完了 — 現行lockから `npm ci` とbuildを実行し、警告・監査件数・全3ページのHTTP応答を基準として記録した。
- [x] 状態: 完了 — `package.json` に `"check": "astro check"` を追加し、checkとTypeScriptを直接devDependencyにした。
- [x] 状態: 完了 — manifestとlockを変更しない一時導入でcheckを実行し、17ファイルが0 errors・0 warnings・0 hintsであることを確認した。型修正とtsconfig変更は不要。

変更ファイル: `package.json`、`package-lock.json`。型エラーが実際に出た場合だけ対象ソース。

```sh
git status --short --branch
node -v
npm -v
npm ci
npm run build
npm run dev
npm install --save-dev --save-exact @astrojs/check@0.9.10 typescript@5.9.3
npm run check
```

成功条件: 指定Nodeで基準build・全3ページを確認し、検査対象を把握したcheckが終了コード0。ロールバック境界: 型検査導入コミット。検証用生成物はコミットしない。

`astro build` は型検査しないため、以降はcheckを別コマンドで必須にする。[公式TypeScriptガイド][typescript-guide]。check 0.9.10のpeerは TypeScript `^5 || ^6`。調査時latestのTypeScript 7を無指定で入れない。[check metadata][npm-check]

## Phase 1 — Astro 5 系内の更新

状態: 完了。コミット `b902305`。互換構成: Astro 5.18.2 + MDX 4.3.14。Cloudflare 12.5.3のpeer `^5.0.0` はこの段階を許容する。

- [x] 状態: 完了 — AstroとMDXだけを指定バージョンへ更新した。
- [x] 状態: 完了 — lock差分、peer解決、build、3ルートのHTTP 200、生成HTML、ブラウザー表示を確認し、独立コミットにした。

変更ファイル: `package.json`、`package-lock.json`。

```sh
npm install --save-exact astro@5.18.2 @astrojs/mdx@4.3.14
npm ls
npm run check
npm run build
```

成功条件: 共通検証成功、基準点からの意図しない表示・機能差がない。ロールバック境界: この更新コミット。次Phaseで削除するadapterを無条件で12系最新へ更新する必要はない。

## Phase 2 — Cloudflare adapter の整理

状態: 作業中。互換構成: Astro 5.18.2 + MDX 4.3.14、adapterなしの静的出力。adapter削除コミットの本番デプロイ成功まで確認済み。未使用と確認できたWranglerの削除を残す。

- [x] 状態: 完了 — Cloudflare APIとデプロイログから、Pages、`npm run build`、`dist`、Node 24.1.0、GitHub `master` 自動デプロイを確認した。
- [x] 状態: 完了 — `astro.config.mjs` のCloudflare importと `adapter: cloudflare()` を削除し、依存をuninstallした。
- [x] 状態: 完了 — adapterが推移的に提供していたSharpの消失をクリーンな `npm ci` 後のbuildで検出し、Astro 5.18.2のoptional範囲に合う `sharp@0.34.5` を直接依存へ固定した。
- [x] 状態: 完了 — `dist` を前後比較し、HTML・CSS・ClientRouter JS・最適化WebP・faviconが同一であることを確認した。adapter固有の `_worker.js`・`_routes.json` と未参照の元JPEGコピーだけが消えた。previewで3ページとfaviconがHTTP 200、存在しないパスが404。
- [ ] 状態: 作業中 — 追跡ファイル、Pages設定、デプロイログのいずれにもWrangler利用がなく、ビルド時にも設定ファイルなしと確認できた。直接依存を追加の独立コミットで削除する。

変更ファイル: `astro.config.mjs`、`package.json`、`package-lock.json`。`astro:assets` の画像最適化を維持するため、Sharpを直接依存として含む。

```sh
npm uninstall @astrojs/cloudflare
npm ls
npm run check
npm run build
npm run preview
```

成功条件: adapterなしで静的配信契約と共通検証を満たす。ロールバック境界: adapter削除コミット。外部利用未確認のWranglerはそのまま残せる。

現adapter自身がstatic時に不要警告を出す（インストール済み `node_modules/@astrojs/cloudflare/dist/index.js:123`）。画像の既定 `compile` はSharpを使い（同 `dist/utils/image-config.js:11`）、Astro標準もSharp（`node_modules/astro/dist/core/config/schemas/base.js:26`）。ただしadapterは `_routes.json` 等にも関与するため、削除後の成果物が完全同一とは仮定しない。[CloudflareのAstro配信手順][cloudflare-pages]

先に分離すると配信形態とAstro本体更新の影響を切り分けられるが、検証が1回増える。保持する場合はPhase 4でadapter 13.7.0と対応Wranglerへ更新が必要で、Pages対応削除、workerd化、画像既定値 `compile` → `cloudflare-binding` が関係する。Pages→Workers移行が必要と分かった場合は計画を見直し、その外部変更を本体更新に黙って追加しない。[公式adapter移行ガイド][cloudflare-upgrade]

## Phase 3 — Tailwind 3 の PostCSS 接続

状態: 未着手。互換構成: Astro 5.18.2、Tailwind CSS 3.4.17、Typography 0.5.16を維持。PostCSS 8.5.4・Autoprefixer 10.4.21は現lockの実値を直接依存に昇格する。

- [ ] 状態: 未着手 — `postcss.config.cjs` にTailwindとAutoprefixerを登録する。
- [ ] 状態: 未着手 — `src/styles/global.css` に `@tailwind base;`、`@tailwind components;`、`@tailwind utilities;` を置き、`Layout.astro` からimportする。
- [ ] 状態: 未着手 — `astro.config.mjs` のTailwind import・`tailwind()` と `@astrojs/tailwind` 依存を削除する。
- [ ] 状態: 未着手 — テーマ色、フォント、typography、`@apply`、hover、レスポンシブ表示を比較してコミットする。

変更ファイル: `package.json`、`package-lock.json`、`astro.config.mjs`、新規 `postcss.config.cjs`、新規 `src/styles/global.css`、`src/layouts/Layout.astro`。`tailwind.config.cjs` は維持。

```sh
npm install --save-dev --save-exact postcss@8.5.4 autoprefixer@10.4.21
npm uninstall @astrojs/tailwind
npm run check
npm run build
npm run preview
```

成功条件: 共通検証と全ページのCSS適用を確認。ロールバック境界: 接続方式変更コミット。現integrationはPostCSS接続とbase CSS注入の両方を担うため、片方だけ移さない（`node_modules/@astrojs/tailwind/dist/index.js:25`、`:52`）。[Tailwind 3公式PostCSS手順][tailwind-postcss]

## Phase 4 — Astro 5 から 6

状態: 未着手。互換構成: Astro 6.4.8 + MDX 6.0.3、Node 24.1.0。前提: Phase 2・3完了。

- [ ] 状態: 未着手 — AstroとMDXを互換バージョンへ同時更新する。
- [ ] 状態: 未着手 — 以下の破壊的変更表をコードと照合し、必要な修正だけ行う。
- [ ] 状態: 未着手 — check/build、全3ページ、MDX見出し・リンク、画像、遷移を検証して6のコミットを確定する。
- [ ] 状態: 未着手 — Astro 6で利用可能になった新機能を公式リリース情報から調査し、本リポジトリに適合する候補を新機能候補表へ追記する。候補の採用は移行コミットに混ぜない。

変更ファイル: 原則 `package.json`、`package-lock.json`。実際に回帰した場合のみ対象ソース・設定。

```sh
npm install --save-exact astro@6.4.8 @astrojs/mdx@6.0.3
npm ls
npm run check
npm run build
npm run preview
```

| 変更 | このリポジトリでの判断 |
| --- | --- |
| Node 22.12以上・Vite7 | 指定Nodeは条件充足。PostCSSの実ビルドを確認 |
| Markdown見出しID | `/me`の日本語・絵文字見出しを比較（`src/pages/me.mdx:15`）。観測した差だけ対応 |
| script/style順序 | 独自styleは `Layout.astro:53` の1ブロック。Tailwindとのカスケードを確認 |
| Imageのcrop・upscale・CSS生成 | Image利用あり。明示width/height/fit/layoutはないため寸法変更は未予定。アバターと書影を目視確認 |
| CJS Astro設定削除 | 現在 `astro.config.mjs` なので該当しない。Tailwind/PostCSSの `.cjs` まで削除しない |
| ViewTransitions等の削除 | 使用中はClientRouterで、削除対象の内部APIやhandleFormsは使っていない |
| Collections・Zod・Actions・session・getStaticPaths・独自adapter API | 現状の `src`＋config検索では該当なし。再検索して判断を更新 |
| SVG rasterization | Image入力はJPEG。faviconとinline SVGはこの変換経路ではない |

成功条件: 共通検証成功と6用peer解決。ロールバック境界: Astro 6更新コミット。ここが成功するまで7へ進まない。[公式v6移行ガイド][upgrade-v6]

## Phase 5 — Astro 6 から 7

状態: 未着手。互換構成: Astro 7.3.5 + MDX 8.0.2 + 依存としてのSätteri 0.4.2、Node 24.1.0。

- [ ] 状態: 未着手 — AstroとMDXを互換バージョンへ同時更新する。
- [ ] 状態: 未着手 — `astro.config.mjs` に `compressHTML: true` を追加して従来の空白処理を維持する。
- [ ] 状態: 未着手 — Rust compilerで全テンプレートをbuildし、実エラーが出た箇所だけ修正する。
- [ ] 状態: 未着手 — SätteriでMDXのfrontmatter layout、`components` によるリンク差し替え、日本語・絵文字・リストを比較する。
- [ ] 状態: 未着手 — 共通検証、クリーン環境での再現、配信先設定との照合を完了し、7のコミットを確定する。
- [ ] 状態: 未着手 — Astro 7で利用可能になった新機能を公式リリース情報から調査し、本リポジトリに適合する候補を新機能候補表へ追記する。
- [ ] 状態: 未着手 — Astro 6・7の候補を統合し、効果・導入コスト・リスクで優先順位を付けてユーザーへ提案する。採用する機能はアップグレード完了後の別タスク・別コミットにする。

変更ファイル: `package.json`、`package-lock.json`、`astro.config.mjs`、実際に修正が必要となったテンプレートのみ。

```sh
npm install --save-exact astro@7.3.5 @astrojs/mdx@8.0.2
npm ls
npm run check
npm run build
npm run preview
```

| 変更 | このリポジトリでの判断 |
| --- | --- |
| whitespace既定値が `'jsx'` | アイコンとTokyo（`src/pages/index.astro:29`）、リンクと矢印（`src/components/ExternalLink.astro:15`）の空白に影響し得る。`compressHTML: true` で従来挙動を維持 |
| Rust compiler | タグ閉じ・HTML構造をbuildと表示で確認。`src/pages/index.astro:18` のバッククォートclass値も受理を確認。現時点で不具合とは断定しない |
| Sätteri既定化・MDX8の処理委譲 | `src/pages/me.mdx:2`・`:8` のlayoutとリンク差し替えを重点確認。独自remark/rehype pluginはない |
| Vite8 | Phase 3のPostCSS接続を実検証。独自Vite pluginは現状ない |
| `src/fetch.ts`予約名、experimental flags、DB、transitions内部API、Container renderer | 現状の追跡ファイル一覧・コードには該当なし。新しい実装が増えていれば再判定 |

成功条件: 共通検証成功と7用peer解決。ロールバック境界: Astro 7更新コミットを戻して検証済み6へ。[公式v7移行ガイド][upgrade-v7]、[MDX変更履歴][mdx-changelog]

Sätteriで互換問題が観測された場合は、`@astrojs/markdown-remark@7.3.1` を直接追加し `markdown.processor: unified()` を指定する公式の回避策がある。依存と設定が増えるため、採用理由と検証を進捗ログに残す。

## 本リポジトリで使えると便利そうな新機能

各メジャーへの移行が実際に完了した時点で、公式リリースノート・ドキュメントとその時点のコードを照合して追記する。新機能という理由だけで採用せず、現在の課題や保守コストに対する具体的な効果がある候補に絞る。

| 導入メジャー | 新機能 | 適合する箇所・用途 | 期待する効果 | 導入コスト・リスク | 最終提案 |
| --- | --- | --- | --- | --- | --- |
| Astro 6 | 移行完了後に調査 | 未評価 | 未評価 | 未評価 | Phase 5で判断 |
| Astro 7 | 移行完了後に調査 | 未評価 | 未評価 | 未評価 | Phase 5で判断 |

最終提案では候補を「推奨」「条件付き」「見送り」に分類し、採用理由だけでなく見送る理由も残す。提案時点では実装せず、ユーザーが選んだ機能だけを個別の作業単位として計画する。

## リスクと未確認事項

- [ ] 状態: 未着手 — 更新後のinstall・check・buildは未実施。metadata上の互換性を実動作成功と扱わない。
- [x] 状態: 完了 — ローカルとCloudflare PagesのデプロイログがともにNode 24.1.0であることを確認した。
- [x] 状態: 完了 — Cloudflare PagesのGitHub連携、build command、公開ディレクトリ、Functions不使用、adapterなしの本番デプロイ成功をAPIで確認した。
- [x] 状態: 完了 — 追跡ファイル、Pages設定、デプロイログにWrangler利用がないことを確認した。依存削除はPhase 2の残作業として扱う。
- [ ] 状態: 未着手 — 既存の型エラー・警告を測定し、更新で生じたものと区別する。
- [ ] 状態: 未着手 — MDX見出しID・空白・画像・遷移の前後比較を行う。生成hashやCSSシリアライズの差は表示不良と区別する。
- [ ] 状態: 未着手 — 実行日が変わった場合は各固定バージョン・peer・公式移行規則を再確認する。

## 進捗ログ

| 日付 | 対象 | 状態 | 実施内容・証拠 | コミット・残課題 |
| --- | --- | --- | --- | --- |
| 2026-09-26 | 計画作成 | 完了 | ローカルコード・lock・設定とnpm metadata、公式移行ガイドを調査 | アップグレードは全Phase未着手 |
| 2026-09-26 | Phase 0 | 完了 | Node 24.1.0で更新前lockの `npm ci` とAstro 5.8.2のbuildが終了コード0。check 0.9.10・TypeScript 5.9.3を固定導入し、17ファイルが0 errors・0 warnings・0 hints。導入後buildも終了コード0 | Phase 1と分離してコミット。更新前npm audit 42件、導入後36件を記録 |
| 2026-09-26 | Phase 1 | 完了 | Astro 5.18.2・MDX 4.3.14へ更新。Node 24.1.0で `npm ls`・buildが終了コード0、dev上の3ルートがHTTP 200。生成HTMLとブラウザー表示を確認 | `b902305`。`astro preview` は現Cloudflare adapterが未対応 |
| 2026-09-26 | 計画更新 | 完了 | Astro 6・7への移行完了時に新機能候補を記録し、Phase 5で優先順位付き提案を行う工程を追加 | 新機能採用は移行コミットに混ぜない |
| 2026-09-27 | Phase 2 | 作業中 | サーバーAPI等の不使用を陽性対照付きで再確認。adapterを削除し、Sharp 0.34.5を直接依存化。クリーンな `npm ci`、check、画像最適化付きstatic build、成果物比較、previewの3ページ/404を検証 | `6bde41a`。Wrangler直接依存の削除を残す |
| 2026-09-27 | Phase 2 本番検証 | 完了 | Cloudflare APIでPages設定を読み取り、GitHub `master`、`npm run build`、`dist`、Functions不使用を確認。デプロイ `1577586b` はコミット `6bde41a`、production、deploy success。ログ上もNode 24.1.0でビルドし、Wrangler設定ファイルなしで配信成功 | adapterなしの静的配信契約を本番で確認。Wranglerは外部設定でも未使用と確定 |

追記時は実行したPhase、Node/npm、コマンド終了コード、画面確認、変更した判断、コミットを記録する。途中終了は「検証待ち」「保留」とし、未実行項目のチェックを付けない。

## 公式一次情報

- [Astro npm metadata][npm-astro]
- [MDX npm metadata][npm-mdx] / [変更履歴][mdx-changelog]
- [Cloudflare adapter npm metadata][npm-cloudflare] / [v13とAstro 6への移行][cloudflare-upgrade]
- [Tailwind integration npm metadata][npm-tailwind] / [Tailwind 3のPostCSS接続][tailwind-postcss]
- [Astro 6移行ガイド][upgrade-v6] / [Astro 7移行ガイド][upgrade-v7]
- [Astro型検査][typescript-guide] / [check 0.9.10 metadata][npm-check]
- [Cloudflare PagesのAstro配信手順][cloudflare-pages]

[npm-astro]: https://registry.npmjs.org/astro
[npm-mdx]: https://registry.npmjs.org/@astrojs%2fmdx
[npm-cloudflare]: https://registry.npmjs.org/@astrojs%2fcloudflare
[npm-tailwind]: https://registry.npmjs.org/@astrojs%2ftailwind
[npm-check]: https://registry.npmjs.org/@astrojs%2fcheck/0.9.10
[upgrade-v6]: https://docs.astro.build/en/guides/upgrade-to/v6/
[upgrade-v7]: https://docs.astro.build/en/guides/upgrade-to/v7/
[cloudflare-upgrade]: https://docs.astro.build/en/guides/integrations-guide/cloudflare/#upgrading-to-v13-and-astro-6
[cloudflare-pages]: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
[tailwind-postcss]: https://v3.tailwindcss.com/docs/installation/using-postcss
[typescript-guide]: https://docs.astro.build/en/guides/typescript/#type-checking
[mdx-changelog]: https://github.com/withastro/astro/blob/main/packages/integrations/mdx/CHANGELOG.md
