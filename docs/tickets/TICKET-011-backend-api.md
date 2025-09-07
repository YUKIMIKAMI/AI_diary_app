# TICKET-011: バックエンドAPI基盤構築

## チケット情報
- **ID**: TICKET-011
- **タイプ**: タスク
- **優先度**: 高
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
RESTful APIまたはGraphQLを使用したバックエンドAPIの構築。

## 詳細説明
フロントエンドとデータベース間の通信を担うAPIサーバーの実装。認証、データ検証、エラーハンドリングを含む。

## タスク一覧
### 基本設定
- [ ] Express/FastAPI のセットアップ
- [ ] ルーティング設計
- [ ] ミドルウェア設定
- [ ] CORS設定

### API実装
- [ ] 認証エンドポイント
- [ ] 日記CRUD API
- [ ] 画像アップロードAPI
- [ ] AI分析API
- [ ] マインドマップデータAPI

### セキュリティ
- [ ] JWT実装
- [ ] レート制限
- [ ] 入力検証
- [ ] SQLインジェクション対策

## 技術仕様
### APIエンドポイント
```typescript
// API Routes
const routes = {
  // 認証
  'POST /api/auth/register': 'ユーザー登録',
  'POST /api/auth/login': 'ログイン',
  'POST /api/auth/refresh': 'トークン更新',
  
  // 日記
  'GET /api/diaries': '日記一覧取得',
  'GET /api/diaries/:id': '日記詳細取得',
  'POST /api/diaries': '日記作成',
  'PUT /api/diaries/:id': '日記更新',
  'DELETE /api/diaries/:id': '日記削除',
  
  // マインドマップ
  'GET /api/mindmap/nodes': 'ノード一覧取得',
  'POST /api/mindmap/nodes': 'ノード作成',
  'PUT /api/mindmap/nodes/:id': 'ノード更新',
  'POST /api/mindmap/questions/generate': '質問生成',
  
  // 分析
  'POST /api/analyze/emotion': '感情分析',
  'GET /api/analyze/words': '単語頻度取得',
  'GET /api/analyze/trends': 'トレンド取得',
  
  // 画像
  'POST /api/images/upload': '画像アップロード',
  'GET /api/images/:id': '画像取得',
  'DELETE /api/images/:id': '画像削除'
}
```

### Express実装例
```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const app = express()

// ミドルウェア
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json({ limit: '10mb' }))

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // 100リクエスト
})
app.use('/api', limiter)

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      code: err.code
    }
  })
})
```

### データ検証
```typescript
import { z } from 'zod'

const DiarySchema = z.object({
  content: z.string().min(1).max(10000),
  entry_date: z.date(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string().uuid()).optional()
})

const validateDiary = (data: unknown) => {
  return DiarySchema.parse(data)
}
```

## 受け入れ条件
- [ ] 全APIエンドポイントが動作
- [ ] 認証が正しく機能
- [ ] エラーハンドリングが適切
- [ ] API仕様書が生成される
- [ ] テストカバレッジ80%以上

## 関連チケット
- TICKET-002: データベース設計とセットアップ
- TICKET-003: フロントエンド基盤構築

## 備考
OpenAPI (Swagger) による API仕様書の自動生成を実装。