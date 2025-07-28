# コンテキスト制御とメモリ管理ガイド

## 概要

大規模なプロジェクトでKiroを効率的に活用するためには、コンテキストの適切な制御とメモリ管理が重要です。このガイドでは、コンテキストの制御方法、メモリ圧縮技術、そして大規模プロジェクトでの効率的な開発手法について詳しく説明します。

## コンテキスト制御の基本概念

### コンテキストとは

Kiroにおけるコンテキストは、AIが参照できる情報の範囲を指します。適切なコンテキスト制御により、以下の利点が得られます：

- **応答精度の向上**: 関連性の高い情報のみを提供
- **処理速度の改善**: 不要な情報の除外による高速化
- **コスト削減**: トークン使用量の最適化
- **メモリ効率**: システムリソースの効率的な利用

### コンテキストの種類

1. **ファイルコンテキスト**: `#File` や `#Folder` で指定
2. **コードベースコンテキスト**: `#Codebase` でプロジェクト全体を参照
3. **問題コンテキスト**: `#Problems` で現在のエラーや警告を参照
4. **ターミナルコンテキスト**: `#Terminal` でコマンド履歴を参照
5. **Git差分コンテキスト**: `#Git Diff` で変更内容を参照

## 1. 効率的なコンテキスト制御戦略

### 1.1 段階的コンテキスト拡張

```markdown
# 段階1: 特定ファイルから開始
#File src/components/UserProfile.tsx

# 段階2: 関連ファイルを追加
#File src/types/User.ts
#File src/hooks/useUser.ts

# 段階3: 必要に応じてディレクトリ全体を参照
#Folder src/components/user/

# 段階4: 最後の手段としてコードベース全体
#Codebase
```

### 1.2 コンテキストフィルタリング

```bash
# 特定の拡張子のみを対象とする
find src/ -name "*.ts" -o -name "*.tsx" | head -10

# 最近変更されたファイルのみを対象とする
git log --name-only --since="1 week ago" --pretty=format: | sort | uniq

# サイズの小さいファイルを優先する
find src/ -name "*.ts" -exec wc -l {} + | sort -n | head -20
```

### 1.3 動的コンテキスト管理

```typescript
// context-manager.ts
interface ContextConfig {
  maxFiles: number;
  maxTokens: number;
  priorityPatterns: string[];
  excludePatterns: string[];
}

class ContextManager {
  private config: ContextConfig;
  
  constructor(config: ContextConfig) {
    this.config = config;
  }
  
  selectOptimalFiles(basePath: string): string[] {
    const allFiles = this.getAllFiles(basePath);
    const filteredFiles = this.applyFilters(allFiles);
    const prioritizedFiles = this.prioritizeFiles(filteredFiles);
    
    return prioritizedFiles.slice(0, this.config.maxFiles);
  }
  
  private applyFilters(files: string[]): string[] {
    return files.filter(file => {
      // 除外パターンのチェック
      if (this.config.excludePatterns.some(pattern => 
        file.match(new RegExp(pattern)))) {
        return false;
      }
      
      // ファイルサイズのチェック
      const stats = require('fs').statSync(file);
      return stats.size < 50000; // 50KB未満
    });
  }
  
  private prioritizeFiles(files: string[]): string[] {
    return files.sort((a, b) => {
      // 優先パターンに一致するファイルを上位に
      const aScore = this.calculatePriority(a);
      const bScore = this.calculatePriority(b);
      return bScore - aScore;
    });
  }
}
```

## 2. メモリ圧縮技術

### 2.1 情報の階層化

```markdown
# レベル1: 概要情報
## プロジェクト構造
- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Testing: Jest + Cypress

# レベル2: 詳細情報（必要時のみ展開）
<details>
<summary>詳細なアーキテクチャ情報</summary>

### フロントエンド詳細
- State Management: Redux Toolkit
- Routing: React Router v6
- Styling: Tailwind CSS
- Build Tool: Vite

### バックエンド詳細
- Authentication: JWT + Passport.js
- Validation: Joi
- ORM: Prisma
- API Documentation: Swagger

</details>
```

### 2.2 コード要約技術

