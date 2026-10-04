/**
 * サイト全体の設定。
 * 運営者情報・連絡先は実在するものだけを設定してください（未設定なら画面にも出ません）。
 */
export const siteConfig = {
  name: '無料でできること研究所',
  tagline: 'お金をかけずに、できることを増やそう。',
  description:
    '無料ツールやサービスを実際に試して、便利な使い方や新しい可能性を発見する研究メディア。',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  locale: 'ja_JP',
  /** お問い合わせ用メールアドレス。未設定(null)のときは「準備中」案内を表示します */
  contactEmail: null as string | null,
  /**
   * 将来の収益化用スイッチ。
   * 広告枠(AdSlot)は enabled が false の間は何も描画しません。
   * 特定の広告サービスには依存していません。
   */
  ads: { enabled: false },
};
