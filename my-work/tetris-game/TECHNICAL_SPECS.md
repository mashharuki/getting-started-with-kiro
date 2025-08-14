# 🔧 Technical Specifications

## Overview

This document provides detailed technical specifications for the Tetris game implementation, including architecture details, API documentation, and implementation notes.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  HTML5 Canvas  │  Control Buttons  │  Score Display       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Game Engine Layer                         │
├─────────────────────────────────────────────────────────────┤
│  GameEngine    │  InputHandler    │  Renderer             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Game Logic Layer                          │
├─────────────────────────────────────────────────────────────┤
│  GameBoard     │  Tetromino       │  GameState            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  Game State    │  Board Data      │  Configuration        │
└─────────────────────────────────────────────────────────────┘
```

## Class Documentation

### Tetromino Class

**Purpose**: Represents individual tetris pieces with rotation and validation capabilities.

#### Constructor
```javascript
new Tetromino(type: string)
```
- **Parameters**: 
  - `type`: One of 'I', 'O', 'T', 'S', 'Z', 'J', 'L'
- **Throws**: Error if invalid tetromino type

#### Methods

##### `getShape(): number[][]`
Returns the current shape as a 2D array.
- **Returns**: 2D array where 1 = filled block, 0 = empty space
- **Example**: `[[0,1,0],[1,1,1]]` for T-piece

##### `getColor(): string`
Returns the tetromino's color.
- **Returns**: Hex color code (e.g., '#a000f0')

##### `rotate(): number[][]`
Rotates the tetromino clockwise by 90 degrees.
- **Returns**: New shape after rotation
- **Throws**: Error if rotation results in invalid state

##### `getRotatedShape(): number[][]`
Gets the shape that would result from rotation without modifying state.
- **Returns**: Shape after hypothetical rotation

##### `validateCurrentShape(): boolean`
Validates the current shape data.
- **Returns**: true if shape is valid, false otherwise

##### `clone(): Tetromino`
Creates a deep copy of the tetromino.
- **Returns**: New Tetromino instance with identical state

#### Properties
- `type`: String - The tetromino type ('I', 'O', etc.)
- `rotation`: Number - Current rotation state (0-3)

### GameBoard Class

**Purpose**: Manages the 10x20 game board with collision detection and line clearing.

#### Constructor
```javascript
new GameBoard(width?: number, height?: number)
```
- **Parameters**:
  - `width`: Board width in blocks (default: 10)
  - `height`: Board height in blocks (default: 20)

#### Methods

##### `isValidPosition(piece: Tetromino, x: number, y: number): boolean`
Checks if a tetromino can be placed at the specified position.
- **Parameters**:
  - `piece`: Tetromino to check
  - `x`: X coordinate (column)
  - `y`: Y coordinate (row)
- **Returns**: true if position is valid (no collision)

##### `placePiece(piece: Tetromino, x: number, y: number): boolean`
Places a tetromino on the board.
- **Parameters**:
  - `piece`: Tetromino to place
  - `x`: X coordinate
  - `y`: Y coordinate
- **Returns**: true if placement successful

##### `clearLines(): number`
Clears completed lines and returns count.
- **Returns**: Number of lines cleared (0-4)

##### `getBoard(): number[][]`
Gets the current board state.
- **Returns**: 2D array representing board (0 = empty, >0 = filled with color ID)

#### Board Coordinate System
```
    0 1 2 3 4 5 6 7 8 9  (X - columns)
  ┌─────────────────────┐
0 │ · · · · · · · · · · │
1 │ · · · · · · · · · · │
2 │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
  │ · · · · · · · · · · │
18│ · · · · · · · · · · │
19│ · · · · · · · · · · │
  └─────────────────────┘
  (Y - rows)
