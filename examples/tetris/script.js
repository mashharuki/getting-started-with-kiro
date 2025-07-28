/**
 * テトリスゲーム - Kiroチュートリアル用サンプル
 * 
 * このファイルには、完全に動作するテトリスゲームの実装が含まれています。
 * Kiroを使った開発プロセスの学習用として作成されました。
 */

// ゲーム設定定数
const BOARD_WIDTH = 10;  // ゲームボードの幅（ブロック数）
const BOARD_HEIGHT = 20; // ゲームボードの高さ（ブロック数）
const BLOCK_SIZE = 30;   // 各ブロックのピクセルサイズ

// テトリミノ（テトリスのピース）の定義
// 各テトリミノは4x4のグリッドで定義され、1が実際のブロックを表す
const TETROMINOS = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00f5ff' // シアン
    },
    O: {
        shape: [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        color: '#ffff00' // 黄色
    },
    T: {
        shape: [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        color: '#800080' // 紫
    },
    S: {
        shape: [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00ff00' // 緑
    },
    Z: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        color: '#ff0000' // 赤
    },
    J: {
        shape: [
            [0, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        color: '#0000ff' // 青
    },
    L: {
        shape: [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        color: '#ffa500' // オレンジ
    }
};

// ゲーム状態を管理するクラス
class TetrisGame {
    constructor() {
        // Canvas要素とコンテキストの取得
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // ゲーム状態の初期化
        this.board = this.createEmptyBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000; // 1秒間隔で落下
        
        // DOM要素の参照
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // ゲーム開始
        this.startNewGame();
    }
    
    /**
     * 空のゲームボードを作成
     * @returns {Array} 20x10の2次元配列（0で初期化）
     */
    createEmptyBoard() {
        return Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // ボタンイベント
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startNewGame());
    }
    
    /**
     * キーボード入力の処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeyPress(event) {
        if (!this.gameRunning || this.gamePaused) return;
        
        switch(event.code) {
            case 'ArrowLeft':
                event.preventDefault();
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.rotatePiece();
                break;
            case 'Space':
                event.preventDefault();
                this.hardDrop();
                break;
            case 'KeyP':
                event.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    /**
     * 新しいゲームを開始
     */
    startNewGame() {
        this.board = this.createEmptyBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        // 次のピースを生成
        this.nextPiece = this.createRandomPiece();
        this.spawnNewPiece();
        
        // UI更新
        this.updateScore();
        this.gameOverElement.classList.add('hidden');
        
        // ゲームループ開始
        this.gameLoop();
    }
    
    /**
     * ランダムなテトリミノピースを生成
     * @returns {Object} ピースオブジェクト
     */
    createRandomPiece() {
        const pieces = Object.keys(TETROMINOS);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        const tetromino = TETROMINOS[randomPiece];
        
        return {
            shape: tetromino.shape.map(row => [...row]), // ディープコピー
            color: tetromino.color,
            x: Math.floor(BOARD_WIDTH / 2) - 2, // 中央に配置
            y: 0
        };
    }
    
    /**
     * 新しいピースをゲームボードに出現させる
     */
    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createRandomPiece();
        
        // ゲームオーバーチェック
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.gameOver();
            return;
        }
        
        this.drawNextPiece();
    }
    
    /**
     * ピースの移動
     * @param {number} dx - X方向の移動量
     * @param {number} dy - Y方向の移動量
     */
    movePiece(dx, dy) {
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }
    
    /**
     * ピースの回転
     */
    rotatePiece() {
        const rotatedShape = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        
        this.currentPiece.shape = rotatedShape;
        
        // 回転後に衝突する場合は元に戻す
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    /**
     * 4x4マトリックスを90度回転
     * @param {Array} matrix - 回転させるマトリックス
     * @returns {Array} 回転後のマトリックス
     */
    rotateMatrix(matrix) {
        const rotated = Array(4).fill().map(() => Array(4).fill(0));
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                rotated[j][3 - i] = matrix[i][j];
            }
        }
        return rotated;
    }
    
    /**
     * ハードドロップ（一気に落下）
     */
    hardDrop() {
        while (this.movePiece(0, 1)) {
            // 落下可能な限り落下
        }
        this.placePiece();
    }
    
    /**
     * 衝突判定
     * @param {Object} piece - チェックするピース
     * @param {number} dx - X方向のオフセット
     * @param {number} dy - Y方向のオフセット
     * @returns {boolean} 衝突する場合はtrue
     */
    checkCollision(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (piece.shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    // 境界チェック
                    if (boardX < 0 || boardX >= BOARD_WIDTH || 
                        boardY >= BOARD_HEIGHT) {
                        return true;
                    }
                    
                    // ボード上のブロックとの衝突チェック
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    /**
     * ピースをボードに固定
     */
    placePiece() {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        // ライン消去チェック
        this.clearLines();
        
        // 新しいピース生成
        this.spawnNewPiece();
    }
    
    /**
     * 完成したラインを消去
     */
    clearLines() {
        let linesCleared = 0;
        
        // 下から上へチェック
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                // ライン完成
                this.board.splice(y, 1);
                this.board.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // 同じ行を再チェック
            }
        }
        
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
    }
    
    /**
     * スコアとレベルの更新
     * @param {number} linesCleared - 消去されたライン数
     */
    updateScore(linesCleared = 0) {
        if (linesCleared > 0) {
            // スコア計算（ライン数に応じてボーナス）
            const points = [0, 100, 300, 500, 800][linesCleared] * this.level;
            this.score += points;
            this.lines += linesCleared;
            
            // レベルアップ（10ライン毎）
            const newLevel = Math.floor(this.lines / 10) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                // 落下速度を上げる
                this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            }
        }
        
        // UI更新
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.linesElement.textContent = this.lines;
    }
    
    /**
     * ゲームオーバー処理
     */
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
    }
    
    /**
     * ゲームの一時停止/再開
     */
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.gamePaused ? '再開' : '一時停止';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    /**
     * メインゲームループ
     */
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        const now = Date.now();
        
        // 自動落下処理
        if (now - this.dropTime > this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
            }
            this.dropTime = now;
        }
        
        // 画面描画
        this.draw();
        
        // 次のフレーム
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * ゲーム画面の描画
     */
    draw() {
        // 画面クリア
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // ボード上の固定されたブロックを描画
        this.drawBoard();
        
        // 現在のピースを描画
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
        
        // グリッド線を描画
        this.drawGrid();
    }
    
    /**
     * ボード上の固定ブロックを描画
     */
    drawBoard() {
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x], this.ctx);
                }
            }
        }
    }
    
    /**
     * ピースを描画
     * @param {Object} piece - 描画するピース
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    drawPiece(piece, ctx) {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (piece.shape[y][x]) {
                    const drawX = piece.x + x;
                    const drawY = piece.y + y;
                    
                    if (drawY >= 0) {
                        this.drawBlock(drawX, drawY, piece.color, ctx);
                    }
                }
            }
        }
    }
    
    /**
     * 単一ブロックを描画
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} color - ブロックの色
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    drawBlock(x, y, color, ctx) {
        const pixelX = x * BLOCK_SIZE;
        const pixelY = y * BLOCK_SIZE;
        
        // ブロック本体
        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
        
        // ブロックの境界線
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
        
        // ハイライト効果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(pixelX + 1, pixelY + 1, BLOCK_SIZE - 2, 2);
        ctx.fillRect(pixelX + 1, pixelY + 1, 2, BLOCK_SIZE - 2);
    }
    
    /**
     * グリッド線を描画
     */
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // 縦線
        for (let x = 0; x <= BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * BLOCK_SIZE, 0);
            this.ctx.lineTo(x * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        // 横線
        for (let y = 0; y <= BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * BLOCK_SIZE);
            this.ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
            this.ctx.stroke();
        }
    }
    
    /**
     * 次のピースを描画
     */
    drawNextPiece() {
        // 画面クリア
        this.nextCtx.fillStyle = '#1a202c';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            // 中央に配置するためのオフセット計算
            const offsetX = (this.nextCanvas.width - 4 * BLOCK_SIZE) / 2;
            const offsetY = (this.nextCanvas.height - 4 * BLOCK_SIZE) / 2;
            
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        const pixelX = offsetX + x * BLOCK_SIZE;
                        const pixelY = offsetY + y * BLOCK_SIZE;
                        
                        // ブロック描画
                        this.nextCtx.fillStyle = this.nextPiece.color;
                        this.nextCtx.fillRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
                        
                        // 境界線
                        this.nextCtx.strokeStyle = '#000';
                        this.nextCtx.lineWidth = 1;
                        this.nextCtx.strokeRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
                    }
                }
            }
        }
    }
}

// ページ読み込み完了後にゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});