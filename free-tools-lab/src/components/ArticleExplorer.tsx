'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { categories } from '@/lib/categories';
import type { SearchableArticle } from '@/lib/types';
import { ArticleCard } from './ArticleCard';

const PAGE_SIZE = 9;
type Sort = 'new' | 'updated';

type Props = {
  articles: SearchableArticle[];
  /** false のとき（カテゴリーページ・研究レポートページ）はカテゴリー絞り込みを隠す */
  showCategoryFilter?: boolean;
  emptyMessage?: string;
};

/**
 * キーワード検索（タイトル・説明文・本文）、カテゴリー絞り込み、並び替え、
 * 「もっと見る」による追加表示を行う一覧。
 * 初回表示は全記事をサーバー側で描画し（検索エンジンにも見える）、
 * マウント後に URL の ?q= と ?category= を読み取って絞り込みます。
 */
export function ArticleExplorer({
  articles,
  showCategoryFilter = true,
  emptyMessage = 'まだ記事がありません。',
}: Props) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<Sort>('new');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // URL からの初期値
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get('q') ?? '');
    const c = sp.get('category');
    if (showCategoryFilter && c && categories.some((x) => x.slug === c)) setCategory(c);
    if (window.location.hash === '#article-search') inputRef.current?.focus();
    setReady(true);
  }, [showCategoryFilter]);

  // 入力内容を URL に反映（共有・戻る操作のため）
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set('q', q.trim());
      if (showCategoryFilter && category !== 'all') sp.set('category', category);
      const qs = sp.toString();
      const url = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
      window.history.replaceState(window.history.state, '', url);
    }, 250);
    return () => window.clearTimeout(t);
  }, [q, category, ready, showCategoryFilter]);

  const terms = useMemo(
    () =>
      q
        .toLowerCase()
        .split(/[\s　]+/)
        .filter(Boolean),
    [q],
  );

  const filtered = useMemo(() => {
    const list = articles.filter(
      (a) =>
        (category === 'all' || a.category === category) &&
        terms.every((t) => a.searchText.includes(t)),
    );
    const key = sort === 'new' ? 'publishedAt' : 'updatedAt';
    return [...list].sort((a, b) => b[key].localeCompare(a[key]) || a.slug.localeCompare(b.slug));
  }, [articles, category, terms, sort]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of articles) map[a.category] = (map[a.category] ?? 0) + 1;
    return map;
  }, [articles]);

  const visible = filtered.slice(0, limit);
  const remaining = filtered.length - visible.length;
  const filtering = terms.length > 0 || category !== 'all';

  const reset = () => {
    setQ('');
    setCategory('all');
    setLimit(PAGE_SIZE);
  };

  const chipBase = 'rounded-full border px-3.5 py-1.5 text-sm font-medium transition';
  const chipOn = 'border-navy-800 bg-navy-800 text-white';
  const chipOff = 'border-line bg-white text-slate-600 hover:border-navy-200 hover:bg-navy-50';

  return (
    <div>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="article-search" className="sr-only">
              キーワードで記事を検索
            </label>
            <input
              id="article-search"
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              placeholder="キーワードで検索（タイトル・説明・本文が対象）"
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-line bg-white pl-4 pr-4 text-base outline-none transition placeholder:text-slate-400 focus:border-navy-400 focus:ring-2 focus:ring-navy-200"
            />
          </div>
          <div>
            <label htmlFor="article-sort" className="sr-only">
              並び順
            </label>
            <select
              id="article-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-12 w-full rounded-xl border border-line bg-white px-4 text-sm outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-200 sm:w-auto"
            >
              <option value="new">新着順（公開日）</option>
              <option value="updated">更新が新しい順</option>
            </select>
          </div>
        </div>

        {showCategoryFilter && (
          <div role="group" aria-label="カテゴリーで絞り込み" className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={category === 'all'}
              onClick={() => {
                setCategory('all');
                setLimit(PAGE_SIZE);
              }}
              className={`${chipBase} ${category === 'all' ? chipOn : chipOff}`}
            >
              すべて（{articles.length}）
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={category === c.slug}
                onClick={() => {
                  setCategory(c.slug);
                  setLimit(PAGE_SIZE);
                }}
                className={`${chipBase} ${category === c.slug ? chipOn : chipOff}`}
              >
                {c.name}（{counts[c.slug] ?? 0}）
              </button>
            ))}
          </div>
        )}
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-sm text-slate-500">
        {filtered.length}件の記事
        {terms.length > 0 ? `（「${q.trim()}」で検索）` : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="font-semibold text-navy-900">
            {articles.length === 0 ? emptyMessage : '条件に一致する記事が見つかりませんでした。'}
          </p>
          {articles.length > 0 && (
            <>
              <p className="mt-2 text-sm text-slate-600">
                キーワードを短くするか、カテゴリーの絞り込みを解除してみてください。
              </p>
              {filtering && (
                <button type="button" onClick={reset} className="btn-secondary mt-5">
                  絞り込みをリセット
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a) => (
            <li key={a.slug}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <div className="mt-10 text-center">
          <button type="button" onClick={() => setLimit((n) => n + PAGE_SIZE)} className="btn-secondary">
            もっと見る（残り{remaining}件）
          </button>
        </div>
      )}
    </div>
  );
}
