# よくある問題と解決方法

このドキュメントでは、Kiroを使用する際によく遭遇する問題とその解決方法を説明します。問題が発生した際は、まずこちらを確認してください。

## インストール関連の問題

### 1. Kiroがインストールできない

**症状:**
- インストールコマンドが失敗する
- 権限エラーが表示される

**原因と解決方法:**

#### Node.jsのバージョンが古い
```bash
# Node.jsのバージョンを確認
node --version

# 推奨: Node.js 18以上を使用
# Node.jsを最新版にアップデート
```

#### 権限の問題（macOS/Linux）
```bash
# sudoを使用してインストール
sudo npm install -g kiro

# または、npmの権限設定を変更
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

#### ネットワーク接続の問題
```bash
# プロキシ設定が必要な場合
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### 2. Kiroコマンドが見つからない

**症状:**
```
kiro: command not found
```

**解決方法:**
```bash
# PATHの確認
echo $PATH

# npmのグローバルインストールパスを確認
npm config get prefix

# .bashrcまたは.zshrcにパスを追加
export PATH="$(npm config get prefix)/bin:$PATH"
```

## 設定関連の問題

### 3. MCP設定が反映されない

**症状:**
- MCP設定を追加したが、ツールが使用できない
- 設定ファイルを変更しても反映されない

**解決方法:**

#### 設定ファイルの場所を確認
```bash
# ワークスペース設定
.kiro/settings/mcp.json

# ユーザー設定（グローバル）
~/.kiro/settings/mcp.json
```

#### JSON形式の確認
```json
{
  "mcpServers": {
    "server-name": {
      "command": "uvx",
      "args": ["package-name@latest"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

#### MCPサーバーの再接続
1. Kiroの設定画面を開く
2. MCP Server viewで該当サーバーを確認
3. 必要に応じて再接続を実行

### 4. Steeringファイルが適用されない

**症状:**
- Steeringファイルを作成したが、AIの動作が変わらない
- 設定が無視されているように見える

**解決方法:**

#### ファイルの配置場所を確認
```
.kiro/steering/
├── always-included.md     # 常に適用
├── conditional.md         # 条件付き適用
└── manual.md             # 手動適用
```

#### Front-matter設定の確認
```markdown
---
inclusion: fileMatch
fileMatchPattern: "*.js"
---

# Steering内容
```

#### ファイル名とパターンの確認
- ファイル名に特殊文字が含まれていないか
- パターンマッチングが正しく設定されているか

## 使用時の問題

### 5. AIの応答が期待と異なる

**症状:**
- AIが意図しない動作をする
- 生成されるコードが要求と合わない

**解決方法:**

#### コンテキストの確認
```bash
# 現在のコンテキストを確認
#File, #Folder, #Problems, #Terminal, #Git Diff, #Codebase
```

#### プロンプトの改善
- より具体的な指示を与える
- 期待する結果の例を示す
- ステップバイステップで指示する

#### Steeringファイルの活用
```markdown
# プロジェクト固有のルール
- コーディング規約
- 使用するライブラリ
- 避けるべきパターン
```

### 6. ファイル操作でエラーが発生する

**症状:**
```
Permission denied
File not found
Cannot write to file
```

**解決方法:**

#### ファイル権限の確認
```bash
# ファイル権限を確認
ls -la filename

# 権限を変更
chmod 644 filename
```

#### ディスク容量の確認
```bash
# ディスク使用量を確認
df -h

# 不要なファイルを削除
```

#### ファイルロックの解除
- 他のエディタでファイルが開かれていないか確認
- プロセスが異常終了していないか確認

### 7. パフォーマンスの問題

**症状:**
- Kiroの動作が遅い
- 応答に時間がかかる

**解決方法:**

#### メモリ使用量の確認
```bash
# メモリ使用量を確認
top
htop  # より詳細な情報
```

#### 大きなファイルの除外
```gitignore
# .gitignoreに追加
node_modules/
*.log
dist/
build/
```

#### コンテキストサイズの調整
- 不要なファイルをコンテキストから除外
- 大きなファイルは部分的に読み込み

## エラーメッセージ別対処法

### "Connection refused"
**原因:** ネットワーク接続の問題
**解決方法:**
1. インターネット接続を確認
2. ファイアウォール設定を確認
3. プロキシ設定を確認

### "Authentication failed"
**原因:** 認証情報の問題
**解決方法:**
1. APIキーの確認
2. 認証情報の再設定
3. アカウント状態の確認

### "Rate limit exceeded"
**原因:** API使用制限に達した
**解決方法:**
1. しばらく待ってから再試行
2. 使用頻度を調整
3. プランのアップグレードを検討

### "Invalid JSON format"
**原因:** 設定ファイルのJSON形式が不正
**解決方法:**
1. JSON形式を確認
2. オンラインJSONバリデーターを使用
3. 設定ファイルを再作成

## トラブルシューティングの手順

### 1. 基本的な確認事項
1. Kiroのバージョンを確認
2. 設定ファイルの内容を確認
3. エラーメッセージを記録
4. 再現手順を整理

### 2. ログの確認
```bash
# Kiroのログを確認
kiro --verbose

# システムログを確認（macOS）
log show --predicate 'process == "kiro"' --last 1h

# システムログを確認（Linux）
journalctl -u kiro --since "1 hour ago"
```

### 3. 設定のリセット
```bash
# 設定をバックアップ
cp -r .kiro .kiro.backup

# 設定をリセット
rm -rf .kiro
kiro init
```

### 4. 再インストール
```bash
# Kiroをアンインストール
npm uninstall -g kiro

# キャッシュをクリア
npm cache clean --force

# 再インストール
npm install -g kiro@latest
```

## サポートを求める前に

問題が解決しない場合は、以下の情報を準備してからサポートに連絡してください：

### 必要な情報
1. **環境情報**
   - OS（macOS、Windows、Linux）
   - Node.jsのバージョン
   - Kiroのバージョン

2. **エラー情報**
   - 正確なエラーメッセージ
   - エラーが発生する手順
   - 期待していた動作

3. **設定情報**
   - 関連する設定ファイルの内容
   - 使用しているMCPサーバー
   - Steeringファイルの設定

### 情報収集コマンド
```bash
# システム情報を収集
echo "OS: $(uname -a)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Kiro: $(kiro --version)"

# 設定情報を確認
cat .kiro/settings/mcp.json
ls -la .kiro/steering/
```

## 関連リンク

- [Kiro公式ドキュメント](https://kiro.dev)
- [GitHub Issues](https://github.com/kiro/kiro/issues)
- [コミュニティフォーラム](https://community.kiro.dev)
- [FAQ](./faq.md)

---

**注意:** このドキュメントは定期的に更新されます。最新の情報については公式ドキュメントを確認してください。---


## 🧭 ナビゲーション

| 前へ | 目次 | 次へ |
|------|------|------|
| [🧠 3.4 コンテキスト・メモリ管理](../chapter3/context-memory-management.md) | [📖 目次](../../README.md) | [❓ FAQ](faq.md) |

### 📍 現在の位置
**サポートリソース** > **よくある問題** ← 現在ここ

### 🔗 関連リンク
- [❓ FAQ](faq.md)
- [📁 サンプルプロジェクト](../../examples/)
- [📖 目次](../../README.md)