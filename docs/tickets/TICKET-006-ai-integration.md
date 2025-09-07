# TICKET-006: AI機能統合とAPI設定

## チケット情報
- **ID**: TICKET-006
- **タイプ**: 機能
- **優先度**: 高
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
OpenAI/Claude APIの統合と、質問生成、感情分析、対話機能の実装。

## 詳細説明
日記の内容を分析して関連質問を生成し、感情分析を行い、過去の日記を学習した相談相手として機能するAI統合。

## タスク一覧
### API統合
- [ ] OpenAI/Claude APIの選定と設定
- [ ] APIキー管理システム
- [ ] レート制限の実装
- [ ] エラーハンドリング
- [ ] W&Bによる使用量モニタリング

### 質問生成機能
- [ ] 日記内容の分析ロジック
- [ ] トピック抽出アルゴリズム
- [ ] 質問テンプレートの作成
- [ ] パーソナライズされた質問生成

### 感情分析
- [ ] 感情スコアリング（5段階）
- [ ] 8つの基本感情の検出
- [ ] 感情の可視化（色/マーク）
- [ ] 感情トレンドの計算

### 相談モード
- [ ] 過去の日記の埋め込みベクトル化
- [ ] コンテキスト検索機能
- [ ] 対話履歴の管理
- [ ] パーソナライズされた回答生成

## 技術仕様
### API設定
```typescript
// AI Provider設定
interface AIConfig {
  provider: 'openai' | 'anthropic'
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
}

// プロンプトテンプレート
const questionPrompt = `
日記の内容: {diary_content}

この日記を書いた人により深い自己理解を促すため、
以下の観点から3-5個の質問を生成してください：
1. 感情の深掘り
2. 行動の動機
3. 今後の行動
4. 人間関係
5. 価値観
`;
```

### 感情分析仕様
```typescript
interface EmotionAnalysis {
  overall_score: number  // 1-5
  emotions: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
    disgust: number
    trust: number
    anticipation: number
  }
  color_code: string
  emoji: string
}
```

### W&B統合
```python
import wandb

# 実験追跡
wandb.init(project="ai-diary-app")
wandb.log({
  "api_calls": api_call_count,
  "tokens_used": total_tokens,
  "average_response_time": avg_time,
  "emotion_accuracy": accuracy_score
})
```

## 受け入れ条件
- [ ] AIによる質問が生成される
- [ ] 感情分析が正確に機能
- [ ] 相談モードで自然な対話が可能
- [ ] W&Bでメトリクスが確認できる
- [ ] APIコストが予算内

## 関連チケット
- TICKET-004: 日記入力機能の実装
- TICKET-005: マインドマップページの実装
- TICKET-007: 感情分析ビジュアライゼーション

## 備考
初期はOpenAI GPT-4を使用し、コスト最適化のためにファインチューニングや軽量モデルへの移行を検討。