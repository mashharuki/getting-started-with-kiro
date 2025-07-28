# Webアプリケーション 設計書

## 概要

React、Node.js/Express、PostgreSQLを使用したフルスタックWebアプリケーションを実装します。マイクロサービスアーキテクチャを採用し、Docker化により開発・運用の効率化を図ります。JWT認証、RESTful API、レスポンシブデザインを特徴とする現代的なWebアプリケーションです。

## アーキテクチャ

### システム全体構成

```
webapp/
├── frontend/                 # React フロントエンド
│   ├── src/
│   │   ├── components/       # UIコンポーネント
│   │   ├── pages/           # ページコンポーネント
│   │   ├── hooks/           # カスタムフック
│   │   ├── services/        # API通信
│   │   ├── utils/           # ユーティリティ
│   │   └── styles/          # スタイル定義
│   ├── public/              # 静的ファイル
│   └── package.json
├── backend/                  # Node.js バックエンド
│   ├── src/
│   │   ├── controllers/     # コントローラー
│   │   ├── models/          # データモデル
│   │   ├── routes/          # ルート定義
│   │   ├── middleware/      # ミドルウェア
│   │   ├── services/        # ビジネスロジック
│   │   └── utils/           # ユーティリティ
│   └── package.json
├── database/                 # データベース設定
│   ├── migrations/          # マイグレーション
│   ├── seeds/               # シードデータ
│   └── init.sql
├── docker-compose.yml        # Docker設定
├── .github/workflows/        # CI/CD設定
└── README.md
```

### 技術スタック

**フロントエンド:**
- React 18 + TypeScript
- React Router v6 (ルーティング)
- Axios (HTTP通信)
- Tailwind CSS (スタイリング)
- React Hook Form (フォーム管理)
- React Query (状態管理・キャッシュ)

**バックエンド:**
- Node.js + Express
- TypeScript
- Prisma (ORM)
- JWT (認証)
- bcrypt (パスワードハッシュ化)
- Joi (バリデーション)

**データベース:**
- PostgreSQL 15
- Redis (セッション・キャッシュ)

**インフラ・ツール:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- ESLint + Prettier (コード品質)
- Jest (テスト)

## コンポーネントとインターフェース

### 1. フロントエンド アーキテクチャ

#### 1.1 コンポーネント構造

```typescript
// src/components/common/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  onClick,
  disabled = false,
  children
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

#### 1.2 ページコンポーネント

```typescript
// src/pages/Dashboard.tsx
export const Dashboard: React.FC = () => {
  const { data: tasks, isLoading, error } = useQuery('tasks', fetchTasks);
  const { user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <Header user={user} />
      <TaskList tasks={tasks} />
      <CreateTaskForm />
    </div>
  );
};
```

#### 1.3 カスタムフック

```typescript
// src/hooks/useAuth.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      localStorage.setItem('token', response.token);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register
  };
};
```

### 2. バックエンド アーキテクチャ

#### 2.1 コントローラー

```typescript
// src/controllers/TaskController.ts
export class TaskController {
  async getTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const tasks = await taskService.getTasksByUserId(userId);
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch tasks' 
      });
    }
  }

  async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, priority } = req.body;
      const userId = req.user.id;
      
      const task = await taskService.createTask({
        title,
        description,
        priority,
        userId
      });
      
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Failed to create task' 
        });
      }
    }
  }
}
```

#### 2.2 サービス層

```typescript
// src/services/TaskService.ts
export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return await this.taskRepository.findByUserId(userId);
  }

  async createTask(taskData: CreateTaskDto): Promise<Task> {
    // バリデーション
    const validatedData = await this.validateTaskData(taskData);
    
    // ビジネスロジック
    const task = await this.taskRepository.create({
      ...validatedData,
      status: TaskStatus.PENDING,
      createdAt: new Date()
    });

    return task;
  }

  private async validateTaskData(data: CreateTaskDto): Promise<CreateTaskDto> {
    const schema = Joi.object({
      title: Joi.string().min(1).max(255).required(),
      description: Joi.string().max(1000).optional(),
      priority: Joi.string().valid('low', 'medium', 'high').required(),
      userId: Joi.string().uuid().required()
    });

    const { error, value } = schema.validate(data);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    return value;
  }
}
```

#### 2.3 データモデル

```typescript
// src/models/Task.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Prisma Schema
model Task {
  id          String      @id @default(uuid())
  title       String
  description String?
  status      TaskStatus  @default(PENDING)
  priority    TaskPriority
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  completedAt DateTime?

  @@map("tasks")
}
```

### 3. 認証システム

#### 3.1 JWT認証ミドルウェア

```typescript
// src/middleware/auth.ts
export const authenticateToken = (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      res.status(403).json({ message: 'Invalid token' });
      return;
    }
    
    req.user = user as JwtPayload;
    next();
  });
};
```

#### 3.2 パスワードハッシュ化

```typescript
// src/services/AuthService.ts
export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  }
}
```

## データモデル

### データベーススキーマ

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(10) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_users_email ON users(email);
```

