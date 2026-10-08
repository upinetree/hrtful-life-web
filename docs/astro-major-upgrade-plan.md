# Astro メジャーアップグレード計画

最終更新日: 2026-10-08

## 目標と進捗

Astro を **5.8.2 → 5.18.2 → 6.4.8 → 7.3.7** の順で更新し、メジャーを一つずつ検証する。全3ページの静的配信、見た目、MDX、画像、画面遷移を維持する。Tailwind CSS 4 への移行は別タスクとする。

- [x] 計画作成 — 状態: 完了。ローカルコードと公式一次情報を調査済み。
- [x] Phase 0: 基準点と型検査 — 状態: 完了。`npm run check` を以降の共通検証に追加。
- [x] Phase 1: Astro 5 系内の更新 — 状態: 完了。コミット `b902305`。
- [x] Phase 2: Cloudflare adapter の整理 — 状態: 完了。adapterなしの本番デプロイと、未使用だったWranglerの削除後の再現ビルドを確認済み。
- [x] Phase 3: Tailwind 3 の PostCSS 接続 — 状態: 完了。実装・自動検証・成果物比較・PC/モバイルの目視確認を完了。コミット `a35e1b5`。
- [x] Phase 4: Astro 5 → 6 — 状態: 完了。依存更新・自動検証・成果物比較・新機能調査・PC/モバイルの目視確認を完了。コミット `aafef02`。
- [x] Phase 5: Astro 6 → 7 — 状態: 完了。依存更新・自動検証・成果物比較・新機能調査・PC/モバイルの目視確認を完了。

## 現状スナップショット

以下は2026-10-08の実測値。次のPhase実行時には再確認し、この表と進捗ログを更新する。

| 項目 | 宣言・実値 | 根拠 |
| --- | --- | --- |
| Astro | 宣言・lock `7.3.7` | `package.json`、`package-lock.json` |
| Cloudflare adapter | 削除済み | `astro.config.mjs`、`package.json` |
| MDX | 宣言・lock `8.0.3` | `package.json`、`package-lock.json` |
| Tailwind integration | 削除済み。Tailwind 3をPostCSSから直接読み込む | `astro.config.mjs`、`postcss.config.cjs` |
| Tailwind CSS | 宣言 `^3.4.17`、lock `3.4.17` | `package.json:17`、`package-lock.json` |
| PostCSS / Autoprefixer | 宣言・lock `8.5.4` / `10.4.21` | `package.json`、`package-lock.json` |
| Typography | 宣言 `^0.5.16`、lock `0.5.16` | `package.json:21`、`package-lock.json` |
| Astro check | 宣言・lock `0.9.10` | `package.json`、`package-lock.json` |
| TypeScript | 宣言・lock `5.9.3` | `package.json`、`package-lock.json` |
| Vite | Astroの推移依存 `8.3.3` | `package-lock.json`、`npm ls` |
| Wrangler | 追跡ファイル・Pages設定・デプロイログで不使用を確認して直接依存を削除済み | `package.json`、`package-lock.json`、Phase 2進捗ログ |
| Node.js | 指定・検証環境 `24.1.0` | `.node-version:1`、`mise exec node@24.1.0 -- node -v` |
| npm / lock形式 | 検証環境 `11.3.0` / lockfileVersion `3` | `mise exec node@24.1.0 -- npm -v`、`package-lock.json:4` |
| 作業ツリー | `master`、`origin/master` より先行 | `git status --short --branch` |

設定は `astro.config.mjs` の `mdx()`・`compressHTML: true` と `postcss.config.cjs` のTailwind・Autoprefixer。`output` 未指定の既定値は `static`（インストール済み `node_modules/astro/dist/core/config/schemas/base.js:46`）。`tsconfig.json:2` は `astro/tsconfigs/base`。`package.json:7` の build は `astro build` であり、型検査ではない。

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

npm registry の安定版と peerDependencies を確認した。2026-10-08時点で6系最新はAstro 6.4.8・MDX 6.0.3、全体の `latest` はAstro 7.3.7・MDX 8.0.3。実装前に公開状況を再確認し、目標を変える場合は表とコマンドを同時に更新する。

