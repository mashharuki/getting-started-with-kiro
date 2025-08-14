/**
 * Tetris Game - Main JavaScript File
 * Basic project foundation with core classes and initialization
 */

// Game configuration constants
const CONFIG = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    BLOCK_SIZE: 30,
    INITIAL_DROP_SPEED: 1000,
    SPEED_INCREASE_RATE: 0.9,
    COLORS: {
        BACKGROUND: '#000000',
        GRID: '#333333',
        TEXT: '#ffffff',
        BORDER: '#ffffff'
    }
};

// Tetromino types and their properties - 7 standard tetris pieces
const TETROMINO_TYPES = {
    I: { 
        shapes: [
            [[1,1,1,1]],
            [[1],[1],[1],[1]],
            [[1,1,1,1]],
            [[1],[1],[1],[1]]
        ], 
        color: '#00f0f0' 
    },
    O: { 
        shapes: [
            [[1,1],[1,1]],
            [[1,1],[1,1]],
            [[1,1],[1,1]],
            [[1,1],[1,1]]
        ], 
        color: '#f0f000' 
    },
    T: { 
        shapes: [
            [[0,1,0],[1,1,1]],
            [[1,0],[1,1],[1,0]],
            [[1,1,1],[0,1,0]],
            [[0,1],[1,1],[0,1]]
        ], 
        color: '#a000f0' 
    },
    S: { 
        shapes: [
            [[0,1,1],[1,1,0]],
            [[1,0],[1,1],[0,1]],
            [[0,1,1],[1,1,0]],
            [[1,0],[1,1],[0,1]]
        ], 
        color: '#00f000' 
    },
    Z: { 
        shapes: [
            [[1,1,0],[0,1,1]],
            [[0,1],[1,1],[1,0]],
            [[1,1,0],[0,1,1]],
            [[0,1],[1,1],[1,0]]
        ], 
        color: '#f00000' 
    },
    J: { 
        shapes: [
            [[1,0,0],[1,1,1]],
            [[1,1],[1,0],[1,0]],
            [[1,1,1],[0,0,1]],
            [[0,1],[0,1],[1,1]]
        ], 
        color: '#0000f0' 
    },
    L: { 
        shapes: [
            [[0,0,1],[1,1,1]],
            [[1,0],[1,0],[1,1]],
            [[1,1,1],[1,0,0]],
            [[1,1],[0,1],[0,1]]
        ], 
        color: '#f0a000' 
    }
};

/**
 * Utility functions for Tetromino management
 */

/**
 * Gets all available tetromino types
 * @returns {string[]} Array of tetromino type strings
 */
function getTetrominoTypes() {
    return Object.keys(TETROMINO_TYPES);
}

/**
 * Creates a random tetromino
 * @returns {Tetromino} A new random tetromino instance
 */
function createRandomTetromino() {
    const types = getTetrominoTypes();
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new Tetromino(randomType);
}

/**
 * Validates that all tetromino types have proper shape data
 * @returns {boolean} True if all tetromino data is valid
 */
function validateTetrominoData() {
    const types = getTetrominoTypes();
    
    for (const type of types) {
        const data = TETROMINO_TYPES[type];
        
        // Check if shapes array exists and has 4 rotations
        if (!data.shapes || data.shapes.length !== 4) {
            console.error(`Invalid shapes data for tetromino ${type}`);
            return false;
        }
        
        // Check if color exists
        if (!data.color || typeof data.color !== 'string') {
            console.error(`Invalid color data for tetromino ${type}`);
            return false;
        }
        
        // Validate each rotation shape
        for (let rotation = 0; rotation < 4; rotation++) {
            const shape = data.shapes[rotation];
            if (!Array.isArray(shape) || shape.length === 0) {
                console.error(`Invalid shape data for tetromino ${type}, rotation ${rotation}`);
                return false;
            }
            
            // Check that all rows have the same length
            const expectedWidth = shape[0].length;
            for (const row of shape) {
                if (!Array.isArray(row) || row.length !== expectedWidth) {
                    console.error(`Inconsistent row width for tetromino ${type}, rotation ${rotation}`);
                    return false;
                }
            }
        }
    }
    
    return true;
}

/**
 * Tetromino class - Represents a tetris piece with all 7 standard shapes
 * Handles rotation states and provides access to shape data and colors
 */
class Tetromino {
    /**
     * Creates a new Tetromino instance
     * @param {string} type - The tetromino type (I, O, T, S, Z, J, L)
     * @throws {Error} If invalid tetromino type is provided
     */
    constructor(type) {
        // Validate tetromino type
        if (!TETROMINO_TYPES[type]) {
            throw new Error(`Invalid tetromino type: ${type}. Valid types are: ${Object.keys(TETROMINO_TYPES).join(', ')}`);
        }
        
        this.type = type;
        this.rotation = 0; // Current rotation state (0-3)
        this._tetrominoData = TETROMINO_TYPES[type];
    }

    /**
     * Gets the current shape based on rotation state
     * @returns {number[][]} 2D array representing the current shape
     */
    getShape() {
        return this._tetrominoData.shapes[this.rotation];
    }

    /**
     * Gets the color of this tetromino
     * @returns {string} Hex color code
     */
    getColor() {
        return this._tetrominoData.color;
    }

    /**
     * Gets the tetromino type
     * @returns {string} The tetromino type (I, O, T, S, Z, J, L)
     */
    getType() {
        return this.type;
    }

    /**
     * Gets the current rotation state
     * @returns {number} Current rotation (0-3)
     */
    getRotation() {
        return this.rotation;
    }

    /**
     * Gets the width of the current shape
     * @returns {number} Width in blocks
     */
    getWidth() {
        const shape = this.getShape();
        return shape.length > 0 ? shape[0].length : 0;
    }

    /**
     * Gets the height of the current shape
     * @returns {number} Height in blocks
     */
    getHeight() {
        return this.getShape().length;
    }

    /**
     * Rotates the tetromino clockwise (90 degrees)
     * Updates the rotation state and returns the new shape
     * @returns {number[][]} The new shape after rotation
     */
    rotate() {
        const previousRotation = this.rotation;
        this.rotation = (this.rotation + 1) % 4;
        
        // Verify the rotation is valid (shape exists and is properly formed)
        if (!this.validateCurrentShape()) {
            // Revert rotation if validation fails
            this.rotation = previousRotation;
            throw new Error(`Invalid rotation state for tetromino ${this.type}`);
        }
        
        return this.getShape();
    }

    /**
     * Gets the shape that would result from rotating clockwise
     * Does not modify the current tetromino state
     * @returns {number[][]} The shape after rotation
     */
    getRotatedShape() {
        const nextRotation = (this.rotation + 1) % 4;
        return this._tetrominoData.shapes[nextRotation];
    }

    /**
     * Rotates the tetromino counter-clockwise (270 degrees / -90 degrees)
     * Updates the rotation state and returns the new shape
     * @returns {number[][]} The new shape after rotation
     */
    rotateCounterClockwise() {
        const previousRotation = this.rotation;
        this.rotation = (this.rotation + 3) % 4; // +3 is equivalent to -1 in mod 4
        
        // Verify the rotation is valid
        if (!this.validateCurrentShape()) {
            // Revert rotation if validation fails
            this.rotation = previousRotation;
            throw new Error(`Invalid counter-clockwise rotation state for tetromino ${this.type}`);
        }
        
        return this.getShape();
    }

    /**
     * Attempts to rotate clockwise and returns whether it was successful
     * Does not throw errors, returns false if rotation is invalid
     * @returns {boolean} True if rotation was successful, false otherwise
     */
    tryRotate() {
        try {
            this.rotate();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Attempts to rotate counter-clockwise and returns whether it was successful
     * Does not throw errors, returns false if rotation is invalid
     * @returns {boolean} True if rotation was successful, false otherwise
     */
    tryRotateCounterClockwise() {
        try {
            this.rotateCounterClockwise();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Validates the current shape data
     * @returns {boolean} True if the current shape is valid
     */
    validateCurrentShape() {
        const shape = this.getShape();
        
        // Check if shape exists
        if (!shape || !Array.isArray(shape) || shape.length === 0) {
            return false;
        }
        
        // Check if all rows exist and have consistent width
        const expectedWidth = shape[0].length;
        if (expectedWidth === 0) {
            return false;
        }
        
        for (const row of shape) {
            if (!Array.isArray(row) || row.length !== expectedWidth) {
                return false;
            }
            
            // Check if all cells are valid (0 or 1)
            for (const cell of row) {
                if (cell !== 0 && cell !== 1) {
                    return false;
                }
            }
        }
        
        // Check if shape has at least one filled block
        let hasFilledBlock = false;
        for (const row of shape) {
            for (const cell of row) {
                if (cell === 1) {
                    hasFilledBlock = true;
                    break;
                }
            }
            if (hasFilledBlock) break;
        }
        
        return hasFilledBlock;
    }

    /**
     * Sets the rotation to a specific value with validation
     * @param {number} rotation - The rotation state to set (0-3)
     * @returns {boolean} True if the rotation was set successfully
     */
    setRotation(rotation) {
        if (rotation < 0 || rotation > 3 || !Number.isInteger(rotation)) {
            return false;
        }
        
        const previousRotation = this.rotation;
        this.rotation = rotation;
        
        if (!this.validateCurrentShape()) {
            this.rotation = previousRotation;
            return false;
        }
        
        return true;
    }

    /**
     * Resets rotation to initial state (0)
     */
    resetRotation() {
        this.rotation = 0;
    }

    /**
     * Creates a deep copy of this tetromino
     * @returns {Tetromino} A new Tetromino instance with the same state
     */
    clone() {
        const cloned = new Tetromino(this.type);
        cloned.rotation = this.rotation;
        return cloned;
    }

    /**
     * Checks if a specific position in the shape is filled
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} True if the position is filled (1), false otherwise
     */
    isBlockAt(row, col) {
        const shape = this.getShape();
        if (row < 0 || row >= shape.length || col < 0 || col >= shape[0].length) {
            return false;
        }
        return shape[row][col] === 1;
    }

    /**
     * Gets all filled block positions relative to the tetromino's origin
     * @returns {Array<{row: number, col: number}>} Array of filled block positions
     */
    getFilledBlocks() {
        const shape = this.getShape();
        const blocks = [];
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    blocks.push({ row, col });
                }
            }
        }
        
        return blocks;
    }

    /**
     * Returns a string representation of the tetromino for debugging
     * @returns {string} String representation
     */
    toString() {
        const shape = this.getShape();
        let result = `Tetromino ${this.type} (rotation: ${this.rotation}):\n`;
        
        for (let row = 0; row < shape.length; row++) {
            result += shape[row].map(cell => cell ? '█' : '·').join(' ') + '\n';
        }
        
        return result;
    }
}

/**
 * GameBoard class - Manages the game board state
 * Handles the 10x20 Tetris game board with collision detection and line clearing
 */
class GameBoard {
    /**
     * Creates a new GameBoard instance
     * @param {number} width - Board width in blocks (default: 10)
     * @param {number} height - Board height in blocks (default: 20)
     */
    constructor(width = CONFIG.BOARD_WIDTH, height = CONFIG.BOARD_HEIGHT) {
        this.width = width;
        this.height = height;
        this.initializeBoard();
    }

    /**
     * Initializes the board with empty cells (0 = empty, >0 = filled with color ID)
     * Creates a 2D array representing the game board state
     */
    initializeBoard() {
        this.board = Array(this.height).fill().map(() => Array(this.width).fill(0));
    }

    /**
     * Gets the current board state
     * @returns {number[][]} 2D array representing the board (0 = empty, >0 = filled)
     */
    getBoard() {
        return this.board;
    }

    /**
     * Gets a copy of the current board state (prevents external modification)
     * @returns {number[][]} Deep copy of the board array
     */
    getBoardCopy() {
        return this.board.map(row => [...row]);
    }

    /**
     * Sets the board state (used for testing or state restoration)
     * @param {number[][]} newBoard - New board state to set
     * @returns {boolean} True if board was set successfully, false if invalid
     */
    setBoard(newBoard) {
        // Validate board dimensions
        if (!Array.isArray(newBoard) || newBoard.length !== this.height) {
            console.error('Invalid board height');
            return false;
        }

        for (let row = 0; row < newBoard.length; row++) {
            if (!Array.isArray(newBoard[row]) || newBoard[row].length !== this.width) {
                console.error(`Invalid board width at row ${row}`);
                return false;
            }

            // Validate cell values (should be numbers >= 0)
            for (let col = 0; col < newBoard[row].length; col++) {
                if (typeof newBoard[row][col] !== 'number' || newBoard[row][col] < 0) {
                    console.error(`Invalid cell value at (${row}, ${col})`);
                    return false;
                }
            }
        }

        // Set the board
        this.board = newBoard.map(row => [...row]);
        return true;
    }

