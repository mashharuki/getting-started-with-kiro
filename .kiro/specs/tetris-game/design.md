# Tetrisゲーム 設計書

## 概要

HTML5 Canvas、CSS、JavaScriptを使用してブラウザで動作するTetrisゲームを実装します。モジュラー設計により保守性と拡張性を確保し、オブジェクト指向プログラミングの原則に従って実装します。

## アーキテクチャ

### システム構成

```
tetris/
├── index.html          # メインHTMLファイル
├── style.css          # スタイルシート
├── script.js          # メインJavaScriptファイル
└── README.md          # プロジェクト説明
```

### 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **描画**: HTML5 Canvas API
- **イベント処理**: DOM Event API
- **アニメーション**: requestAnimationFrame

## コンポーネントと インターフェース

### 1. ゲームエンジン (GameEngine)

```javascript
class GameEngine {
  constructor(canvas, scoreElement, levelElement)
  start()                    // ゲーム開始
  pause()                    // ゲーム一時停止
  resume()                   // ゲーム再開
  gameOver()                 // ゲーム終了処理
  update()                   // ゲーム状態更新
  render()                   // 画面描画
}
```

**責任:**
- ゲームループの管理
- 全体的なゲーム状態の制御
- 描画とロジックの統合

### 2. ゲームボード (GameBoard)

```javascript
class GameBoard {
  constructor(width, height)
  isValidPosition(piece, x, y)    // 位置の有効性チェック
  placePiece(piece, x, y)         // ピースの配置
  clearLines()                    // 完成した行の削除
  isGameOver()                    // ゲームオーバー判定
  getBoard()                      // ボード状態の取得
}
```

**責任:**
- ゲームボードの状態管理
- ブロック配置の検証
- ライン消去ロジック

### 3. テトリミノ (Tetromino)

```javascript
class Tetromino {
  constructor(type)
  rotate()                        // 回転処理
  getShape()                      // 現在の形状取得
  getColor()                      // 色の取得
  clone()                         // コピー作成
}

// テトリミノの種類
const TETROMINO_TYPES = {
  I: { shape: [[1,1,1,1]], color: '#00f0f0' },
  O: { shape: [[1,1],[1,1]], color: '#f0f000' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#f00000' },
  J: { shape: [[1,0,0],[1,1,1]], color: '#0000f0' },
  L: { shape: [[0,0,1],[1,1,1]], color: '#f0a000' }
};
```

**責任:**
- テトリミノの形状管理
- 回転ロジック
- 色情報の管理

### 4. ゲーム状態管理 (GameState)

```javascript
class GameState {
  constructor()
  updateScore(lines)              // スコア更新
  updateLevel()                   // レベル更新
  getDropSpeed()                  // 落下速度取得
  reset()                         // 状態リセット
}
```

**責任:**
- スコア、レベル、ライン数の管理
- ゲーム難易度の調整
- 状態の永続化

### 5. 入力ハンドラー (InputHandler)

```javascript
class InputHandler {
  constructor(gameEngine)
  bindEvents()                    // イベントリスナー設定
  handleKeyDown(event)            // キー押下処理
  handleKeyUp(event)              // キー離上処理
}
```

**責任:**
- キーボード入力の処理
- ゲームコマンドへの変換
- 入力の検証

### 6. レンダラー (Renderer)

```javascript
class Renderer {
  constructor(canvas, context)
  drawBoard(board)                // ボード描画
  drawPiece(piece, x, y)          // ピース描画
  drawNextPiece(piece)            // 次のピース描画
  drawGameOver()                  // ゲームオーバー画面
  clear()                         // 画面クリア
}
```

**責任:**
- Canvas描画処理
- UI要素の描画
- アニメーション効果

## データモデル

### ゲームボードデータ構造

```javascript
// 10x20のゲームボード（0: 空、1以上: ブロック色ID）
const board = Array(20).fill().map(() => Array(10).fill(0));
```

### テトリミノデータ構造

```javascript
const tetromino = {
  type: 'T',                      // テトリミノタイプ
  shape: [[0,1,0],[1,1,1]],      // 現在の形状
  color: '#a000f0',              // 色
  rotation: 0                     // 回転状態（0-3）
};
```

### ゲーム状態データ構造

```javascript
const gameState = {
  score: 0,                       // 現在のスコア
  level: 1,                       // 現在のレベル
  lines: 0,                       // 消去したライン数
  isPaused: false,                // 一時停止状態
  isGameOver: false,              // ゲームオーバー状態
  dropTime: 0,                    // 最後の落下時間
  dropSpeed: 1000                 // 落下間隔（ミリ秒）
};
```

## エラーハンドリング

### 1. 入力エラー処理

```javascript
// 無効なキー入力の無視
function handleKeyDown(event) {
  const validKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '];
  if (!validKeys.includes(event.key)) {
    return; // 無効なキーは無視
  }
  
  // ゲームオーバー時は操作を無効化
  if (gameState.isGameOver) {
    return;
  }
}
```