| 段階 | Astro | MDX | Cloudflareを保持する場合 | Node条件 |
| --- | --- | --- | --- | --- |
| 5系最新 | 5.18.2 | 4.3.14 (`astro ^5.0.0`) | 12.6.13 (`astro ^5.7.0`) | 現指定24.1.0で充足 |
| 6系最新 | 6.4.8 | 6.0.3 (`astro ^6.4.0`) | 13.7.0 (`astro ^6.3.0`, Wrangler `^4.83.0`) | `>=22.12.0` |
| 7系最新 | 7.3.7 | 8.0.3 (`astro ^7.2.10`) | 14.3.4 (`astro ^7.2.0`, Wrangler `^4.125.0`) | `>=22.12.0` |

MDX のメジャー番号は Astro と連動しない。Astro本体を一メジャーずつ進める方針に合わせ、Phase 4では互換性が確認されたMDX 6.0.3へ同時更新した。MDX 6.0.3 の Sätteri 0.3.0 は optional peer で、既定は従来の unified。Astro 7.3.7 はSätteri 0.4.3を依存に持つ。

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

状態: 完了。互換構成: Astro 5.18.2 + MDX 4.3.14、adapter・Wranglerなしの静的出力。adapter削除コミットの本番デプロイと、Wrangler削除後のクリーンな再現ビルドまで確認済み。

- [x] 状態: 完了 — Cloudflare APIとデプロイログから、Pages、`npm run build`、`dist`、Node 24.1.0、GitHub `master` 自動デプロイを確認した。
- [x] 状態: 完了 — `astro.config.mjs` のCloudflare importと `adapter: cloudflare()` を削除し、依存をuninstallした。
- [x] 状態: 完了 — adapterが推移的に提供していたSharpの消失をクリーンな `npm ci` 後のbuildで検出し、Astro 5.18.2のoptional範囲に合う `sharp@0.34.5` を直接依存へ固定した。
- [x] 状態: 完了 — `dist` を前後比較し、HTML・CSS・ClientRouter JS・最適化WebP・faviconが同一であることを確認した。adapter固有の `_worker.js`・`_routes.json` と未参照の元JPEGコピーだけが消えた。previewで3ページとfaviconがHTTP 200、存在しないパスが404。
- [x] 状態: 完了 — 追跡ファイル、Pages設定、デプロイログのいずれにもWrangler利用がなく、ビルド時にも設定ファイルなしと確認できたため、直接依存を削除した。削除後の `npm ci`、`npm ls`、check、buildはいずれも終了コード0。

変更ファイル: `astro.config.mjs`、`package.json`、`package-lock.json`。`astro:assets` の画像最適化を維持するため、Sharpを直接依存として含む。

```sh
npm uninstall @astrojs/cloudflare
npm uninstall wrangler
npm ls
npm run check
npm run build
npm run preview
```

成功条件: adapterなしで静的配信契約と共通検証を満たす。ロールバック境界: adapter削除コミット。外部利用未確認のWranglerはそのまま残せる。

現adapter自身がstatic時に不要警告を出す（インストール済み `node_modules/@astrojs/cloudflare/dist/index.js:123`）。画像の既定 `compile` はSharpを使い（同 `dist/utils/image-config.js:11`）、Astro標準もSharp（`node_modules/astro/dist/core/config/schemas/base.js:26`）。ただしadapterは `_routes.json` 等にも関与するため、削除後の成果物が完全同一とは仮定しない。[CloudflareのAstro配信手順][cloudflare-pages]

先に分離すると配信形態とAstro本体更新の影響を切り分けられるが、検証が1回増える。保持する場合はPhase 4でadapter 13.7.0と対応Wranglerへ更新が必要で、Pages対応削除、workerd化、画像既定値 `compile` → `cloudflare-binding` が関係する。Pages→Workers移行が必要と分かった場合は計画を見直し、その外部変更を本体更新に黙って追加しない。[公式adapter移行ガイド][cloudflare-upgrade]

## Phase 3 — Tailwind 3 の PostCSS 接続

状態: 完了。互換構成: Astro 5.18.2、Tailwind CSS 3.4.17、Typography 0.5.16を維持。PostCSS 8.5.4・Autoprefixer 10.4.21を直接依存に固定し、自動検証・成果物比較・PC/モバイルの目視確認を完了した。