```typescript
// 元のコード（詳細版）
export class UserService {
  private userRepository: UserRepository;
  private emailService: EmailService;
  private logger: Logger;
  
  constructor(
    userRepository: UserRepository,
    emailService: EmailService,
    logger: Logger
  ) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.logger = logger;
  }
  
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // バリデーション
      await this.validateUserData(userData);
      
      // 重複チェック
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictException('User already exists');
      }
      
      // パスワードハッシュ化
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // ユーザー作成
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
      });
      
      // ウェルカムメール送信
      await this.emailService.sendWelcomeEmail(user.email, user.name);
      
      // ログ出力
      this.logger.info(`User created: ${user.id}`);
      
      return user;
    } catch (error) {
      this.logger.error('User creation failed', error);
      throw error;
    }
  }
}

// 圧縮版（概要のみ）
/**
 * UserService - ユーザー管理サービス
 * 
 * 主要メソッド:
 * - createUser(userData): ユーザー作成（バリデーション、重複チェック、メール送信含む）
 * - updateUser(id, userData): ユーザー情報更新
 * - deleteUser(id): ユーザー削除
 * - findUser(criteria): ユーザー検索
 * 
 * 依存関係: UserRepository, EmailService, Logger
 */
```

### 2.3 動的情報圧縮

```bash
#!/bin/bash
# compress-context.sh

# ファイルサイズに基づく圧縮レベル決定
compress_file() {
  local file=$1
  local size=$(wc -c < "$file")
  
  if [ $size -lt 1000 ]; then
    # 小さいファイルはそのまま
    cat "$file"
  elif [ $size -lt 5000 ]; then
    # 中サイズファイルは関数シグネチャのみ
    grep -E "(function|class|interface|type)" "$file"
  else
    # 大きいファイルは構造のみ
    echo "# $(basename "$file") - 構造概要"
    grep -E "(export|import|class|interface)" "$file" | head -20
  fi
}

# 使用例
for file in src/**/*.ts; do
  echo "## $file"
  compress_file "$file"
  echo ""
done
```

## 3. 大規模プロジェクトでの効率的な開発手法

### 3.1 モジュール分割戦略

```typescript
// project-structure.ts
interface ModuleStructure {
  name: string;
  path: string;
  dependencies: string[];
  size: number;
  complexity: 'low' | 'medium' | 'high';
}

const projectModules: ModuleStructure[] = [
  {
    name: 'auth',
    path: 'src/modules/auth',
    dependencies: ['common', 'database'],
    size: 15,
    complexity: 'medium'
  },
  {
    name: 'user-management',
    path: 'src/modules/users',
    dependencies: ['auth', 'common'],
    size: 25,
    complexity: 'high'
  },
  {
    name: 'common',
    path: 'src/common',
    dependencies: [],
    size: 10,
    complexity: 'low'
  }
];

// モジュール別コンテキスト管理
class ModuleContextManager {
  getModuleContext(moduleName: string): string[] {
    const module = projectModules.find(m => m.name === moduleName);
    if (!module) return [];
    
    const files = [
      `${module.path}/**/*.ts`,
      ...module.dependencies.map(dep => {
        const depModule = projectModules.find(m => m.name === dep);
        return depModule ? `${depModule.path}/index.ts` : '';
      }).filter(Boolean)
    ];
    
    return files;
  }
}
```

### 3.2 インクリメンタル開発アプローチ

```markdown
# 段階的開発プロセス

## フェーズ1: コア機能の実装
- 基本的なCRUD操作
- 認証・認可システム
- データベーススキーマ

### コンテキスト範囲
```bash
#Folder src/core/
#File src/types/core.ts
#File src/config/database.ts
```

## フェーズ2: ビジネスロジックの追加
- ユーザー管理機能
- 権限管理システム
- 通知機能

### コンテキスト範囲
```bash
#Folder src/modules/users/
#Folder src/modules/notifications/
#File src/services/auth.service.ts
```

## フェーズ3: UI/UX の実装
- フロントエンドコンポーネント
- API統合
- エラーハンドリング

### コンテキスト範囲
```bash
#Folder src/components/
#Folder src/pages/
#File src/hooks/useApi.ts
```
```

### 3.3 パフォーマンス監視と最適化

```typescript
// performance-monitor.ts
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startTimer(operation: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }
  
  recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const values = this.metrics.get(operation)!;
    values.push(value);
    
    // 最新100件のみ保持
    if (values.length > 100) {
      values.shift();
    }
  }
  
  getAverageTime(operation: string): number {
    const values = this.metrics.get(operation) || [];
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  generateReport(): string {
    let report = '# パフォーマンスレポート\n\n';
    
    for (const [operation, values] of this.metrics) {
      const avg = this.getAverageTime(operation);
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      report += `## ${operation}\n`;
      report += `- 平均: ${avg.toFixed(2)}ms\n`;
      report += `- 最大: ${max.toFixed(2)}ms\n`;
      report += `- 最小: ${min.toFixed(2)}ms\n\n`;
    }
    
    return report;
  }
}

// 使用例
const monitor = new PerformanceMonitor();

// Kiroとの対話時間を測定
const endTimer = monitor.startTimer('kiro-response');
// ... Kiroとの対話 ...
endTimer();

