# MCP設定テンプレート

Model Context Protocol（MCP）の設定テンプレート集です。プロジェクトの種類や開発環境に応じて適切なテンプレートを選択してください。

## 📁 テンプレート一覧

### 基本設定
- [`basic-mcp.json`](basic-mcp.json) - 最小限のMCP設定
- [`standard-mcp.json`](standard-mcp.json) - 標準的な開発環境用設定
- [`enterprise-mcp.json`](enterprise-mcp.json) - エンタープライズ環境用設定

### 開発タイプ別設定
- [`web-development.json`](web-development.json) - Webアプリケーション開発用
- [`api-development.json`](api-development.json) - API開発用
- [`frontend-development.json`](frontend-development.json) - フロントエンド開発用
- [`mobile-development.json`](mobile-development.json) - モバイルアプリ開発用

### クラウドプロバイダー別設定
- [`aws-focused.json`](aws-focused.json) - AWS中心の開発環境
- [`azure-focused.json`](azure-focused.json) - Azure中心の開発環境
- [`gcp-focused.json`](gcp-focused.json) - Google Cloud中心の開発環境

## 🚀 使用方法

### 1. テンプレートの選択

プロジェクトに最適なテンプレートを選択：

```bash
# Webアプリケーション開発の場合
cp templates/mcp/web-development.json .kiro/settings/mcp.json

# API開発の場合
cp templates/mcp/api-development.json .kiro/settings/mcp.json
```

### 2. 設定のカスタマイズ

テンプレートをプロジェクトに合わせて調整：

```json
{
  "mcpServers": {
    "awslabs.aws-documentation-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR",
        "AWS_DOCUMENTATION_PARTITION": "aws"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 3. 設定の確認

```bash
# 設定ファイルの構文チェック
cat .kiro/settings/mcp.json | python -m json.tool

# Kiroでの設定確認
# Kiroを再起動して設定を読み込み
```

## 📋 テンプレート詳細

### basic-mcp.json
最小限の設定で、学習や小規模プロジェクトに適用。

**含まれるMCPサーバー:**
- AWS Documentation MCP

**適用場面:**
- Kiroの学習
- 個人プロジェクト
- プロトタイプ開発

### standard-mcp.json
一般的な開発プロジェクトに適した標準設定。

**含まれるMCPサーバー:**
- AWS Documentation MCP
- GitHub MCP
- Playwright MCP

**適用場面:**
- チーム開発
- 商用プロジェクト
- 継続的な開発

### web-development.json
Webアプリケーション開発に特化した設定。

**含まれるMCPサーバー:**
- AWS Documentation MCP
- GitHub MCP
- Playwright MCP
- Database MCP
- Docker MCP

**適用場面:**
- フルスタックWeb開発
- SPA開発
- PWA開発

## 🔧 カスタマイズ方法

### 環境変数の設定

```json
{
  "mcpServers": {
    "server-name": {
      "env": {
        "FASTMCP_LOG_LEVEL": "DEBUG",  // 開発時はDEBUG、本番はERROR
        "AWS_REGION": "[AWS_REGION]",
        "CUSTOM_CONFIG": "[YOUR_VALUE]"
      }
    }
  }
}
```

### autoApproveの設定

```json
{
  "mcpServers": {
    "server-name": {
      "autoApprove": [
        "safe_operation_1",
        "safe_operation_2"
      ]
    }
  }
}
```

### 条件付き有効化

```json
{
  "mcpServers": {
    "development-only-server": {
      "disabled": false,  // 開発環境では有効
      "command": "uvx",
      "args": ["dev-server@latest"]
    },
    "production-server": {
      "disabled": true,   // 開発環境では無効
      "command": "uvx",
      "args": ["prod-server@latest"]
    }
  }
}
```

## 🛠️ トラブルシューティング

### よくある問題

#### 1. MCPサーバーが起動しない

**症状:**
```
Error: Failed to start MCP server 'server-name'
```

**解決方法:**
```bash
# uvの確認
uv --version

# 手動でサーバーを起動してテスト
uvx server-package@latest

# 設定ファイルの構文確認
cat .kiro/settings/mcp.json | python -m json.tool
```

#### 2. 権限エラー

**症状:**
```
Permission denied when executing MCP server
```

**解決方法:**
```bash
# 実行権限の確認
which uvx
ls -la $(which uvx)

# パスの設定
export PATH="$HOME/.local/bin:$PATH"
```

#### 3. 設定が反映されない

**症状:**
MCPサーバーの変更が反映されない

**解決方法:**
```bash
# Kiroの再起動
# または MCP Server viewから再接続
```

## 📚 関連ドキュメント

- [Kiro MCP公式ドキュメント](https://kiro.dev/docs/mcp)
- [AWS Documentation MCP](https://awslabs.github.io/mcp/servers/aws-documentation-mcp-server)
- [GitHub MCP](https://github.com/modelcontextprotocol/servers)
- [Playwright MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/playwright)

## 🔄 更新履歴

- v1.0.0: 初期テンプレート作成
- v1.1.0: AWS中心設定を追加
- v1.2.0: モバイル開発用設定を追加

---

<div align="center">

| [← テンプレート一覧](../README.md) | [🏠 目次](../../README.md) |
|:---:|:---:|

</div>

---

### 🔗 関連リソース
- [🧪 Playwright MCPテスト](../../docs/chapter1/playwright-mcp-testing.md)
- [⚙️ AWS MCP設定](../../docs/chapter2/aws-mcp-setup.md)
- [🛠️ トラブルシューティング](../../docs/troubleshooting/common-issues.md)