### API レスポンス形式

```typescript
// 成功レスポンス
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// エラーレスポンス
interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
}

// ページネーション
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## エラーハンドリング

### 1. フロントエンドエラー処理

```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // エラーレポーティングサービスに送信
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. バックエンドエラー処理

```typescript
// src/middleware/errorHandler.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.details
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
    return;
  }

  // デフォルトエラー
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
```

## テスト戦略

### 1. フロントエンドテスト

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  test('renders button with correct text', () => {
    render(
      <Button variant="primary" size="md" onClick={() => {}}>
        Click me
      </Button>
    );
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(
      <Button variant="primary" size="md" onClick={handleClick}>
        Click me
      </Button>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. バックエンドテスト

```typescript
// src/controllers/__tests__/TaskController.test.ts
import request from 'supertest';
import { app } from '../../app';
import { createTestUser, createAuthToken } from '../helpers/testHelpers';

describe('Task Controller', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user.id;
    authToken = createAuthToken(user);
  });

  test('GET /api/tasks returns user tasks', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/tasks creates new task', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'medium'
    };

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(taskData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(taskData.title);
  });
});
```

## セキュリティ

### 1. 認証・認可

```typescript
// JWT設定
const jwtConfig = {
  secret: process.env.JWT_SECRET!,
  expiresIn: '24h',
  algorithm: 'HS256' as const
};

// CORS設定
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 2. 入力検証

```typescript
// バリデーションスキーマ
const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  priority: Joi.string().valid('low', 'medium', 'high').required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required()
});
```

## パフォーマンス最適化

### 1. フロントエンド最適化

```typescript
// React.memo でコンポーネント最適化
export const TaskItem = React.memo<TaskItemProps>(({ task, onUpdate }) => {
  return (
    <div className="task-item">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
  );
});

// useMemo でコンピューテッド値をキャッシュ
const filteredTasks = useMemo(() => {
  return tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [tasks, searchTerm]);

// React.lazy で動的インポート
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
```

### 2. バックエンド最適化

```typescript
// データベースクエリ最適化
const getTasksWithPagination = async (userId: string, page: number, limit: number) => {
  return await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: {
        select: { firstName: true, lastName: true }
      }
    }
  });
};

// Redis キャッシュ
const getCachedTasks = async (userId: string): Promise<Task[] | null> => {
  const cached = await redis.get(`tasks:${userId}`);
  return cached ? JSON.parse(cached) : null;
};
```

## デプロイメント

### Docker設定

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/webapp
      - JWT_SECRET=your-secret-key
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=webapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### CI/CD パイプライン

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
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && npm ci
    
    - name: Run tests
      run: |
        cd frontend && npm test
        cd ../backend && npm test
    
    - name: Build applications
      run: |
        cd frontend && npm run build
        cd ../backend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: echo "Deploy to production server"
```

## まとめ

この設計により、スケーラブルで保守性の高いフルスタックWebアプリケーションを構築できます。モジュラー設計、適切な分離、包括的なテスト戦略により、品質の高いソフトウェアを効率的に開発・運用できます。