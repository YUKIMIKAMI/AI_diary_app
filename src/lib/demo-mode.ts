// デモモード用のユーティリティ

export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
         !process.env.OPENAI_API_KEY || 
         !process.env.GOOGLE_API_KEY
}

// デモモード用のレスポンス
export const DEMO_RESPONSES = {
  dialogue: [
    "それは大変でしたね。もう少し詳しく教えていただけますか？",
    "なるほど、そのような経験をされたんですね。どのように感じましたか？",
    "その気持ち、とてもよく分かります。他に何か心に残っていることはありますか？",
    "素晴らしい気づきですね。その経験から学んだことは何ですか？",
    "それは興味深い視点ですね。もう少し深く掘り下げてみましょう。"
  ],
  
  emotions: {
    overallScore: 4,
    dominantEmotions: ["希望", "成長", "期待"],
    keywords: ["前向き", "チャレンジ", "学び", "発見", "改善"]
  },
  
  questions: [
    "この経験から学んだ最も大切なことは何ですか？",
    "同じ状況に再び直面したら、どのように対処しますか？",
    "この出来事があなたの価値観にどう影響しましたか？"
  ]
}

// レート制限
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(ip: string): boolean {
  if (!process.env.RATE_LIMIT_ENABLED) return true
  
  const now = Date.now()
  const limit = parseInt(process.env.MAX_REQUESTS_PER_HOUR || '100')
  const hour = 60 * 60 * 1000
  
  const record = requestCounts.get(ip)
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + hour })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

// セキュアなデモ日記データ
export const DEMO_DIARY_ENTRIES = [
  {
    id: 'demo-1',
    content: '今日は新しいプロジェクトを始めました。少し不安もありますが、ワクワクしています。',
    mood: 'excited',
    tags: ['仕事', '新規プロジェクト', 'チャレンジ'],
    entryDate: new Date(Date.now() - 86400000).toISOString(),
    emotionScore: 4
  },
  {
    id: 'demo-2',
    content: '昨日の会議でいいアイデアが浮かびました。チームのみんなも賛同してくれて嬉しかったです。',
    mood: 'happy',
    tags: ['チーム', 'アイデア', '達成感'],
    entryDate: new Date(Date.now() - 172800000).toISOString(),
    emotionScore: 5
  },
  {
    id: 'demo-3',
    content: '今週は色々と忙しかったけど、充実していました。来週も頑張ろう。',
    mood: 'calm',
    tags: ['振り返り', '成長', '前向き'],
    entryDate: new Date(Date.now() - 259200000).toISOString(),
    emotionScore: 4
  }
]