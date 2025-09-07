# TICKET-001: プロジェクト基盤のセットアップ

## チケット情報
- **ID**: TICKET-001
- **タイプ**: タスク
- **優先度**: 高
- **ステータス**: 進行中
- **担当者**: -
- **作成日**: 2024-08-25
- **更新日**: 2024-09-04

## 概要
プロジェクトの基本的な構造とツールチェーンをセットアップする。

## 詳細説明
AI日記アプリケーションの開発環境を整備し、必要な依存関係と開発ツールを設定する。

## タスク一覧
- [x] Git初期化と.gitignore設定
- [ ] package.json の作成とNode.jsプロジェクト初期化
- [ ] TypeScriptの設定
- [ ] ESLint/Prettierの設定
- [ ] Huskyによるpre-commitフックの設定
- [ ] GitHub リポジトリの設定
- [ ] Weights & Biases (W&B) の統合設定

## 実装手順（コマンド）
```bash
# 1. Node.jsプロジェクト初期化
npm init -y

# 2. 必要な依存関係インストール
npm install next@latest react@latest react-dom@latest
npm install @wandb/sdk dotenv
npm install axios zod bcrypt jsonwebtoken
npm install @prisma/client prisma

# 3. 開発依存関係
npm install -D typescript @types/react @types/node @types/react-dom
npm install -D eslint prettier eslint-config-prettier
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D husky lint-staged
npm install -D @types/bcrypt @types/jsonwebtoken

# 4. TypeScript初期化
npx tsc --init

# 5. Next.js設定ファイル生成
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# 6. Prettier設定
echo '{"semi": false, "singleQuote": true}' > .prettierrc

# 7. ESLint設定
npx eslint --init

# 8. Husky設定
npx husky-init && npm install
npx husky add .husky/pre-commit "npx lint-staged"

# 9. lint-staged設定（package.jsonに追加）
npm pkg set 'lint-staged[*.{js,jsx,ts,tsx}][0]=eslint --fix'
npm pkg set 'lint-staged[*.{js,jsx,ts,tsx}][1]=prettier --write'

# 10. W&B初期化テスト
node -e "require('dotenv').config(); const wandb = require('@wandb/sdk'); console.log('W&B loaded successfully');"
```

## 技術仕様
### 使用技術
- Node.js 18+
- TypeScript 5+
- pnpm (パッケージマネージャー)
- GitHub Actions (CI/CD)
- W&B (実験管理・モニタリング)

### ディレクトリ構造
```
AI_diary_app/
├── .github/
│   └── workflows/
├── docs/
│   └── tickets/
├── src/
│   ├── frontend/
│   ├── backend/
│   └── shared/
├── scripts/
├── tests/
├── public/
└── config/
```

## 受け入れ条件
- [ ] TypeScriptでの開発が可能
- [ ] コードフォーマットが自動化されている
- [ ] GitHubリポジトリにプッシュ可能
- [ ] W&Bとの連携が確認できる

## 関連チケット
- TICKET-002: 開発環境の構築

## 備考
W&Bは主にAI機能の実験管理と性能モニタリングに使用する。