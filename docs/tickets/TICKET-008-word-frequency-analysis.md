# TICKET-008: 単語頻度分析機能

## チケット情報
- **ID**: TICKET-008
- **タイプ**: 機能
- **優先度**: 中
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
日記テキストから単語を集計し、頻出単語を棒グラフやワードクラウドで可視化。

## 詳細説明
月単位・年単位で日記に出現する単語を分析し、ユーザーの関心事や思考パターンを可視化する。

## タスク一覧
### テキスト処理
- [ ] 形態素解析の実装（日本語対応）
- [ ] ストップワードの除外
- [ ] 品詞フィルタリング
- [ ] 単語の正規化

### 集計機能
- [ ] 単語カウントアルゴリズム
- [ ] 期間別集計（日/月/年）
- [ ] カテゴリー別集計
- [ ] TF-IDF計算

### 可視化
- [ ] 棒グラフの実装
- [ ] ワードクラウドの実装
- [ ] トレンドグラフ
- [ ] 比較ビュー（期間比較）

## 技術仕様
### 形態素解析
```typescript
// 日本語形態素解析
import kuromoji from 'kuromoji'

const tokenizer = await kuromoji.builder({
  dicPath: 'node_modules/kuromoji/dict'
}).build()

const analyzeText = (text: string) => {
  const tokens = tokenizer.tokenize(text)
  return tokens
    .filter(token => token.pos === '名詞' || token.pos === '動詞')
    .map(token => token.surface_form)
}
```

### ワードクラウド
```typescript
import WordCloud from 'react-wordcloud'

interface WordFrequency {
  text: string
  value: number
}

const WordCloudComponent = ({ words }: { words: WordFrequency[] }) => {
  const options = {
    rotations: 2,
    rotationAngles: [-90, 0],
    fontSizes: [12, 60],
    colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']
  }
  
  return <WordCloud words={words} options={options} />
}
```

### データ構造
```typescript
interface WordAnalysis {
  period: Date
  periodType: 'daily' | 'monthly' | 'yearly'
  words: Map<string, number>
  totalWords: number
  uniqueWords: number
  topWords: Array<{
    word: string
    count: number
    trend: 'up' | 'down' | 'stable'
  }>
}
```

## 受け入れ条件
- [ ] 日本語の形態素解析が正確
- [ ] ワードクラウドが表示される
- [ ] 期間別の集計が可能
- [ ] ストップワードが除外される
- [ ] エクスポート機能が動作

## 関連チケット
- TICKET-007: 感情分析ビジュアライゼーション
- TICKET-009: データエクスポート機能

## 備考
多言語対応を考慮し、言語判定機能も実装予定。英語の場合はnlpライブラリを使用。