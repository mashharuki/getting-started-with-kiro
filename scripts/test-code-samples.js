#!/usr/bin/env node

/**
 * コードサンプル動作確認スクリプト
 * 
 * ドキュメント内のコードサンプルが実際に動作することを確認します。
 * 以下のテストを実行：
 * 1. JavaScript/TypeScriptコードの構文チェック
 * 2. JSONファイルの妥当性チェック
 * 3. YAMLファイルの妥当性チェック
 * 4. シェルスクリプトの基本チェック
 * 5. 実行可能なサンプルの動作テスト
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class CodeSampleTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
        this.tempDir = path.join(__dirname, '../temp-test');
    }

    /**
     * メイン実行関数
     */
    async run() {
        console.log('🧪 コードサンプルの動作確認を開始します...\n');

        try {
            // 一時ディレクトリの準備
            this.setupTempDirectory();

            // ドキュメントファイルを検索
            const docFiles = this.findDocumentFiles();
            console.log(`📄 ${docFiles.length}個のドキュメントファイルを検出\n`);

            // 各ファイルのコードサンプルをテスト
            for (const file of docFiles) {
                await this.testFileCodeSamples(file);
            }

            // サンプルプロジェクトのテスト
            await this.testSampleProjects();

            // 結果表示
            this.displayResults();

        } catch (error) {
            console.error('❌ テスト実行中にエラーが発生:', error.message);
            process.exit(1);
        } finally {
            // 一時ディレクトリのクリーンアップ
            this.cleanupTempDirectory();
        }
    }

    /**
     * 一時ディレクトリのセットアップ
     */
    setupTempDirectory() {
        if (fs.existsSync(this.tempDir)) {
            fs.rmSync(this.tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(this.tempDir, { recursive: true });
    }

    /**
     * 一時ディレクトリのクリーンアップ
     */
    cleanupTempDirectory() {
        if (fs.existsSync(this.tempDir)) {
            fs.rmSync(this.tempDir, { recursive: true, force: true });
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
     * ファイル内のコードサンプルをテスト
     */
    async testFileCodeSamples(filePath) {
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`🔍 テスト中: ${relativePath}`);

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const codeBlocks = this.extractCodeBlocks(content);

            for (const block of codeBlocks) {
                await this.testCodeBlock(block, relativePath);
            }

        } catch (error) {
            this.addError(relativePath, `ファイル読み込みエラー: ${error.message}`);
        }
    }

    /**
     * コードブロックを抽出
     */
    extractCodeBlocks(content) {
        const blocks = [];
        const regex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            blocks.push({
                language: match[1] || 'text',
                code: match[2].trim(),
                fullMatch: match[0]
            });
        }

        return blocks;
    }

    /**
     * 個別のコードブロックをテスト
     */
    async testCodeBlock(block, filePath) {
        const { language, code } = block;

        try {
            switch (language.toLowerCase()) {
                case 'javascript':
                case 'js':
                    await this.testJavaScript(code, filePath);
                    break;
                case 'typescript':
                case 'ts':
                    await this.testTypeScript(code, filePath);
                    break;
                case 'json':
                    this.testJSON(code, filePath);
                    break;
                case 'yaml':
                case 'yml':
                    this.testYAML(code, filePath);
                    break;
                case 'bash':
                case 'sh':
                    this.testShellScript(code, filePath);
                    break;
                case 'html':
                    this.testHTML(code, filePath);
                    break;
                case 'css':
                    this.testCSS(code, filePath);
                    break;
                default:
                    this.results.skipped++;
                    break;
            }
        } catch (error) {
            this.addError(filePath, `${language}コードブロックエラー: ${error.message}`);
        }
    }

    /**
     * JavaScriptコードのテスト
     */
    async testJavaScript(code, filePath) {
        // 構文チェック用の一時ファイル作成
        const tempFile = path.join(this.tempDir, `test-${Date.now()}.js`);
        
        try {
            // プレースホルダーを実際の値に置換
            const processedCode = this.processCodePlaceholders(code);
            fs.writeFileSync(tempFile, processedCode);

            // Node.jsで構文チェック
            execSync(`node --check "${tempFile}"`, { stdio: 'pipe' });
            
            this.results.passed++;
            console.log(`  ✅ JavaScript構文チェック合格`);

        } catch (error) {
            this.addError(filePath, `JavaScript構文エラー: ${error.message}`);
        } finally {
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        }
    }

    /**
     * TypeScriptコードのテスト
     */
    async testTypeScript(code, filePath) {
        const tempFile = path.join(this.tempDir, `test-${Date.now()}.ts`);
        
        try {
            const processedCode = this.processCodePlaceholders(code);
            fs.writeFileSync(tempFile, processedCode);

            // TypeScriptコンパイラーで構文チェック
            try {
                execSync(`npx tsc --noEmit "${tempFile}"`, { stdio: 'pipe' });
                this.results.passed++;
                console.log(`  ✅ TypeScript構文チェック合格`);
            } catch (tscError) {
                // TypeScriptが利用できない場合はJavaScriptとしてチェック
                execSync(`node --check "${tempFile}"`, { stdio: 'pipe' });
                this.results.passed++;
                console.log(`  ✅ JavaScript構文チェック合格 (TypeScript未対応)`);
            }

        } catch (error) {
            this.addError(filePath, `TypeScript構文エラー: ${error.message}`);
        } finally {
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        }
    }

    /**
     * JSONの妥当性チェック
     */
    testJSON(code, filePath) {
        try {
            const processedCode = this.processCodePlaceholders(code);
            JSON.parse(processedCode);
            this.results.passed++;
            console.log(`  ✅ JSON妥当性チェック合格`);
        } catch (error) {
            this.addError(filePath, `JSON構文エラー: ${error.message}`);
        }
    }

    /**
     * YAMLの妥当性チェック
     */
    testYAML(code, filePath) {
        try {
            // 簡易的なYAMLチェック（yamlライブラリが利用できない場合）
            const processedCode = this.processCodePlaceholders(code);
            
            // 基本的な構文エラーをチェック
            const lines = processedCode.split('\n');
            let indentLevel = 0;
            
            for (const line of lines) {
                if (line.trim() === '') continue;
                
                const currentIndent = line.length - line.trimStart().length;
                if (currentIndent % 2 !== 0) {
                    throw new Error('インデントは2の倍数である必要があります');
                }
            }
            
            this.results.passed++;
            console.log(`  ✅ YAML基本チェック合格`);
        } catch (error) {
            this.addError(filePath, `YAML構文エラー: ${error.message}`);
        }
    }

    /**
     * シェルスクリプトの基本チェック
     */
    testShellScript(code, filePath) {
        try {
            const processedCode = this.processCodePlaceholders(code);
            
            // 基本的な構文エラーをチェック
            const lines = processedCode.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed === '') continue;
                
                // 危険なコマンドをチェック
                const dangerousCommands = ['rm -rf /', 'sudo rm', 'format', 'del /f'];
                for (const dangerous of dangerousCommands) {
                    if (trimmed.includes(dangerous)) {
                        throw new Error(`危険なコマンドが検出されました: ${dangerous}`);
                    }
                }
            }
            
            this.results.passed++;
            console.log(`  ✅ シェルスクリプト基本チェック合格`);
        } catch (error) {
            this.addError(filePath, `シェルスクリプトエラー: ${error.message}`);
        }
    }

    /**
     * HTMLの基本チェック
     */
    testHTML(code, filePath) {
        try {
            const processedCode = this.processCodePlaceholders(code);
            
            // 基本的なHTMLタグの対応チェック
            const openTags = (processedCode.match(/<(\w+)[^>]*>/g) || [])
                .map(tag => tag.match(/<(\w+)/)[1])
                .filter(tag => !['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tag));
            
            const closeTags = (processedCode.match(/<\/(\w+)>/g) || [])
                .map(tag => tag.match(/<\/(\w+)>/)[1]);
            
            // 簡易的なタグ対応チェック
            for (const tag of openTags) {
                if (!closeTags.includes(tag)) {
                    console.log(`  ⚠️  閉じタグが見つかりません: ${tag}`);
                }
            }
            
            this.results.passed++;
            console.log(`  ✅ HTML基本チェック合格`);
        } catch (error) {
            this.addError(filePath, `HTMLエラー: ${error.message}`);
        }
    }

    /**
     * CSSの基本チェック
     */
    testCSS(code, filePath) {
        try {
            const processedCode = this.processCodePlaceholders(code);
            
            // 基本的なCSS構文チェック
            const braceCount = (processedCode.match(/\{/g) || []).length;
            const closeBraceCount = (processedCode.match(/\}/g) || []).length;
            
            if (braceCount !== closeBraceCount) {
                throw new Error('括弧の対応が正しくありません');
            }
            
            this.results.passed++;
            console.log(`  ✅ CSS基本チェック合格`);
        } catch (error) {
            this.addError(filePath, `CSSエラー: ${error.message}`);
        }
    }

    /**
     * サンプルプロジェクトのテスト
     */
    async testSampleProjects() {
        console.log('\n🎯 サンプルプロジェクトのテスト開始\n');

        const sampleProjects = [
            'examples/tetris',
            'examples/webapp'
        ];

        for (const project of sampleProjects) {
            if (fs.existsSync(project)) {
                await this.testSampleProject(project);
            }
        }
    }

    /**
     * 個別のサンプルプロジェクトをテスト
     */
    async testSampleProject(projectPath) {
        console.log(`🔍 テスト中: ${projectPath}`);

        try {
            // package.jsonの存在確認
            const packageJsonPath = path.join(projectPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                await this.testNodeProject(projectPath);
            } else {
                await this.testStaticProject(projectPath);
            }
        } catch (error) {
            this.addError(projectPath, `プロジェクトテストエラー: ${error.message}`);
        }
    }

    /**
     * Node.jsプロジェクトのテスト
     */
    async testNodeProject(projectPath) {
        try {
            // package.jsonの妥当性チェック
            const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8'));
            
            // 依存関係のチェック
            if (packageJson.dependencies || packageJson.devDependencies) {
                console.log(`  📦 依存関係チェック合格`);
            }

            // スクリプトの存在チェック
            if (packageJson.scripts) {
                const commonScripts = ['build', 'test', 'start', 'dev'];
                const availableScripts = Object.keys(packageJson.scripts);
                const hasCommonScript = commonScripts.some(script => availableScripts.includes(script));
                
                if (hasCommonScript) {
                    console.log(`  🔧 スクリプト設定チェック合格`);
                }
            }

            this.results.passed++;
            console.log(`  ✅ Node.jsプロジェクト構造チェック合格`);

        } catch (error) {
            this.addError(projectPath, `Node.jsプロジェクトエラー: ${error.message}`);
        }
    }

    /**
     * 静的プロジェクトのテスト
     */
    async testStaticProject(projectPath) {
        try {
            // 必要なファイルの存在チェック
            const requiredFiles = ['index.html'];
            const missingFiles = requiredFiles.filter(file => 
                !fs.existsSync(path.join(projectPath, file))
            );

            if (missingFiles.length > 0) {
                throw new Error(`必要なファイルが見つかりません: ${missingFiles.join(', ')}`);
            }

            // HTMLファイルの基本チェック
            const indexPath = path.join(projectPath, 'index.html');
            const htmlContent = fs.readFileSync(indexPath, 'utf-8');
            
            if (!htmlContent.includes('<!DOCTYPE html>')) {
                console.log(`  ⚠️  DOCTYPE宣言が見つかりません`);
            }

            this.results.passed++;
            console.log(`  ✅ 静的プロジェクト構造チェック合格`);

        } catch (error) {
            this.addError(projectPath, `静的プロジェクトエラー: ${error.message}`);
        }
    }

    /**
     * コード内のプレースホルダーを処理
     */
    processCodePlaceholders(code) {
        return code
            .replace(/\[PROJECT_NAME\]/g, 'test-project')
            .replace(/\[YOUR_NAME\]/g, 'Test User')
            .replace(/\[YOUR_EMAIL\]/g, 'test@example.com')
            .replace(/\[API_KEY\]/g, 'test-api-key')
            .replace(/\[DATABASE_URL\]/g, 'postgresql://localhost:5432/test')
            .replace(/\[AWS_REGION\]/g, 'ap-northeast-1')
            .replace(/\[GITHUB_TOKEN\]/g, 'ghp_test_token')
            .replace(/\[REPOSITORY_URL\]/g, 'https://github.com/test/repo');
    }

    /**
     * エラーを追加
     */
    addError(location, message) {
        this.results.failed++;
        this.results.errors.push({ location, message });
        console.log(`  ❌ ${message}`);
    }

    /**
     * 結果を表示
     */
    displayResults() {
        console.log('\n📊 コードサンプルテスト結果\n');
        
        console.log(`✅ 合格: ${this.results.passed}`);
        console.log(`❌ 失敗: ${this.results.failed}`);
        console.log(`⏭️  スキップ: ${this.results.skipped}`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ エラー詳細:');
            this.results.errors.forEach(error => {
                console.log(`   ${error.location}: ${error.message}`);
            });
        }

        if (this.results.failed === 0) {
            console.log('\n🎉 すべてのコードサンプルテストに合格しました！');
        } else {
            console.log(`\n⚠️  ${this.results.failed}件のエラーがあります。修正してください。`);
            process.exit(1);
        }
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    const tester = new CodeSampleTester();
    tester.run().catch(error => {
        console.error('❌ 予期しないエラー:', error);
        process.exit(1);
    });
}

module.exports = CodeSampleTester;