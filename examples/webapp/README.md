# タスク管理Webアプリケーション - Kiroチュートリアル用サンプル

このディレクトリには、第2章「本格的なアプリを作ろう」で使用する実践的なタスク管理Webアプリケーションが含まれています。

## 概要

このタスク管理アプリは、以下の学習目的で作成されました：

- 本格的なWebアプリケーション開発の体験
- フロントエンドとバックエンドの連携
- データベース設計と実装
- AWS連携の実践
- CI/CDパイプラインの構築
- チーム開発プロセスの理解

## 機能

### 認証機能
- ✅ ユーザー登録・ログイン
- ✅ JWT認証
- ✅ パスワードリセット
- ✅ プロフィール管理

### タスク管理機能
- ✅ タスクの作成・編集・削除
- ✅ ステータス管理（未着手、進行中、完了）
- ✅ 優先度設定
- ✅ 期限設定
- ✅ 担当者割り当て
- ✅ コメント機能

### プロジェクト管理機能
- ✅ プロジェクト作成・管理
- ✅ チームメンバー管理
- ✅ 権限管理（Admin、Manager、Member）
- ✅ プロジェクトダッシュボード

### リアルタイム機能
- ✅ リアルタイム更新（Socket.io）
- ✅ 通知システム
- ✅ オンライン状態表示

## 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **Tailwind CSS** - スタイリング
- **React Query** - サーバー状態管理
- **React Hook Form** - フォーム管理
- **Socket.io Client** - リアルタイム通信

### バックエンド
- **Node.js** - ランタイム
- **Express** - Webフレームワーク
- **TypeScript** - 型安全性
- **Prisma** - ORM
- **PostgreSQL** - データベース
- **JWT** - 認証
- **Socket.io** - リアルタイム通信
- **Bcrypt** - パスワードハッシュ化

### インフラ・DevOps
- **Docker** - コンテナ化
- **AWS ECS** - コンテナオーケストレーション
- **AWS RDS** - データベース
- **AWS S3** - ファイルストレージ
- **AWS CloudFront** - CDN
- **GitHub Actions** - CI/CD

## プロジェクト構造

```
webapp/
├── frontend/                 # React フロントエンド
│   ├── src/
│   │   ├── components/      # UIコンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── hooks/          # カスタムフック
│   │   ├── services/       # API サービス
│   │   ├── types/          # TypeScript型定義
│   │   ├── utils/          # ユーティリティ
│   │   └── stores/         # 状態管理
│   ├── public/             # 静的ファイル
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/                 # Node.js バックエンド
│   ├── src/
│   │   ├── controllers/    # コントローラー
│   │   ├── services/       # ビジネスロジック
│   │   ├── models/         # データモデル
│   │   ├── middleware/     # ミドルウェア
│   │   ├── routes/         # ルート定義
│   │   ├── utils/          # ユーティリティ
│   │   └── types/          # TypeScript型定義
│   ├── prisma/             # Prismaスキーマ
│   ├── tests/              # テストファイル
│   ├── package.json
│   └── tsconfig.json
├── docker/                  # Docker設定
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── docker-compose.yml
├── .github/                 # GitHub Actions
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── infrastructure/          # AWS設定
│   ├── terraform/          # Terraformファイル
│   └── cloudformation/     # CloudFormationテンプレート
└── docs/                   # ドキュメント
    ├── api.md              # API仕様
    ├── deployment.md       # デプロイ手順
    └── development.md      # 開発環境構築
```

## セットアップ手順

### 1. 前提条件

以下がインストールされていることを確認してください：

- Node.js 18以上
- Docker & Docker Compose
- PostgreSQL（ローカル開発用）
- Git

### 2. リポジトリのクローン

```bash
git clone <repository-url>
cd webapp
```

### 3. 環境変数の設定

```bash
# バックエンド用
cp backend/.env.example backend/.env

# フロントエンド用
cp frontend/.env.example frontend/.env
```

### 4. データベースの起動

```bash
# Docker Composeでデータベース起動
docker-compose up -d postgres
```

### 5. バックエンドのセットアップ

```bash
cd backend

# 依存関係のインストール
npm install

# データベースマイグレーション
npx prisma migrate dev

# シードデータの投入
npx prisma db seed

# 開発サーバー起動
npm run dev
```

### 6. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

### 7. アプリケーションへのアクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- API ドキュメント: http://localhost:8000/api-docs

## 開発ワークフロー

### 1. 機能開発

```bash
# 新しいブランチを作成
git checkout -b feature/task-filtering

# 開発作業...

# テスト実行
npm run test

# コミット
git add .
git commit -m "feat: add task filtering functionality"

# プッシュ
git push origin feature/task-filtering
```

### 2. プルリクエスト

1. GitHub上でプルリクエストを作成
2. CI/CDパイプラインの実行を確認
3. コードレビューを受ける
4. 承認後にマージ

### 3. デプロイ

```bash
# ステージング環境へのデプロイ（自動）
git push origin develop

# 本番環境へのデプロイ（自動）
git push origin main
```

