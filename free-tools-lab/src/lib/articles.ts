import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter, type Frontmatter } from './frontmatter';
import { renderMarkdown, toPlainText } from './markdown';
import { categories, isCategorySlug } from './categories';
import type { Article, ArticleSummary, ReportMeta, SearchableArticle } from './types';

/** 記事は content/articles/*.md に置きます（先頭が _ のファイルは無視） */
const CONTENT_DIR = path.join(process.cwd(), 'content', 'articles');
/** 日本語の目安読書速度（文字/分） */
const CHARS_PER_MINUTE = 500;

function str(data: Frontmatter, key: string, file: string, required = true): string {
  const v = data[key];
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (required) {
    throw new Error(`[content] ${file}: frontmatter の "${key}" が未設定です`);
  }
  return '';
}

function bool(data: Frontmatter, key: string): boolean {
  return data[key] === true;
}

function list(data: Frontmatter, key: string): string[] {
  const v = data[key];
  if (Array.isArray(v)) return v;
  return typeof v === 'string' && v.trim() ? [v.trim()] : [];
}

function dateField(data: Frontmatter, key: string, file: string, fallback?: string): string {
  const v = str(data, key, file, fallback === undefined);
  const value = v || fallback || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`[content] ${file}: "${key}" は YYYY-MM-DD 形式で指定してください`);
  }
  return value;
}

function buildReport(data: Frontmatter, file: string): ReportMeta {
  return {
    theme: str(data, 'report_theme', file, false),
    goal: str(data, 'report_goal', file, false),
    tools: list(data, 'report_tools'),
    environment: str(data, 'report_environment', file, false),
    duration: str(data, 'report_duration', file, false),
    problems: list(data, 'report_problems'),
    limits: list(data, 'report_limits'),
    conclusion: str(data, 'report_conclusion', file, false),
    verified: bool(data, 'verified'),
  };
}

function loadArticles(): Article[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'));

  const articles = files.map((file): Article => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);

    const slug = str(data, 'slug', file, false) || file.replace(/\.md$/, '');
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(`[content] ${file}: slug は半角英小文字・数字・ハイフンのみ使えます`);
    }

    const category = str(data, 'category', file);
    if (!isCategorySlug(category)) {
      const valid = categories.map((c) => c.slug).join(', ');
      throw new Error(`[content] ${file}: category "${category}" は不明です（使える値: ${valid}）`);
    }

    const publishedAt = dateField(data, 'publishedAt', file);
    const updatedAt = dateField(data, 'updatedAt', file, publishedAt);

    const plain = toPlainText(body);
    const declared = Number(str(data, 'readingTime', file, false));
    const readingTime =
      Number.isFinite(declared) && declared > 0
        ? Math.round(declared)
        : Math.max(1, Math.ceil(plain.length / CHARS_PER_MINUTE));

    const title = str(data, 'title', file);
    const description = str(data, 'description', file);
    const research = bool(data, 'research');
    const { html, headings } = renderMarkdown(body);

    return {
      id: str(data, 'id', file, false) || slug,
      title,
      slug,
      category,
      description,
      thumbnail: str(data, 'thumbnail', file, false) || undefined,
      publishedAt,
      updatedAt,
      readingTime,
      featured: bool(data, 'featured'),
      research,
      sample: bool(data, 'sample'),
      body,
      html,
      headings,
      searchText: [title, description, plain].join(' ').toLowerCase(),
      report: research ? buildReport(data, file) : undefined,
    };
  });

  const seen = new Set<string>();
  for (const a of articles) {
    if (seen.has(a.slug)) throw new Error(`[content] slug "${a.slug}" が重複しています`);
    seen.add(a.slug);
  }

  return articles.sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug),
  );
}

let cache: Article[] | null = null;

/** 公開日の新しい順。本番ビルドではキャッシュし、開発中は毎回読み直します */
export function getAllArticles(): Article[] {
  if (process.env.NODE_ENV === 'production' && cache) return cache;
  const loaded = loadArticles();
  if (process.env.NODE_ENV === 'production') cache = loaded;
  return loaded;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return getAllArticles().filter((a) => a.category === categorySlug);
}

export function getFeaturedArticles(limit = 2): Article[] {
  return getAllArticles()
    .filter((a) => a.featured)
    .slice(0, limit);
}

export function getReportArticles(): Article[] {
  return getAllArticles().filter((a) => a.research);
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of categories) counts[c.slug] = 0;
  for (const a of getAllArticles()) counts[a.category] = (counts[a.category] ?? 0) + 1;
  return counts;
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return getAllArticles()
    .filter((a) => a.slug !== article.slug)
    .map((a) => ({
      a,
      score: (a.category === article.category ? 2 : 0) + (a.research === article.research ? 1 : 0),
    }))
    .sort((x, y) => y.score - x.score || y.a.publishedAt.localeCompare(x.a.publishedAt))
    .slice(0, limit)
    .map((x) => x.a);
}

/** newer: より新しい記事 / older: より古い記事 */
export function getAdjacentArticles(slug: string): {
  newer: Article | undefined;
  older: Article | undefined;
} {
  const all = getAllArticles();
  const i = all.findIndex((a) => a.slug === slug);
  if (i === -1) return { newer: undefined, older: undefined };
  return { newer: all[i - 1], older: all[i + 1] };
}

export function toSummary(a: Article): ArticleSummary {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    category: a.category,
    description: a.description,
    thumbnail: a.thumbnail,
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt,
    readingTime: a.readingTime,
    featured: a.featured,
    research: a.research,
    sample: a.sample,
  };
}

export function toSearchable(a: Article): SearchableArticle {
  return { ...toSummary(a), searchText: a.searchText };
}