- [x] 状態: 完了 — `postcss.config.cjs` にTailwindとAutoprefixerを登録した。
- [x] 状態: 完了 — `src/styles/global.css` に `@tailwind base;`、`@tailwind components;`、`@tailwind utilities;` を置き、`Layout.astro` からimportした。
- [x] 状態: 完了 — `astro.config.mjs` のTailwind import・`tailwind()` と `@astrojs/tailwind` 依存を削除した。
- [x] 状態: 完了 — CSS成果物でテーマ・typography・`@apply`・hover・レスポンシブ規則の維持を確認し、PC・モバイルでも表示と遷移に問題がないことを目視確認した。

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

状態: 完了。互換構成: Astro 6.4.8 + MDX 6.0.3、Node 24.1.0。依存更新・自動検証・成果物比較・新機能調査・PC/モバイルの目視確認を完了した。

- [x] 状態: 完了 — Astro 6.4.8とMDX 6.0.3を同時更新し、npm registryで6系最新・peer・Node・Sharp要件を再確認した。
- [x] 状態: 完了 — 以下の破壊的変更表をコードと照合し、該当する削除APIや要事前修正箇所がないことを陽性対照付き検索で確認した。
- [x] 状態: 完了 — `npm ci`、`npm ls`、check/build、全3ページのHTTP応答、成果物のDOM・CSS・MDX見出しID・画像hashを確認し、PC/モバイルの表示とClientRouter遷移にも問題がないことを目視確認した。
- [x] 状態: 完了 — Astro 6.0・6.4の公式リリース情報から、本リポジトリに適合する新機能候補を新機能候補表へ追記した。候補の採用は移行コミットに混ぜない。

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

状態: 完了。互換構成: Astro 7.3.7 + MDX 8.0.3 + 依存としてのSätteri 0.4.3、Node 24.1.0。依存更新・自動検証・成果物比較・新機能調査・PC/モバイルの目視確認を完了した。

- [x] 状態: 完了 — Astro 7.3.7とMDX 8.0.3を同時更新し、npm registryでlatest・peer・Node・Vite・Sätteri要件を再確認した。
- [x] 状態: 完了 — `astro.config.mjs` に `compressHTML: true` を追加し、アイコンと隣接テキストの空白がAstro 6と同様に残ることを成果物で確認した。
- [x] 状態: 完了 — Rust compilerで全テンプレートをbuildし、タグ閉じやHTML構造にエラーがないことを確認した。
- [x] 状態: 完了 — SätteriでMDXのfrontmatter layout、`components` による外部リンク差し替え、日本語・絵文字の見出しID、入れ子リストをAstro 6成果物と比較した。
- [x] 状態: 完了 — `npm ci`、`npm ls`、check/build、全3ページのHTTP応答、成果物のDOM・CSS主要規則・画像hashを確認し、PC/モバイルの表示とClientRouter遷移にも問題がないことを目視確認した。
- [x] 状態: 完了 — Astro 7.0〜7.3の公式リリース情報から、本リポジトリに適合する新機能候補を新機能候補表へ追記した。
- [x] 状態: 完了 — Astro 6・7の候補を効果・導入コスト・リスクで分類した。採用する機能はアップグレード完了後の別タスク・別コミットにする。

変更ファイル: `package.json`、`package-lock.json`、`astro.config.mjs`、実際に修正が必要となったテンプレートのみ。