    /**
     * Gets the value at a specific board position
     * @param {number} row - Row index (0-based from top)
     * @param {number} col - Column index (0-based from left)
     * @returns {number|null} Cell value (0 = empty, >0 = filled) or null if out of bounds
     */
    getCellValue(row, col) {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return null;
        }
        return this.board[row][col];
    }

    /**
     * Sets the value at a specific board position
     * @param {number} row - Row index (0-based from top)
     * @param {number} col - Column index (0-based from left)
     * @param {number} value - Value to set (0 = empty, >0 = filled with color ID)
     * @returns {boolean} True if value was set successfully, false if out of bounds
     */
    setCellValue(row, col, value) {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return false;
        }
        
        if (typeof value !== 'number' || value < 0) {
            return false;
        }

        this.board[row][col] = value;
        return true;
    }

    /**
     * Checks if a specific position is empty
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} True if position is empty (0) or out of bounds
     */
    isEmpty(row, col) {
        const value = this.getCellValue(row, col);
        return value === null || value === 0;
    }

    /**
     * Checks if a specific position is filled
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} True if position is filled (>0)
     */
    isFilled(row, col) {
        const value = this.getCellValue(row, col);
        return value !== null && value > 0;
    }

    /**
     * Clears the entire board (sets all cells to 0)
     * Resets the board to initial empty state
     */
    clear() {
        this.initializeBoard();
    }

    /**
     * Resets the board to initial state (alias for clear)
     */
    reset() {
        this.clear();
    }

    /**
     * Gets board dimensions
     * @returns {{width: number, height: number}} Board dimensions
     */
    getDimensions() {
        return {
            width: this.width,
            height: this.height
        };
    }

    /**
     * Checks if coordinates are within board bounds
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} True if coordinates are within bounds
     */
    isInBounds(row, col) {
        return row >= 0 && row < this.height && col >= 0 && col < this.width;
    }

    /**
     * Gets the number of filled cells in the board
     * @returns {number} Count of filled cells
     */
    getFilledCellCount() {
        let count = 0;
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.board[row][col] > 0) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Gets the number of empty cells in the board
     * @returns {number} Count of empty cells
     */
    getEmptyCellCount() {
        return (this.width * this.height) - this.getFilledCellCount();
    }

    /**
     * Validates the current board state
     * @returns {boolean} True if board state is valid
     */
    validateBoard() {
        // Check board dimensions
        if (!Array.isArray(this.board) || this.board.length !== this.height) {
            return false;
        }

        // Check each row
        for (let row = 0; row < this.height; row++) {
            if (!Array.isArray(this.board[row]) || this.board[row].length !== this.width) {
                return false;
            }

            // Check each cell
            for (let col = 0; col < this.width; col++) {
                const value = this.board[row][col];
                if (typeof value !== 'number' || value < 0) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Creates a string representation of the board for debugging
     * @returns {string} String representation of the board
     */
    toString() {
        let result = `GameBoard (${this.width}x${this.height}):\n`;
        result += '┌' + '─'.repeat(this.width * 2 + 1) + '┐\n';
        
        for (let row = 0; row < this.height; row++) {
            result += '│ ';
            for (let col = 0; col < this.width; col++) {
                result += this.board[row][col] === 0 ? '·' : '█';
                result += ' ';
            }
            result += '│\n';
        }
        
        result += '└' + '─'.repeat(this.width * 2 + 1) + '┘';
        return result;
    }

    // Placeholder methods for collision detection and line clearing (to be implemented in subtasks)
    
    /**
     * Checks if a tetromino can be placed at the specified position
     * Performs collision detection with board boundaries and existing pieces
     * @param {Tetromino} piece - The tetromino to check
     * @param {number} x - X position (column, left edge of piece)
     * @param {number} y - Y position (row, top edge of piece)
     * @returns {boolean} True if position is valid (no collision)
     */
    isValidPosition(piece, x, y) {
        if (!piece || typeof x !== 'number' || typeof y !== 'number') {
            return false;
        }

        const shape = piece.getShape();
        if (!shape || shape.length === 0) {
            return false;
        }

        // Check each filled block of the tetromino
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                // Skip empty blocks in the tetromino shape
                if (shape[row][col] === 0) {
                    continue;
                }

                // Calculate absolute position on the board
                const boardRow = y + row;
                const boardCol = x + col;

                // Check boundary collision
                if (!this.isInBounds(boardRow, boardCol)) {
                    return false;
                }

                // Check collision with existing pieces
                if (this.isFilled(boardRow, boardCol)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Checks if a position is valid for boundary checking only (ignores existing pieces)
     * Used for checking if a piece can fit within board boundaries
     * @param {Tetromino} piece - The tetromino to check
     * @param {number} x - X position (column)
     * @param {number} y - Y position (row)
     * @returns {boolean} True if piece fits within boundaries
     */
    isWithinBounds(piece, x, y) {
        if (!piece || typeof x !== 'number' || typeof y !== 'number') {
            return false;
        }

        const shape = piece.getShape();
        if (!shape || shape.length === 0) {
            return false;
        }

        // Check each filled block of the tetromino
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                // Skip empty blocks in the tetromino shape
                if (shape[row][col] === 0) {
                    continue;
                }

                // Calculate absolute position on the board
                const boardRow = y + row;
                const boardCol = x + col;

                // Check if position is within board bounds
                if (!this.isInBounds(boardRow, boardCol)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Checks if a tetromino collides with existing pieces (ignores boundaries)
     * @param {Tetromino} piece - The tetromino to check
     * @param {number} x - X position (column)
     * @param {number} y - Y position (row)
     * @returns {boolean} True if piece collides with existing pieces
     */
    hasCollision(piece, x, y) {
        if (!piece || typeof x !== 'number' || typeof y !== 'number') {
            return true; // Invalid input counts as collision
        }

        const shape = piece.getShape();
        if (!shape || shape.length === 0) {
            return true;
        }

        // Check each filled block of the tetromino
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                // Skip empty blocks in the tetromino shape
                if (shape[row][col] === 0) {
                    continue;
                }

                // Calculate absolute position on the board
                const boardRow = y + row;
                const boardCol = x + col;

                // Check collision with existing pieces (only if within bounds)
                if (this.isInBounds(boardRow, boardCol) && this.isFilled(boardRow, boardCol)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Places a tetromino on the board at the specified position
     * Only places if the position is valid
     * @param {Tetromino} piece - The tetromino to place
     * @param {number} x - X position (column)
     * @param {number} y - Y position (row)
     * @returns {boolean} True if piece was placed successfully
     */
    placePiece(piece, x, y) {
        // Validate input parameters
        if (!piece || typeof x !== 'number' || typeof y !== 'number') {
            console.error('Invalid parameters for placePiece');
            return false;
        }

        // Check if position is valid before placing
        if (!this.isValidPosition(piece, x, y)) {
            console.warn(`Cannot place ${piece.getType()} at (${x}, ${y}) - invalid position`);
            return false;
        }

        const shape = piece.getShape();
        const colorId = this.getColorId(piece.getColor());

        // Place each filled block of the tetromino
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                // Only place filled blocks
                if (shape[row][col] === 1) {
                    const boardRow = y + row;
                    const boardCol = x + col;
                    this.setCellValue(boardRow, boardCol, colorId);
                }
            }
        }

        console.log(`Successfully placed ${piece.getType()} at (${x}, ${y})`);
        return true;
    }

    /**
     * Converts a color hex code to a numeric ID for board storage
     * @param {string} color - Hex color code
     * @returns {number} Numeric color ID (1-7 for tetromino colors)
     */
    getColorId(color) {
        const colorMap = {
            '#00f0f0': 1, // I - Cyan
            '#f0f000': 2, // O - Yellow
            '#a000f0': 3, // T - Purple
            '#00f000': 4, // S - Green
            '#f00000': 5, // Z - Red
            '#0000f0': 6, // J - Blue
            '#f0a000': 7  // L - Orange
        };
        
        return colorMap[color] || 1; // Default to 1 if color not found
    }

    /**
     * Converts a numeric color ID back to hex color code
     * @param {number} colorId - Numeric color ID
     * @returns {string} Hex color code
     */
    getColorFromId(colorId) {
        const colorMap = {
            1: '#00f0f0', // I - Cyan
            2: '#f0f000', // O - Yellow
            3: '#a000f0', // T - Purple
            4: '#00f000', // S - Green
            5: '#f00000', // Z - Red
            6: '#0000f0', // J - Blue
            7: '#f0a000'  // L - Orange
        };
        
        return colorMap[colorId] || '#ffffff'; // Default to white if ID not found
    }

    /**
     * Clears completed lines and returns the number of lines cleared
     * A line is complete when all cells in the row are filled (> 0)
     * @returns {number} Number of lines cleared
     */
    clearLines() {
        const completedLines = this.findCompletedLines();
        
        if (completedLines.length === 0) {
            return 0;
        }

        // Remove completed lines and add empty lines at the top
        this.removeCompletedLines(completedLines);
        
        console.log(`Cleared ${completedLines.length} line(s): rows ${completedLines.join(', ')}`);
        return completedLines.length;
    }

    /**
     * Finds all completed lines (rows that are completely filled)
     * @returns {number[]} Array of row indices that are completed (sorted from bottom to top)
     */
    findCompletedLines() {
        const completedLines = [];
        
        // Check each row from bottom to top
        for (let row = this.height - 1; row >= 0; row--) {
            if (this.isLineComplete(row)) {
                completedLines.push(row);
            }
        }
        
        // Return in descending order (bottom to top) for easier processing
        return completedLines.sort((a, b) => b - a);
    }

    /**
     * Checks if a specific line (row) is complete
     * @param {number} row - Row index to check
     * @returns {boolean} True if the line is completely filled
     */
    isLineComplete(row) {
        if (row < 0 || row >= this.height) {
            return false;
        }
        
        // Check if all cells in the row are filled
        for (let col = 0; col < this.width; col++) {
            if (this.board[row][col] === 0) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Checks if a specific line (row) is empty
     * @param {number} row - Row index to check
     * @returns {boolean} True if the line is completely empty
     */
    isLineEmpty(row) {
        if (row < 0 || row >= this.height) {
            return false;
        }
        
        // Check if all cells in the row are empty
        for (let col = 0; col < this.width; col++) {
            if (this.board[row][col] !== 0) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Removes completed lines and drops blocks above them
     * @param {number[]} completedLines - Array of row indices to remove (should be sorted descending)
     */
    removeCompletedLines(completedLines) {
        // Process lines from bottom to top to avoid index shifting issues
        for (const lineIndex of completedLines) {
            this.removeLine(lineIndex);
        }
    }

    /**
     * Removes a single line and drops all blocks above it
     * @param {number} lineIndex - Index of the line to remove
     */
    removeLine(lineIndex) {
        if (lineIndex < 0 || lineIndex >= this.height) {
            return;
        }

        // Remove the completed line by shifting all rows above it down
        for (let row = lineIndex; row > 0; row--) {
            for (let col = 0; col < this.width; col++) {
                this.board[row][col] = this.board[row - 1][col];
            }
        }

        // Clear the top row (new empty line)
        for (let col = 0; col < this.width; col++) {
            this.board[0][col] = 0;
        }
    }

    /**
     * Simulates line clearing and returns information without modifying the board
     * Useful for preview or scoring calculations
     * @returns {{linesCleared: number, completedLines: number[]}} Information about lines that would be cleared
     */
    simulateLineClear() {
        const completedLines = this.findCompletedLines();
        return {
            linesCleared: completedLines.length,
            completedLines: completedLines
        };
    }

    /**
     * Checks if the game is over (blocks have reached the top)
     * Game over occurs when the top rows contain filled blocks
     * @returns {boolean} True if game is over
     */
    isGameOver() {
        // Check the top few rows for any filled blocks
        // In Tetris, game over typically occurs when blocks reach the top
        for (let row = 0; row < 4; row++) { // Check top 4 rows
            for (let col = 0; col < this.width; col++) {
                if (this.board[row][col] > 0) {
                    return true;
                }
            }
        }
        return false;
    }
}

/**
 * InputHandler class - Manages keyboard input for the Tetris game
 * Handles key events and translates them to game commands
 * Provides input validation and prevents invalid operations
 */
class InputHandler {
    /**
     * Creates a new InputHandler instance
     * @param {GameEngine} gameEngine - Reference to the game engine for command execution
     */
    constructor(gameEngine) {
        if (!gameEngine) {
            throw new Error('GameEngine reference is required for InputHandler');
        }
        
        this.gameEngine = gameEngine;
        this.isEnabled = true;
        this.keyStates = new Map(); // Track key press states for repeat handling
        this.lastKeyTime = new Map(); // Track timing for key repeat prevention
        
        // Key mapping configuration
        this.keyMap = {
            'ArrowLeft': 'moveLeft',
            'ArrowRight': 'moveRight', 
            'ArrowUp': 'rotate',
            'ArrowDown': 'softDrop',
            ' ': 'pause', // Spacebar
            'Escape': 'pause'
        };
        
        // Key repeat settings
        this.keyRepeatDelay = 150; // Milliseconds between repeats for movement keys
        this.keyRepeatKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowDown']); // Keys that can repeat
        
        this.bindEvents();
    }

    /**
     * Binds keyboard event listeners to the document
     * Sets up keydown and keyup event handlers
     */
    bindEvents() {
        // Bind keydown event
        this.keyDownHandler = (event) => this.handleKeyDown(event);
        document.addEventListener('keydown', this.keyDownHandler);
        
        // Bind keyup event
        this.keyUpHandler = (event) => this.handleKeyUp(event);
        document.addEventListener('keyup', this.keyUpHandler);
        
        // Prevent default behavior for game keys to avoid page scrolling
        this.preventDefaultHandler = (event) => {
            if (this.isGameKey(event.key)) {
                event.preventDefault();
            }
        };
        document.addEventListener('keydown', this.preventDefaultHandler);
        
        console.log('InputHandler: Event listeners bound successfully');
    }

    /**
     * Unbinds all keyboard event listeners
     * Used for cleanup when destroying the input handler
     */
    unbindEvents() {
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
        }
        if (this.keyUpHandler) {
            document.removeEventListener('keyup', this.keyUpHandler);
        }
        if (this.preventDefaultHandler) {
            document.removeEventListener('keydown', this.preventDefaultHandler);
        }
        
        console.log('InputHandler: Event listeners unbound');
    }

    /**
     * Handles keydown events
     * Processes key input and executes corresponding game commands
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyDown(event) {
        try {
            // Validate event object
            if (!event || typeof event !== 'object') {
                this.logInputError('Invalid event object received', event);
                return;
            }

            const key = event.key;
            
            // Validate key property
            if (typeof key !== 'string') {
                this.logInputError('Invalid key property in event', { key, event });
                return;
            }

            // Validate if this is a recognized game key
            if (!this.isValidInput(key)) {
                this.handleInvalidInput(key, event);
                return;
            }

            // Get the game command for this key
            const command = this.keyMap[key];
            if (!command) {
                this.logInputError(`No command mapped for key: ${key}`, { key, keyMap: this.keyMap });
                return;
            }

            // Check game state before processing input
            if (!this.isInputAllowedInCurrentState(command)) {
                this.handleInputBlockedByGameState(command, key);
                return;
            }

            // Always allow pause command, even when input is disabled
            if (command === 'pause') {
                this.executeCommand(command, event);
                console.log(`InputHandler: Executed pause command for key '${key}'`);
                return;
            }

            // Check if input is enabled for other commands
            if (!this.isEnabled) {
                this.handleInputDisabled(command, key);
                return;
            }

            // Check for key repeat prevention
            if (this.shouldPreventRepeat(key)) {
                return;
            }

            // Update key state tracking
            this.updateKeyState(key, true);

            // Execute the game command
            this.executeCommand(command, event);
            
            console.log(`InputHandler: Executed command '${command}' for key '${key}'`);
            
        } catch (error) {
            this.handleInputProcessingError(error, event);
        }
    }

    /**
     * Handles keyup events
     * Updates key state tracking when keys are released
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyUp(event) {
        const key = event.key;
        
        // Update key state tracking
        this.updateKeyState(key, false);
    }

    /**
     * Validates if a key input is valid for the game
     * @param {string} key - The key that was pressed
     * @returns {boolean} True if the key is valid for game input
     */
    isValidInput(key) {
        // Validate key parameter
        if (typeof key !== 'string' || key.length === 0) {
            return false;
        }

        // Check if key is in our key mapping
        if (this.keyMap.hasOwnProperty(key)) {
            return true;
        }
        
        return false;
    }

    /**
     * Handles invalid input attempts
     * @param {string} key - The invalid key that was pressed
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleInvalidInput(key, event) {
        // Log invalid key attempts for debugging
        console.debug(`InputHandler: Invalid key input: ${key}`);
        
        // Check if it's a potentially harmful key combination
        if (this.isPotentiallyHarmfulInput(key, event)) {
            console.warn(`InputHandler: Potentially harmful input detected: ${key}`);
        }
        
        // Display user-friendly message for common invalid keys
        this.showInvalidInputMessage(key);
    }

    /**
     * Checks if input is potentially harmful or suspicious
     * @param {string} key - The key that was pressed
     * @param {KeyboardEvent} event - The keyboard event
     * @returns {boolean} True if input might be harmful
     */
    isPotentiallyHarmfulInput(key, event) {
        // Check for suspicious key combinations
        if (event.ctrlKey && (key === 'c' || key === 'v' || key === 'x')) {
            return false; // Allow common clipboard operations
        }
        
        // Check for function keys that might interfere with browser
        if (key.startsWith('F') && key.length <= 3) {
            return true;
        }
        
        // Check for system keys
        const systemKeys = ['Alt', 'Control', 'Meta', 'Tab', 'CapsLock'];
        return systemKeys.includes(key);
    }

    /**
     * Shows user-friendly message for invalid input
     * @param {string} key - The invalid key
     */
    showInvalidInputMessage(key) {
        // Only show messages for keys that users might expect to work
        const commonKeys = ['w', 'a', 's', 'd', 'Enter', 'Shift'];
        
        if (commonKeys.includes(key)) {
            this.displayErrorMessage(`Key '${key}' is not used in this game. Use arrow keys to play.`);
        }
    }

    /**
     * Checks if a key is a recognized game key
     * @param {string} key - The key to check
     * @returns {boolean} True if the key is used by the game
     */
    isGameKey(key) {
        return this.keyMap.hasOwnProperty(key);
    }

    /**
     * Checks if key repeat should be prevented based on timing
     * @param {string} key - The key that was pressed
     * @returns {boolean} True if the key press should be ignored due to repeat prevention
     */
    shouldPreventRepeat(key) {
        // Only apply repeat prevention to movement keys
        if (!this.keyRepeatKeys.has(key)) {
            return false;
        }

        const now = Date.now();
        const lastTime = this.lastKeyTime.get(key) || 0;
        
        // Check if enough time has passed since last press
        if (now - lastTime < this.keyRepeatDelay) {
            return true;
        }

        // Update last key time
        this.lastKeyTime.set(key, now);
        return false;
    }

    /**
     * Updates the key state tracking
     * @param {string} key - The key to update
     * @param {boolean} isPressed - Whether the key is currently pressed
     */
    updateKeyState(key, isPressed) {
        this.keyStates.set(key, isPressed);
        
        // Clear timing when key is released
        if (!isPressed) {
            this.lastKeyTime.delete(key);
        }
    }

    /**
     * Executes a game command
     * @param {string} command - The command to execute
     * @param {KeyboardEvent} event - The original keyboard event
     */
    executeCommand(command, event) {
        try {
            // Validate command parameter
            if (typeof command !== 'string' || command.length === 0) {
                this.logInputError('Invalid command parameter', { command, event });
                return;
            }

            // Check if game engine exists
            if (!this.gameEngine) {
                this.logInputError('GameEngine reference is null or undefined', { command });
                this.displayErrorMessage('Game engine error. Please refresh the page.');
                return;
            }

            // Check if game engine has the required method
            if (typeof this.gameEngine[command] !== 'function') {
                this.logInputError(`GameEngine does not have method: ${command}`, { 
                    command, 
                    availableMethods: Object.getOwnPropertyNames(this.gameEngine) 
                });
                this.displayErrorMessage(`Game command '${command}' is not available.`);
                return;
            }

            // Execute the command on the game engine
            this.gameEngine[command](event);
            
        } catch (error) {
            this.handleCommandExecutionError(error, command, event);
        }
    }

    /**
     * Handles errors that occur during command execution
     * @param {Error} error - The error that occurred
     * @param {string} command - The command that failed
     * @param {KeyboardEvent} event - The original keyboard event
     */
    handleCommandExecutionError(error, command, event) {
        console.error(`InputHandler: Error executing command '${command}':`, error);
        
        // Log detailed error information
        this.logInputError(`Command execution failed: ${command}`, {
            error: error.message,
            stack: error.stack,
            command,
            event: event ? { key: event.key, type: event.type } : null
        });
        
        // Show user-friendly error message
        this.displayErrorMessage(`Failed to execute game action. Please try again.`);
        
        // Attempt recovery if possible
        this.attemptErrorRecovery(command, error);
    }

    /**
     * Checks if input is allowed in the current game state
     * @param {string} command - The command to check
     * @returns {boolean} True if input is allowed
     */
    isInputAllowedInCurrentState(command) {
        try {
            // Always allow pause command
            if (command === 'pause') {
                return true;
            }

            // Check if game engine exists and has state
            if (!this.gameEngine || !this.gameEngine.gameState) {
                return false;
            }

            const gameState = this.gameEngine.gameState;

            // Block input during game over (except pause)
            if (gameState.isGameOverState && gameState.isGameOverState()) {
                return false;
            }

            // Allow input during normal play and pause
            return true;
            
        } catch (error) {
            console.error('InputHandler: Error checking game state:', error);
            return false; // Fail safe - block input if we can't determine state
        }
    }

    /**
     * Handles input that is blocked by current game state
     * @param {string} command - The blocked command
     * @param {string} key - The key that was pressed
     */
    handleInputBlockedByGameState(command, key) {
        try {
            if (!this.gameEngine || !this.gameEngine.gameState) {
                return;
            }

            const gameState = this.gameEngine.gameState;

            if (gameState.isGameOverState && gameState.isGameOverState()) {
                this.displayErrorMessage('Game is over. Press restart to play again.');
                console.debug(`InputHandler: Input '${key}' blocked - game over`);
            }
            
        } catch (error) {
            console.error('InputHandler: Error handling blocked input:', error);
        }
    }

    /**
     * Handles input when input processing is disabled
     * @param {string} command - The command that was attempted
     * @param {string} key - The key that was pressed
     */
    handleInputDisabled(command, key) {
        console.debug(`InputHandler: Input '${key}' ignored - input disabled`);
        // Don't show error message for disabled input as it's expected behavior
    }

    /**
     * Handles errors during input processing
     * @param {Error} error - The error that occurred
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleInputProcessingError(error, event) {
        console.error('InputHandler: Error processing input:', error);
        
        this.logInputError('Input processing error', {
            error: error.message,
            stack: error.stack,
            event: event ? { key: event.key, type: event.type } : null
        });
        
        this.displayErrorMessage('Input processing error. Please try again.');
    }

    /**
     * Logs input-related errors with detailed information
     * @param {string} message - Error message
     * @param {Object} details - Additional error details
     */
    logInputError(message, details = {}) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            message,
            inputEnabled: this.isEnabled,
            gameEngineExists: !!this.gameEngine,
            ...details
        };
        
        console.error('InputHandler Error:', errorInfo);
        
        // Store error for debugging (keep last 10 errors)
        if (!this.errorLog) {
            this.errorLog = [];
        }
        
        this.errorLog.push(errorInfo);
        if (this.errorLog.length > 10) {
            this.errorLog.shift();
        }
    }

    /**
     * Displays error message to the user
     * @param {string} message - Message to display
     */
    displayErrorMessage(message) {
        // Try to find error display element
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        } else {
            // Fallback to console if no error element exists
            console.warn('No error display element found. Message:', message);
        }
    }

    /**
     * Attempts to recover from errors
     * @param {string} command - The command that failed
     * @param {Error} error - The error that occurred
     */
    attemptErrorRecovery(command, error) {
        try {
            // Reset key states to prevent stuck keys
            this.keyStates.clear();
            this.lastKeyTime.clear();
            
            // Re-validate configuration
            if (!this.validateConfiguration()) {
                console.warn('InputHandler: Configuration validation failed during recovery');
                this.resetToDefaults();
            }
            
            console.log('InputHandler: Attempted error recovery');
            
        } catch (recoveryError) {
            console.error('InputHandler: Error during recovery attempt:', recoveryError);
        }
    }

    /**
     * Resets input handler to default state
     */
    resetToDefaults() {
        try {
            this.isEnabled = true;
            this.keyStates.clear();
            this.lastKeyTime.clear();
            this.resetKeyMap();
            
            console.log('InputHandler: Reset to defaults');
            
        } catch (error) {
            console.error('InputHandler: Error resetting to defaults:', error);
        }
    }

    /**
     * Gets error log for debugging
     * @returns {Array} Array of recent errors
     */
    getErrorLog() {
        return this.errorLog ? [...this.errorLog] : [];
    }

    /**
     * Clears the error log
     */
    clearErrorLog() {
        this.errorLog = [];
    }

    /**
     * Enables input processing
     * Allows keyboard input to be processed and executed
     */
    enable() {
        this.isEnabled = true;
        console.log('InputHandler: Input enabled');
    }

    /**
     * Disables input processing
     * Prevents keyboard input from being processed (useful during game over, menus, etc.)
     */
    disable() {
        this.isEnabled = false;
        this.keyStates.clear();
        this.lastKeyTime.clear();
        console.log('InputHandler: Input disabled');
    }

    /**
     * Checks if input is currently enabled
     * @returns {boolean} True if input is enabled
     */
    isInputEnabled() {
        return this.isEnabled;
    }

    /**
     * Gets the current state of a specific key
     * @param {string} key - The key to check
     * @returns {boolean} True if the key is currently pressed
     */
    isKeyPressed(key) {
        return this.keyStates.get(key) || false;
    }

    /**
     * Gets all currently pressed keys
     * @returns {string[]} Array of currently pressed keys
     */
    getPressedKeys() {
        const pressedKeys = [];
        for (const [key, isPressed] of this.keyStates) {
            if (isPressed) {
                pressedKeys.push(key);
            }
        }
        return pressedKeys;
    }

    /**
     * Configures key repeat settings
     * @param {number} delay - Delay in milliseconds between key repeats
     * @param {string[]} repeatKeys - Array of keys that should support repeat
     */
    configureKeyRepeat(delay, repeatKeys = []) {
        if (typeof delay === 'number' && delay > 0) {
            this.keyRepeatDelay = delay;
        }
        
        if (Array.isArray(repeatKeys)) {
            this.keyRepeatKeys = new Set(repeatKeys);
        }
        
        console.log(`InputHandler: Key repeat configured - delay: ${this.keyRepeatDelay}ms, keys: ${Array.from(this.keyRepeatKeys).join(', ')}`);
    }

    /**
     * Updates the key mapping configuration
     * @param {Object} newKeyMap - New key mapping object
     */
    updateKeyMap(newKeyMap) {
        if (typeof newKeyMap === 'object' && newKeyMap !== null) {
            this.keyMap = { ...this.keyMap, ...newKeyMap };
            console.log('InputHandler: Key mapping updated', this.keyMap);
        }
    }

    /**
     * Resets key mapping to default configuration
     */
    resetKeyMap() {
        this.keyMap = {
            'ArrowLeft': 'moveLeft',
            'ArrowRight': 'moveRight', 
            'ArrowUp': 'rotate',
            'ArrowDown': 'softDrop',
            ' ': 'pause',
            'Escape': 'pause'
        };
        console.log('InputHandler: Key mapping reset to default');
    }

    /**
     * Gets the current key mapping configuration
     * @returns {Object} Current key mapping
     */
    getKeyMap() {
        return { ...this.keyMap };
    }

    /**
     * Validates the input handler configuration
     * @returns {boolean} True if configuration is valid
     */
    validateConfiguration() {
        // Check if game engine reference exists
        if (!this.gameEngine) {
            console.error('InputHandler: No game engine reference');
            return false;
        }

        // Check if key mapping is valid
        if (!this.keyMap || typeof this.keyMap !== 'object') {
            console.error('InputHandler: Invalid key mapping');
            return false;
        }

        // Check if key mapping has required commands
        const requiredCommands = ['moveLeft', 'moveRight', 'rotate', 'softDrop', 'pause'];
        const mappedCommands = Object.values(this.keyMap);
        
        for (const command of requiredCommands) {
            if (!mappedCommands.includes(command)) {
                console.warn(`InputHandler: Missing key mapping for command: ${command}`);
            }
        }

        return true;
    }

    /**
     * Cleans up the input handler
     * Unbinds events and clears state
     */
    destroy() {
        this.unbindEvents();
        this.keyStates.clear();
        this.lastKeyTime.clear();
        this.gameEngine = null;
        this.isEnabled = false;
        
        console.log('InputHandler: Destroyed and cleaned up');
    }

    /**
     * Gets debug information about the input handler state
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        return {
            isEnabled: this.isEnabled,
            keyMap: this.keyMap,
            pressedKeys: this.getPressedKeys(),
            keyRepeatDelay: this.keyRepeatDelay,
            keyRepeatKeys: Array.from(this.keyRepeatKeys),
            hasGameEngine: !!this.gameEngine
        };
    }
}

/**
 * GameState class - Manages game state including score, level, lines, and game status
 * Handles scoring calculations and level progression logic
 */
class GameState {
    /**
     * Creates a new GameState instance
     */
    constructor() {
        this.reset();
    }

    /**
     * Resets all game state to initial values
     */
    reset() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.isRunning = false;
        
        console.log('GameState: State reset to initial values');
    }

    /**
     * Gets the current score
     * @returns {number} Current score
     */
    getScore() {
        return this.score;
    }

    /**
     * Gets the current level
     * @returns {number} Current level
     */
    getLevel() {
        return this.level;
    }

    /**
     * Gets the number of lines cleared
     * @returns {number} Total lines cleared
     */
    getLines() {
        return this.lines;
    }

    /**
     * Checks if the game is paused
     * @returns {boolean} True if game is paused
     */
    isPausedState() {
        return this.isPaused;
    }

    /**
     * Checks if the game is over
     * @returns {boolean} True if game is over
     */
    isGameOverState() {
        return this.isGameOver;
    }

    /**
     * Checks if the game is running
     * @returns {boolean} True if game is running
     */
    isRunningState() {
        return this.isRunning;
    }

    /**
     * Sets the paused state
     * @param {boolean} paused - Whether the game should be paused
     */
    setPaused(paused) {
        if (this.isGameOver) {
            return; // Cannot pause when game is over
        }
        
        this.isPaused = Boolean(paused);
        console.log(`GameState: Paused state set to ${this.isPaused}`);
    }

    /**
     * Sets the game over state
     * @param {boolean} gameOver - Whether the game is over
     */
    setGameOver(gameOver) {
        this.isGameOver = Boolean(gameOver);
        if (this.isGameOver) {
            this.isRunning = false;
            this.isPaused = false;
        }
        console.log(`GameState: Game over state set to ${this.isGameOver}`);
    }

    /**
     * Sets the running state
     * @param {boolean} running - Whether the game is running
     */
    setRunning(running) {
        this.isRunning = Boolean(running);
        if (this.isRunning) {
            this.isGameOver = false;
        }
        console.log(`GameState: Running state set to ${this.isRunning}`);
    }

    /**
     * Updates the score based on lines cleared
     * Implements Tetris scoring system with bonuses for multiple lines
     * @param {number} linesCleared - Number of lines cleared (1-4)
     * @returns {number} Points awarded for this line clear
     */
    updateScore(linesCleared) {
        if (typeof linesCleared !== 'number' || linesCleared < 0 || linesCleared > 4) {
            console.warn('GameState: Invalid linesCleared value:', linesCleared);
            return 0;
        }

        if (linesCleared === 0) {
            return 0;
        }

        // Tetris scoring system based on original game
        // Base score per line: 100 points
        // Multipliers for multiple lines (bonus for clearing more lines at once):
        // 1 line (Single): 100 × 1 = 100 points
        // 2 lines (Double): 100 × 3 = 300 points  
        // 3 lines (Triple): 100 × 5 = 500 points
        // 4 lines (Tetris): 100 × 8 = 800 points
        const baseScore = 100;
        const scoreMultipliers = {
            1: 1,   // Single - 100 points base
            2: 3,   // Double - 300 points base (bonus for clearing 2 at once)
            3: 5,   // Triple - 500 points base (bonus for clearing 3 at once)
            4: 8    // Tetris - 800 points base (big bonus for clearing 4 at once)
        };
        
        const multiplier = scoreMultipliers[linesCleared] || 1;
        const basePoints = baseScore * multiplier;
        const levelBonus = this.level; // Level multiplier
        const totalPoints = basePoints * levelBonus;
        
        this.score += totalPoints;
        
        // Log scoring details
        const lineNames = {
            1: 'Single',
            2: 'Double', 
            3: 'Triple',
            4: 'Tetris'
        };
        
        const lineName = lineNames[linesCleared] || `${linesCleared} lines`;
        console.log(`GameState: ${lineName}! ${basePoints} × ${levelBonus} (level) = ${totalPoints} points`);
        
        return totalPoints;
    }

    /**
     * Adds lines to the total count and updates level if necessary
     * Level progression: Every 10 lines cleared increases the level by 1
     * @param {number} linesCleared - Number of lines to add
     * @returns {boolean} True if level increased
     */
    addLines(linesCleared) {
        if (typeof linesCleared !== 'number' || linesCleared < 0) {
            console.warn('GameState: Invalid linesCleared value:', linesCleared);
            return false;
        }

        const previousLevel = this.level;
        const previousLines = this.lines;
        this.lines += linesCleared;
        
        // Level progression: Every 10 lines = level up
        // Level 1: 0-9 lines, Level 2: 10-19 lines, etc.
        const newLevel = Math.floor(this.lines / 10) + 1;
        const levelIncreased = newLevel > this.level;
        
        if (levelIncreased) {
            const levelsGained = newLevel - this.level;
            this.level = newLevel;
            
            console.log(`GameState: Level up! Level ${previousLevel} → ${this.level} (+${levelsGained})`);
            console.log(`GameState: Lines: ${previousLines} → ${this.lines} (+${linesCleared})`);
            console.log(`GameState: Next level at ${this.level * 10} lines (${(this.level * 10) - this.lines} lines to go)`);
        }
        
        return levelIncreased;
    }

    /**
     * Gets the drop speed for the current level
     * Drop speed decreases (gets faster) as level increases
     * @returns {number} Drop speed in milliseconds
     */
    getDropSpeed() {
        const baseSpeed = CONFIG.INITIAL_DROP_SPEED;
        const speedRate = CONFIG.SPEED_INCREASE_RATE;
        const minSpeed = 50; // Minimum drop speed (maximum speed)
        
        const calculatedSpeed = baseSpeed * Math.pow(speedRate, this.level - 1);
        return Math.max(minSpeed, calculatedSpeed);
    }

    /**
     * Gets the number of lines needed to reach the next level
     * @returns {number} Lines needed for next level
     */
    getLinesUntilNextLevel() {
        const nextLevelThreshold = this.level * 10;
        return Math.max(0, nextLevelThreshold - this.lines);
    }

    /**
     * Gets the progress towards the next level as a percentage
     * @returns {number} Progress percentage (0-100)
     */
    getLevelProgress() {
        const currentLevelStart = (this.level - 1) * 10;
        const nextLevelStart = this.level * 10;
        const progressInLevel = this.lines - currentLevelStart;
        const levelRange = nextLevelStart - currentLevelStart;
        
        return Math.min(100, (progressInLevel / levelRange) * 100);
    }

    /**
     * Calculates the score that would be awarded for clearing a specific number of lines
     * Does not modify the actual score - used for preview/calculation purposes
     * @param {number} linesCleared - Number of lines to calculate score for
     * @returns {number} Points that would be awarded
     */
    calculateScorePreview(linesCleared) {
        if (typeof linesCleared !== 'number' || linesCleared < 0 || linesCleared > 4) {
            return 0;
        }

        if (linesCleared === 0) {
            return 0;
        }

        const baseScore = 100;
        const scoreMultipliers = {
            1: 1,   // Single
            2: 3,   // Double
            3: 5,   // Triple
            4: 8    // Tetris
        };
        
        const multiplier = scoreMultipliers[linesCleared] || 1;
        const basePoints = baseScore * multiplier;
        const totalPoints = basePoints * this.level;
        
        return totalPoints;
    }

    /**
     * Awards points for soft drop (manual fast drop)
     * Gives 1 point per cell dropped manually
     * @param {number} cellsDropped - Number of cells the piece was dropped
     * @returns {number} Points awarded for soft drop
     */
    awardSoftDropPoints(cellsDropped) {
        if (typeof cellsDropped !== 'number' || cellsDropped <= 0) {
            return 0;
        }
        
        const points = cellsDropped; // 1 point per cell dropped
        this.score += points;
        
        console.log(`GameState: Soft drop bonus: ${points} points for ${cellsDropped} cells`);
        return points;
    }

    /**
     * Awards points for hard drop (instant drop to bottom)
     * Gives 2 points per cell dropped instantly
     * @param {number} cellsDropped - Number of cells the piece was dropped
     * @returns {number} Points awarded for hard drop
     */
    awardHardDropPoints(cellsDropped) {
        if (typeof cellsDropped !== 'number' || cellsDropped <= 0) {
            return 0;
        }
        
        const points = cellsDropped * 2; // 2 points per cell dropped
        this.score += points;
        
        console.log(`GameState: Hard drop bonus: ${points} points for ${cellsDropped} cells`);
        return points;
    }

    /**
     * Gets scoring statistics
     * @returns {Object} Scoring statistics and information
     */
    getScoringStats() {
        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            linesUntilNextLevel: this.getLinesUntilNextLevel(),
            levelProgress: this.getLevelProgress(),
            dropSpeed: this.getDropSpeed(),
            scorePreview: {
                single: this.calculateScorePreview(1),
                double: this.calculateScorePreview(2),
                triple: this.calculateScorePreview(3),
                tetris: this.calculateScorePreview(4)
            }
        };
    }

    /**
     * Processes a line clear event
     * Updates both score and lines, returns comprehensive information about the update
     * @param {number} linesCleared - Number of lines cleared
     * @returns {Object} Detailed information about the score and level update
     */
    processLineClear(linesCleared) {
        // Store previous values for comparison
        const previousScore = this.score;
        const previousLevel = this.level;
        const previousLines = this.lines;
        
        // Update score and lines
        const pointsAwarded = this.updateScore(linesCleared);
        const levelIncreased = this.addLines(linesCleared);
        
        // Determine line clear type
        const lineClearTypes = {
            1: 'Single',
            2: 'Double',
            3: 'Triple', 
            4: 'Tetris'
        };
        
        const lineClearType = lineClearTypes[linesCleared] || `${linesCleared} lines`;
        
        return {
            // Line clear information
            linesCleared,
            lineClearType,
            
            // Score information
            pointsAwarded,
            previousScore,
            newScore: this.score,
            
            // Level information
            levelIncreased,
            previousLevel,
            newLevel: this.level,
            levelsGained: this.level - previousLevel,
            
            // Lines information
            previousLines,
            newLines: this.lines,
            linesUntilNextLevel: this.getLinesUntilNextLevel(),
            levelProgress: this.getLevelProgress(),
            
            // Game speed information
            newDropSpeed: this.getDropSpeed(),
            
            // Complete state
            gameState: this.getState()
        };
    }

    /**
     * Gets a complete snapshot of the current game state
     * @returns {Object} Complete game state object
     */
    getState() {
        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            isPaused: this.isPaused,
            isGameOver: this.isGameOver,
            isRunning: this.isRunning,
            dropSpeed: this.getDropSpeed()
        };
    }

    /**
     * Validates the current game state
     * @returns {boolean} True if state is valid
     */
    validateState() {
        try {
            let isValid = true;
            const errors = [];

            // Check that all numeric values are valid
            if (typeof this.score !== 'number' || this.score < 0 || !Number.isFinite(this.score)) {
                errors.push(`Invalid score: ${this.score}`);
                isValid = false;
            }

            if (typeof this.level !== 'number' || this.level < 1 || !Number.isFinite(this.level)) {
                errors.push(`Invalid level: ${this.level}`);
                isValid = false;
            }

            if (typeof this.lines !== 'number' || this.lines < 0 || !Number.isFinite(this.lines)) {
                errors.push(`Invalid lines: ${this.lines}`);
                isValid = false;
            }

            // Check that boolean values are actually booleans
            if (typeof this.isPaused !== 'boolean') {
                errors.push(`Invalid isPaused type: ${typeof this.isPaused}`);
                isValid = false;
            }

            if (typeof this.isGameOver !== 'boolean') {
                errors.push(`Invalid isGameOver type: ${typeof this.isGameOver}`);
                isValid = false;
            }

            if (typeof this.isRunning !== 'boolean') {
                errors.push(`Invalid isRunning type: ${typeof this.isRunning}`);
                isValid = false;
            }

            // Check logical consistency
            if (this.isGameOver && this.isRunning) {
                errors.push('Inconsistent state - cannot be both game over and running');
                isValid = false;
            }

            if (this.isPaused && this.isGameOver) {
                errors.push('Inconsistent state - cannot be paused when game is over');
                isValid = false;
            }

            // Check reasonable value ranges
            if (this.score > 999999999) {
                errors.push(`Score too high: ${this.score}`);
                isValid = false;
            }

            if (this.level > 999) {
                errors.push(`Level too high: ${this.level}`);
                isValid = false;
            }

            if (this.lines > 999999) {
                errors.push(`Lines too high: ${this.lines}`);
                isValid = false;
            }

            // Log errors if any
            if (!isValid) {
                console.error('GameState: Validation failed:', errors);
            }

            return isValid;

        } catch (error) {
            console.error('GameState: Error during validation:', error);
            return false;
        }
    }

    /**
     * Attempts to fix invalid state values
     * @returns {boolean} True if state was fixed successfully
     */
    fixInvalidState() {
        try {
            let wasFixed = false;

            // Fix numeric values
            if (typeof this.score !== 'number' || this.score < 0 || !Number.isFinite(this.score)) {
                this.score = 0;
                wasFixed = true;
                console.warn('GameState: Fixed invalid score');
            }

            if (typeof this.level !== 'number' || this.level < 1 || !Number.isFinite(this.level)) {
                this.level = 1;
                wasFixed = true;
                console.warn('GameState: Fixed invalid level');
            }

            if (typeof this.lines !== 'number' || this.lines < 0 || !Number.isFinite(this.lines)) {
                this.lines = 0;
                wasFixed = true;
                console.warn('GameState: Fixed invalid lines');
            }

            // Fix boolean values
            if (typeof this.isPaused !== 'boolean') {
                this.isPaused = false;
                wasFixed = true;
                console.warn('GameState: Fixed invalid isPaused');
            }

            if (typeof this.isGameOver !== 'boolean') {
                this.isGameOver = false;
                wasFixed = true;
                console.warn('GameState: Fixed invalid isGameOver');
            }

            if (typeof this.isRunning !== 'boolean') {
                this.isRunning = false;
                wasFixed = true;
                console.warn('GameState: Fixed invalid isRunning');
            }

            // Fix logical inconsistencies
            if (this.isGameOver && this.isRunning) {
                this.isRunning = false;
                wasFixed = true;
                console.warn('GameState: Fixed inconsistent running/game over state');
            }

            if (this.isPaused && this.isGameOver) {
                this.isPaused = false;
                wasFixed = true;
                console.warn('GameState: Fixed inconsistent paused/game over state');
            }

            // Fix unreasonable values
            if (this.score > 999999999) {
                this.score = 999999999;
                wasFixed = true;
                console.warn('GameState: Capped excessive score');
            }

            if (this.level > 999) {
                this.level = 999;
                wasFixed = true;
                console.warn('GameState: Capped excessive level');
            }

            if (this.lines > 999999) {
                this.lines = 999999;
                wasFixed = true;
                console.warn('GameState: Capped excessive lines');
            }

            if (wasFixed) {
                console.log('GameState: State corruption fixed');
            }

            return wasFixed;

        } catch (error) {
            console.error('GameState: Error fixing invalid state:', error);
            return false;
        }
    }

    /**
     * Validates and fixes state if necessary
     * @returns {boolean} True if state is valid after any fixes
     */
    validateAndFix() {
        if (this.validateState()) {
            return true;
        }

        // Try to fix the state
        this.fixInvalidState();

        // Validate again after fixing
        return this.validateState();
    }

    /**
     * Creates a string representation of the game state for debugging
     * @returns {string} String representation
     */
    toString() {
        return `GameState: Score=${this.score}, Level=${this.level}, Lines=${this.lines}, ` +
               `Running=${this.isRunning}, Paused=${this.isPaused}, GameOver=${this.isGameOver}`;
    }
}

/**
 * GameEngine class - Main game engine that manages game state and operations
 * Handles game logic, piece movement, and coordinates between different game components
 */
class GameEngine {
    /**
     * Creates a new GameEngine instance
     * @param {HTMLCanvasElement} canvas - The canvas element for rendering
     * @param {HTMLElement} scoreElement - Element to display score
     * @param {HTMLElement} levelElement - Element to display level
     * @param {HTMLElement} linesElement - Element to display lines cleared (optional)
     */
    constructor(canvas, scoreElement, levelElement, linesElement = null) {
        try {
            // Validate required parameters
            this.validateConstructorParameters(canvas, scoreElement, levelElement);

            this.canvas = canvas;
            this.scoreElement = scoreElement;
            this.levelElement = levelElement;
            this.linesElement = linesElement;
            
            // Initialize error handling
            this.errorLog = [];
            this.isInErrorState = false;
            this.lastErrorTime = 0;
            this.errorRecoveryAttempts = 0;
            this.maxErrorRecoveryAttempts = 3;
            
            // Initialize game components with error handling
            this.initializeGameComponents();
            
            // Game pieces and positioning
            this.currentPiece = null;
            this.nextPiece = null;
            this.pieceX = 0;
            this.pieceY = 0;
            
            // Timing
            this.lastDropTime = 0;
            
            // Animation frame ID for cleanup
            this.animationId = null;
            
            // Validate initial state
            this.validateGameState();
            
            console.log('GameEngine: Initialized successfully');
            
        } catch (error) {
            this.handleConstructorError(error);
            throw error;
        }
    }

    /**
     * Validates constructor parameters
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {HTMLElement} scoreElement - Score display element
     * @param {HTMLElement} levelElement - Level display element
     */
    validateConstructorParameters(canvas, scoreElement, levelElement) {
        if (!canvas) {
            throw new Error('GameEngine: Canvas element is required');
        }
        
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('GameEngine: Canvas parameter must be an HTMLCanvasElement');
        }
        
        if (!scoreElement || !(scoreElement instanceof HTMLElement)) {
            throw new Error('GameEngine: Score element must be a valid HTMLElement');
        }
        
        if (!levelElement || !(levelElement instanceof HTMLElement)) {
            throw new Error('GameEngine: Level element must be a valid HTMLElement');
        }
        
        // Validate canvas context
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('GameEngine: Cannot get 2D context from canvas');
        }
    }

    /**
     * Initializes game components with error handling
     */
    initializeGameComponents() {
        try {
            this.gameBoard = new GameBoard();
            if (!this.gameBoard.validateBoard()) {
                throw new Error('GameBoard initialization failed validation');
            }
            
            this.gameState = new GameState();
            if (!this.gameState.validateState()) {
                throw new Error('GameState initialization failed validation');
            }
            
            this.inputHandler = new InputHandler(this);
            if (!this.inputHandler.validateConfiguration()) {
                throw new Error('InputHandler initialization failed validation');
            }
            
        } catch (error) {
            this.logError('Component initialization failed', error);
            throw new Error(`GameEngine: Failed to initialize components - ${error.message}`);
        }
    }

    /**
     * Handles constructor errors
     * @param {Error} error - The error that occurred
     */
    handleConstructorError(error) {
        console.error('GameEngine: Constructor error:', error);
        
        // Try to display error to user if possible
        try {
            this.displayCriticalError('Failed to initialize game. Please refresh the page.');
        } catch (displayError) {
            console.error('GameEngine: Could not display error message:', displayError);
        }
    }

    /**
     * Starts the game
     * Initializes game state and begins the game loop
     */
    start() {
        if (this.gameState.isRunningState()) {
            console.warn('GameEngine: Game is already running');
            return;
        }

        // Hide game over screen if visible
        this.hideGameOverScreen();
        
        // Reset game state
        this.reset();
        
        // Generate first pieces
        this.currentPiece = createRandomTetromino();
        this.nextPiece = createRandomTetromino();
        
        // Position the first piece at the top center
        this.pieceX = Math.floor(this.gameBoard.width / 2) - Math.floor(this.currentPiece.getWidth() / 2);
        this.pieceY = 0;
        
        // Check if starting position is valid
        if (!this.gameBoard.isValidPosition(this.currentPiece, this.pieceX, this.pieceY)) {
            this.gameOver();
            return;
        }
        
        this.gameState.setRunning(true);
        
        // Enable input
        this.inputHandler.enable();
        
        // Start game loop
        this.lastDropTime = Date.now();
        this.gameLoop();
        
        console.log('GameEngine: Game started');
    }

    /**
     * Pauses or resumes the game
     * Toggles between paused and running states
     */
    pause() {
        if (this.gameState.isGameOverState()) {
            return; // Cannot pause when game is over
        }

        if (!this.gameState.isRunningState()) {
            return; // Cannot pause when not running
        }

        const wasPaused = this.gameState.isPausedState();
        this.gameState.setPaused(!wasPaused);
        
        if (this.gameState.isPausedState()) {
            // Disable input when paused (except pause key)
            this.inputHandler.disable();
            console.log('GameEngine: Game paused');
        } else {
            // Re-enable input when resuming
            this.inputHandler.enable();
            // Reset drop timer to prevent immediate drop after resume
            this.resetDropTimer();
            console.log('GameEngine: Game resumed');
        }
    }

    /**
     * Resumes the game from paused state
     */
    resume() {
        if (!this.gameState.isPausedState()) {
            return;
        }
        this.pause(); // Toggle pause state
    }

    /**
     * Ends the game
     * Sets game over state and disables input
     */
    gameOver() {
        this.gameState.setGameOver(true);
        
        // Disable input
        this.inputHandler.disable();
        
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Display game over information
        this.displayGameOverInfo();
        
        console.log('GameEngine: Game over');
    }

    /**
     * Checks if the game should end
     * Evaluates game over conditions
     * @returns {boolean} True if game should end
     */
    checkGameOverCondition() {
        // Primary game over condition: new piece cannot be placed at spawn position
        if (this.currentPiece) {
            const spawnX = Math.floor(this.gameBoard.width / 2) - Math.floor(this.currentPiece.getWidth() / 2);
            const spawnY = 0;
            
            if (!this.gameBoard.isValidPosition(this.currentPiece, spawnX, spawnY)) {
                return true;
            }
        }
        
        // Secondary condition: check if board is filled to the top
        return this.gameBoard.isGameOver();
    }

    /**
     * Displays game over information
     * Shows final score, level, and lines cleared
     */
    displayGameOverInfo() {
        const finalState = this.gameState.getState();
        
        console.log('=== GAME OVER ===');
        console.log(`Final Score: ${finalState.score}`);
        console.log(`Final Level: ${finalState.level}`);
        console.log(`Lines Cleared: ${finalState.lines}`);
        console.log('================');
        
        // Update UI to show game over state
        this.showGameOverScreen();
    }

    /**
     * Shows the game over screen
     * Displays game over message and restart option
     */
    showGameOverScreen() {
        // Find the game over screen element
        const gameOverScreen = document.getElementById('gameOverScreen');
        const restartButton = document.getElementById('restartButton');
        
        if (gameOverScreen) {
            gameOverScreen.classList.remove('hidden');
            gameOverScreen.style.display = 'flex';
        }
        
        if (restartButton) {
            restartButton.focus(); // Focus on restart button for accessibility
        }
        
        console.log('GameEngine: Game over screen displayed');
    }

    /**
     * Hides the game over screen
     * Called when starting a new game
     */
    hideGameOverScreen() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
            gameOverScreen.style.display = 'none';
        }
        
        console.log('GameEngine: Game over screen hidden');
    }

    /**
     * Restarts the game
     * Resets all state and starts a new game
     */
    restart() {
        console.log('GameEngine: Restarting game...');
        
        // Hide game over screen
        this.hideGameOverScreen();
        
        // Reset the game
        this.reset();
        
        // Start new game
        this.start();
        
        console.log('GameEngine: Game restarted successfully');
    }

    /**
     * Resets the game to initial state
     * Clears the board and resets all game state
     */
    reset() {
        // Cancel any running animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Reset game components
        this.gameBoard.clear();
        this.gameState.reset();
        
        // Clear pieces
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceX = 0;
        this.pieceY = 0;
        
        // Reset timing
        this.lastDropTime = 0;
        
        // Update UI
        this.updateScore();
        this.updateLevel();
        this.updateLines();
        
        console.log('GameEngine: Game reset');
    }

    /**
     * Main game loop using requestAnimationFrame
     * Handles game updates and rendering
     */
    gameLoop() {
        // Store animation ID for cleanup
        this.animationId = requestAnimationFrame(() => this.gameLoop());
        
        // Skip update if game is not running or is paused
        if (!this.gameState.isRunningState() || this.gameState.isPausedState()) {
            return;
        }
        
        // Update game state
        this.update();
        
        // Render the game
        this.render();
    }

    /**
     * Updates the game state
     * Handles piece dropping, collision detection, and line clearing
     */
    update() {
        if (!this.currentPiece) {
            return;
        }

        // Handle automatic piece dropping based on level
        this.handleAutomaticDrop();
    }

    /**
     * Handles automatic tetromino dropping based on level speed
     * Implements the core drop timer system with level-based speed adjustment
     */
    handleAutomaticDrop() {
        const currentTime = Date.now();
        const dropSpeed = this.gameState.getDropSpeed();
        
        // Check if enough time has passed for the next drop
        if (currentTime - this.lastDropTime >= dropSpeed) {
            this.performAutomaticDrop();
            this.lastDropTime = currentTime;
        }
    }

    /**
     * Performs an automatic drop of the current piece
     * Handles the drop completion and piece placement logic
     */
    performAutomaticDrop() {
        if (!this.currentPiece) {
            return;
        }

        const newY = this.pieceY + 1;
        
        // Check if piece can move down one more row
        if (this.gameBoard.isValidPosition(this.currentPiece, this.pieceX, newY)) {
            // Move piece down
            this.pieceY = newY;
            console.log(`GameEngine: Auto-dropped piece to row ${this.pieceY}`);
        } else {
            // Piece has reached bottom or hit another piece
            this.handleDropCompletion();
        }
    }

    /**
     * Handles the completion of a piece drop
     * Places the piece, clears lines, and spawns the next piece
     */
    handleDropCompletion() {
        if (!this.currentPiece) {
            return;
        }

        console.log(`GameEngine: Drop completed for ${this.currentPiece.getType()} at (${this.pieceX}, ${this.pieceY})`);
        
        // Place the piece on the board
        const placed = this.gameBoard.placePiece(this.currentPiece, this.pieceX, this.pieceY);
        
        if (!placed) {
            console.error('GameEngine: Failed to place piece during drop completion');
            this.gameOver();
            return;
        }

        // Process line clearing
        this.processLineClearAfterDrop();
        
        // Spawn the next piece
        this.spawnNextPiece();
    }

    /**
     * Spawns the next piece and generates a new next piece
     */
    spawnNextPiece() {
        // Move next piece to current
        this.currentPiece = this.nextPiece;
        this.nextPiece = createRandomTetromino();
        
        // Position new piece at top center
        this.pieceX = Math.floor(this.gameBoard.width / 2) - Math.floor(this.currentPiece.getWidth() / 2);
        this.pieceY = 0;
        
        // Check game over condition before placing new piece
        if (this.checkGameOverCondition()) {
            console.log('GameEngine: Cannot spawn new piece - game over condition met');
            this.gameOver();
            return;
        }
        
        console.log(`GameEngine: Spawned new ${this.currentPiece.getType()} piece at (${this.pieceX}, ${this.pieceY})`);
    }

    /**
     * Processes line clearing after a piece has been placed
     * Updates score and level based on lines cleared
     */
    processLineClearAfterDrop() {
        const linesCleared = this.gameBoard.clearLines();
        
        if (linesCleared > 0) {
            const result = this.gameState.processLineClear(linesCleared);
            console.log(`GameEngine: ${result.lineClearType}! +${result.pointsAwarded} points`);
            
            if (result.levelIncreased) {
                console.log(`GameEngine: Level up! Now level ${result.newLevel} (speed: ${result.newDropSpeed}ms)`);
            }
        }
    }

    /**
     * Gets the current drop speed based on level
     * @returns {number} Drop speed in milliseconds
     */
    getCurrentDropSpeed() {
        return this.gameState.getDropSpeed();
    }

    /**
     * Resets the drop timer
     * Used when resuming from pause or after manual movements
     */
    resetDropTimer() {
        this.lastDropTime = Date.now();
        console.log('GameEngine: Drop timer reset');
    }

    /**
     * Renders the game
     * Draws the board, current piece, and UI elements
     */
    render() {
        try {
            // Check if we're in error state
            if (this.isInErrorState) {
                return; // Skip rendering if in error state
            }

            // Validate canvas and context
            if (!this.canvas) {
                throw new Error('Canvas element is null');
            }

            const context = this.canvas.getContext('2d');
            if (!context) {
                throw new Error('Cannot get 2D context from canvas');
            }

            // Clear the canvas
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update UI elements with error handling
            this.safeCall(this.updateScore, 'ui_update');
            this.safeCall(this.updateLevel, 'ui_update');
            this.safeCall(this.updateLines, 'ui_update');

            // Basic rendering (placeholder for future Renderer class)
            this.renderGameBoard(context);
            this.renderCurrentPiece(context);

        } catch (error) {
            this.handleRenderingError(error);
        }
    }

    /**
     * Renders the game board (basic implementation)
     * @param {CanvasRenderingContext2D} context - Canvas context
     */
    renderGameBoard(context) {
        try {
            if (!this.gameBoard) {
                return;
            }

            const board = this.gameBoard.getBoard();
            const blockSize = 30;

            // Draw filled blocks
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[row].length; col++) {
                    if (board[row][col] > 0) {
                        const x = col * blockSize;
                        const y = row * blockSize;
                        
                        context.fillStyle = this.gameBoard.getColorFromId(board[row][col]);
                        context.fillRect(x, y, blockSize, blockSize);
                        
                        // Draw border
                        context.strokeStyle = '#ffffff';
                        context.lineWidth = 1;
                        context.strokeRect(x, y, blockSize, blockSize);
                    }
                }
            }

            // Draw grid lines
            context.strokeStyle = '#333333';
            context.lineWidth = 1;
            
            // Vertical lines
            for (let col = 0; col <= this.gameBoard.width; col++) {
                const x = col * blockSize;
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, this.gameBoard.height * blockSize);
                context.stroke();
            }
            
            // Horizontal lines
            for (let row = 0; row <= this.gameBoard.height; row++) {
                const y = row * blockSize;
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(this.gameBoard.width * blockSize, y);
                context.stroke();
            }

        } catch (error) {
            console.error('GameEngine: Error rendering game board:', error);
        }
    }

    /**
     * Renders the current piece (basic implementation)
     * @param {CanvasRenderingContext2D} context - Canvas context
     */
    renderCurrentPiece(context) {
        try {
            if (!this.currentPiece) {
                return;
            }

            const shape = this.currentPiece.getShape();
            const color = this.currentPiece.getColor();
            const blockSize = 30;

            context.fillStyle = color;

            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col] === 1) {
                        const x = (this.pieceX + col) * blockSize;
                        const y = (this.pieceY + row) * blockSize;
                        
                        context.fillRect(x, y, blockSize, blockSize);
                        
                        // Draw border
                        context.strokeStyle = '#ffffff';
                        context.lineWidth = 2;
                        context.strokeRect(x, y, blockSize, blockSize);
                    }
                }
            }

        } catch (error) {
            console.error('GameEngine: Error rendering current piece:', error);
        }
    }

    /**
     * Drops the current piece by one row (manual or automatic)
     * Handles piece placement and spawning new pieces
     */
    dropPiece() {
        if (!this.currentPiece) {
            return;
        }

        const newY = this.pieceY + 1;
        
        // Check if piece can move down
        if (this.gameBoard.isValidPosition(this.currentPiece, this.pieceX, newY)) {
            this.pieceY = newY;
        } else {
            // Piece cannot move down, handle drop completion
            this.handleDropCompletion();
        }
    }



    /**
     * Spawns the next piece and generates a new next piece
     */
    spawnNextPiece() {
        // Move next piece to current
        this.currentPiece = this.nextPiece;
        this.nextPiece = createRandomTetromino();
        
        // Position new piece at top center
        this.pieceX = Math.floor(this.gameBoard.width / 2) - Math.floor(this.currentPiece.getWidth() / 2);
        this.pieceY = 0;
        
        // Check if new piece can be placed (game over condition)
        if (!this.gameBoard.isValidPosition(this.currentPiece, this.pieceX, this.pieceY)) {
            this.gameOver();
            return;
        }
        
        console.log(`GameEngine: Spawned new ${this.currentPiece.getType()} piece`);
    }

    /**
     * Moves the current piece left
     */
    moveLeft() {
        if (!this.canMove()) {
            return;
        }

        const newX = this.pieceX - 1;
        
        if (this.gameBoard.isValidPosition(this.currentPiece, newX, this.pieceY)) {
            this.pieceX = newX;
            console.log('GameEngine: Moved piece left');
        }
    }

    /**
     * Moves the current piece right
     */
    moveRight() {
        if (!this.canMove()) {
            return;
        }

        const newX = this.pieceX + 1;
        
        if (this.gameBoard.isValidPosition(this.currentPiece, newX, this.pieceY)) {
            this.pieceX = newX;
            console.log('GameEngine: Moved piece right');
        }
    }

    /**
     * Rotates the current piece clockwise
     */
    rotate() {
        if (!this.canMove()) {
            return;
        }

        // Get the rotated shape to test
        const rotatedShape = this.currentPiece.getRotatedShape();
        const originalRotation = this.currentPiece.getRotation();
        
        // Temporarily apply rotation to test position
        this.currentPiece.rotate();
        
        // Check if rotated piece fits in current position
        if (this.gameBoard.isValidPosition(this.currentPiece, this.pieceX, this.pieceY)) {
            console.log('GameEngine: Rotated piece');
            return;
        }
        
        // Try wall kicks (simple implementation)
        const wallKicks = [-1, 1, -2, 2]; // Try moving left/right to fit rotation
        
        for (const kick of wallKicks) {
            const testX = this.pieceX + kick;
            if (this.gameBoard.isValidPosition(this.currentPiece, testX, this.pieceY)) {
                this.pieceX = testX;
                console.log(`GameEngine: Rotated piece with wall kick (${kick})`);
                return;
            }
        }
        
        // Rotation failed, revert to original rotation
        this.currentPiece.setRotation(originalRotation);
        console.log('GameEngine: Rotation blocked');
    }

    /**
     * Performs a soft drop (faster drop)
     */
    softDrop() {
        if (!this.canMove()) {
            return;
        }

        const originalY = this.pieceY;
        this.dropPiece();
        
        // Award points for soft drop
        const cellsDropped = this.pieceY - originalY;
        if (cellsDropped > 0) {
            this.gameState.awardSoftDropPoints(cellsDropped);
        }
    }

    /**
     * Performs a hard drop (instant drop to bottom)
     */
    hardDrop() {
        if (!this.canMove()) {
            return;
        }

        const originalY = this.pieceY;
        
        // Drop piece as far as possible
        while (this.gameBoard.isValidPosition(this.currentPiece, this.pieceX, this.pieceY + 1)) {
            this.pieceY++;
        }
        
        // Award points for hard drop
        const cellsDropped = this.pieceY - originalY;
        if (cellsDropped > 0) {
            this.gameState.awardHardDropPoints(cellsDropped);
        }
        
        // Place the piece immediately
        this.handleDropCompletion();
        
        console.log(`GameEngine: Hard drop - ${cellsDropped} cells`);
    }

    /**
     * Resets the game to initial state
     */
    reset() {
        // Clear board
        this.gameBoard.clear();
        
        // Reset game state
        this.gameState.reset();
        
        // Reset timing
        this.lastDropTime = 0;
        
        // Clear pieces
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceX = 0;
        this.pieceY = 0;
        
        // Update UI
        this.updateScore();
        this.updateLevel();
        this.updateLines();
        
        console.log('GameEngine: Game reset');
    }

    /**
     * Main game loop
     * Handles timing, updates, and rendering
     */
    gameLoop() {
        try {
            // Check if we're in an error state
            if (this.isInErrorState) {
                // Try to recover from error state
                if (Date.now() - this.lastErrorTime > 1000) { // Wait 1 second before retry
                    this.attemptRenderingRecovery();
                }
                
                // Continue loop even in error state to allow recovery
                this.animationId = requestAnimationFrame(() => this.gameLoop());
                return;
            }

            // Validate game state before proceeding
            if (!this.validateGameState()) {
                this.handleGameLogicError(new Error('Invalid game state in game loop'), 'game_loop');
                return;
            }

            if (!this.gameState.isRunningState() || this.gameState.isGameOverState()) {
                return;
            }

            const currentTime = Date.now();
            
            // Validate timing
            if (typeof currentTime !== 'number' || !Number.isFinite(currentTime)) {
                this.handleGameLogicError(new Error('Invalid current time'), 'timing');
                return;
            }

            const dropSpeed = this.gameState.getDropSpeed();
            
            // Validate drop speed
            if (typeof dropSpeed !== 'number' || dropSpeed <= 0 || !Number.isFinite(dropSpeed)) {
                this.handleGameLogicError(new Error(`Invalid drop speed: ${dropSpeed}`), 'timing');
                return;
            }
            
            // Handle automatic piece dropping
            if (!this.gameState.isPausedState() && currentTime - this.lastDropTime >= dropSpeed) {
                this.safeCall(this.dropPiece, 'piece_movement');
                this.lastDropTime = currentTime;
            }
            
            // Render the game
            this.safeCall(this.render, 'rendering');
            
            // Continue game loop
            this.animationId = requestAnimationFrame(() => this.gameLoop());
            
        } catch (error) {
            this.handleGameLogicError(error, 'game_loop');
            
            // Try to continue the game loop after error
            setTimeout(() => {
                if (!this.gameState.isGameOverState()) {
                    this.animationId = requestAnimationFrame(() => this.gameLoop());
                }
            }, 100);
        }
    }

    /**
     * Moves the current piece left
     * Validates the move before applying it
     */
    moveLeft() {
        if (!this.canMove() || !this.currentPiece) {
            return;
        }

        const newX = this.pieceX - 1;
        
        if (this.gameBoard.isValidPosition(this.currentPiece, newX, this.pieceY)) {
            this.pieceX = newX;
            console.log('GameEngine: Moved piece left');
        }
    }

    /**
     * Moves the current piece right
     * Validates the move before applying it
     */
    moveRight() {
        if (!this.canMove() || !this.currentPiece) {
            return;
        }

        const newX = this.pieceX + 1;
        
        if (this.gameBoard.isValidPosition(this.currentPiece, newX, this.pieceY)) {
            this.pieceX = newX;
            console.log('GameEngine: Moved piece right');
        }
    }

    /**
     * Rotates the current piece clockwise
     * Validates the rotation before applying it
     */
    rotate() {
        if (!this.canMove() || !this.currentPiece) {
            return;
        }

        // Create a copy to test rotation
        const testPiece = this.currentPiece.clone();
        
        try {
            testPiece.rotate();
            
            // Check if rotated piece fits in current position
            if (this.gameBoard.isValidPosition(testPiece, this.pieceX, this.pieceY)) {
                this.currentPiece.rotate();
                console.log('GameEngine: Rotated piece');
            } else {
                // Try wall kicks (simple implementation)
                const wallKickOffsets = [-1, 1, -2, 2]; // Try moving left/right to fit rotation
                
                for (const offset of wallKickOffsets) {
                    const testX = this.pieceX + offset;
                    if (this.gameBoard.isValidPosition(testPiece, testX, this.pieceY)) {
                        this.currentPiece.rotate();
                        this.pieceX = testX;
                        console.log(`GameEngine: Rotated piece with wall kick (offset: ${offset})`);
                        return;
                    }
                }
                
                console.log('GameEngine: Rotation blocked - no valid position');
            }
        } catch (error) {
            console.warn('GameEngine: Rotation failed:', error.message);
        }
    }

    /**
     * Performs soft drop (fast drop) of the current piece
     * Moves the piece down faster than normal drop speed and awards bonus points
     */
    softDrop() {
        if (!this.canMove() || !this.currentPiece) {
            return;
        }

        const newY = this.pieceY + 1;
        
        if (this.gameBoard.isValidPosition(this.currentPiece, this.pieceX, newY)) {
            this.pieceY = newY;
            
            // Award soft drop points (1 point per cell dropped manually)
            const points = this.gameState.awardSoftDropPoints(1);
            if (points > 0) {
                this.updateScore(); // Update UI
            }
            
            // Reset drop timer to prevent double-drop
            this.lastDropTime = Date.now();
            console.log('GameEngine: Soft drop');
        } else {
            // Piece has landed, place it immediately
            this.placePiece();
        }
    }

    /**
     * Drops the current piece by one row (automatic drop)
     * Called by the game loop at regular intervals
     */
    dropPiece() {
        if (!this.currentPiece) {
            return;
        }

        const newY = this.pieceY + 1;
        
        if (this.gameBoard.isValidPosition(this.currentPiece, this.pieceX, newY)) {
            this.pieceY = newY;
        } else {
            // Piece has landed
            this.placePiece();
        }
    }

    /**
     * Places the current piece on the board and spawns a new piece
     */
    placePiece() {
        if (!this.currentPiece) {
            return;
        }

        // Place the piece on the board
        if (this.gameBoard.placePiece(this.currentPiece, this.pieceX, this.pieceY)) {
            console.log(`GameEngine: Placed ${this.currentPiece.getType()} at (${this.pieceX}, ${this.pieceY})`);
            
            // Clear completed lines
            const linesCleared = this.gameBoard.clearLines();
            if (linesCleared > 0) {
                const result = this.gameState.processLineClear(linesCleared);
                console.log(`GameEngine: Cleared ${linesCleared} lines, awarded ${result.pointsAwarded} points`);
                
                if (result.levelIncreased) {
                    console.log(`GameEngine: Level increased to ${result.newLevel}! New drop speed: ${result.newDropSpeed}ms`);
                }
                
                // Update UI
                this.updateScore();
                this.updateLevel();
                this.updateLines();
            }
            
            // Spawn next piece
            this.spawnNextPiece();
        } else {
            console.error('GameEngine: Failed to place piece');
            this.gameOver();
        }
    }

    /**
     * Spawns the next piece and generates a new next piece
     */
    spawnNextPiece() {
        // Move next piece to current
        this.currentPiece = this.nextPiece;
        this.nextPiece = createRandomTetromino();
        
        // Position new piece at top center
        this.pieceX = Math.floor(this.gameBoard.width / 2) - Math.floor(this.currentPiece.getWidth() / 2);
        this.pieceY = 0;
        
        // Check if new piece can be placed (game over condition)
        if (!this.gameBoard.isValidPosition(this.currentPiece, this.pieceX, this.pieceY)) {
            this.gameOver();
            return;
        }
        
        console.log(`GameEngine: Spawned new ${this.currentPiece.getType()} piece`);
    }

    /**
     * Updates the score display in the UI
     */
    updateScore() {
        try {
            if (!this.scoreElement) {
                console.warn('GameEngine: Score element not found');
                return;
            }

            if (!this.gameState) {
                console.error('GameEngine: GameState not available for score update');
                return;
            }

            const score = this.gameState.getScore();
            
            // Validate score value
            if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
                console.error(`GameEngine: Invalid score value: ${score}`);
                this.scoreElement.textContent = '0';
                return;
            }

            this.scoreElement.textContent = score.toLocaleString();
            
        } catch (error) {
            console.error('GameEngine: Error updating score display:', error);
            if (this.scoreElement) {
                this.scoreElement.textContent = 'Error';
            }
        }
    }

    /**
     * Updates the level display in the UI
     */
    updateLevel() {
        try {
            if (!this.levelElement) {
                console.warn('GameEngine: Level element not found');
                return;
            }

            if (!this.gameState) {
                console.error('GameEngine: GameState not available for level update');
                return;
            }

            const level = this.gameState.getLevel();
            
            // Validate level value
            if (typeof level !== 'number' || !Number.isFinite(level) || level < 1) {
                console.error(`GameEngine: Invalid level value: ${level}`);
                this.levelElement.textContent = '1';
                return;
            }

            this.levelElement.textContent = level.toString();
            
        } catch (error) {
            console.error('GameEngine: Error updating level display:', error);
            if (this.levelElement) {
                this.levelElement.textContent = 'Error';
            }
        }
    }

    /**
     * Updates the lines display in the UI
     */
    updateLines() {
        try {
            if (!this.linesElement) {
                // Lines element is optional, so just return silently
                return;
            }

            if (!this.gameState) {
                console.error('GameEngine: GameState not available for lines update');
                return;
            }

            const lines = this.gameState.getLines();
            
            // Validate lines value
            if (typeof lines !== 'number' || !Number.isFinite(lines) || lines < 0) {
                console.error(`GameEngine: Invalid lines value: ${lines}`);
                this.linesElement.textContent = '0';
                return;
            }

            this.linesElement.textContent = lines.toString();
            
        } catch (error) {
            console.error('GameEngine: Error updating lines display:', error);
            if (this.linesElement) {
                this.linesElement.textContent = 'Error';
            }
        }
    }

    /**
     * Checks if the current piece can be moved
     * @returns {boolean} True if piece can be moved
     */
    canMove() {
        return this.gameState.isRunningState() && 
               !this.gameState.isPausedState() && 
               !this.gameState.isGameOverState() && 
               this.currentPiece;
    }

    /**
     * Gets the current game state
     * @returns {Object} Current game state
     */
    getGameState() {
        const state = this.gameState.getState();
        return {
            ...state,
            currentPiece: this.currentPiece ? {
                type: this.currentPiece.getType(),
                x: this.pieceX,
                y: this.pieceY,
                rotation: this.currentPiece.getRotation()
            } : null,
            nextPiece: this.nextPiece ? {
                type: this.nextPiece.getType()
            } : null
        };
    }

    /**
     * Validates the game engine state
     * @returns {boolean} True if state is valid
     */
    validateState() {
        // Check required components
        if (!this.gameBoard || !this.gameState || !this.inputHandler) {
            console.error('GameEngine: Missing required components');
            return false;
        }

        // Check UI elements
        if (!this.canvas || !this.scoreElement || !this.levelElement) {
            console.error('GameEngine: Missing required UI elements');
            return false;
        }

        // Validate game state
        if (!this.gameState.validateState()) {
            console.error('GameEngine: Invalid game state');
            return false;
        }

        return true;
    }

    /**
     * Cleans up the game engine
     * Stops the game loop and cleans up resources
     */
    destroy() {
        // Stop game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Clean up input handler
        if (this.inputHandler) {
            this.inputHandler.destroy();
            this.inputHandler = null;
        }

        // Clear references
        this.gameBoard = null;
        this.gameState = null;
        this.currentPiece = null;
        this.nextPiece = null;
        this.canvas = null;
        this.scoreElement = null;
        this.levelElement = null;
        
        console.log('GameEngine: Destroyed and cleaned up');
    }

    // ===== ERROR HANDLING METHODS =====

    /**
     * Validates the current game state
     * @returns {boolean} True if game state is valid
     */
    validateGameState() {
        try {
            // Check if core components exist
            if (!this.gameBoard || !this.gameState) {
                this.logError('Core components missing', { 
                    gameBoard: !!this.gameBoard, 
                    gameState: !!this.gameState 
                });
                return false;
            }

            // Validate game board
            if (!this.gameBoard.validateBoard()) {
                this.logError('GameBoard validation failed');
                return false;
            }

            // Validate game state
            if (!this.gameState.validateState()) {
                this.logError('GameState validation failed');
                return false;
            }

            // Check piece consistency
            if (this.currentPiece && !this.validateCurrentPiece()) {
                this.logError('Current piece validation failed');
                return false;
            }

            return true;
            
        } catch (error) {
            this.logError('Error during game state validation', error);
            return false;
        }
    }

    /**
     * Validates the current piece state
     * @returns {boolean} True if current piece is valid
     */
    validateCurrentPiece() {
        try {
            if (!this.currentPiece) {
                return true; // No piece is valid state
            }

            // Check piece validity
            if (!this.currentPiece.validateCurrentShape()) {
                return false;
            }

            // Check piece position bounds
            if (typeof this.pieceX !== 'number' || typeof this.pieceY !== 'number') {
                return false;
            }

            // Check if piece position is reasonable (not too far out of bounds)
            if (this.pieceX < -10 || this.pieceX > this.gameBoard.width + 10 ||
                this.pieceY < -10 || this.pieceY > this.gameBoard.height + 10) {
                return false;
            }

            return true;
            
        } catch (error) {
            this.logError('Error validating current piece', error);
            return false;
        }
    }

    /**
     * Logs an error with detailed information
     * @param {string} message - Error message
     * @param {Error|Object} details - Error details or additional information
     */
    logError(message, details = null) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            message,
            details: details instanceof Error ? {
                name: details.name,
                message: details.message,
                stack: details.stack
            } : details,
            gameState: this.gameState ? {
                isRunning: this.gameState.isRunningState(),
                isPaused: this.gameState.isPausedState(),
                isGameOver: this.gameState.isGameOverState(),
                score: this.gameState.getScore(),
                level: this.gameState.getLevel()
            } : null,
            currentPiece: this.currentPiece ? {
                type: this.currentPiece.getType(),
                rotation: this.currentPiece.getRotation(),
                x: this.pieceX,
                y: this.pieceY
            } : null
        };

        console.error('GameEngine Error:', errorInfo);

        // Store error for debugging (keep last 20 errors)
        if (!this.errorLog) {
            this.errorLog = [];
        }
        
        this.errorLog.push(errorInfo);
        if (this.errorLog.length > 20) {
            this.errorLog.shift();
        }
    }

    /**
     * Handles rendering errors
     * @param {Error} error - The rendering error
     */
    handleRenderingError(error) {
        this.logError('Rendering error occurred', error);
        
        // Set error state to prevent further rendering attempts
        this.isInErrorState = true;
        
        // Try to recover
        this.attemptRenderingRecovery();
        
        // Display error to user
        this.displayErrorMessage('Display error occurred. Attempting to recover...');
    }

    /**
     * Attempts to recover from rendering errors
     */
    attemptRenderingRecovery() {
        try {
            // Increment recovery attempts
            this.errorRecoveryAttempts++;
            
            if (this.errorRecoveryAttempts > this.maxErrorRecoveryAttempts) {
                this.handleCriticalError('Too many rendering errors. Game cannot continue.');
                return;
            }

            // Try to get a fresh canvas context
            const context = this.canvas.getContext('2d');
            if (!context) {
                throw new Error('Cannot get canvas context');
            }

            // Clear the canvas
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Reset error state
            this.isInErrorState = false;
            
            console.log('GameEngine: Rendering recovery successful');
            
        } catch (recoveryError) {
            this.logError('Rendering recovery failed', recoveryError);
            this.handleCriticalError('Cannot recover from rendering error.');
        }
    }

    /**
     * Handles game logic errors
     * @param {Error} error - The game logic error
     * @param {string} operation - The operation that failed
     */
    handleGameLogicError(error, operation) {
        this.logError(`Game logic error in ${operation}`, error);
        
        // Try to recover based on the operation
        switch (operation) {
            case 'piece_movement':
                this.recoverFromMovementError();
                break;
            case 'line_clearing':
                this.recoverFromLineClearError();
                break;
            case 'piece_generation':
                this.recoverFromPieceGenerationError();
                break;
            default:
                this.attemptGeneralRecovery();
        }
    }

    /**
     * Recovers from piece movement errors
     */
    recoverFromMovementError() {
        try {
            // Reset piece to a safe position
            if (this.currentPiece) {
                // Try to place piece at center top
                this.pieceX = Math.floor(this.gameBoard.width / 2) - Math.floor(this.currentPiece.getWidth() / 2);
                this.pieceY = 0;
                
                // If that doesn't work, generate a new piece
                if (!this.gameBoard.isValidPosition(this.currentPiece, this.pieceX, this.pieceY)) {
                    this.generateNewPiece();
                }
            }
            
            console.log('GameEngine: Recovered from movement error');
            
        } catch (error) {
            this.logError('Movement error recovery failed', error);
            this.handleCriticalError('Cannot recover from movement error.');
        }
    }

    /**
     * Recovers from line clearing errors
     */
    recoverFromLineClearError() {
        try {
            // Validate board state
            if (!this.gameBoard.validateBoard()) {
                // Reset board if corrupted
                this.gameBoard.clear();
                console.warn('GameEngine: Board reset due to corruption');
            }
            
            // Continue game
            console.log('GameEngine: Recovered from line clear error');
            
        } catch (error) {
            this.logError('Line clear error recovery failed', error);
            this.handleCriticalError('Cannot recover from line clearing error.');
        }
    }

    /**
     * Recovers from piece generation errors
     */
    recoverFromPieceGenerationError() {
        try {
            // Try to generate a simple piece (I-piece as fallback)
            this.currentPiece = new Tetromino('I');
            this.nextPiece = new Tetromino('O');
            
            // Position at center top
            this.pieceX = Math.floor(this.gameBoard.width / 2) - Math.floor(this.currentPiece.getWidth() / 2);
            this.pieceY = 0;
            
            console.log('GameEngine: Recovered from piece generation error');
            
        } catch (error) {
            this.logError('Piece generation error recovery failed', error);
            this.handleCriticalError('Cannot recover from piece generation error.');
        }
    }

    /**
     * Attempts general error recovery
     */
    attemptGeneralRecovery() {
        try {
            // Validate and fix game state
            if (!this.validateGameState()) {
                // Reset to safe state
                this.reset();
                console.warn('GameEngine: Game reset due to invalid state');
            }
            
            console.log('GameEngine: General recovery completed');
            
        } catch (error) {
            this.logError('General recovery failed', error);
            this.handleCriticalError('Cannot recover from error.');
        }
    }

    /**
     * Handles critical errors that cannot be recovered from
     * @param {string} message - Critical error message
     */
    handleCriticalError(message) {
        console.error('GameEngine: CRITICAL ERROR -', message);
        
        // Stop the game
        this.gameState.setGameOver(true);
        
        // Disable input
        if (this.inputHandler) {
            this.inputHandler.disable();
        }
        
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Display critical error to user
        this.displayCriticalError(message);
    }

    /**
     * Displays error message to user
     * @param {string} message - Error message to display
     */
    displayErrorMessage(message) {
        try {
            const errorElement = document.getElementById('error-message');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 5000);
            }
        } catch (error) {
            console.error('GameEngine: Could not display error message:', error);
        }
    }

    /**
     * Displays critical error message to user
     * @param {string} message - Critical error message
     */
    displayCriticalError(message) {
        try {
            // Try to use error element first
            this.displayErrorMessage(`CRITICAL: ${message} Please refresh the page.`);
            
            // Also try to show game over screen with error
            const gameOverScreen = document.getElementById('gameOverScreen');
            if (gameOverScreen) {
                const errorText = gameOverScreen.querySelector('h2');
                if (errorText) {
                    errorText.textContent = 'Critical Error';
                }
                gameOverScreen.classList.remove('hidden');
                gameOverScreen.style.display = 'flex';
            }
            
        } catch (error) {
            console.error('GameEngine: Could not display critical error:', error);
            // Last resort - alert (not ideal but better than nothing)
            alert(`Critical Error: ${message} Please refresh the page.`);
        }
    }

    /**
     * Gets error log for debugging
     * @returns {Array} Array of recent errors
     */
    getErrorLog() {
        return this.errorLog ? [...this.errorLog] : [];
    }

    /**
     * Clears the error log
     */
    clearErrorLog() {
        this.errorLog = [];
        this.errorRecoveryAttempts = 0;
    }

    /**
     * Checks if game is in error state
     * @returns {boolean} True if in error state
     */
    isInError() {
        return this.isInErrorState;
    }

    /**
     * Wraps a method call with error handling
     * @param {Function} method - Method to call
     * @param {string} operationName - Name of the operation for error reporting
     * @param {...any} args - Arguments to pass to the method
     * @returns {any} Method result or null if error occurred
     */
    safeCall(method, operationName, ...args) {
        try {
            return method.apply(this, args);
        } catch (error) {
            this.handleGameLogicError(error, operationName);
            return null;
        }
    }
}

