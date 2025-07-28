# Steeringファイルテンプレート

プロジェクト固有のガイドラインとルールを定義するSteeringファイルのテンプレート集です。チームの開発効率と品質向上に役立ちます。

## 📁 テンプレート一覧

### 基本設定
- [`project-basics.md`](project-basics.md) - プロジェクト基本原則
- [`coding-standards.md`](coding-standards.md) - コーディング規約
- [`architecture-guide.md`](architecture-guide.md) - アーキテクチャガイド
- [`security-guidelines.md`](security-guidelines.md) - セキュリティガイドライン

### 技術別設定
- [`react-standards.md`](react-standards.md) - React開発規約
- [`nodejs-standards.md`](nodejs-standards.md) - Node.js開発規約
- [`typescript-standards.md`](typescript-standards.md) - TypeScript規約
- [`database-standards.md`](database-standards.md) - データベース設計規約

### 役割別設定
- [`frontend-developer.md`](frontend-developer.md) - フロントエンド開発者向け
- [`backend-developer.md`](backend-developer.md) - バックエンド開発者向け
- [`devops-engineer.md`](devops-engineer.md) - DevOpsエンジニア向け
- [`qa-engineer.md`](qa-engineer.md) - QAエンジニア向け

### プロジェクトフェーズ別
- [`mvp-phase.md`](mvp-phase.md) - MVP開発フェーズ
- [`scaling-phase.md`](scaling-phase.md) - スケーリングフェーズ
- [`maintenance-phase.md`](maintenance-phase.md) - 保守フェーズ

## 🚀 使用方法

### 1. 基本設定のコピー

```bash
# 基本的なSteeringファイルをコピー
cp templates/steering/project-basics.md .kiro/steering/
cp templates/steering/coding-standards.md .kiro/steering/
cp templates/steering/architecture-guide.md .kiro/steering/
```

### 2. プロジェクトに合わせてカスタマイズ

```bash
# プレースホルダーを実際の値に置換
sed -i 's/\[PROJECT_NAME\]/my-awesome-project/g' .kiro/steering/*.md
sed -i 's/\[TEAM_NAME\]/awesome-team/g' .kiro/steering/*.md
```

### 3. 条件付き適用の設定

特定のファイルタイプにのみ適用する場合：

```markdown
---
inclusion: fileMatch
fileMatchPattern: '*.tsx'
---

# React コンポーネント規約
```

手動で指定する場合：

```markdown
---
inclusion: manual
---

# MVP開発フェーズ専用ガイド
```

## 📋 テンプレート詳細

### project-basics.md
プロジェクトの基本方針と開発哲学を定義。

**含まれる内容:**
- 開発哲学
- 技術スタック
- 品質基準
- チーム規約

**適用場面:**
- プロジェクト開始時
- 新メンバー参加時
- 方針変更時

### coding-standards.md
コーディング規約とベストプラクティス。

**含まれる内容:**
- 命名規則
- ファイル構成
- コード品質基準
- レビュー基準

**適用場面:**
- 全ての開発作業
- コードレビュー
- 品質チェック

### architecture-guide.md
システム設計の指針とパターン。

**含まれる内容:**
- 設計原則
- アーキテクチャパターン
- データフロー
- セキュリティ考慮事項

**適用場面:**
- 設計フェーズ
- アーキテクチャレビュー
- 技術選択時

## 🔧 カスタマイズ方法

### プレースホルダーの置換

各テンプレートには以下のプレースホルダーが含まれています：

```
[PROJECT_NAME]     → プロジェクト名
[TEAM_NAME]        → チーム名
[TECH_STACK]       → 技術スタック
[DATABASE_TYPE]    → データベース種類
[DEPLOYMENT_ENV]   → デプロイ環境
[CODE_STYLE]       → コードスタイル
[TEST_FRAMEWORK]   → テストフレームワーク
```

### 一括置換スクリプト

```bash
#!/bin/bash
# customize-steering.sh

PROJECT_NAME="my-project"
TEAM_NAME="dev-team"
TECH_STACK="React + Node.js"

# .kiro/steering/ 内の全ファイルを対象に置換
find .kiro/steering/ -name "*.md" -exec sed -i "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" {} \;
find .kiro/steering/ -name "*.md" -exec sed -i "s/\[TEAM_NAME\]/$TEAM_NAME/g" {} \;
find .kiro/steering/ -name "*.md" -exec sed -i "s/\[TECH_STACK\]/$TECH_STACK/g" {} \;
```

### 外部ファイル参照の追加

```markdown
## API設計ガイド

詳細なAPI仕様は以下を参照：
#[[file:docs/api-spec.yaml]]

## データベース設計

スキーマ定義：
#[[file:prisma/schema.prisma]]
```

## 📚 ベストプラクティス

### 1. 段階的な導入

```markdown
# 導入順序の推奨
1. project-basics.md (プロジェクト開始時)
2. coding-standards.md (開発開始時)
3. architecture-guide.md (設計フェーズ)
4. 技術別・役割別ファイル (必要に応じて)
```

### 2. 定期的な見直し

```markdown
# 見直しスケジュール
- 月次: コーディング規約の実効性確認
- 四半期: アーキテクチャガイドの更新
- 半年: プロジェクト基本方針の見直し
```

### 3. チーム合意の形成

```markdown
# 合意形成プロセス
1. ドラフト作成
2. チーム内レビュー
3. 修正・調整
4. 正式採用
5. 定期見直し
```

## 🛠️ トラブルシューティング

### よくある問題

#### 1. Steeringファイルが適用されない

**確認事項:**
```bash
# ファイル配置の確認
ls -la .kiro/steering/

# front-matter構文の確認
head -5 .kiro/steering/project-basics.md
```

#### 2. 設定が競合する

**解決方法:**
```markdown
# 優先順位の明記
---
inclusion: always
priority: high
---
```

#### 3. 外部ファイル参照が機能しない

**確認事項:**
```bash
# 参照先ファイルの存在確認
ls -la docs/api-spec.yaml

# パスの確認（相対パス）
```

## 📈 効果測定

### メトリクス例

```markdown
# 効果測定指標
- コードレビュー指摘事項の減少
- 開発速度の向上
- バグ発生率の低下
- チーム内認識の統一度
- 新メンバーのオンボーディング時間短縮
```

### 改善サイクル

```markdown
# 継続的改善プロセス
1. メトリクス収集
2. 問題点の特定
3. Steeringファイルの更新
4. 効果測定
5. フィードバック収集
```

## 🔄 更新履歴

- v1.0.0: 基本テンプレート作成
- v1.1.0: 技術別テンプレート追加
- v1.2.0: 役割別テンプレート追加
- v1.3.0: フェーズ別テンプレート追加