```sh
npm install --save-exact astro@7.3.7 @astrojs/mdx@8.0.3
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
| Astro 6 | Fonts API | `Layout.astro` がGoogle Fontsを3本の外部stylesheetで読み込む箇所 | フォントの自己ホスト、preload、fallback最適化、閲覧者のGoogle接続削減 | 3書体・weight・emojiの対応確認とTailwind fontFamilyのCSS変数移行が必要 | **推奨**。最初の採用候補 |
| Astro 6 / 7.1 | Content Security Policy APIと要素・属性別directive | ClientRouterとinline styleを含む全3ページ | Astro生成script/styleのhashと細かなdirectiveでXSS耐性を高める | 現在のGoogle Fonts外部stylesheetは標準設定だけでは扱えないため、Fonts API移行後にCSPレポートと画面遷移を検証する | **条件付き**。Fonts APIの後に採用 |
| Astro 6.4 / 7 | Sätteri Markdown processor | `src/pages/me.mdx` のMDX処理 | Rust実装の既定processorへ移行 | Astro 7更新で既定化済み。layout・components差し替え・日本語見出しを検証済み | **対応済み**。追加作業なし |
| Astro 7 / 7.2 / 7.3 | 管理対象のbackground dev/preview server・health endpoint・複数server | エージェントによる表示検証と並行worktree | 起動完了待ち、PID・ログ・停止、重複回避をCLIへ委ねられる | managed sandboxでは自動background起動した子プロセスがportを開けないため、`--ignore-lock` と権限昇格が必要 | **条件付き**。ローカル運用へ必要時に追記 |
| Astro 7.2 | Experimental incremental static builds | 3ページのstatic build | 将来ページ数が大幅に増えた場合の再ビルド短縮 | 現在のbuildは約1秒で、実験機能の状態管理コストが効果を上回る | **見送り** |

最終提案は、(1) Fonts APIを先に導入、(2) 外部Google Fonts依存を解消した後にCSPを導入、(3) background serverは運用上必要になった時だけ手順化、の順とする。SätteriはAstro 7移行で対応済み。advanced routing・route cache・JSON loggingは3ページのstatic配信には利用箇所がなく、incremental static buildも現状の約1秒buildには過剰なため見送る。提案時点では新機能を実装せず、ユーザーが選んだ機能だけを個別の作業単位として計画する。

### 次期タスク案 — Fonts API

Astro Fonts APIは、フォントprovider・使用するweight/style・fallback・CSS変数を `astro.config.mjs` で宣言し、Astroがビルド時にフォントを取得・キャッシュして静的アセットとして配信する仕組み。現在は閲覧者のブラウザーがGoogleへ直接接続するが、移行後はビルド時に取得したファイルをCloudflare Pagesから配信する。

```text
現在:   閲覧者 → fonts.googleapis.com / fonts.gstatic.com
移行後: Astro build → providerから取得・キャッシュ
        閲覧者 → Cloudflare Pagesの /_astro/fonts
