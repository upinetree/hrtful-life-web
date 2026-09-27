# Repository Guidelines

## Project Structure & Module Organization

このリポジトリは Astro 製の個人ポータルサイトです。主要な実装は `src/` にあります。ページは `src/pages/`、再利用 UI は `src/components/`、共通レイアウトは `src/layouts/` に配置します。MDX コンテンツは `src/pages/me.mdx` のようにページ配下へ置きます。画像アセットは `src/images/`、静的にそのまま配信するファイルは `public/` を使います。ビルド成果物の `dist/` は生成物として扱い、手編集しないでください。

## Build, Test, and Development Commands

- `npm install`: 依存関係をインストールします。Node.js は `.node-version` に合わせてください。
- `npm run dev`: Astro の開発サーバーを起動します。
- `npm run build`: 本番用ビルドを作成し、Astro のビルドが完了することを確認します。
- `npm run preview`: ビルド結果をローカルで確認します。
- `npm run update`: `npm-check-updates` で minor 更新を反映し、依存関係を更新します。

GitHub の `master` ブランチへ `push` すると、Cloudflare Pages の本番デプロイが自動で開始されます。ローカルコミットと `push` を別の操作として扱い、`push` はユーザーから明示的に依頼された場合だけ実行してください。

## Coding Style & Naming Conventions

Astro コンポーネントは PascalCase の `.astro` ファイルにします（例: `ExternalLinkCard.astro`）。ページルートは Astro の規約に従い、URL に対応する小文字名を `src/pages/` に置きます（例: `style.astro`）。インデントや import の並びは既存ファイルのスタイルに合わせ、不要な抽象化は避けてください。スタイルは Tailwind CSS のユーティリティを優先し、色やフォントは `tailwind.config.cjs` の拡張テーマを再利用します。

## Testing Guidelines

現時点で専用のテストフレームワークや `npm test` は定義されていません。変更後は最低限 `npm run build` を実行し、ページ追加やレイアウト変更では `npm run dev` または `npm run preview` で表示を確認してください。新しいテストを追加する場合は、対象機能に近い場所へ配置し、命名は対象ファイルが分かる形にします。

## Commit & Pull Request Guidelines

コミット履歴は短い英語の命令形または説明形が中心です（例: `update employment details in personal profile`, `add .node-version file with Node.js version 24.1.0`）。1 コミットは関連する変更に絞り、生成物や不要な整形差分を含めないでください。Pull Request には変更内容、確認したコマンド、影響するページを記載します。UI 表示が変わる場合はスクリーンショットを添付し、関連 Issue があればリンクしてください。

## Security & Configuration Tips

秘密情報をリポジトリへコミットしないでください。Cloudflare や Wrangler に関する認証情報はローカル環境またはデプロイ環境のシークレットで管理します。依存関係更新では `package-lock.json` の差分を確認し、`npm run build` で回帰がないことを確認してください。