// 定期的なレポート生成
setInterval(() => {
  console.log(monitor.generateReport());
}, 60000); // 1分ごと
```

## 4. 実践的な最適化テクニック

### 4.1 コンテキスト分割パターン

```typescript
// context-splitter.ts
interface ContextChunk {
  id: string;
  content: string;
  priority: number;
  tokens: number;
}

class ContextSplitter {
  private maxTokensPerChunk = 4000;
  
  splitLargeContext(content: string): ContextChunk[] {
    const sections = this.identifySections(content);
    const chunks: ContextChunk[] = [];
    
    let currentChunk = '';
    let currentTokens = 0;
    let chunkId = 0;
    
    for (const section of sections) {
      const sectionTokens = this.estimateTokens(section.content);
      
      if (currentTokens + sectionTokens > this.maxTokensPerChunk) {
        // 現在のチャンクを保存
        chunks.push({
          id: `chunk-${chunkId++}`,
          content: currentChunk,
          priority: this.calculatePriority(currentChunk),
          tokens: currentTokens
        });
        
        // 新しいチャンクを開始
        currentChunk = section.content;
        currentTokens = sectionTokens;
      } else {
        currentChunk += section.content;
        currentTokens += sectionTokens;
      }
    }
    
    // 最後のチャンクを追加
    if (currentChunk) {
      chunks.push({
        id: `chunk-${chunkId}`,
        content: currentChunk,
        priority: this.calculatePriority(currentChunk),
        tokens: currentTokens
      });
    }
    
    return chunks.sort((a, b) => b.priority - a.priority);
  }
  
  private identifySections(content: string): Array<{content: string, type: string}> {
    // コードブロック、関数、クラスなどを識別
    const sections = [];
    const lines = content.split('\n');
    
    let currentSection = '';
    let sectionType = 'general';
    
    for (const line of lines) {
      if (line.match(/^(class|function|interface|type)/)) {
        if (currentSection) {
          sections.push({content: currentSection, type: sectionType});
        }
        currentSection = line + '\n';
        sectionType = 'definition';
      } else {
        currentSection += line + '\n';
      }
    }
    
    if (currentSection) {
      sections.push({content: currentSection, type: sectionType});
    }
    
    return sections;
  }
  
  private estimateTokens(text: string): number {
    // 簡易的なトークン数推定（実際はより精密な計算が必要）
    return Math.ceil(text.length / 4);
  }
  
  private calculatePriority(content: string): number {
    let priority = 0;
    
    // キーワードベースの優先度計算
    const highPriorityKeywords = ['export', 'public', 'interface', 'type'];
    const mediumPriorityKeywords = ['function', 'class', 'const'];
    
    for (const keyword of highPriorityKeywords) {
      priority += (content.match(new RegExp(keyword, 'g')) || []).length * 3;
    }
    
    for (const keyword of mediumPriorityKeywords) {
      priority += (content.match(new RegExp(keyword, 'g')) || []).length * 2;
    }
    
    return priority;
  }
}
```

### 4.2 キャッシュ戦略

```typescript
// context-cache.ts
interface CacheEntry {
  content: string;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
}

class ContextCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;
  private ttl = 3600000; // 1時間
  
  get(key: string): string | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // TTLチェック
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // アクセス情報更新
    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    return entry.content;
  }
  
  set(key: string, content: string): void {
    // キャッシュサイズ制限
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }
    
    this.cache.set(key, {
      content,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now()
    });
  }
  
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedScore = Infinity;
    
    for (const [key, entry] of this.cache) {
      // アクセス頻度と最終アクセス時間を考慮したスコア
      const score = entry.accessCount / (Date.now() - entry.lastAccess);
      
      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats(): object {
    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate(),
      oldestEntry: this.getOldestEntry(),
      mostAccessed: this.getMostAccessedEntry()
    };
  }
  
  private calculateHitRate(): number {
    // 実装は省略（実際のヒット率計算ロジック）
    return 0.85;
  }
  
  private getOldestEntry(): string | null {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    return oldestKey || null;
  }
  
  private getMostAccessedEntry(): string | null {
    let mostAccessedKey = '';
    let maxAccess = 0;
    
    for (const [key, entry] of this.cache) {
      if (entry.accessCount > maxAccess) {
        maxAccess = entry.accessCount;
        mostAccessedKey = key;
      }
    }
    
    return mostAccessedKey || null;
  }
}
```

## 5. 監視とデバッグ

### 5.1 コンテキスト使用量の監視

```bash
#!/bin/bash
# monitor-context-usage.sh

LOG_FILE="context-usage.log"

