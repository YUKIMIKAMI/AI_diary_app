# TICKET-019: テスト戦略と実装

## チケット情報
- **ID**: TICKET-019
- **タイプ**: タスク
- **優先度**: 高
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
包括的なテスト戦略の策定と、単体テスト、統合テスト、E2Eテストの実装。

## 詳細説明
コード品質を保証し、リグレッションを防ぐための自動テスト環境を構築。CI/CDパイプラインと統合。

## タスク一覧
### テスト環境
- [ ] テストフレームワーク選定と設定
- [ ] テストデータベース構築
- [ ] モックサーバー設定
- [ ] テストカバレッジ設定

### テスト実装
- [ ] 単体テスト作成
- [ ] 統合テスト作成
- [ ] E2Eテスト作成
- [ ] パフォーマンステスト

### CI/CD統合
- [ ] GitHub Actions設定
- [ ] 自動テスト実行
- [ ] カバレッジレポート
- [ ] デプロイ前検証

## 技術仕様
### テストスタック
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest": "^29.0.0",
    "cypress": "^13.0.0",
    "msw": "^2.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### 単体テスト例
```typescript
// diary.service.test.ts
describe('DiaryService', () => {
  let service: DiaryService
  let mockRepository: jest.Mocked<DiaryRepository>
  
  beforeEach(() => {
    mockRepository = createMockRepository()
    service = new DiaryService(mockRepository)
  })
  
  describe('createEntry', () => {
    it('should create diary entry with emotion analysis', async () => {
      const input = {
        content: 'Today was a great day!',
        userId: 'user-123'
      }
      
      const result = await service.createEntry(input)
      
      expect(result).toMatchObject({
        id: expect.any(String),
        content: input.content,
        emotionScore: expect.any(Number),
        createdAt: expect.any(Date)
      })
      
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          content: input.content,
          userId: input.userId
        })
      )
    })
  })
})
```

### E2Eテスト
```typescript
// diary-flow.e2e.ts
import { test, expect } from '@playwright/test'

test.describe('Diary Creation Flow', () => {
  test('should create diary and navigate to mindmap', async ({ page }) => {
    // ログイン
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // 日記作成ページへ
    await page.goto('/diary/new')
    
    // 日記入力
    await page.fill('[data-testid="diary-editor"]', '今日は素晴らしい一日でした。')
    
    // 画像アップロード
    const fileInput = await page.locator('input[type="file"]')
    await fileInput.setInputFiles('test-assets/sample.jpg')
    
    // 送信
    await page.click('button[data-testid="submit-diary"]')
    
    // マインドマップページへの遷移を確認
    await expect(page).toHaveURL('/mindmap')
    
    // 質問ノードの表示を確認
    await expect(page.locator('[data-testid="question-node"]')).toBeVisible()
  })
})
```

### パフォーマンステスト
```typescript
import { check } from 'k6'
import http from 'k6/http'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // 100ユーザーまで増加
    { duration: '5m', target: 100 }, // 100ユーザーを維持
    { duration: '2m', target: 0 },   // 0まで減少
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%のリクエストが500ms以下
    http_req_failed: ['rate<0.1'],    // エラー率10%以下
  },
}

export default function () {
  const payload = JSON.stringify({
    content: 'Performance test diary entry',
    tags: ['test', 'performance']
  })
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.TOKEN}`,
    },
  }
  
  const res = http.post('http://localhost:3000/api/diaries', payload, params)
  
  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
}
```

## 受け入れ条件
- [ ] テストカバレッジ80%以上
- [ ] 全テストがCIで自動実行
- [ ] E2Eテストが主要フローをカバー
- [ ] パフォーマンステスト合格
- [ ] テストレポートの自動生成

## 関連チケット
- TICKET-020: デプロイメント設定
- TICKET-021: モニタリング・ログ管理

## 備考
W&Bを使用してテストメトリクスとパフォーマンスを追跡。