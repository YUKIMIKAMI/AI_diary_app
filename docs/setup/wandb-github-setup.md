# W&B および GitHub セットアップガイド

## Weights & Biases (W&B) セットアップ

### 1. アカウント作成
1. [W&B公式サイト](https://wandb.ai/site)でアカウント作成
2. 組織（Team）の作成（任意）

### 2. APIキーの取得
1. [設定ページ](https://wandb.ai/settings)にアクセス
2. 「API Keys」セクションから API Key をコピー
3. `.env`ファイルの`WANDB_API_KEY`に設定

### 3. プロジェクト作成
```bash
# W&B CLIインストール
pip install wandb

# ログイン
wandb login

# プロジェクト初期化（プロジェクトルートで実行）
wandb init -p ai-diary-app
```

### 4. 使用例
```javascript
// JavaScript/TypeScriptでの使用
import wandb from '@wandb/sdk'

wandb.init({
  project: process.env.WANDB_PROJECT,
  entity: process.env.WANDB_ENTITY,
  config: {
    environment: process.env.NODE_ENV
  }
})

// メトリクスの記録
wandb.log({
  'api_response_time': responseTime,
  'tokens_used': tokensCount,
  'user_satisfaction': score
})
```

## GitHub セットアップ

### 1. リポジトリ作成
```bash
# GitHubでリポジトリ作成後
git remote add origin https://github.com/YOUR_USERNAME/AI_diary_app.git
git branch -M main
git push -u origin main
```

### 2. Personal Access Token (PAT) の作成
1. GitHubの[Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 「Generate new token (classic)」クリック
3. 必要な権限を選択:
   - `repo` (フルアクセス)
   - `workflow` (GitHub Actions用)
   - `write:packages` (パッケージ公開用)
4. トークンをコピーして`.env`の`GITHUB_TOKEN`に設定

### 3. GitHub Actions Secrets設定
リポジトリの Settings > Secrets and variables > Actions で以下を設定:

```yaml
WANDB_API_KEY: your-wandb-api-key
OPENAI_API_KEY: your-openai-api-key
DATABASE_URL: your-production-db-url
VERCEL_TOKEN: your-vercel-token
```

### 4. Webhook設定（オプション）
1. リポジトリ Settings > Webhooks > Add webhook
2. Payload URL: `https://your-app.com/api/webhooks/github`
3. Secret: ランダムな文字列を生成して`.env`の`GITHUB_WEBHOOK_SECRET`に設定

## 環境変数の優先順位

1. **開発環境** (`.env.local`)
   - ローカル開発用の設定
   - Gitにコミットしない

2. **テスト環境** (`.env.test`)
   - テスト実行時の設定
   - モックAPIキーを使用

3. **本番環境** (環境変数)
   - ホスティングサービスで直接設定
   - 絶対にコードにハードコーディングしない

## セキュリティベストプラクティス

### やるべきこと ✅
- APIキーは必ず環境変数で管理
- `.env`ファイルは`.gitignore`に追加
- 本番環境では環境変数をホスティングサービスで設定
- 定期的にAPIキーをローテーション

### やってはいけないこと ❌
- APIキーをコードに直接記載
- `.env`ファイルをGitにコミット
- APIキーをフロントエンドコードに含める
- 公開リポジトリにシークレットを保存

## トラブルシューティング

### W&B接続エラー
```bash
# API キーの確認
wandb login --relogin

# プロキシ設定が必要な場合
export HTTPS_PROXY=http://proxy.example.com:8080
```

### GitHub Actions失敗
```yaml
# デバッグログ有効化
- name: Debug
  run: |
    echo "Current directory: $(pwd)"
    echo "Environment: $NODE_ENV"
  env:
    ACTIONS_STEP_DEBUG: true
```

## 次のステップ

1. `.env.example`を`.env`にコピー
2. 必要なAPIキーを取得して設定
3. `npm install`で依存関係インストール
4. `npm run dev`で開発サーバー起動

## 関連リンク

- [W&B Documentation](https://docs.wandb.ai/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [環境変数のベストプラクティス](https://12factor.net/config)