## テスト

### バックエンドテスト

```bash
cd backend

# 単体テスト
npm run test:unit

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:coverage
```

### フロントエンドテスト

```bash
cd frontend

# 単体テスト
npm run test

# E2Eテスト（Playwright）
npm run test:e2e

# 視覚回帰テスト
npm run test:visual
```

## API仕様

### 認証エンドポイント

```
POST /api/auth/register    # ユーザー登録
POST /api/auth/login       # ログイン
POST /api/auth/logout      # ログアウト
POST /api/auth/refresh     # トークン更新
POST /api/auth/reset       # パスワードリセット
```

### タスク管理エンドポイント

```
GET    /api/tasks          # タスク一覧取得
POST   /api/tasks          # タスク作成
GET    /api/tasks/:id      # タスク詳細取得
PUT    /api/tasks/:id      # タスク更新
DELETE /api/tasks/:id      # タスク削除
```

### プロジェクト管理エンドポイント

```
GET    /api/projects       # プロジェクト一覧取得
POST   /api/projects       # プロジェクト作成
GET    /api/projects/:id   # プロジェクト詳細取得
PUT    /api/projects/:id   # プロジェクト更新
DELETE /api/projects/:id   # プロジェクト削除
```

詳細なAPI仕様は [docs/api.md](docs/api.md) を参照してください。

## デプロイメント

### AWS環境

本アプリケーションは以下のAWSサービスを使用します：

- **ECS Fargate**: コンテナ実行環境
- **RDS PostgreSQL**: データベース
- **S3**: ファイルストレージ
- **CloudFront**: CDN
- **ALB**: ロードバランサー
- **Route 53**: DNS
- **ACM**: SSL証明書

### デプロイ手順

1. **インフラ構築**
   ```bash
   cd infrastructure/terraform
   terraform init
   terraform plan
   terraform apply
   ```

2. **アプリケーションデプロイ**
   ```bash
   # GitHub Actionsによる自動デプロイ
   git push origin main
   ```

詳細なデプロイ手順は [docs/deployment.md](docs/deployment.md) を参照してください。

## 監視とログ

### メトリクス監視

- **CloudWatch**: システムメトリクス
- **Application Insights**: アプリケーションメトリクス
- **Custom Metrics**: ビジネスメトリクス

### ログ管理

- **CloudWatch Logs**: アプリケーションログ
- **Structured Logging**: JSON形式のログ
- **Log Aggregation**: ログの集約と検索

### アラート設定

- **Error Rate**: エラー率の監視
- **Response Time**: レスポンス時間の監視
- **Resource Usage**: リソース使用率の監視

## セキュリティ

### 実装済みセキュリティ対策

- **認証・認可**: JWT + RBAC
- **入力検証**: バリデーション + サニタイゼーション
- **SQL インジェクション対策**: Prisma ORM使用
- **XSS対策**: CSP + エスケープ処理
- **CSRF対策**: SameSite Cookie
- **HTTPS**: SSL/TLS暗号化
- **Rate Limiting**: API制限
- **セキュリティヘッダー**: Helmet.js使用

### セキュリティチェック

```bash
# 依存関係の脆弱性チェック
npm audit

# セキュリティテスト
npm run test:security

# OWASP ZAP スキャン
npm run security:scan
```

## パフォーマンス最適化

### フロントエンド最適化

- **Code Splitting**: 動的インポート
- **Lazy Loading**: 遅延読み込み
- **Memoization**: React.memo, useMemo
- **Bundle Optimization**: Tree shaking
- **Image Optimization**: WebP, 適切なサイズ

### バックエンド最適化

- **Database Indexing**: 適切なインデックス
- **Query Optimization**: N+1問題の解決
- **Caching**: Redis キャッシュ
- **Connection Pooling**: データベース接続プール
- **Compression**: Gzip圧縮

## トラブルシューティング

### よくある問題

#### 1. データベース接続エラー

```bash
# データベースの状態確認
docker-compose ps

# ログ確認
docker-compose logs postgres

# 再起動
docker-compose restart postgres
```

#### 2. フロントエンドビルドエラー

```bash
# キャッシュクリア
rm -rf node_modules package-lock.json
npm install

# TypeScriptエラー確認
npm run type-check
```

#### 3. API接続エラー

```bash
# バックエンドサーバーの状態確認
curl http://localhost:8000/health

# ログ確認
npm run logs
```

## 貢献ガイドライン

### コーディング規約

- **TypeScript**: 厳密な型定義
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット
- **Conventional Commits**: コミットメッセージ規約

### プルリクエスト

1. 機能ブランチで開発
2. テストの追加・更新
3. ドキュメントの更新
4. レビューの実施

## ライセンス

このサンプルアプリケーションは学習目的で作成されており、MITライセンスの下で公開されています。

## 関連リンク

- [Kiroチュートリアル](../../README.md)
- [第2章: 本格的なアプリを作ろう](../../docs/chapter2/)
- [API仕様書](docs/api.md)
- [デプロイメントガイド](docs/deployment.md)