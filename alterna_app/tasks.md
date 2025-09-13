# 実装計画

- [ ] 1. プロジェクト環境構築とSupabase設定
  - Next.js 15プロジェクトの初期化とTypeScript設定
  - Supabaseプロジェクト作成とローカル開発環境構築
  - 環境変数管理の設定（.env.example作成、.gitignore設定）
  - GitHub Codespaces Secretsの設定（公開/非公開区分に注意）
    - 公開可: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
    - 非公開: SUPABASE_SERVICE_ROLE_KEY
  - _要件: 要件3, 要件4, 要件5_

- [ ] 2. データベーススキーマとセキュリティ設定
  - [ ] 2.1 基本テーブル作成
    - API契約（signed_url）を前提
    - sources_raw（source, url, title, content, published_at列を含む）、al_tr_events（url列にUNIQUE制約）、al_tr_performanceテーブルの作成
    - al_offering_snapsテーブルの作成とユニーク制約設定
    - パフォーマンス向上インデックスの作成：
      - al_tr_events_published_idx (published_at DESC)
      - al_tr_events_event_type_idx (event_type)
      - al_offering_snaps_captured_idx (captured_at DESC)
    - _要件: 要件7_

  - [ ] 2.2 Row Level Security (RLS) 設定
    - ニュース系テーブルの匿名SELECT許可ポリシー作成
    - al_offering_snapsテーブルの完全プライベート設定
    - Storageバケット作成とプライベート設定
    - Storageポリシー作成（バケット限定条件付き、Service Role専用）
    - _要件: 要件4_

- [ ] 3. バックエンドAPI実装
  - [ ] 3.1 Supabaseクライアント設定
    - クライアント用Supabaseクライアント実装（lib/supabase/client.ts）
    - サーバー用Service Roleクライアント実装（lib/supabase/service-role.ts）
    - import "server-only"によるサーバー専用保護
    - 環境変数の適切な分離（NEXT_PUBLIC_プレフィックス管理）
    - _要件: 要件4, 要件5_

  - [ ] 3.2 署名付きURL生成API
    - app/api/snapshots/route.ts実装（export const runtime = "nodejs"）
    - lib/supabase/service-role.tsを使用した安全な画像アクセス機能
    - エラーハンドリングとログ記録
    - _要件: 要件2, 要件4_

- [ ] 4. RSS取得バッチ処理実装
  - [ ] 4.1 Edge Function基盤構築
    - supabase/functions/fetch-feeds/index.ts作成
    - RSS XMLパース機能実装
    - 複数ソースの並列処理実装
    - _要件: 要件3_

  - [ ] 4.2 データ正規化とエラーハンドリング
    - RSS データのal_tr_eventsテーブルへの正規化保存
    - ネットワークエラーとタイムアウト処理
    - 部分的成功時の継続処理実装
    - _要件: 要件3_

- [ ] 5. フロントエンド基盤実装
  - [ ] 5.1 基本レイアウトとナビゲーション
    - app/layout.tsx実装（レスポンシブデザイン、タブナビ常設）
    - components/Navigation.tsx実装（`/`と`/snapshots`間のタブナビゲーション）
    - 基本的なUIコンポーネント作成
    - _要件: 要件6_

  - [ ] 5.2 データフェッチングフックと用語統一
    - lib/constants.ts実装（イベント種別・申込方式の定数とラベル定義）
    - hooks/useNews.ts実装（React Query使用）
    - hooks/useSnapshots.ts実装
    - エラーハンドリングとローディング状態管理
    - _要件: 要件1, 要件2_

- [ ] 6. ニュースタイムライン機能実装
  - [ ] 6.1 ニュース表示コンポーネント
    - components/NewsTimeline.tsx実装
    - components/NewsCard.tsx実装（イベント種別タグ、利回り、投資額表示）
    - 公開日時降順ソート機能
    - _要件: 要件1_

  - [ ] 6.2 フィルタリング機能
    - components/FilterPanel.tsx実装
    - 期間、種別、抽選/先着ステータスによるフィルタ
    - URLパラメータとの同期
    - _要件: 要件1_

- [ ] 7. スナップショット表示機能実装
  - [ ] 7.1 スナップショット一覧ページ（/snapshots）
    - app/snapshots/page.tsx実装
    - components/SnapshotGrid.tsx実装（グリッド形式表示）
    - Next.js Imageコンポーネントによる最適化
    - _要件: 要件2_

  - [ ] 7.2 署名付きURL API連携
    - GET /api/snapshots API契約に準拠した実装
    - {ok: boolean, items: Array<{...signed_url: string|null}>}形式のレスポンス処理
    - 画像クリック時の元URLリダイレクト機能
    - 画像読み込みエラー時のフォールバック
    - _要件: 要件2, 要件4_

- [ ] 8. エラーハンドリングとユーザビリティ向上
  - [ ] 8.1 エラー境界とフォールバック
    - React Error Boundaryコンポーネント実装
    - ローディングスケルトンコンポーネント作成
    - ネットワークエラー時の再試行機能
    - _要件: 要件6_

  - [ ] 8.2 パフォーマンス最適化
    - React Queryキャッシュ設定
    - 画像遅延読み込み実装
    - コード分割とdynamic import設定
    - _要件: 要件6_

- [ ] 9. テスト実装
  - [ ] 9.1 単体テスト
    - コンポーネントテスト（Jest + React Testing Library）
    - フックテスト実装
    - ユーティリティ関数テスト
    - _要件: 全要件の品質保証_

  - [ ] 9.2 統合テスト
    - API Routeテスト実装
    - Edge Functionテスト
    - データベースRLSポリシーテスト
    - _要件: 要件3, 要件4_

- [ ] 10. CI/CD設定とデプロイ準備
  - [ ] 10.1 GitHub Actions設定
    - .github/workflows/ci.yml作成
    - GitHub Actions Secretsの設定
    - lint、test、buildの自動実行設定
    - _要件: 要件5_

  - [ ] 10.2 本番環境デプロイ
    - Vercel環境変数設定
    - 本番環境でのSupabase接続確認
    - Edge Functionのスケジューラ設定
    - _要件: 要件3, 要件4_

- [ ] 11. 最終テストと調整
  - [ ] 11.1 E2Eテスト
    - Playwrightを使用したE2Eテスト実装
    - タブナビゲーション（`/` ↔ `/snapshots`）のテスト
    - ユーザーフロー全体のテスト
    - レスポンシブデザインテスト
    - _要件: 要件1, 要件2, 要件6_

  - [ ] 11.2 セキュリティ検証
    - 環境変数漏洩チェック
    - RLSポリシー動作確認
    - 署名付きURL有効期限テスト
    - _要件: 要件4, 要件5_