monitor_context() {
  while true; do
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # メモリ使用量
    memory_usage=$(ps aux | grep kiro | awk '{sum+=$6} END {print sum/1024 " MB"}')
    
    # ファイル数
    file_count=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l)
    
    # コンテキストサイズ推定
    context_size=$(find . -name "*.ts" -o -name "*.tsx" | xargs wc -c | tail -1 | awk '{print $1/1024 " KB"}')
    
    echo "$timestamp,Memory: $memory_usage,Files: $file_count,Context: $context_size" >> $LOG_FILE
    
    sleep 60  # 1分間隔
  done
}

# バックグラウンドで実行
monitor_context &
echo "Context monitoring started. PID: $!"
```

### 5.2 パフォーマンス分析ツール

```typescript
// performance-analyzer.ts
class PerformanceAnalyzer {
  private operations: Array<{
    name: string;
    startTime: number;
    endTime?: number;
    contextSize: number;
    result: 'success' | 'error';
  }> = [];
  
  startOperation(name: string, contextSize: number): string {
    const operationId = `${name}-${Date.now()}`;
    
    this.operations.push({
      name,
      startTime: performance.now(),
      contextSize,
      result: 'success'
    });
    
    return operationId;
  }
  
  endOperation(operationId: string, result: 'success' | 'error' = 'success'): void {
    const operation = this.operations.find(op => 
      `${op.name}-${op.startTime}` === operationId
    );
    
    if (operation) {
      operation.endTime = performance.now();
      operation.result = result;
    }
  }
  
  generateAnalysis(): string {
    const completedOps = this.operations.filter(op => op.endTime);
    
    if (completedOps.length === 0) {
      return 'No completed operations to analyze.';
    }
    
    const analysis = {
      totalOperations: completedOps.length,
      successRate: completedOps.filter(op => op.result === 'success').length / completedOps.length,
      averageTime: completedOps.reduce((sum, op) => sum + (op.endTime! - op.startTime), 0) / completedOps.length,
      contextSizeImpact: this.analyzeContextSizeImpact(completedOps)
    };
    
    return `
# パフォーマンス分析レポート

## 基本統計
- 総操作数: ${analysis.totalOperations}
- 成功率: ${(analysis.successRate * 100).toFixed(2)}%
- 平均実行時間: ${analysis.averageTime.toFixed(2)}ms

## コンテキストサイズの影響
${analysis.contextSizeImpact}

## 推奨事項
${this.generateRecommendations(analysis)}
    `;
  }
  
  private analyzeContextSizeImpact(operations: any[]): string {
    const sizeGroups = {
      small: operations.filter(op => op.contextSize < 1000),
      medium: operations.filter(op => op.contextSize >= 1000 && op.contextSize < 5000),
      large: operations.filter(op => op.contextSize >= 5000)
    };
    
    let impact = '';
    for (const [size, ops] of Object.entries(sizeGroups)) {
      if (ops.length > 0) {
        const avgTime = ops.reduce((sum, op) => sum + (op.endTime! - op.startTime), 0) / ops.length;
        impact += `- ${size}: ${ops.length}操作, 平均${avgTime.toFixed(2)}ms\n`;
      }
    }
    
    return impact;
  }
  
  private generateRecommendations(analysis: any): string {
    const recommendations = [];
    
    if (analysis.successRate < 0.9) {
      recommendations.push('- エラー率が高いため、コンテキストサイズの削減を検討してください');
    }
    
    if (analysis.averageTime > 5000) {
      recommendations.push('- 実行時間が長いため、コンテキストの分割を検討してください');
    }
    
    if (analysis.contextSizeImpact.includes('large')) {
      recommendations.push('- 大きなコンテキストが検出されました。段階的な情報提供を検討してください');
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : '- 現在のパフォーマンスは良好です';
  }
}

// 使用例
const analyzer = new PerformanceAnalyzer();

// 操作の開始
const opId = analyzer.startOperation('code-generation', 2500);

// ... 実際の処理 ...

// 操作の終了
analyzer.endOperation(opId, 'success');

// 分析レポートの生成
console.log(analyzer.generateAnalysis());
```

## まとめ

効果的なコンテキスト制御とメモリ管理により、大規模プロジェクトでもKiroを効率的に活用できます。重要なポイントは：

- **段階的なコンテキスト拡張**: 必要最小限から始めて徐々に拡張
- **情報の階層化**: 概要から詳細へのドリルダウン方式
- **動的な最適化**: プロジェクトの成長に合わせた設定調整
- **継続的な監視**: パフォーマンスメトリクスの定期的な確認

これらの技術を活用することで、大規模なプロジェクトでも快適にKiroを使用し、高品質なソフトウェア開発を実現できます。

チーム開発の完全なワークフローについては、[チーム開発セットアップガイド](team-development-setup.md)と[Steeringファイル管理戦略ガイド](steering-management.md)も併せて参照してください。