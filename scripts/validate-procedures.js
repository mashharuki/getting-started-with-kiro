#!/usr/bin/env node

/**
 * 手順実行可能性検証スクリプト
 * 
 * ドキュメント内の手順が実際に実行可能かを段階的に検証します。
 * 以下の検証を実行：
 * 1. 前提条件の確認
 * 2. 手順の論理的整合性チェック
 * 3. 依存関係の確認
 * 4. 実行可能性の検証
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProcedureValidator {
    constructor() {
        this.results = {
            procedures: 0,
            validated: 0,
            warnings: 0,
            errors: []
        };
        this.systemInfo = this.getSystemInfo();
    }

    /**
     * メイン実行関数
     */
    async validate() {
        console.log('📋 手順実行可能性検証を開始します...\n');
        console.log('🖥️  システム情報:');
        console.log(`   OS: ${this.systemInfo.platform}`);
        console.log(`   Node.js: ${this.systemInfo.nodeVersion}`);
        console.log(`   npm: ${this.systemInfo.npmVersion}\n`);

        try {
            // ドキュメントファイルを検索
            const docFiles = this.findDocumentFiles();
            console.log(`📄 ${docFiles.length}個のドキュメントファイルを検出\n`);

            // 各ファイルの手順を検証
            for (const file of docFiles) {
                await this.validateFileProcedures(file);
            }

            // 特定の重要な手順を詳細検証
            await this.validateCriticalProcedures();

            // 結果表示
            this.displayResults();

        } catch (error) {
            console.error('❌ 検証中にエラーが発生:', error.message);
            process.exit(1);
        }
    }

    /**
     * システム情報を取得
     */
    getSystemInfo() {
        try {
            return {
                platform: process.platform,
                nodeVersion: process.version,
                npmVersion: execSync('npm --version', { encoding: 'utf-8' }).trim(),
                hasDocker: this.checkCommand('docker --version'),
                hasGit: this.checkCommand('git --version'),
                hasPython: this.checkCommand('python --version') || this.checkCommand('python3 --version'),
                hasUv: this.checkCommand('uv --version')
            };
        } catch (error) {
            return {
                platform: process.platform,
                nodeVersion: process.version,
                npmVersion: 'unknown'
            };
        }
    }

    /**
     * コマンドの存在確認
     */
    checkCommand(command) {
        try {
            execSync(command, { stdio: 'pipe' });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * ドキュメントファイルを検索
     */
    findDocumentFiles() {
        const files = [];
        const searchDirs = ['docs', 'examples', 'templates'];

        const searchDir = (dir) => {
            if (!fs.existsSync(dir)) return;

            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    searchDir(fullPath);
                } else if (item.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
        };

        searchDirs.forEach(searchDir);
        return files;
    }

    /**
     * ファイル内の手順を検証
     */
    async validateFileProcedures(filePath) {
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`🔍 検証中: ${relativePath}`);

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // 手順を抽出
            const procedures = this.extractProcedures(content);
            
            if (procedures.length === 0) {
                console.log(`  ℹ️  手順が見つかりませんでした`);
                return;
            }

            this.results.procedures += procedures.length;

            // 各手順を検証
            for (const procedure of procedures) {
                await this.validateProcedure(procedure, relativePath);
            }

        } catch (error) {
            this.addError(relativePath, `ファイル処理エラー: ${error.message}`);
        }
    }

    /**
     * 手順を抽出
     */
    extractProcedures(content) {
        const procedures = [];
        
        // 番号付きリストの手順を抽出
        const numberedSteps = content.match(/^\d+\.\s+.+$/gm) || [];
        if (numberedSteps.length > 0) {
            procedures.push({
                type: 'numbered',
                steps: numberedSteps,
                context: this.getContextAroundSteps(content, numberedSteps)
            });
        }

        // コードブロック内のコマンド手順を抽出
        const codeBlocks = content.match(/```(?:bash|sh|shell)\n([\s\S]*?)```/g) || [];
        codeBlocks.forEach(block => {
            const commands = block.match(/```(?:bash|sh|shell)\n([\s\S]*?)```/)[1]
                .split('\n')
                .filter(line => line.trim() && !line.trim().startsWith('#'));
            
            if (commands.length > 0) {
                procedures.push({
                    type: 'commands',
                    steps: commands,
                    context: 'コマンド実行手順'
                });
            }
        });

        return procedures;
    }

    /**
     * 手順周辺のコンテキストを取得
     */
    getContextAroundSteps(content, steps) {
        if (steps.length === 0) return '';
        
        const firstStep = steps[0];
        const index = content.indexOf(firstStep);
        if (index === -1) return '';
        
        // 前後の文脈を取得
        const before = content.substring(Math.max(0, index - 200), index);
        const after = content.substring(index, Math.min(content.length, index + 200));
        
        return before + after;
    }

    /**
     * 個別の手順を検証
     */
    async validateProcedure(procedure, filePath) {
        console.log(`  📋 ${procedure.type}手順を検証中...`);

        try {
            switch (procedure.type) {
                case 'numbered':
                    await this.validateNumberedSteps(procedure, filePath);
                    break;
                case 'commands':
                    await this.validateCommandSteps(procedure, filePath);
                    break;
            }
            
            this.results.validated++;
            console.log(`    ✅ 手順検証合格`);

        } catch (error) {
            this.addError(filePath, `手順検証エラー: ${error.message}`);
        }
    }

    /**
     * 番号付き手順の検証
     */
    async validateNumberedSteps(procedure, filePath) {
        const { steps, context } = procedure;
        
        // 手順の論理的整合性をチェック
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const stepNumber = parseInt(step.match(/^(\d+)\./)[1]);
            
            // 番号の連続性チェック
            if (stepNumber !== i + 1) {
                this.addWarning(filePath, `手順番号が不連続です: ${stepNumber} (期待値: ${i + 1})`);
            }
            
            // 前提条件のチェック
            await this.checkStepPrerequisites(step, filePath);
            
            // 危険な操作のチェック
            this.checkDangerousOperations(step, filePath);
        }
    }

    /**
     * コマンド手順の検証
     */
    async validateCommandSteps(procedure, filePath) {
        const { steps } = procedure;
        
        for (const command of steps) {
            const trimmedCommand = command.trim();
            if (!trimmedCommand) continue;
            
            // コマンドの安全性チェック
            this.checkCommandSafety(trimmedCommand, filePath);
            
            // 依存関係チェック
            await this.checkCommandDependencies(trimmedCommand, filePath);
            
            // プレースホルダーチェック
            this.checkPlaceholders(trimmedCommand, filePath);
        }
    }

    /**
     * 手順の前提条件をチェック
     */
    async checkStepPrerequisites(step, filePath) {
        const stepText = step.toLowerCase();
        
        // Node.js関連の前提条件
        if (stepText.includes('npm') || stepText.includes('node')) {
            if (!this.systemInfo.npmVersion || this.systemInfo.npmVersion === 'unknown') {
                this.addWarning(filePath, 'npm/Node.jsが必要ですが、システムで確認できませんでした');
            }
        }
        
        // Docker関連の前提条件
        if (stepText.includes('docker')) {
            if (!this.systemInfo.hasDocker) {
                this.addWarning(filePath, 'Dockerが必要ですが、システムで確認できませんでした');
            }
        }
        
        // Git関連の前提条件
        if (stepText.includes('git')) {
            if (!this.systemInfo.hasGit) {
                this.addWarning(filePath, 'Gitが必要ですが、システムで確認できませんでした');
            }
        }
        
        // Python関連の前提条件
        if (stepText.includes('python') || stepText.includes('pip')) {
            if (!this.systemInfo.hasPython) {
                this.addWarning(filePath, 'Pythonが必要ですが、システムで確認できませんでした');
            }
        }
        
        // uv関連の前提条件
        if (stepText.includes('uvx') || stepText.includes('uv ')) {
            if (!this.systemInfo.hasUv) {
                this.addWarning(filePath, 'uvが必要ですが、システムで確認できませんでした');
            }
        }
    }

    /**
     * 危険な操作をチェック
     */
    checkDangerousOperations(step, filePath) {
        const dangerousPatterns = [
            /rm\s+-rf\s+\/[^\/]/,  // rm -rf /xxx
            /sudo\s+rm/,           // sudo rm
            /format\s+/,           // format command
            /del\s+\/[fs]/,        // del /f or del /s
            />\s*\/dev\/null/      // redirect to /dev/null without context
        ];
        
        for (const pattern of dangerousPatterns) {
            if (pattern.test(step)) {
                this.addWarning(filePath, `潜在的に危険な操作が含まれています: ${step.trim()}`);
            }
        }
    }

    /**
     * コマンドの安全性をチェック
     */
    checkCommandSafety(command, filePath) {
        // 危険なコマンドパターン
        const dangerousCommands = [
            'rm -rf /',
            'sudo rm -rf',
            'format c:',
            'del /f /s',
            'DROP DATABASE',
            'TRUNCATE TABLE'
        ];
        
        for (const dangerous of dangerousCommands) {
            if (command.includes(dangerous)) {
                this.addError(filePath, `危険なコマンドが検出されました: ${dangerous}`);
            }
        }
    }

    /**
     * コマンドの依存関係をチェック
     */
    async checkCommandDependencies(command, filePath) {
        const commandName = command.split(' ')[0];
        
        // よく使用されるコマンドの依存関係チェック
        const dependencies = {
            'docker': 'Docker',
            'git': 'Git',
            'npm': 'Node.js/npm',
            'yarn': 'Yarn',
            'python': 'Python',
            'pip': 'Python/pip',
            'uvx': 'uv',
            'aws': 'AWS CLI',
            'kubectl': 'kubectl',
            'terraform': 'Terraform'
        };
        
        if (dependencies[commandName]) {
            const hasCommand = this.checkCommand(`${commandName} --version`) || 
                             this.checkCommand(`${commandName} -v`) ||
                             this.checkCommand(`which ${commandName}`);
            
            if (!hasCommand) {
                this.addWarning(filePath, `${dependencies[commandName]}が必要ですが、システムで確認できませんでした`);
            }
        }
    }

    /**
     * プレースホルダーをチェック
     */
    checkPlaceholders(command, filePath) {
        const placeholders = command.match(/\[[A-Z_]+\]/g) || [];
        
        if (placeholders.length > 0) {
            const uniquePlaceholders = [...new Set(placeholders)];
            console.log(`    ℹ️  プレースホルダーが含まれています: ${uniquePlaceholders.join(', ')}`);
        }
    }

    /**
     * 重要な手順の詳細検証
     */
    async validateCriticalProcedures() {
        console.log('\n🎯 重要な手順の詳細検証\n');

        const criticalProcedures = [
            {
                name: 'Kiroインストール手順',
                file: 'docs/chapter1/kiro-introduction.md',
                validator: this.validateKiroInstallation.bind(this)
            },
            {
                name: 'MCP設定手順',
                file: 'docs/chapter2/aws-mcp-setup.md',
                validator: this.validateMCPSetup.bind(this)
            },
            {
                name: 'テトリスゲーム作成手順',
                file: 'docs/chapter1/tetris-tutorial.md',
                validator: this.validateTetrisTutorial.bind(this)
            }
        ];

        for (const procedure of criticalProcedures) {
            if (fs.existsSync(procedure.file)) {
                console.log(`🔍 ${procedure.name}を検証中...`);
                try {
                    await procedure.validator(procedure.file);
                    console.log(`  ✅ ${procedure.name}検証合格`);
                } catch (error) {
                    this.addError(procedure.file, `${procedure.name}検証エラー: ${error.message}`);
                }
            }
        }
    }

    /**
     * Kiroインストール手順の検証
     */
    async validateKiroInstallation(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // kiro.devへのリンクが含まれているかチェック
        if (!content.includes('kiro.dev')) {
            throw new Error('kiro.devへのリンクが見つかりません');
        }
        
        // インストール手順が含まれているかチェック
        const hasInstallSteps = content.includes('インストール') || 
                               content.includes('ダウンロード') ||
                               content.includes('セットアップ');
        
        if (!hasInstallSteps) {
            throw new Error('インストール手順が見つかりません');
        }
    }

    /**
     * MCP設定手順の検証
     */
    async validateMCPSetup(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 必要な設定要素がすべて含まれているかチェック
        const requiredElements = [
            'mcp.json',
            'uvx',
            'awslabs.aws-documentation-mcp-server',
            'FASTMCP_LOG_LEVEL'
        ];
        
        for (const element of requiredElements) {
            if (!content.includes(element)) {
                throw new Error(`必要な設定要素が見つかりません: ${element}`);
            }
        }
    }

    /**
     * テトリスチュートリアル手順の検証
     */
    async validateTetrisTutorial(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 必要な手順が含まれているかチェック
        const requiredSteps = [
            'プロジェクト',
            'ローカルサーバー',
            'テスト',
            'ブラウザ'
        ];
        
        for (const step of requiredSteps) {
            if (!content.includes(step)) {
                throw new Error(`必要な手順が見つかりません: ${step}`);
            }
        }
        
        // サンプルファイルの存在確認
        const sampleFiles = [
            'examples/tetris/index.html',
            'examples/tetris/style.css',
            'examples/tetris/script.js'
        ];
        
        for (const file of sampleFiles) {
            if (!fs.existsSync(file)) {
                throw new Error(`サンプルファイルが見つかりません: ${file}`);
            }
        }
    }

    /**
     * エラーを追加
     */
    addError(location, message) {
        this.results.errors.push({ location, message, type: 'error' });
        console.log(`  ❌ ${message}`);
    }

    /**
     * 警告を追加
     */
    addWarning(location, message) {
        this.results.warnings++;
        this.results.errors.push({ location, message, type: 'warning' });
        console.log(`  ⚠️  ${message}`);
    }

    /**
     * 結果を表示
     */
    displayResults() {
        console.log('\n📊 手順検証結果\n');
        
        console.log(`📋 検証した手順数: ${this.results.procedures}`);
        console.log(`✅ 検証合格: ${this.results.validated}`);
        console.log(`⚠️  警告: ${this.results.warnings}`);
        
        const errors = this.results.errors.filter(e => e.type === 'error');
        console.log(`❌ エラー: ${errors.length}`);
        
        if (this.results.errors.length > 0) {
            console.log('\n詳細:');
            this.results.errors.forEach(error => {
                const icon = error.type === 'error' ? '❌' : '⚠️ ';
                console.log(`   ${icon} ${error.location}: ${error.message}`);
            });
        }

        if (errors.length === 0) {
            console.log('\n🎉 すべての手順検証に合格しました！');
        } else {
            console.log(`\n⚠️  ${errors.length}件のエラーがあります。修正してください。`);
            process.exit(1);
        }
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    const validator = new ProcedureValidator();
    validator.validate().catch(error => {
        console.error('❌ 予期しないエラー:', error);
        process.exit(1);
    });
}

module.exports = ProcedureValidator;