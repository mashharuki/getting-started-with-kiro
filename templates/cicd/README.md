# CI/CD設定テンプレート

継続的インテグレーション・デプロイメント（CI/CD）の設定テンプレート集です。プロジェクトの規模や要件に応じて適切なテンプレートを選択してください。

## 📁 テンプレート一覧

### GitHub Actions
- [`basic-ci.yml`](github-actions/basic-ci.yml) - 基本的なCI設定
- [`web-app-ci.yml`](github-actions/web-app-ci.yml) - Webアプリケーション用CI
- [`api-ci.yml`](github-actions/api-ci.yml) - API開発用CI
- [`deploy-aws.yml`](github-actions/deploy-aws.yml) - AWS デプロイメント
- [`deploy-vercel.yml`](github-actions/deploy-vercel.yml) - Vercel デプロイメント

### Docker設定
- [`basic-dockerfile`](docker/basic-dockerfile) - 基本的なDockerfile
- [`multi-stage-dockerfile`](docker/multi-stage-dockerfile) - マルチステージビルド
- [`docker-compose.dev.yml`](docker/docker-compose.dev.yml) - 開発環境用
- [`docker-compose.prod.yml`](docker/docker-compose.prod.yml) - 本番環境用

### テスト設定
- [`jest.config.js`](testing/jest.config.js) - Jest設定
- [`playwright.config.ts`](testing/playwright.config.ts) - Playwright設定
- [`vitest.config.ts`](testing/vitest.config.ts) - Vitest設定
- [`cypress.config.js`](testing/cypress.config.js) - Cypress設定

### 品質チェック
- [`eslint.config.js`](quality/eslint.config.js) - ESLint設定
- [`prettier.config.js`](quality/prettier.config.js) - Prettier設定
- [`sonar-project.properties`](quality/sonar-project.properties) - SonarQube設定
- [`codecov.yml`](quality/codecov.yml) - Codecov設定

## 🚀 使用方法

### 1. 基本的なCI/CD設定

```bash
# GitHub Actions ワークフローをコピー
mkdir -p .github/workflows
cp templates/cicd/github-actions/web-app-ci.yml .github/workflows/ci.yml

# Docker設定をコピー
cp templates/cicd/docker/basic-dockerfile Dockerfile
cp templates/cicd/docker/docker-compose.dev.yml docker-compose.yml
```

### 2. プロジェクトに合わせてカスタマイズ

```bash
# プレースホルダーを実際の値に置換
sed -i 's/\[PROJECT_NAME\]/my-project/g' .github/workflows/ci.yml
sed -i 's/\[NODE_VERSION\]/18/g' .github/workflows/ci.yml
sed -i 's/\[AWS_REGION\]/ap-northeast-1/g' .github/workflows/ci.yml
```

### 3. シークレットの設定

GitHub リポジトリの Settings > Secrets で以下を設定：

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
DOCKER_USERNAME
DOCKER_PASSWORD
SLACK_WEBHOOK_URL
```

## 📋 テンプレート詳細

### basic-ci.yml
最小限のCI設定で、コード品質チェックと基本テストを実行。

**含まれる処理:**
- コード品質チェック（ESLint, Prettier）
- 単体テスト実行
- ビルド確認

**適用場面:**
- 個人プロジェクト
- プロトタイプ開発
- 学習プロジェクト

### web-app-ci.yml
Webアプリケーション開発に特化したCI設定。

**含まれる処理:**
- フロントエンド・バックエンドの並列テスト
- E2Eテスト実行
- セキュリティスキャン
- Docker イメージビルド

**適用場面:**
- フルスタックWeb開発
- チーム開発
- 商用プロジェクト

### deploy-aws.yml
AWS環境への自動デプロイ設定。

**含まれる処理:**
- ECRへのイメージプッシュ
- ECSサービス更新
- データベースマイグレーション
- ヘルスチェック

**適用場面:**
- AWS環境での運用
- 本番デプロイメント
- 継続的デリバリー

## 🔧 カスタマイズ方法

### 環境変数の設定

```yaml
env:
  NODE_VERSION: '[NODE_VERSION]'
  PYTHON_VERSION: '[PYTHON_VERSION]'
  AWS_REGION: '[AWS_REGION]'
  PROJECT_NAME: '[PROJECT_NAME]'
```

### 条件付き実行

```yaml
# 特定のブランチでのみ実行
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

# 手動実行オプション
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
```

### 並列実行の設定

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest, macos-latest]
```

### キャッシュの活用

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## 🛠️ トラブルシューティング

### よくある問題

#### 1. テストが不安定

**症状:**
```
Tests are flaky and sometimes fail
```

**解決方法:**
```yaml
# リトライ機能の追加
- name: Run tests with retry
  run: |
    for i in {1..3}; do
      npm test && break
      echo "Test failed, retrying..."
      sleep 10
    done
```

#### 2. ビルド時間が長い

**症状:**
```
CI pipeline takes too long to complete
```

**解決方法:**
```yaml
# 並列実行とキャッシュの活用
strategy:
  matrix:
    test-group: [unit, integration, e2e]

- uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
```

#### 3. デプロイが失敗する

**症状:**
```
Deployment fails with permission errors
```

**解決方法:**
```yaml
# 適切な権限設定
permissions:
  contents: read
  packages: write
  id-token: write

# IAMロールの使用
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: ${{ env.AWS_REGION }}
```

## 📚 ベストプラクティス

### 1. セキュリティ

```yaml
# シークレットの適切な管理
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  API_KEY: ${{ secrets.API_KEY }}

# 最小権限の原則
permissions:
  contents: read
  pull-requests: write
```

### 2. パフォーマンス

```yaml
# 効率的なキャッシュ戦略
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cache
      node_modules
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json') }}
```

### 3. 可読性

```yaml
# 明確なジョブ名とステップ名
jobs:
  code-quality:
    name: Code Quality Check
    steps:
    - name: Run ESLint
      run: npm run lint
    
    - name: Check code formatting
      run: npm run format:check
```

### 4. 監視とアラート

```yaml
# 失敗時の通知
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: 'CI Pipeline failed!'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 📈 メトリクスと改善

### 測定指標

```yaml
# パフォーマンスメトリクス
- name: Measure build time
  run: |
    echo "Build started at: $(date)"
    npm run build
    echo "Build completed at: $(date)"

# テストメトリクス
- name: Generate test report
  run: npm run test:coverage
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

### 継続的改善

```markdown
# 改善サイクル
1. メトリクス収集
2. ボトルネック特定
3. 最適化実施
4. 効果測定
5. フィードバック反映
```

## 🔄 更新履歴

- v1.0.0: 基本テンプレート作成
- v1.1.0: AWS デプロイテンプレート追加
- v1.2.0: セキュリティスキャン強化
- v1.3.0: パフォーマンス最適化