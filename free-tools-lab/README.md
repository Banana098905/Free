# 無料でできること研究所

お金をかけずに、できることを増やそう。無料ツール・サービスの活用法と検証結果を紹介する情報メディアです。
Next.js（App Router）+ TypeScript + Tailwind CSS。外部DB・有料APIは使わず、記事は Markdown ファイルで管理します。

## はじめかた

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run typecheck  # 型チェック
npm run lint       # Lint
npm run build      # 本番ビルド
npm run start      # ビルド後の起動
```

公開URLを使う場合は `.env.example` を `.env.local` にコピーして `NEXT_PUBLIC_SITE_URL` を設定してください（sitemap・canonical・OGPに使われます）。

## 記事の追加方法

`content/articles/` に `.md` ファイルを1つ追加するだけです（コードの変更は不要）。ファイル名の先頭が `_` のものは無視されます。

```markdown
---
id: a006
title: 記事のタイトル
slug: my-new-article
category: software
description: 一覧や検索結果に表示される短い説明。
publishedAt: 2026-10-05
updatedAt: 2026-10-05
featured: false
research: false
---

本文をここに書きます。

## 見出し
```

### frontmatter の項目

| 項目 | 必須 | 説明 |
| --- | --- | --- |
| `title` / `description` / `category` / `publishedAt` | ○ | `category` は下のスラッグから選ぶ。日付は `YYYY-MM-DD` |
| `slug` | | URL。省略するとファイル名。半角英小文字・数字・ハイフンのみ |
| `id` | | 省略すると slug と同じ |
| `updatedAt` | | 省略すると公開日と同じ |
| `thumbnail` | | `/images/xxx.jpg` のように `public/` 配下のパス。省略すると自動生成のアートワークを表示 |
| `readingTime` | | 分。省略すると本文の文字数から自動計算 |
| `featured` | | `true` でトップの「注目の記事」に表示（新しい順に最大2件） |
| `research` | | `true` で研究レポート形式（下記）になり、`/reports` にも掲載 |
| `sample` | | `true` で「サンプル」表示と、公開前確認の注意書きを表示。本番記事では外す |

カテゴリーのスラッグ：`ai` / `design` / `media` / `productivity` / `software` / `web-services` / `learning` / `experiments`
（追加・変更は `src/lib/categories.ts`）

### 研究レポート（`research: true`）の追加項目

`report_theme`（実験テーマ）、`report_goal`（検証したいこと）、`report_tools`（使用ツール。`[A, B]` 形式）、`report_environment`（検証環境）、`report_duration`（所要時間）、`report_problems`（問題点。`- ` で箇条書き）、`report_limits`（無料プランの制限。同左）、`report_conclusion`（結論）、`verified`（`true`/`false`）。

**実際に検証するまで `verified: false` のままにしてください。** false の間は画面に「未検証」と表示されます。

## 本文で使える書き方

通常の Markdown（`##` 見出し、箇条書き、番号付きリスト、`>` 引用、`![説明](/images/a.png)` 画像、表、コードブロック、`**太字**`、`[リンク](URL)`）に加えて、次のブロックが使えます。`:::` だけの行で閉じます（入れ子は不可）。

```markdown
:::note タイトル
補足やポイント
:::

:::warning タイトル
注意事項
:::

:::success 成功
成功した検証結果
:::

:::failure うまくいかなかった点
失敗した検証結果
:::

:::steps 手順の流れ
1. 最初の手順
2. 次の手順
:::
```

目次は `##` と `###` の見出しから自動生成されます。見出しは `##` から使ってください（`#` はページのタイトル用）。
frontmatter の配列に半角カンマは使えません（全角の「、」を使ってください）。

## 将来の収益化に向けて

- `src/components/AdSlot.tsx` が、記事の上・下・サイドバーの広告枠です。`src/lib/site.ts` の `ads.enabled` が `false` の間は何も表示しません。特定の広告サービスには依存していません。
- 有料資料・教材・特集は、`content/` や `src/app/` に新しいセクションを足す形で拡張できます。

## 構成

```
content/articles/     記事（Markdown）
src/app/              ページ（トップ・記事・カテゴリー・研究レポート・固定ページ・sitemap・robots）
src/components/       UI コンポーネント
src/lib/              記事の読み込み、Markdown 変換、カテゴリー、SEO 設定
```

## 公開前に確認すること

- `content/articles/` のサンプル記事（`sample: true`）は、内容を実際に確認して書き直すか、削除してください。
- お問い合わせ窓口・運営者情報は、実在するものを `src/lib/site.ts` の `contactEmail` と `/about` ページに追記してください。
- プライバシーポリシー・免責事項は雛形です。運営の実態（広告・解析の導入など）に合わせて見直してください。
