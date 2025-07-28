# チーム開発セットアップガイド

## 概要

このガイドでは、Kiroを使用したチーム開発環境のセットアップ方法について説明します。GitHubリポジトリの作成から、Amazon Q DeveloperとGitHub Actionsの統合まで、チーム開発に必要な全ての手順を段階的に解説します。

## 前提条件

- Kiroがローカル環境にインストールされていること
- GitHubアカウントを持っていること
- 基本的なGitの操作に慣れていること
- AWS アカウント（Amazon Q Developer使用時）

## 1. GitHubリポジトリの作成とセットアップ

### 1.1 新しいリポジトリの作成

1. **GitHubでリポジトリを作成**
   ```bash
   # GitHub CLIを使用する場合
   gh repo create my-team-project --public --clone
   
   # または、GitHub Webインターフェースで作成後
   git clone https://github.com/username/my-team-project.git
   cd my-team-project
   ```

2. **基本的なプロジェクト構造の作成**
   ```bash
   # 基本ディレクトリ構造
   mkdir -p src tests docs .kiro/steering .github/workflows
   
   # 基本ファイルの作成
   touch README.md .gitignore
   ```

3. **Kiro設定ファイルの初期化**
   ```bash
   # Kiro設定ディレクトリの確認
   ls -la .kiro/
   
   # 必要に応じてMCP設定を作成
   touch .kiro/settings/mcp.json
   ```

### 1.2 チーム開発用のブランチ戦略

1. **Git Flowの設定**
   ```bash
   # メインブランチの保護
   git checkout -b develop
   git push -u origin develop
   
   # フィーチャーブランチの例
   git checkout -b feature/user-authentication
   ```

2. **ブランチ保護ルールの設定**
   - GitHub Webインターフェースで以下を設定：
     - `main`ブランチへの直接プッシュを禁止
     - プルリクエストレビューを必須に設定
     - ステータスチェックの通過を必須に設定

## 2. Amazon Q Developerの統合

### 2.1 Amazon Q Developerのセットアップ

1. **AWS アカウントでのQ Developer有効化**
   ```bash
   # AWS CLIの設定（必要に応じて）
   aws configure
   ```

2. **VS Code拡張機能のインストール**
   - AWS Toolkit for Visual Studio Code
   - Amazon Q Developer拡張機能

