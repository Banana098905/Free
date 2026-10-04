import type { Metadata } from 'next';
import { ArticleExplorer } from '@/components/ArticleExplorer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getReportArticles, toSearchable } from '@/lib/articles';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: '研究レポート',
  description:
    '無料ツールを実際に試した結果を、使用ツール・手順・所要時間・制限事項などとあわせて整理したレポート。',
  path: '/reports',
});

const items = [
  '実験テーマ',
  '検証したいこと',
  '使用した無料ツール',
  '検証環境',
  '実際の作業手順',
  '検証結果',
  '問題点',
  '無料プランの制限',
  '結論',
  '関連記事',
];

export default function ReportsPage() {
  const reports = getReportArticles().map(toSearchable);

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ label: '研究レポート' }]} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">研究レポート</h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          使い方の解説とは別に、無料ツールを実際に試した結果をまとめるコーナーです。
          検証していない内容を「検証済み」とは表示しません。
        </p>
      </header>

      <section aria-labelledby="report-format" className="mt-10 rounded-2xl border border-iris-line bg-iris-soft/60 p-6">
        <h2 id="report-format" className="text-base font-bold text-iris">
          レポートに含まれる項目
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {items.map((i) => (
            <li key={i} className="rounded-full bg-white px-3 py-1 text-sm text-navy-800 ring-1 ring-iris-line">
              {i}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <ArticleExplorer
          articles={reports}
          showCategoryFilter={false}
          emptyMessage="公開中の研究レポートはまだありません。"
        />
      </div>
    </div>
  );
}
