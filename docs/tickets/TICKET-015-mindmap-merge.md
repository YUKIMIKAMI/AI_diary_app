# TICKET-015: マインドマップ結合機能

## チケット情報
- **ID**: TICKET-015
- **タイプ**: 機能
- **優先度**: 中
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
月別、年別、全期間のマインドマップを自動生成し、人生の縮図を可視化する機能。

## 詳細説明
個別の日記マインドマップを期間ごとに統合し、趣味、人間関係、家族、友達、仕事などの大きなカテゴリーに自動分類。ユーザーの人生の全体像を俯瞰できるビューを提供。

## タスク一覧
### データ分析
- [ ] カテゴリー自動分類アルゴリズム
- [ ] トピッククラスタリング
- [ ] 重要度スコアリング
- [ ] 関連性分析

### マップ生成
- [ ] 期間別データ集約
- [ ] ノードの階層構造生成
- [ ] レイアウトアルゴリズム
- [ ] エッジの重み付け

### 可視化
- [x] 大規模マインドマップ描画
- [x] ズーム機能の最適化
- [x] カテゴリー別色分け
- [ ] 時系列アニメーション
- [ ] 単語クリックで関連日記一覧表示（後続タスク）

## 技術仕様
### カテゴリー分類
```typescript
enum LifeCategory {
  WORK = '仕事',
  FAMILY = '家族',
  FRIENDS = '友達',
  HOBBY = '趣味',
  HEALTH = '健康',
  RELATIONSHIP = '人間関係',
  GROWTH = '成長',
  FINANCE = '金銭',
  TRAVEL = '旅行',
  EDUCATION = '学習'
}

// AIによるカテゴリー分類
const categorizeNode = async (node: MindmapNode): Promise<LifeCategory[]> => {
  const prompt = `
以下のテキストを分析し、該当するカテゴリーを判定してください。

テキスト: ${node.content}

カテゴリー: ${Object.values(LifeCategory).join(', ')}

複数該当する場合は全て列挙してください。
`

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }]
  })
  
  return parseCategories(response.choices[0].message.content)
}
```

### マップ結合アルゴリズム
```typescript
interface MergedMindmap {
  period: 'monthly' | 'yearly' | 'all-time'
  rootNode: HierarchicalNode
  statistics: MapStatistics
}

const mergeMindmaps = async (
  diaries: DiaryEntry[],
  period: Period
): Promise<MergedMindmap> => {
  // 1. カテゴリー別にグループ化
  const categorized = await categorizeDiaries(diaries)
  
  // 2. 階層構造を生成
  const hierarchy = {
    id: 'root',
    label: getPeriodLabel(period),
    children: Object.entries(categorized).map(([category, entries]) => ({
      id: category,
      label: category,
      children: entries.map(entry => ({
        id: entry.id,
        label: entry.title || entry.content.substring(0, 30),
        data: entry,
        importance: calculateImportance(entry)
      }))
    }))
  }
  
  // 3. レイアウト計算
  const layout = calculateRadialLayout(hierarchy)
  
  // 4. 統計情報生成
  const statistics = {
    totalNodes: countNodes(hierarchy),
    categoryDistribution: getCategoryDistribution(categorized),
    emotionTrend: calculateEmotionTrend(diaries),
    topKeywords: extractTopKeywords(diaries)
  }
  
  return {
    period,
    rootNode: layout,
    statistics
  }
}
```

### ビジュアライゼーション
```tsx
import * as d3 from 'd3'

const LifeMapVisualization = ({ data }: { data: MergedMindmap }) => {
  useEffect(() => {
    const svg = d3.select('#life-map')
    const width = 1200
    const height = 800
    
    // Force-directed layout
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))
    
    // カテゴリー別の色スケール
    const colorScale = d3.scaleOrdinal()
      .domain(Object.values(LifeCategory))
      .range(d3.schemeCategory10)
    
    // ノード描画
    const nodes = svg.selectAll('.node')
      .data(data.nodes)
      .enter().append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
    
    nodes.append('circle')
      .attr('r', d => Math.sqrt(d.importance) * 10)
      .style('fill', d => colorScale(d.category))
      .style('opacity', 0.8)
    
    nodes.append('text')
      .text(d => d.label)
      .style('font-size', d => `${Math.sqrt(d.importance) * 3}px`)
  }, [data])
  
  return (
    <div className="life-map-container">
      <svg id="life-map" />
      <MapControls />
      <CategoryLegend />
      <StatisticsPanel statistics={data.statistics} />
    </div>
  )
}
```

## 受け入れ条件
- [ ] 期間別マップが生成される
- [ ] カテゴリー分類が正確
- [ ] 大規模データでも描画可能
- [ ] インタラクティブな操作
- [ ] 統計情報の表示

## 関連チケット
- TICKET-005: マインドマップページの実装
- TICKET-006: AI機能統合とAPI設定
- TICKET-007: 感情分析ビジュアライゼーション

## 備考
パフォーマンスのため、1000ノード以上の場合は階層的にグループ化して表示。