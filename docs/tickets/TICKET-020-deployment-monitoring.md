# TICKET-020: デプロイメント・モニタリング設定

## チケット情報
- **ID**: TICKET-020
- **タイプ**: タスク
- **優先度**: 高
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
本番環境へのデプロイメント設定とモニタリング・ログ管理システムの構築。

## 詳細説明
CI/CDパイプラインを構築し、自動デプロイを実現。W&Bを活用したモニタリングとアラート設定。

## タスク一覧
### デプロイメント
- [ ] ホスティングサービス選定（Vercel/AWS/GCP）
- [ ] 環境変数管理
- [ ] Docker設定
- [ ] CI/CDパイプライン構築

### モニタリング
- [ ] W&B統合設定
- [ ] アプリケーションメトリクス
- [ ] エラートラッキング
- [ ] アラート設定

### ログ管理
- [ ] ログ収集設定
- [ ] ログ分析ダッシュボード
- [ ] ログローテーション
- [ ] 監査ログ

## 技術仕様
### GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test:ci
      
      - name: Build
        run: pnpm build
      
      - name: Upload coverage to W&B
        env:
          WANDB_API_KEY: ${{ secrets.WANDB_API_KEY }}
        run: |
          wandb login
          wandb log coverage.json

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm i -g vercel
          vercel --prod --token $VERCEL_TOKEN
```

### Docker設定
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### W&Bモニタリング
```typescript
import wandb from '@wandb/sdk'

// アプリケーションメトリクス
export const initMonitoring = () => {
  wandb.init({
    project: 'ai-diary-production',
    config: {
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION
    }
  })
}

// APIメトリクス記録
export const logApiMetrics = (endpoint: string, metrics: ApiMetrics) => {
  wandb.log({
    endpoint,
    response_time: metrics.responseTime,
    status_code: metrics.statusCode,
    user_id: metrics.userId,
    timestamp: new Date().toISOString()
  })
}

// AI使用量追跡
export const trackAIUsage = (usage: AIUsage) => {
  wandb.log({
    ai_provider: usage.provider,
    tokens_used: usage.tokens,
    cost: usage.estimatedCost,
    model: usage.model,
    feature: usage.feature
  })
}

// エラー追跡
export const logError = (error: Error, context?: any) => {
  wandb.alert(
    title: 'Production Error',
    text: error.message,
    level: 'ERROR',
    wait_duration: 300
  )
  
  wandb.log({
    error_message: error.message,
    error_stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })
}
```

### ログ管理
```typescript
import winston from 'winston'
import { WandbTransport } from './wandb-transport'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { 
    service: 'ai-diary',
    version: process.env.APP_VERSION 
  },
  transports: [
    // ファイル出力
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    }),
    
    // W&B出力
    new WandbTransport({
      project: 'ai-diary-logs',
      entity: 'your-team'
    }),
    
    // コンソール出力（開発環境）
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ] : [])
  ]
})

// 監査ログ
export const auditLog = (action: string, userId: string, details: any) => {
  logger.info('AUDIT', {
    action,
    userId,
    details,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  })
}
```

### アラート設定
```python
# monitoring/alerts.py
import wandb

# W&Bアラート設定
alerts = [
  {
    "name": "High Error Rate",
    "condition": "error_rate > 0.05",
    "wait_duration": 300,
    "channels": ["slack", "email"]
  },
  {
    "name": "High Response Time",
    "condition": "p95_response_time > 1000",
    "wait_duration": 600,
    "channels": ["slack"]
  },
  {
    "name": "AI API Cost Spike",
    "condition": "daily_ai_cost > 100",
    "wait_duration": 0,
    "channels": ["email", "sms"]
  }
]

for alert in alerts:
    wandb.alert(**alert)
```

## 受け入れ条件
- [ ] 自動デプロイが機能
- [ ] モニタリングダッシュボード表示
- [ ] エラーアラートが送信される
- [ ] ログが適切に記録される
- [ ] W&Bでメトリクス確認可能

## 関連チケット
- TICKET-019: テスト戦略と実装
- TICKET-001: プロジェクト基盤のセットアップ

## 備考
W&Bを中心としたObservabilityスタックを構築し、システム全体の可視性を確保。