3. **Kiroとの連携設定**
   ```json
   // .kiro/settings/mcp.json の例
   {
     "mcpServers": {
       "aws-docs": {
         "command": "uvx",
         "args": ["awslabs.aws-documentation-mcp-server@latest"],
         "env": {
           "FASTMCP_LOG_LEVEL": "ERROR"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

### 2.2 Q Developerを活用したコード生成

1. **コード生成の基本的な使い方**
   - Kiroのチャットで「#Codebase」を使用してプロジェクト全体のコンテキストを取得
   - Q Developerの提案を参考にしながらKiroでコード生成

2. **ベストプラクティス**
   - コード生成前に要件を明確に定義
   - 生成されたコードのレビューを必ず実施
   - セキュリティ面での検証を怠らない

## 3. GitHub Actionsの統合

### 3.1 基本的なCI/CDパイプラインの設定

1. **基本的なワークフローファイルの作成**  
 ```yaml
   # .github/workflows/ci.yml
   name: CI/CD Pipeline
   
   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main ]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v4
       
       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'
       
       - name: Install dependencies
         run: npm ci
       
       - name: Run tests
         run: npm test
       
       - name: Run linting
         run: npm run lint
   
     build:
       needs: test
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v4
       
       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'
       
       - name: Install dependencies
         run: npm ci
       
       - name: Build application
         run: npm run build
       
       - name: Upload build artifacts
         uses: actions/upload-artifact@v4
         with:
           name: build-files
           path: dist/
   ```

2. **Kiroとの統合を考慮したワークフロー**
   ```yaml
   # .github/workflows/kiro-integration.yml
   name: Kiro Integration Tests
   
   on:
     pull_request:
       branches: [ main, develop ]
   
   jobs:
     kiro-validation:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v4
       
       - name: Validate Kiro configuration
         run: |
           # Kiro設定ファイルの検証
           if [ -f ".kiro/settings/mcp.json" ]; then
             echo "Validating MCP configuration..."
             # JSON形式の検証
             python -m json.tool .kiro/settings/mcp.json > /dev/null
           fi
       
       - name: Check Steering files
         run: |
           # Steeringファイルの存在確認
           if [ -d ".kiro/steering" ]; then
             echo "Found Steering files:"
             find .kiro/steering -name "*.md" -type f
           fi
   ```

### 3.2 自動デプロイメントの設定

1. **ステージング環境への自動デプロイ**
   ```yaml
   # .github/workflows/deploy-staging.yml
   name: Deploy to Staging
   
   on:
     push:
       branches: [ develop ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment: staging
       
       steps:
       - uses: actions/checkout@v4
       
       - name: Deploy to staging
         run: |
           # デプロイスクリプトの実行
           echo "Deploying to staging environment..."
           # 実際のデプロイコマンドをここに記述
   ```

2. **本番環境への手動デプロイ**
   ```yaml
   # .github/workflows/deploy-production.yml
   name: Deploy to Production
   
   on:
     workflow_dispatch:
       inputs:
         version:
           description: 'Version to deploy'
           required: true
           default: 'latest'
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment: production
       
       steps:
       - uses: actions/checkout@v4
       
       - name: Deploy to production
         run: |
           echo "Deploying version ${{ github.event.inputs.version }} to production..."
           # 本番デプロイスクリプト
   ```

## 4. チーム開発のワークフロー

### 4.1 日常的な開発フロー

1. **フィーチャー開発の開始**
   ```bash
   # 最新のdevelopブランチから開始
   git checkout develop
   git pull origin develop
   
   # 新しいフィーチャーブランチを作成
   git checkout -b feature/new-feature
   ```

2. **Kiroを使用した開発**
   ```bash
   # Kiroでスペック作成
   # 1. 要件定義
   # 2. 設計書作成
   # 3. タスクリスト生成
   # 4. 実装
   ```

3. **プルリクエストの作成**
   ```bash
   # 変更をコミット
   git add .
   git commit -m "feat: implement new feature"
   git push origin feature/new-feature
   
   # GitHub CLIでPR作成
   gh pr create --title "New Feature Implementation" --body "Description of changes"
   ```

### 4.2 コードレビューのベストプラクティス

1. **レビュー観点**
   - コードの品質と可読性
   - セキュリティの考慮
   - パフォーマンスへの影響
   - テストカバレッジ
   - ドキュメントの更新

2. **Kiroを活用したレビュー**
   - Kiroにコードレビューを依頼
   - 改善提案の自動生成
   - コーディング規約の確認

## 5. 監視とメンテナンス

### 5.1 プロジェクトの健全性監視

1. **定期的なチェック項目**
   - 依存関係の更新状況
   - セキュリティ脆弱性の確認
   - パフォーマンスメトリクスの監視
   - テストカバレッジの維持

2. **自動化された監視**
   ```yaml
   # .github/workflows/health-check.yml
   name: Project Health Check
   
   on:
     schedule:
       - cron: '0 9 * * 1'  # 毎週月曜日の9時
   
   jobs:
     health-check:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v4
       
       - name: Check dependencies
         run: npm audit
       
       - name: Check for outdated packages
         run: npm outdated
   ```

### 5.2 ドキュメントの維持

1. **README.mdの更新**
   - プロジェクトの現在の状態を反映
   - セットアップ手順の最新化
   - 貢献者ガイドラインの更新

2. **Kiro設定の文書化**
   - MCP設定の説明
   - Steeringファイルの使用方法
   - チーム固有の開発ルール

## 6. トラブルシューティング

### 6.1 よくある問題と解決方法

1. **GitHub Actions の失敗**
   ```bash
   # ログの確認方法
   gh run list
   gh run view <run-id>
   
   # ローカルでのテスト
   act  # GitHub Actions をローカルで実行するツール
   ```

2. **Amazon Q Developer の接続問題**
   - AWS認証情報の確認
   - 権限設定の見直し
   - ネットワーク設定の確認

3. **Kiro設定の問題**
   ```bash
   # MCP設定の検証
   python -m json.tool .kiro/settings/mcp.json
   
   # Steeringファイルの確認
   find .kiro/steering -name "*.md" -exec head -5 {} \;
   ```

### 6.2 パフォーマンス最適化

1. **ビルド時間の短縮**
   - キャッシュの活用
   - 並列処理の導入
   - 不要な処理の削除

2. **リソース使用量の最適化**
   - メモリ使用量の監視
   - CPU使用率の最適化
   - ストレージ容量の管理

## まとめ

このガイドに従って、Kiroを中心としたチーム開発環境を構築することで、効率的で品質の高い開発プロセスを実現できます。重要なポイントは：

- **段階的な導入**: 一度に全てを導入せず、チームの習熟度に合わせて段階的に機能を追加
- **継続的な改善**: 定期的にプロセスを見直し、チームに最適化された方法を見つける
- **ドキュメント化**: 設定や手順を適切に文書化し、チーム全体で共有する
- **自動化の活用**: 繰り返し作業は可能な限り自動化し、開発に集中できる環境を作る

次のステップとして、[Steeringファイル管理戦略ガイド](steering-management.md)でチーム開発における設定管理について学習することをお勧めします。