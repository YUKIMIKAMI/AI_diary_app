# TICKET-017: 過去振り返り機能（5-10年スパン）

## チケット情報
- **ID**: TICKET-017
- **タイプ**: 機能
- **優先度**: 低
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
5年や10年スパンで過去を振り返り、自分の軌跡を5分程度で視覚的に体験できる機能。

## 詳細説明
長期間の日記と画像データからタイムラインやハイライトを自動生成し、人生の重要な瞬間や成長の軌跡を感動的に振り返る体験を提供。

## タスク一覧
### データ分析
- [ ] 重要イベントの自動抽出
- [ ] ターニングポイントの識別
- [ ] 感情の高まりポイント検出
- [ ] 成長の軌跡分析

### コンテンツ生成
- [ ] タイムライン生成
- [ ] ハイライト選定
- [ ] ストーリーライン構築
- [ ] BGM選定ロジック

### プレゼンテーション
- [ ] スライドショー機能
- [ ] アニメーション効果
- [ ] ナレーション生成
- [ ] インタラクティブタイムライン

## 技術仕様
### 重要イベント抽出
```typescript
interface LifeEvent {
  date: Date
  type: 'milestone' | 'turning_point' | 'achievement' | 'memory'
  title: string
  description: string
  emotionScore: number
  images?: string[]
  significance: number  // 0-1の重要度スコア
}

const extractLifeEvents = async (
  diaries: DiaryEntry[],
  timespan: number
): Promise<LifeEvent[]> => {
  // 1. 感情の山と谷を検出
  const emotionPeaks = findEmotionExtremes(diaries)
  
  // 2. 頻出キーワードの変化点を検出
  const topicShifts = detectTopicChanges(diaries)
  
  // 3. AIによる重要イベント判定
  const prompt = `
以下の日記から、人生の重要なイベントやターニングポイントを抽出してください。

期間: ${timespan}年間
日記数: ${diaries.length}

判定基準:
- 人生の転機となった出来事
- 大きな達成や成功
- 重要な人との出会い
- 価値観が変わった瞬間
- 忘れられない思い出

各イベントに重要度スコア（0-1）を付けてください。
`

  const events = await analyzeWithAI(prompt, diaries)
  
  // 4. 重要度でソートして上位を選定
  return events
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 50) // 上位50イベント
}
```

### タイムライン生成
```tsx
import { motion } from 'framer-motion'

const RetrospectiveTimeline = ({ events }: { events: LifeEvent[] }) => {
  const [currentEvent, setCurrentEvent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // 自動再生
  useEffect(() => {
    if (isPlaying && currentEvent < events.length - 1) {
      const timer = setTimeout(() => {
        setCurrentEvent(prev => prev + 1)
      }, 5000) // 5秒ごとに次のイベント
      
      return () => clearTimeout(timer)
    }
  }, [currentEvent, isPlaying, events])
  
  return (
    <div className="retrospective-container">
      <motion.div 
        className="timeline-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* 年表ビュー */}
        <YearScale 
          startYear={getYear(events[0].date)}
          endYear={getYear(events[events.length - 1].date)}
        />
        
        {/* イベントマーカー */}
        {events.map((event, index) => (
          <TimelineMarker
            key={event.id}
            event={event}
            isActive={index === currentEvent}
            onClick={() => setCurrentEvent(index)}
          />
        ))}
      </motion.div>
      
      {/* 現在のイベント詳細 */}
      <motion.div 
        className="event-detail"
        key={currentEvent}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
      >
        <h2>{events[currentEvent].title}</h2>
        <p className="date">
          {formatDate(events[currentEvent].date)}
        </p>
        <p className="description">
          {events[currentEvent].description}
        </p>
        
        {events[currentEvent].images && (
          <ImageGallery images={events[currentEvent].images} />
        )}
        
        <EmotionIndicator score={events[currentEvent].emotionScore} />
      </motion.div>
      
      {/* コントロール */}
      <PlaybackControls
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onNext={() => setCurrentEvent(prev => prev + 1)}
        onPrevious={() => setCurrentEvent(prev => prev - 1)}
      />
    </div>
  )
}
```

### ストーリー生成
```typescript
const generateLifeStory = async (
  events: LifeEvent[],
  period: string
): Promise<string> => {
  const prompt = `
以下の人生の重要イベントから、感動的な振り返りストーリーを生成してください。

期間: ${period}
イベント:
${events.map(e => `- ${e.date}: ${e.title} - ${e.description}`).join('\n')}

要件:
- 5分程度で読める長さ
- 時系列に沿った物語形式
- 成長と変化を強調
- ポジティブで前向きなトーン
- 未来への希望を含める
`

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }],
    temperature: 0.8
  })
  
  return response.choices[0].message.content
}

// ナレーション音声生成
const generateNarration = async (story: string) => {
  const response = await fetch('/api/tts', {
    method: 'POST',
    body: JSON.stringify({
      text: story,
      voice: 'alloy',
      speed: 0.9
    })
  })
  
  return await response.blob()
}
```

### ビジュアルエフェクト
```css
/* Ken Burns効果 */
@keyframes kenBurns {
  0% {
    transform: scale(1) translateX(0);
  }
  100% {
    transform: scale(1.2) translateX(-10%);
  }
}

.retrospective-image {
  animation: kenBurns 10s ease-in-out infinite alternate;
}

/* パーティクルエフェクト */
.memory-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  animation: float 20s infinite;
}
```

## 受け入れ条件
- [ ] 重要イベントが自動抽出される
- [ ] タイムラインが表示される
- [ ] 自動再生機能が動作
- [ ] 画像が効果的に表示される
- [ ] 5分程度で視聴完了

## 関連チケット
- TICKET-015: マインドマップ結合機能
- TICKET-007: 感情分析ビジュアライゼーション

## 備考
プライバシー配慮のため、共有機能を実装する場合は慎重に設計。