### 2. 描画エラー処理

```javascript
function safeRender() {
  try {
    renderer.clear();
    renderer.drawBoard(gameBoard.getBoard());
    renderer.drawPiece(currentPiece, pieceX, pieceY);
  } catch (error) {
    console.error('Rendering error:', error);
    // フォールバック処理
    showErrorMessage('描画エラーが発生しました');
  }
}
```

### 3. ゲーム状態エラー処理

```javascript
function validateGameState() {
  // スコアの妥当性チェック
  if (gameState.score < 0) {
    gameState.score = 0;
  }
  
  // レベルの妥当性チェック
  if (gameState.level < 1) {
    gameState.level = 1;
  }
}
```

## テスト戦略

### 1. 単体テスト

**テスト対象:**
- Tetrominoクラスの回転ロジック
- GameBoardの衝突検出
- スコア計算ロジック

**テストフレームワーク:** Jest（将来的な拡張時）

```javascript
// テスト例
describe('Tetromino', () => {
  test('should rotate T-piece correctly', () => {
    const tPiece = new Tetromino('T');
    const originalShape = tPiece.getShape();
    tPiece.rotate();
    const rotatedShape = tPiece.getShape();
    
    expect(rotatedShape).not.toEqual(originalShape);
    expect(rotatedShape.length).toBe(originalShape[0].length);
  });
});
```

### 2. 統合テスト

**テスト項目:**
- ゲームエンジンとコンポーネント間の連携
- キー入力からゲーム状態変更までの流れ
- ライン消去からスコア更新までの処理

### 3. 手動テスト

**テストケース:**
- 各テトリミノの正常な動作確認
- ゲームオーバー条件の確認
- 一時停止/再開機能の確認
- 異なるブラウザでの動作確認

### 4. パフォーマンステスト

**測定項目:**
- フレームレート（60fps目標）
- メモリ使用量
- CPU使用率

## セキュリティ考慮事項

### 1. XSS対策

```javascript
// ユーザー入力のサニタイズ（スコア表示時）
function displayScore(score) {
  const sanitizedScore = String(score).replace(/[<>]/g, '');
  scoreElement.textContent = sanitizedScore;
}
```

### 2. 入力検証

```javascript
// キー入力の検証
function isValidInput(keyCode) {
  const allowedKeys = [37, 38, 39, 40, 32]; // 矢印キー、スペース
  return allowedKeys.includes(keyCode);
}
```

## パフォーマンス最適化

### 1. 描画最適化

```javascript
// 差分描画による最適化
class OptimizedRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.previousBoard = null;
  }
  
  drawBoard(board) {
    // 前回と変更がない場合はスキップ
    if (this.boardsEqual(board, this.previousBoard)) {
      return;
    }
    
    // 変更された部分のみ再描画
    this.drawChangedCells(board, this.previousBoard);
    this.previousBoard = this.cloneBoard(board);
  }
}
```

### 2. メモリ管理

```javascript
// オブジェクトプールによるメモリ最適化
class TetrominoPool {
  constructor() {
    this.pool = [];
  }
  
  get(type) {
    if (this.pool.length > 0) {
      const tetromino = this.pool.pop();
      tetromino.reset(type);
      return tetromino;
    }
    return new Tetromino(type);
  }
  
  release(tetromino) {
    this.pool.push(tetromino);
  }
}
```

## 拡張性設計

### 1. 設定システム

```javascript
const CONFIG = {
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 20,
  INITIAL_DROP_SPEED: 1000,
  SPEED_INCREASE_RATE: 0.9,
  COLORS: {
    BACKGROUND: '#000000',
    GRID: '#333333',
    TEXT: '#ffffff'
  }
};
```

### 2. プラグインシステム

```javascript
class GamePlugin {
  constructor(name) {
    this.name = name;
  }
  
  onGameStart() {}
  onLineCleared(lines) {}
  onGameOver() {}
}

// 使用例: サウンドプラグイン
class SoundPlugin extends GamePlugin {
  onLineCleared(lines) {
    this.playSound('line-clear.wav');
  }
}
```

## デプロイメント

### 1. ファイル構成

```
tetris/
├── index.html          # エントリーポイント
├── style.css          # スタイル定義
├── script.js          # ゲームロジック
└── README.md          # 使用方法
```

### 2. ブラウザ対応

- **対象ブラウザ:** Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **必要機能:** Canvas API, ES6 Classes, requestAnimationFrame

### 3. 配信方法

- 静的ファイルとしてWebサーバーに配置
- CDNでの配信対応
- PWA化（将来的な拡張）

## まとめ

この設計により、保守性が高く拡張可能なTetrisゲームを実装できます。モジュラー設計により各コンポーネントが独立しており、テストやデバッグが容易になります。また、パフォーマンス最適化により快適なゲーム体験を提供できます。