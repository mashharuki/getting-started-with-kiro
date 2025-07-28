# テトリスゲーム - Kiroチュートリアル用サンプル

このディレクトリには、Kiroを使った開発プロセスを学習するための完全に動作するテトリスゲームが含まれています。

## 概要

このテトリスゲームは、以下の学習目的で作成されました：

- Kiroを使った実際の開発プロセスの体験
- スペック駆動開発の実践例
- AIとの協働による効率的な開発手法の理解
- 完成したアプリケーションの動作確認

## 機能

### 基本機能
- ✅ 7種類のテトリミノ（I, O, T, S, Z, J, L）
- ✅ ブロックの移動（左右、下）
- ✅ ブロックの回転
- ✅ ライン消去機能
- ✅ スコア計算
- ✅ レベルシステム
- ✅ ゲームオーバー判定

### 追加機能
- ✅ 次のピースのプレビュー
- ✅ ハードドロップ（スペースキー）
- ✅ 一時停止機能
- ✅ レスポンシブデザイン
- ✅ 視覚的なエフェクト

## 操作方法

| キー | 動作 |
|------|------|
| ← → | ブロックの左右移動 |
| ↓ | ブロックの高速落下 |
| ↑ | ブロックの回転 |
| Space | ハードドロップ（一気に落下） |
| P | ゲームの一時停止/再開 |

## ファイル構成

```
tetris/
├── index.html      # メインHTMLファイル
├── style.css       # スタイルシート
├── script.js       # ゲームロジック
└── README.md       # このファイル
```

## 実行方法

### 1. ローカルサーバーでの実行

#### Python を使用する場合
```bash
# Python 3の場合
python -m http.server 8000

# Python 2の場合
python -m SimpleHTTPServer 8000
```

#### Node.js を使用する場合
```bash
# http-serverをインストール（初回のみ）
npm install -g http-server

# サーバー起動
http-server
```

#### Live Server（VS Code拡張）を使用する場合
1. VS Codeで`index.html`を開く
2. 右クリック → `Open with Live Server`

### 2. ブラウザでアクセス

ローカルサーバー起動後、ブラウザで以下にアクセス：
- `http://localhost:8000`

## 技術仕様

### 使用技術
- **HTML5**: ゲーム画面の構造
- **CSS3**: スタイリングとレスポンシブデザイン
- **JavaScript (ES6+)**: ゲームロジックと描画
- **Canvas API**: ゲーム画面の描画

### ゲーム仕様
- **ボードサイズ**: 10×20ブロック
- **ブロックサイズ**: 30×30ピクセル
- **フレームレート**: 60 FPS（requestAnimationFrame使用）
- **落下間隔**: レベルに応じて調整（初期値: 1秒）

## コード構造

### メインクラス: `TetrisGame`

```javascript
class TetrisGame {
    constructor()           // ゲーム初期化
    createEmptyBoard()      // 空のボード作成
    setupEventListeners()   // イベント設定
    handleKeyPress()        // キー入力処理
    startNewGame()          // 新ゲーム開始
    createRandomPiece()     // ランダムピース生成
    spawnNewPiece()         // 新ピース出現
    movePiece()            // ピース移動
    rotatePiece()          // ピース回転
    checkCollision()       // 衝突判定
    placePiece()           // ピース固定
    clearLines()           // ライン消去
    updateScore()          // スコア更新
    gameLoop()             // メインループ
    draw()                 // 描画処理
}
```

### 主要な定数とデータ構造

```javascript
// ゲーム設定
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// テトリミノ定義
const TETROMINOS = {
    I: { shape: [...], color: '#00f5ff' },
    O: { shape: [...], color: '#ffff00' },
    // ... 他のピース
};
```

## 学習ポイント

### 1. オブジェクト指向設計
- クラスベースの設計
- メソッドの適切な分割
- 状態管理の実装

### 2. Canvas API の活用
- 2D描画コンテキストの使用
- アニメーションループの実装
- 効率的な描画処理

### 3. イベント処理
- キーボードイベントの処理
- ユーザーインターフェースとの連携
- 状態に応じた処理分岐

### 4. ゲームロジック
- 衝突判定アルゴリズム
- マトリックス操作（回転処理）
- スコア計算とレベル管理

## カスタマイズ例

### 1. 新しいテトリミノの追加

```javascript
const TETROMINOS = {
    // 既存のピース...
    
    // 新しいピース例
    X: {
        shape: [
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#ff69b4' // ピンク
    }
};
```

### 2. 難易度調整

```javascript
// 落下速度の調整
this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);

// スコア計算の調整
const points = [0, 200, 600, 1000, 1600][linesCleared] * this.level;
```

### 3. 視覚効果の追加

```javascript
// ライン消去時のエフェクト
clearLines() {
    // ... 既存のコード
    
    if (linesCleared > 0) {
        this.showLinesClearEffect(clearedRows);
    }
}
```

## トラブルシューティング

### よくある問題

#### 1. ゲームが動作しない
- ブラウザのコンソールでエラーを確認
- ファイルパスが正しいか確認
- ローカルサーバーが起動しているか確認

#### 2. キー操作が効かない
- ゲーム画面をクリックしてフォーカスを当てる
- ブラウザの開発者ツールでイベントを確認

#### 3. 描画が乱れる
- ブラウザのキャッシュをクリア
- Canvas要素のサイズ設定を確認

## 拡張アイデア

### 機能拡張
- [ ] ゴーストピース（落下予測表示）
- [ ] ホールド機能（ピースの保留）
- [ ] 効果音とBGM
- [ ] マルチプレイヤー対応
- [ ] ハイスコア保存機能

### 技術的改善
- [ ] TypeScript化
- [ ] モジュール分割
- [ ] テストコードの追加
- [ ] パフォーマンス最適化
- [ ] PWA対応

## 関連リンク

- [Kiroチュートリアル](../../README.md)
- [第1章: はじめてのKiro](../../docs/chapter1/)
- [テトリス作成チュートリアル](../../docs/chapter1/tetris-tutorial.md)

## ライセンス

このサンプルコードは学習目的で作成されており、自由に使用・改変できます。