```

### GameEngine Class

**Purpose**: Main game controller that orchestrates all game systems.

#### Constructor
```javascript
new GameEngine(canvas: HTMLCanvasElement, scoreElement: HTMLElement, levelElement: HTMLElement, linesElement: HTMLElement)
```

#### Methods

##### `start(): void`
Starts the game loop.

##### `pause(): void`
Pauses the game.

##### `resume(): void`
Resumes the game.

##### `isRunning(): boolean`
Checks if game is currently running.

##### `isPaused(): boolean`
Checks if game is paused.

#### Game Loop
The game engine uses `requestAnimationFrame` for smooth 60 FPS gameplay:

```javascript
gameLoop(timestamp) {
    // Update game state
    this.update(timestamp);
    
    // Render frame
    this.render();
    
    // Schedule next frame
    if (this.running) {
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}
```

### GameState Class

**Purpose**: Manages scoring, level progression, and game statistics.

#### Scoring System

| Lines Cleared | Base Points | Level Multiplier | Formula |
|---------------|-------------|------------------|---------|
| 1 line        | 100         | level           | 100 × level |
| 2 lines       | 300         | level           | 300 × level |
| 3 lines       | 500         | level           | 500 × level |
| 4 lines (Tetris) | 800      | level           | 800 × level |

#### Level Progression
- Start at level 1
- Advance level every 10 lines cleared
- Drop speed increases by 10% each level (multiplied by 0.9)

### InputHandler Class

**Purpose**: Processes keyboard input and translates to game actions.

#### Key Mappings
```javascript
const KEY_MAPPINGS = {
    'ArrowLeft': 'moveLeft',
    'ArrowRight': 'moveRight',
    'ArrowUp': 'rotate',
    'ArrowDown': 'softDrop',
    ' ': 'pause'  // Space key
};
```

#### Input Processing Flow
1. Browser fires keyboard event
2. InputHandler captures event
3. Key is mapped to game action
4. Action is validated (game state, valid key, etc.)
5. Action is executed on GameEngine
6. Game state is updated
7. Visual feedback is provided

### Renderer Class

**Purpose**: Handles all canvas drawing operations and visual effects.

#### Rendering Pipeline
1. Clear canvas
2. Draw background/grid
3. Draw placed pieces on board
4. Draw current falling piece
5. Draw ghost piece (preview)
6. Draw UI elements
7. Apply visual effects

#### Color System
```javascript
const TETROMINO_COLORS = {
    1: '#00f0f0', // I - Cyan
    2: '#f0f000', // O - Yellow  
    3: '#a000f0', // T - Purple
    4: '#00f000', // S - Green
    5: '#f00000', // Z - Red
    6: '#0000f0', // J - Blue
    7: '#f0a000'  // L - Orange
};
```

## Data Structures

### Board Representation
The game board is represented as a 2D array:
```javascript
// 20 rows × 10 columns
const board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 0 (top)
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 1
    // ... 18 more rows
    [1, 1, 0, 0, 0, 0, 0, 1, 1, 1]  // Row 19 (bottom)
];
```
- `0` = empty cell
- `1-7` = filled cell with color ID

### Tetromino Shape Data
Each tetromino has 4 rotation states:
```javascript
const TETROMINO_TYPES = {
    T: {
        shapes: [
            [[0,1,0],[1,1,1]], // Rotation 0
            [[1,0],[1,1],[1,0]], // Rotation 1  
            [[1,1,1],[0,1,0]], // Rotation 2
            [[0,1],[1,1],[0,1]]  // Rotation 3
        ],
        color: '#a000f0'
    }
};
```

### Game State Object
```javascript
const gameState = {
    score: 0,
    level: 1,
    lines: 0,
    isPaused: false,
    isGameOver: false,
    dropTime: 0,
    dropSpeed: 1000 // milliseconds
};
```

## Performance Optimizations

### Rendering Optimizations
1. **Dirty Rectangle Updates**: Only redraw changed areas
2. **Object Pooling**: Reuse objects to reduce garbage collection
3. **Efficient Canvas Operations**: Batch drawing operations
4. **RequestAnimationFrame**: Sync with display refresh rate

### Memory Management
1. **Event Listener Cleanup**: Remove listeners when destroying objects
2. **Canvas Context Reuse**: Single context for all drawing
3. **Minimal Object Creation**: Reuse objects in game loop
4. **Garbage Collection Friendly**: Avoid creating objects in hot paths

### Input Optimization
1. **Event Debouncing**: Prevent excessive input processing
2. **Key State Tracking**: Track key press/release states
3. **Input Validation**: Validate inputs before processing
4. **Efficient Event Handling**: Use event delegation where possible

## Error Handling

### Error Categories
1. **Input Errors**: Invalid key presses, malformed events
2. **State Errors**: Invalid game states, corrupted data
3. **Rendering Errors**: Canvas context issues, drawing failures
4. **Logic Errors**: Invalid moves, collision detection failures

### Error Recovery Strategies
1. **Graceful Degradation**: Continue operation with reduced functionality
2. **State Reset**: Reset to known good state when corruption detected
3. **User Notification**: Inform user of non-critical errors
4. **Logging**: Comprehensive error logging for debugging

### Error Handling Example
```javascript
try {
    gameEngine.moveLeft();
} catch (error) {
    console.error('Move failed:', error);
    
    // Attempt recovery
    if (error.type === 'INVALID_STATE') {
        gameEngine.resetToSafeState();
    }
    
    // Notify user if necessary
    if (error.severity === 'HIGH') {
        showErrorMessage('Game error occurred. Restarting...');
        gameEngine.restart();
    }
}
```

## Configuration

### Game Configuration
```javascript
const CONFIG = {
    // Board dimensions
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    
    // Rendering
    BLOCK_SIZE: 30,
    
    // Gameplay
    INITIAL_DROP_SPEED: 1000, // ms
    SPEED_INCREASE_RATE: 0.9,  // multiplier per level
    
    // Scoring
    SCORE_MULTIPLIERS: {
        1: 100,  // Single line
        2: 300,  // Double line
        3: 500,  // Triple line
        4: 800   // Tetris
    },
    
    // Visual
    COLORS: {
        BACKGROUND: '#000000',
        GRID: '#333333',
        TEXT: '#ffffff',
        BORDER: '#ffffff'
    }
};
```

### Browser Compatibility Configuration
```javascript
const BROWSER_SUPPORT = {
    // Minimum browser versions
    chrome: 60,
    firefox: 55,
    safari: 12,
    edge: 79,
    
    // Required features
    requiredFeatures: [
        'canvas',
        'requestAnimationFrame',
        'addEventListener',
        'localStorage',
        'JSON'
    ],
    
    // Fallbacks
    fallbacks: {
        requestAnimationFrame: 'setTimeout',
        localStorage: 'cookies'
    }
};
```

## Testing Strategy

### Unit Tests
- Individual class methods
- Pure functions
- Data validation
- Edge cases

### Integration Tests  
- Class interactions
- Game flow scenarios
- Input/output chains
- State transitions

### Performance Tests
- Frame rate measurement
- Memory usage monitoring
- Input latency testing
- Rendering benchmarks

### Compatibility Tests
- Cross-browser testing
- Feature detection
- Graceful degradation
- Mobile responsiveness

## Deployment Considerations

### File Optimization
- Minify JavaScript and CSS for production
- Optimize images and assets
- Enable gzip compression
- Use CDN for static assets

### Caching Strategy
```javascript
// Service Worker for offline support
const CACHE_NAME = 'tetris-v1.0.0';
const urlsToCache = [
    '/',
    '/style.css',
    '/script.js',
    '/index.html'
];
```

### Security Considerations
- Input validation and sanitization
- XSS prevention
- Content Security Policy headers
- HTTPS deployment

## Future Enhancements

### Planned Features
1. **Sound Effects**: Audio feedback for actions
2. **High Scores**: Local storage leaderboard
3. **Themes**: Multiple visual themes
4. **Multiplayer**: Network multiplayer support
5. **Mobile Controls**: Touch-based controls
6. **Accessibility**: Screen reader support

### Technical Improvements
1. **WebGL Rendering**: Hardware-accelerated graphics
2. **Web Workers**: Background processing
3. **Progressive Web App**: Offline support
4. **TypeScript**: Type safety and better tooling

---

This technical specification provides the foundation for understanding, maintaining, and extending the Tetris game implementation.