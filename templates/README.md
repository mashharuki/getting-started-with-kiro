# 設定ファイルテンプレート集

このディレクトリには、Kiroを使った開発で頻繁に使用される設定ファイルのテンプレートが含まれています。これらのテンプレートを使用することで、プロジェクトのセットアップを効率化できます。

## 📁 テンプレート一覧

### MCP設定
- [`mcp/`](mcp/) - Model Context Protocol設定テンプレート
  - AWS Documentation MCP
  - GitHub MCP
  - Playwright MCP
  - カスタムMCP設定例

### Steeringファイル
- [`steering/`](steering/) - プロジェクト固有のガイドライン
  - プロジェクト基本原則
  - コーディング規約
  - アーキテクチャガイド
  - セキュリティガイドライン

### CI/CD設定
- [`cicd/`](cicd/) - 継続的インテグレーション・デプロイメント
  - GitHub Actions ワークフロー
  - Docker設定
  - AWS デプロイメント
  - テスト設定

### 開発環境
- [`development/`](development/) - 開発環境設定
  - VS Code設定
  - ESLint/Prettier設定
  - TypeScript設定
  - パッケージ管理

## 🚀 使用方法

### 1. テンプレートのコピー

```bash
# 必要なテンプレートをプロジェクトにコピー
cp templates/mcp/basic-mcp.json .kiro/settings/mcp.json
cp templates/steering/project-basics.md .kiro/steering/
```

### 2. プロジェクトに合わせてカスタマイズ

各テンプレートには `[PROJECT_NAME]` や `[YOUR_VALUE]` などのプレースホルダーが含まれています。これらをプロジェクトの実際の値に置き換えてください。

### 3. 設定の確認

```bash
# MCP設定の確認
cat .kiro/settings/mcp.json

# Steeringファイルの確認
ls -la .kiro/steering/
```

## 📋 テンプレート選択ガイド

### プロジェクトタイプ別推奨テンプレート

#### Webアプリケーション開発
```
✅ mcp/web-development.json
✅ steering/web-app-standards.md
✅ cicd/web-app-pipeline.yml
✅ development/web-dev-config/
```

#### API開発
```
✅ mcp/api-development.json
✅ steering/api-standards.md
✅ cicd/api-pipeline.yml
✅ development/api-dev-config/
```

#### フロントエンド開発
```
✅ mcp/frontend-development.json
✅ steering/frontend-standards.md
✅ cicd/frontend-pipeline.yml
✅ development/frontend-config/
```

#### モバイルアプリ開発
```
✅ mcp/mobile-development.json
✅ steering/mobile-standards.md
✅ cicd/mobile-pipeline.yml
✅ development/mobile-config/
```

### チーム規模別推奨設定

#### 個人開発
- 基本的なMCP設定
- シンプルなSteering設定
- 軽量なCI/CD設定

#### 小規模チーム（2-5人）
- 標準的なMCP設定
- チーム共通のSteering設定
- 基本的なCI/CD + レビュー設定

#### 中規模チーム（6-20人）
- 拡張MCP設定
- 役割別Steering設定
- 包括的なCI/CD + 品質ゲート

#### 大規模チーム（20人以上）
- エンタープライズMCP設定
- 部門別Steering設定
- 高度なCI/CD + セキュリティ設定

## 🔧 カスタマイズガイド

### プレースホルダーの置換

各テンプレートには以下のプレースホルダーが含まれています：

```
[PROJECT_NAME]     → プロジェクト名
[TEAM_NAME]        → チーム名
[REPOSITORY_URL]   → GitHubリポジトリURL
[AWS_REGION]       → AWSリージョン
[NODE_VERSION]     → Node.jsバージョン
[PYTHON_VERSION]   → Pythonバージョン
[YOUR_EMAIL]       → メールアドレス
[YOUR_NAME]        → 名前
[COMPANY_NAME]     → 会社名
```

### 一括置換スクリプト

```bash
#!/bin/bash
# setup-templates.sh

PROJECT_NAME="my-awesome-project"
TEAM_NAME="awesome-team"
REPOSITORY_URL="https://github.com/user/repo"

# プレースホルダーを一括置換
find .kiro/ -type f -name "*.md" -o -name "*.json" | xargs sed -i "s/\[PROJECT_NAME\]/$PROJECT_NAME/g"
find .kiro/ -type f -name "*.md" -o -name "*.json" | xargs sed -i "s/\[TEAM_NAME\]/$TEAM_NAME/g"
find .kiro/ -type f -name "*.md" -o -name "*.json" | xargs sed -i "s|\[REPOSITORY_URL\]|$REPOSITORY_URL|g"
```

## 📚 詳細ドキュメント

各テンプレートの詳細な使用方法については、以下のドキュメントを参照してください：

- [MCP設定ガイド](mcp/README.md)
- [Steeringファイルガイド](steering/README.md)
- [CI/CD設定ガイド](cicd/README.md)
- [開発環境設定ガイド](development/README.md)

## 🤝 貢献

新しいテンプレートの追加や既存テンプレートの改善については、以下の手順で貢献できます：

1. 新しいテンプレートを作成
2. 適切なドキュメントを追加
3. 使用例とテスト手順を含める
4. プルリクエストを作成

## 📄 ライセンス

これらのテンプレートは学習目的で作成されており、自由に使用・改変できます。