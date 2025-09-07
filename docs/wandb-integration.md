# Weights & Biases (W&B) Integration

## Overview
MindFlowアプリケーションは、Weights & Biases (W&B)を統合してAIモデルのパフォーマンスを追跡・可視化しています。これにより、継続的なモデル改善とユーザー体験の向上を実現します。

## 統合機能

### 1. メトリクス追跡
以下のメトリクスをリアルタイムで追跡：

#### AI応答メトリクス
- **Response Time**: API応答時間（ミリ秒）
- **Token Count**: 使用トークン数
- **Model Name**: 使用モデル（GPT-3.5-turbo等）
- **Temperature**: 生成パラメータ

#### 感情分析メトリクス
- **Emotion Score**: 感情スコア（1-5）
- **Dominant Emotion**: 主要な感情
- **Emotion Confidence**: 分析信頼度（％）
- **Emotion Accuracy**: 精度スコア

#### 対話品質メトリクス
- **Conversation Length**: 対話ターン数
- **User Satisfaction**: ユーザー満足度（推定）
- **Response Relevance**: 応答関連性スコア

#### システムメトリクス
- **API Calls**: APIコール総数
- **Error Rate**: エラー発生率（％）
- **Cache Hit Rate**: キャッシュヒット率（％）

### 2. ダッシュボード表示
`MetricsDashboard`コンポーネントによる可視化：
- リアルタイムメトリクス表示
- 5秒ごとの自動更新
- グラデーション付きカード表示
- ダークモード対応

### 3. 実装詳細

#### サービスクラス
```typescript
// src/lib/wandb-service.ts
class WandbService {
  log(metrics: WandbMetrics)
  logResponseTime(startTime: number, modelName: string)
  logEmotionAnalysis(score: number, emotions: string[], confidence: number)
  logConversation(messageCount: number, satisfaction?: number)
  logError(errorType: string)
  logCacheHit(hit: boolean)
  generateReport(): MetricsReport
}
```

#### 統合ポイント
1. **対話API** (`/api/ai/dialogue/route.ts`)
   - 応答時間の記録
   - 対話長の追跡

2. **感情分析API** (`/api/ai/emotions/route.ts`)
   - 感情スコアの記録
   - 分析精度の追跡

3. **ホームページ** (`/app/page.tsx`)
   - メトリクスダッシュボード表示

## 環境設定

### 環境変数
```env
WANDB_API_KEY=your-wandb-api-key
WANDB_PROJECT=mindflow-ai-diary
WANDB_ENTITY=hackathon-team
```

### モード
- **Development Mode**: コンソールログ出力
- **Demo Mode**: UIダッシュボードのみ（APIキーなし）
- **Production Mode**: 実際のW&B APIへの送信

## Tokyo AI Festival Hackathon対応

### 加点要素
✅ **W&B統合実装済み**
- AIメトリクスの自動追跡
- リアルタイムダッシュボード
- パフォーマンス最適化指標

### デモンストレーション
1. ホームページのメトリクスダッシュボード
2. AI対話時のリアルタイム更新
3. 感情分析結果の可視化

### 技術的価値
- **継続的改善**: メトリクスに基づくモデル最適化
- **透明性**: ユーザーへのAI動作の可視化
- **スケーラビリティ**: 大規模データでも追跡可能

## 今後の拡張計画

### Phase 1（実装済み）
- 基本メトリクス追跡
- ダッシュボード表示
- API統合

### Phase 2（計画中）
- グラフ表示（時系列）
- A/Bテスト機能
- カスタムメトリクス定義

### Phase 3（将来）
- MLOps完全統合
- 自動モデル再訓練
- ユーザーセグメント分析

## 使用方法

### デモモード（APIキーなし）
```bash
npm run dev
# http://localhost:3000 でダッシュボード確認
```

### 本番モード（APIキー設定後）
```bash
# .envファイルに設定
WANDB_API_KEY=your-key-here

npm run dev
# W&Bダッシュボードでメトリクス確認
```

## 技術スタック
- **W&B SDK**: メトリクス送信
- **Next.js**: サーバーサイド統合
- **React**: ダッシュボードUI
- **TypeScript**: 型安全性

## まとめ
W&B統合により、MindFlowは単なる日記アプリから、継続的に進化するAI駆動のプラットフォームへと進化しました。ユーザーの使用パターンを分析し、AIモデルを最適化することで、より良いユーザー体験を提供します。