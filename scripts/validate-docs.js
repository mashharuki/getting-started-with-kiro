#!/usr/bin/env node

/**
 * ドキュメント品質検証スクリプト
 * 
 * このスクリプトは以下の検証を行います：
 * 1. 内部リンクの検証
 * 2. 外部リンクの検証
 * 3. 画像リンクの検証
 * 4. コードブロックの構文チェック
 * 5. マークダウン構文の検証
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class DocumentValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.checkedUrls = new Set();
        this.baseDir = process.cwd();
    }

    /**
     * メイン実行関数
     */
    async validate() {
        console.log('📚 ドキュメント品質検証を開始します...\n');

        try {
            // Markdownファイルを検索
            const markdownFiles = this.findMarkdownFiles();
            console.log(`📄 ${markdownFiles.length}個のMarkdownファイルを検出しました\n`);

            // 各ファイルを検証
            for (const file of markdownFiles) {
                await this.validateFile(file);
            }

            // 結果を表示
            this.displayResults();

        } catch (error) {
            console.error('❌ 検証中にエラーが発生しました:', error.message);
            process.exit(1);
        }
    }

    /**
     * Markdownファイルを再帰的に検索
     */
    findMarkdownFiles() {
        const files = [];
        
        const searchDir = (dir) => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // 除外ディレクトリをスキップ
                    if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
                        searchDir(fullPath);
                    }
                } else if (item.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
        };

        searchDir(this.baseDir);
        return files;
    }

    /**
     * 単一ファイルの検証
     */
    async validateFile(filePath) {
        const relativePath = path.relative(this.baseDir, filePath);
        console.log(`🔍 検証中: ${relativePath}`);

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // 各種検証を実行
            this.validateMarkdownSyntax(filePath, content);
            await this.validateLinks(filePath, content);
            this.validateCodeBlocks(filePath, content);
            this.validateImages(filePath, content);
            
        } catch (error) {
            this.addError(filePath, `ファイル読み込みエラー: ${error.message}`);
        }
    }

    /**
     * Markdown構文の検証
     */
    validateMarkdownSyntax(filePath, content) {
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            
            // 見出しレベルの検証
            const headingMatch = line.match(/^(#{1,6})\s/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                if (level > 4) {
                    this.addWarning(filePath, lineNum, `見出しレベル${level}は推奨されません（h4以下を推奨）`);
                }
            }
            
            // リストのインデントチェック
            if (line.match(/^\s*[-*+]\s/) || line.match(/^\s*\d+\.\s/)) {
                const indent = line.match(/^(\s*)/)[1].length;
                if (indent % 2 !== 0) {
                    this.addWarning(filePath, lineNum, 'リストのインデントは2の倍数を推奨します');
                }
            }
            
            // 長すぎる行の検出
            if (line.length > 120) {
                this.addWarning(filePath, lineNum, `行が長すぎます (${line.length}文字)`);
            }
        });
    }

    /**
     * リンクの検証
     */
    async validateLinks(filePath, content) {
        // 内部リンクの検証
        const internalLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
        
        for (const linkMatch of internalLinks) {
            const match = linkMatch.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (match) {
                const linkText = match[1];
                const linkUrl = match[2];
                
                if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
                    // 外部リンクの検証
                    await this.validateExternalLink(filePath, linkUrl);
                } else if (linkUrl.startsWith('#')) {
                    // アンカーリンクの検証
                    this.validateAnchorLink(filePath, content, linkUrl);
                } else {
                    // 相対パスリンクの検証
                    this.validateInternalLink(filePath, linkUrl);
                }
            }
        }
    }

    /**
     * 内部リンクの検証
     */
    validateInternalLink(filePath, linkUrl) {
        const fileDir = path.dirname(filePath);
        const targetPath = path.resolve(fileDir, linkUrl);
        
        if (!fs.existsSync(targetPath)) {
            this.addError(filePath, `内部リンクが無効です: ${linkUrl}`);
        }
    }

    /**
     * 外部リンクの検証
     */
    async validateExternalLink(filePath, url) {
        if (this.checkedUrls.has(url)) {
            return; // 既にチェック済み
        }
        
        this.checkedUrls.add(url);
        
        try {
            const isValid = await this.checkUrl(url);
            if (!isValid) {
                this.addError(filePath, `外部リンクが無効です: ${url}`);
            }
        } catch (error) {
            this.addWarning(filePath, null, `外部リンクの確認に失敗: ${url} (${error.message})`);
        }
    }

    /**
     * アンカーリンクの検証
     */
    validateAnchorLink(filePath, content, anchor) {
        const anchorId = anchor.substring(1); // # を除去
        
        // 見出しからアンカーを生成して確認
        const headings = content.match(/^#{1,6}\s+(.+)$/gm) || [];
        const validAnchors = headings.map(heading => {
            const text = heading.replace(/^#{1,6}\s+/, '');
            return text.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
        });
        
        if (!validAnchors.includes(anchorId)) {
            this.addError(filePath, `アンカーリンクが無効です: ${anchor}`);
        }
    }

    /**
     * URLの有効性をチェック
     */
    checkUrl(url) {
        return new Promise((resolve) => {
            const client = url.startsWith('https:') ? https : http;
            const timeout = 5000; // 5秒タイムアウト
            
            const req = client.get(url, { timeout }, (res) => {
                resolve(res.statusCode >= 200 && res.statusCode < 400);
            });
            
            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
        });
    }

    /**
     * コードブロックの検証
     */
    validateCodeBlocks(filePath, content) {
        const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
        
        codeBlocks.forEach((block, index) => {
            const lines = block.split('\n');
            const firstLine = lines[0];
            
            // 言語指定の確認
            const langMatch = firstLine.match(/^```(\w+)?/);
            if (langMatch && langMatch[1]) {
                const lang = langMatch[1];
                
                // サポートされている言語かチェック
                const supportedLangs = [
                    'javascript', 'js', 'typescript', 'ts', 'html', 'css', 
                    'json', 'yaml', 'yml', 'bash', 'sh', 'python', 'java',
                    'markdown', 'md', 'sql', 'dockerfile'
                ];
                
                if (!supportedLangs.includes(lang.toLowerCase())) {
                    this.addWarning(filePath, null, `未知の言語指定: ${lang}`);
                }
            }
            
            // コードブロックの内容チェック
            const codeContent = lines.slice(1, -1).join('\n');
            
            if (langMatch && langMatch[1]) {
                this.validateCodeSyntax(filePath, langMatch[1], codeContent, index);
            }
        });
    }

    /**
     * コード構文の基本チェック
     */
    validateCodeSyntax(filePath, lang, code, blockIndex) {
        switch (lang.toLowerCase()) {
            case 'json':
                try {
                    JSON.parse(code);
                } catch (error) {
                    this.addError(filePath, `JSONコードブロック${blockIndex + 1}の構文エラー: ${error.message}`);
                }
                break;
                
            case 'javascript':
            case 'js':
                // 基本的な構文チェック
                if (code.includes('console.log') && !code.includes(';')) {
                    this.addWarning(filePath, null, `JSコードブロック${blockIndex + 1}: セミコロンの使用を推奨`);
                }
                break;
        }
    }

    /**
     * 画像リンクの検証
     */
    validateImages(filePath, content) {
        const imageLinks = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
        
        imageLinks.forEach(imageMatch => {
            const match = imageMatch.match(/!\[([^\]]*)\]\(([^)]+)\)/);
            if (match) {
                const altText = match[1];
                const imagePath = match[2];
                
                // alt属性の確認
                if (!altText.trim()) {
                    this.addWarning(filePath, null, `画像にalt属性がありません: ${imagePath}`);
                }
                
                // 画像ファイルの存在確認
                if (!imagePath.startsWith('http')) {
                    const fileDir = path.dirname(filePath);
                    const fullImagePath = path.resolve(fileDir, imagePath);
                    
                    if (!fs.existsSync(fullImagePath)) {
                        this.addError(filePath, `画像ファイルが見つかりません: ${imagePath}`);
                    }
                }
            }
        });
    }

    /**
     * エラーを追加
     */
    addError(filePath, lineNum, message) {
        const relativePath = path.relative(this.baseDir, filePath);
        const location = lineNum ? `${relativePath}:${lineNum}` : relativePath;
        this.errors.push({ location, message: message || lineNum });
    }

    /**
     * 警告を追加
     */
    addWarning(filePath, lineNum, message) {
        const relativePath = path.relative(this.baseDir, filePath);
        const location = lineNum ? `${relativePath}:${lineNum}` : relativePath;
        this.warnings.push({ location, message: message || lineNum });
    }

    /**
     * 結果を表示
     */
    displayResults() {
        console.log('\n📊 検証結果\n');
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ すべての検証に合格しました！');
            return;
        }
        
        if (this.errors.length > 0) {
            console.log(`❌ エラー (${this.errors.length}件):`);
            this.errors.forEach(error => {
                console.log(`   ${error.location}: ${error.message}`);
            });
            console.log();
        }
        
        if (this.warnings.length > 0) {
            console.log(`⚠️  警告 (${this.warnings.length}件):`);
            this.warnings.forEach(warning => {
                console.log(`   ${warning.location}: ${warning.message}`);
            });
            console.log();
        }
        
        // 終了コードを設定
        if (this.errors.length > 0) {
            process.exit(1);
        }
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    const validator = new DocumentValidator();
    validator.validate().catch(error => {
        console.error('❌ 予期しないエラー:', error);
        process.exit(1);
    });
}

module.exports = DocumentValidator;