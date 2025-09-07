# TICKET-007: 感情分析ビジュアライゼーション

## チケット情報
- **ID**: TICKET-007
- **タイプ**: 機能
- **優先度**: 中
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
感情分析結果の可視化機能。マインドマップの色分け、月次・年次グラフの生成。

## 詳細説明
日記エントリーの感情を分析し、マインドマップノードに色やマークを付与。期間別の感情変化をグラフで表示。

## タスク一覧
### マインドマップ表示
- [ ] ノードへの感情色の適用
- [ ] 感情マーク（絵文字）の表示
- [ ] 感情強度による透明度調整
- [ ] 凡例の表示

### グラフ機能
- [ ] 月次感情グラフの実装
- [ ] 年次感情グラフの実装
- [ ] 感情推移の折れ線グラフ
- [ ] 感情分布の円グラフ
- [ ] ヒートマップカレンダー

### データ集計
- [ ] 日次感情スコアの集計
- [ ] 期間平均の計算
- [ ] トレンド分析
- [ ] 異常値検出

## 技術仕様
### グラフライブラリ
```json
{
  "dependencies": {
    "recharts": "^2.x",
    "d3": "^7.x",
    "react-calendar-heatmap": "^1.x"
  }
}
```

### 感情カラーマッピング
```typescript
const emotionColors = {
  joy: '#FFD700',      // ゴールド
  sadness: '#4682B4',  // スチールブルー
  anger: '#DC143C',    // クリムゾン
  fear: '#8B008B',     // ダークマゼンタ
  surprise: '#FF69B4', // ホットピンク
  disgust: '#228B22',  // フォレストグリーン
  trust: '#87CEEB',    // スカイブルー
  anticipation: '#FFA500' // オレンジ
}

// 感情スコアによる色の濃淡
const getColorIntensity = (score: number) => {
  return `rgba(${hexToRgb(color)}, ${score / 5})`
}
```

### グラフコンポーネント
```tsx
interface EmotionChartProps {
  data: EmotionData[]
  period: 'daily' | 'monthly' | 'yearly'
  chartType: 'line' | 'bar' | 'pie' | 'heatmap'
}

// 月次感情推移グラフの例
const MonthlyEmotionChart = ({ data }) => (
  <LineChart data={data}>
    <Line type="monotone" dataKey="joy" stroke="#FFD700" />
    <Line type="monotone" dataKey="sadness" stroke="#4682B4" />
    {/* 他の感情... */}
  </LineChart>
)
```

## 受け入れ条件
- [ ] マインドマップに感情色が表示される
- [ ] 月次・年次グラフが正しく描画される
- [ ] データの集計が正確
- [ ] レスポンシブなグラフ表示
- [ ] パフォーマンス（大量データでもスムーズ）

## 関連チケット
- TICKET-006: AI機能統合とAPI設定
- TICKET-005: マインドマップページの実装
- TICKET-008: 単語頻度分析機能

## 備考
色覚多様性に配慮し、色だけでなくパターンやアイコンでも識別可能にする。