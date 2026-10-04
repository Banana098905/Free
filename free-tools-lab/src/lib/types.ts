export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

/** 研究レポート専用の追加情報（frontmatter の report_* から作られる） */
export type ReportMeta = {
  theme: string;
  goal: string;
  tools: string[];
  environment: string;
  duration: string;
  problems: string[];
  limits: string[];
  conclusion: string;
  /** 実際に検証済みかどうか。false の間は「未検証」と表示される */
  verified: boolean;
};

/** 一覧表示に必要な軽量データ（クライアントにも渡せる） */
export type ArticleSummary = {
  id: string;
  title: string;
  slug: string;
  /** カテゴリーの slug */
  category: string;
  description: string;
  thumbnail?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  featured: boolean;
  research: boolean;
  sample: boolean;
};

/** 検索用テキストを含む一覧データ */
export type SearchableArticle = ArticleSummary & {
  searchText: string;
};

export type Article = ArticleSummary & {
  body: string;
  html: string;
  headings: Heading[];
  searchText: string;
  report?: ReportMeta;
};