```

現状は `src/layouts/Layout.astro:23-36` で以下を外部stylesheetとして読み込み、`tailwind.config.cjs:8-10` でフォント名を直接指定している。

- Noto Sans JP: 400 / 600 / 700
- Noto Color Emoji
- Moirai One: `HRTful.life` に必要な文字だけを `text` queryで取得

期待する効果:

- 閲覧時のGoogleへの第三者通信をなくし、プライバシーと配信の自己完結性を高める。
- Google Fontsの応答遅延・障害からページ表示を切り離し、Cloudflareとブラウザーの静的アセットキャッシュを利用する。
- 必要なweight・style・formatだけを宣言し、重要なフォントだけをpreloadする。
- primary fontに近いoptimized fallbackを生成し、フォント読込時のレイアウトシフトを抑える。
- フォント設定とTailwindの `fontFamily` をAstro生成のCSS変数で接続し、設定箇所を明確にする。

実装順:

1. 移行前のフォントrequest、転送量、表示、computed `font-family`、レイアウトシフトを記録する。
2. `astro.config.mjs` に3書体を登録し、`Layout.astro` に `<Font />` を配置する。
3. Tailwind 3の `fontFamily.sans` と `fontFamily.brand` をAstroのCSS変数へ切り替える。
4. Google Fonts向けの3 stylesheetと2 preconnectを削除し、生成HTMLにGoogle Fontsへの接続が残らないことを確認する。
5. `npm ci`、`npm ls`、check、build、preview、成果物比較、PC/モバイルの目視確認を行う。

重点確認:

- Noto Sans JPの400 / 600 / 700が意図どおり生成・適用されること。
- Noto Color Emojiのカラー表示とfallback順が維持されること。
- Moirai Oneで `HRTful.life` が欠けず、現在の `text=HRTful.life` 相当の軽量性を維持できること。
- 日本語フォントの自己ホスト化で転送量が過度に増えないこと。全グリフを無条件に同梱せず、providerが生成するファイル数・総容量・Unicode rangeを実測する。
- preloadはabove-the-foldに必須なファイルへ限定し、不要なweightや絵文字フォントを先読みしないこと。
- 初回buildでproviderへのネットワーク接続が必要になる前提と、`.astro/fonts`・`node_modules/.astro/fonts` のキャッシュ挙動を確認すること。

成功条件: 閲覧時のGoogle Fonts向けrequestが0件で、3書体・指定weight・emoji・brand表示を維持し、フォント転送量とレイアウトシフトが許容範囲に収まる。ロールバック境界: Fonts API移行コミット。CSP導入はこの移行を本番確認した後の別コミットとする。[Astro Fontsガイド][astro-fonts-guide]

## リスクと未確認事項

- [x] 状態: 完了 — Astro 6更新後の `npm ci`、`npm ls`、check、buildを実行し、metadata上の互換性と実動作を区別して確認した。
- [x] 状態: 完了 — ローカルとCloudflare PagesのデプロイログがともにNode 24.1.0であることを確認した。
- [x] 状態: 完了 — Cloudflare PagesのGitHub連携、build command、公開ディレクトリ、Functions不使用、adapterなしの本番デプロイ成功をAPIで確認した。
- [x] 状態: 完了 — 追跡ファイル、Pages設定、デプロイログにWrangler利用がないことを確認し、Phase 2で直接依存を削除した。
- [x] 状態: 完了 — Astro 6更新前後のcheckがともに診断0であることを確認した。
- [x] 状態: 完了 — MDX見出しID・DOM・CSS・画像の前後比較に加え、PC/モバイルの表示とClientRouter遷移を目視確認した。
- [x] 状態: 完了 — 2026-10-08に6系・7系の固定バージョン、peer、Node要件、公式v6移行規則を再確認した。
- [x] 状態: 完了 — Astro 7更新後のクリーンな `npm ci`、`npm ls`、check、buildと成果物比較を実行した。
- [x] 状態: 完了 — Astro 7成果物のDOM構造・本文、MDX、主要CSS規則、画像hashを比較し、PC/モバイルの表示とClientRouter遷移を目視確認した。

## 進捗ログ

| 日付 | 対象 | 状態 | 実施内容・証拠 | コミット・残課題 |
| --- | --- | --- | --- | --- |
| 2026-09-26 | 計画作成 | 完了 | ローカルコード・lock・設定とnpm metadata、公式移行ガイドを調査 | アップグレードは全Phase未着手 |
| 2026-09-26 | Phase 0 | 完了 | Node 24.1.0で更新前lockの `npm ci` とAstro 5.8.2のbuildが終了コード0。check 0.9.10・TypeScript 5.9.3を固定導入し、17ファイルが0 errors・0 warnings・0 hints。導入後buildも終了コード0 | Phase 1と分離してコミット。更新前npm audit 42件、導入後36件を記録 |
| 2026-09-26 | Phase 1 | 完了 | Astro 5.18.2・MDX 4.3.14へ更新。Node 24.1.0で `npm ls`・buildが終了コード0、dev上の3ルートがHTTP 200。生成HTMLとブラウザー表示を確認 | `b902305`。`astro preview` は現Cloudflare adapterが未対応 |
| 2026-09-26 | 計画更新 | 完了 | Astro 6・7への移行完了時に新機能候補を記録し、Phase 5で優先順位付き提案を行う工程を追加 | 新機能採用は移行コミットに混ぜない |
| 2026-09-27 | Phase 2 | 完了 | サーバーAPI等の不使用を陽性対照付きで再確認。adapterを削除し、Sharp 0.34.5を直接依存化。クリーンな `npm ci`、check、画像最適化付きstatic build、成果物比較、previewの3ページ/404を検証 | adapter整理は `6bde41a`。Wrangler削除は別コミット |
| 2026-09-27 | Phase 2 本番検証 | 完了 | Cloudflare APIでPages設定を読み取り、GitHub `master`、`npm run build`、`dist`、Functions不使用を確認。デプロイ `1577586b` はコミット `6bde41a`、production、deploy success。ログ上もNode 24.1.0でビルドし、Wrangler設定ファイルなしで配信成功 | adapterなしの静的配信契約を本番で確認。Wranglerは外部設定でも未使用と確定 |
| 2026-09-27 | Phase 2 Wrangler整理 | 完了 | 未使用のWrangler 3.107.3を直接依存から削除。Node 24.1.0・npm 11.3.0で `npm ci`、`npm ls`、check、画像最適化付きstatic buildが終了コード0。checkは17ファイルで0 errors・0 warnings・0 hints、buildは全3ページを生成 | Phase 2完了。次はPhase 3のTailwind 3 PostCSS接続 |
| 2026-09-27 | Phase 3 | 完了 | Tailwind integrationを公式PostCSS接続へ移行。Node 24.1.0・npm 11.3.0で `npm ci`、`npm ls`、check、buildが終了コード0。checkは18ファイルで診断0、previewは3ページとfaviconが200・未知パスが404。旧CSS本体と新CSSは、HTMLから外部CSSへ移った2規則を除いて一致。PC・モバイルで表示と遷移を目視確認 | `a35e1b5`。Phase 4のAstro 5→6へ進む |
| 2026-10-08 | Phase 4 | 完了 | Astro 6.4.8・MDX 6.0.3へ更新。Node 24.1.0・npm 11.3.0で `npm ci`、`npm ls`、check、画像最適化付きstatic buildが終了コード0。previewは3ページとfaviconが200・未知パスが404。旧成果物との比較でDOM構造・本文、MDX見出しID、画像hashを維持し、CSS差は`@media`内の空白圧縮のみ。PC・モバイルで表示と遷移を目視確認 | `aafef02`。Phase 4完了 |
| 2026-10-08 | Phase 5 | 完了 | Astro 7.3.7・MDX 8.0.3へ更新し、従来の空白処理を明示。Node 24.1.0・npm 11.3.0でクリーンな `npm ci`、`npm ls`、check、Rust compiler・Sätteri・Vite 8によるstatic buildが終了コード0。previewは3ページとfaviconが200・未知パスが404。Astro 6成果物との比較でDOM構造・本文、MDX見出しID・外部リンク差し替え、画像hash、主要CSS規則を維持。PC・モバイルで表示とClientRouter遷移を目視確認 | Phase 5完了。Astroメジャーアップグレード計画を完遂 |

追記時は実行したPhase、Node/npm、コマンド終了コード、画面確認、変更した判断、コミットを記録する。途中終了は「検証待ち」「保留」とし、未実行項目のチェックを付けない。

## 公式一次情報

- [Astro npm metadata][npm-astro]
- [MDX npm metadata][npm-mdx] / [変更履歴][mdx-changelog]
- [Cloudflare adapter npm metadata][npm-cloudflare] / [v13とAstro 6への移行][cloudflare-upgrade]
- [Tailwind integration npm metadata][npm-tailwind] / [Tailwind 3のPostCSS接続][tailwind-postcss]
- [Astro 6移行ガイド][upgrade-v6] / [Astro 7移行ガイド][upgrade-v7]
- [Astro 6.0リリース][astro-6-release] / [Astro 6.4リリース][astro-64-release]
- [Astro 6 Fonts API][astro-6-fonts] / [Astro 6 CSP設定][astro-6-csp]
- [Astro 7.0リリース][astro-7-release] / [Astro 7.1][astro-71-release] / [Astro 7.2][astro-72-release] / [Astro 7.3][astro-73-release]
- [Astro型検査][typescript-guide] / [check 0.9.10 metadata][npm-check]
- [Cloudflare PagesのAstro配信手順][cloudflare-pages]

[npm-astro]: https://registry.npmjs.org/astro
[npm-mdx]: https://registry.npmjs.org/@astrojs%2fmdx
[npm-cloudflare]: https://registry.npmjs.org/@astrojs%2fcloudflare
[npm-tailwind]: https://registry.npmjs.org/@astrojs%2ftailwind
[npm-check]: https://registry.npmjs.org/@astrojs%2fcheck/0.9.10
[upgrade-v6]: https://docs.astro.build/en/guides/upgrade-to/v6/
[upgrade-v7]: https://docs.astro.build/en/guides/upgrade-to/v7/
[astro-6-release]: https://astro.build/blog/astro-6/
[astro-64-release]: https://astro.build/blog/astro-640/
[astro-6-fonts]: https://v6.docs.astro.build/en/reference/font-provider-reference/
[astro-6-csp]: https://v6.docs.astro.build/en/reference/configuration-reference/#securitycsp
[astro-fonts-guide]: https://docs.astro.build/en/guides/fonts/
[astro-7-release]: https://astro.build/blog/astro-7/
[astro-71-release]: https://astro.build/blog/astro-710/
[astro-72-release]: https://astro.build/blog/astro-720/
[astro-73-release]: https://astro.build/blog/astro-730/
[cloudflare-upgrade]: https://docs.astro.build/en/guides/integrations-guide/cloudflare/#upgrading-to-v13-and-astro-6
[cloudflare-pages]: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
[tailwind-postcss]: https://v3.tailwindcss.com/docs/installation/using-postcss
[typescript-guide]: https://docs.astro.build/en/guides/typescript/#type-checking
[mdx-changelog]: https://github.com/withastro/astro/blob/main/packages/integrations/mdx/CHANGELOG.md