/**
 * Game initialization and startup
 * Sets up the game when the page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tetris Game: DOM loaded, initializing game...');
    
    // Validate tetromino data before starting
    if (!validateTetrominoData()) {
        console.error('Tetris Game: Invalid tetromino data, cannot start game');
        return;
    }
    
    // Get required DOM elements
    const canvas = document.getElementById('gameCanvas');
    const scoreElement = document.getElementById('scoreValue');
    const levelElement = document.getElementById('levelValue');
    const linesElement = document.getElementById('linesValue');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const restartButton = document.getElementById('restartButton');
    
    // Validate required elements exist
    if (!canvas || !scoreElement || !levelElement) {
        console.error('Tetris Game: Required DOM elements not found');
        return;
    }
    
    // Initialize game engine
    let gameEngine;
    
    try {
        gameEngine = new GameEngine(canvas, scoreElement, levelElement, linesElement);
        console.log('Tetris Game: Game engine initialized successfully');
    } catch (error) {
        console.error('Tetris Game: Failed to initialize game engine:', error);
        return;
    }
    
    // Set up button event listeners
    if (startButton) {
        startButton.addEventListener('click', function() {
            gameEngine.start();
            console.log('Tetris Game: Start button clicked');
        });
    }
    
    if (pauseButton) {
        pauseButton.addEventListener('click', function() {
            gameEngine.pause();
            console.log('Tetris Game: Pause button clicked');
        });
    }
    
    if (restartButton) {
        restartButton.addEventListener('click', function() {
            gameEngine.restart();
            console.log('Tetris Game: Restart button clicked');
        });
    }
    
    // Display controls information
    console.log('Tetris Game: Controls:');
    console.log('  ← → : Move left/right');
    console.log('  ↑   : Rotate');
    console.log('  ↓   : Soft drop');
    console.log('  Space/Esc : Pause/Resume');
    
    console.log('Tetris Game: Initialization complete. Click Start to begin!');
});