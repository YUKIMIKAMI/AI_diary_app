/**
 * RAG (Retrieval-Augmented Generation) Service
 * 過去の日記データを活用した文脈認識型AI応答
 */

import { EmotionData } from '@/types/emotion'

export interface DiaryContext {
  id: string
  content: string
  date: Date
  emotions: EmotionData
  keywords: string[]
  embedding?: number[]
  type?: 'diary' | 'answer' | 'reflection'
  parentId?: string
}

export interface SearchResult {
  context: DiaryContext
  relevanceScore: number
}

class RAGService {
  private contextCache: Map<string, DiaryContext[]> = new Map()
  
  /**
   * テキストの埋め込みベクトルを生成（デモ版）
   */
  private generateEmbedding(text: string): number[] {
    // 実際の実装ではOpenAI EmbeddingsやSentence Transformersを使用
    // デモ版では簡易的なハッシュベースの疑似ベクトル
    const words = text.toLowerCase().split(/\s+/)
    const vector = new Array(128).fill(0)
    
    words.forEach((word, idx) => {
      const hash = this.hashCode(word)
      vector[hash % 128] += 1 / (idx + 1) // 位置による重み付け
    })
    
    // 正規化
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return vector.map(val => val / (norm || 1))
  }
  
  /**
   * コサイン類似度を計算
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0
    
    let dotProduct = 0
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
    }
    
    return dotProduct
  }
  
  /**
   * 文字列のハッシュ値を計算
   */
  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }
  
  /**
   * 関連する過去の日記を検索
   */
  async searchRelevantContext(
    query: string,
    userId: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    // キャッシュから取得（デモ版）
    let userContexts = this.contextCache.get(userId)
    
    if (!userContexts) {
      // デモデータを生成
      userContexts = this.generateDemoContexts()
      this.contextCache.set(userId, userContexts)
    }
    
    // クエリの埋め込みベクトルを生成
    const queryEmbedding = this.generateEmbedding(query)
    
    // 各コンテキストとの類似度を計算
    const results: SearchResult[] = userContexts
      .map(context => {
        const contextEmbedding = context.embedding || this.generateEmbedding(context.content)
        const similarity = this.cosineSimilarity(queryEmbedding, contextEmbedding)
        
        // キーワードマッチングによるブースト
        const queryWords = new Set(query.toLowerCase().split(/\s+/))
        const keywordBoost = context.keywords.reduce((boost, keyword) => {
          return queryWords.has(keyword.toLowerCase()) ? boost + 0.1 : boost
        }, 0)
        
        // 感情の類似性によるブースト
        const emotionBoost = this.calculateEmotionSimilarity(query, context.emotions)
        
        return {
          context,
          relevanceScore: similarity + keywordBoost + emotionBoost
        }
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
    
    return results
  }
  
  /**
   * 感情の類似性を計算
   */
  private calculateEmotionSimilarity(query: string, emotions: EmotionData): number {
    // クエリから感情キーワードを抽出
    const positiveWords = ['嬉しい', '楽しい', 'happy', '良い', '素晴らしい']
    const negativeWords = ['悲しい', '辛い', 'sad', '大変', '疲れ']
    
    const queryLower = query.toLowerCase()
    let queryMood = 0
    
    positiveWords.forEach(word => {
      if (queryLower.includes(word)) queryMood += 1
    })
    negativeWords.forEach(word => {
      if (queryLower.includes(word)) queryMood -= 1
    })
    
    // 感情スコアとの差を計算
    const emotionScore = emotions.overallScore / 5 // 0-1に正規化
    const moodScore = (queryMood + 2) / 4 // -2～2を0～1に正規化
    
    return Math.max(0, 1 - Math.abs(emotionScore - moodScore)) * 0.2
  }
  
  /**
   * RAGを使用してプロンプトを強化
   */
  async enhancePromptWithContext(
    userMessage: string,
    userId: string
  ): Promise<string> {
    const relevantContexts = await this.searchRelevantContext(userMessage, userId, 3)
    
    if (relevantContexts.length === 0) {
      return userMessage
    }
    
    // コンテキストを整形
    const contextSummary = relevantContexts
      .map((result, idx) => {
        const date = new Date(result.context.date).toLocaleDateString('ja-JP')
        const emotions = result.context.emotions.dominantEmotions.join('、')
        return `[過去の記録${idx + 1}] ${date}\n感情: ${emotions}\n内容: ${result.context.content.substring(0, 100)}...`
      })
      .join('\n\n')
    
    // 強化されたプロンプト
    return `
ユーザーの質問: ${userMessage}

以下は関連する過去の日記記録です：
${contextSummary}

これらの過去の記録を参考にしながら、ユーザーの現在の状況に寄り添った返答をしてください。
過去の経験や感情のパターンを踏まえて、より深い洞察を提供してください。
`
  }
  
  /**
   * 回答データをRAGコンテキストとして追加
   */
  addAnswerContext(
    answer: string,
    emotions: EmotionData,
    keywords: string[],
    parentId?: string
  ): void {
    const userId = 'demo-user' // デモ版では固定
    let userContexts = this.contextCache.get(userId) || []
    
    const newContext: DiaryContext = {
      id: `answer-${Date.now()}`,
      content: answer,
      date: new Date(),
      emotions,
      keywords,
      type: 'answer',
      parentId,
      embedding: this.generateEmbedding(answer)
    }
    
    userContexts.push(newContext)
    this.contextCache.set(userId, userContexts)
    
    // セッションストレージにも保存
    if (typeof window !== 'undefined') {
      const contexts = Array.from(this.contextCache.get(userId) || [])
      sessionStorage.setItem('ragContexts', JSON.stringify(contexts))
    }
  }
  
  /**
   * デモ用のコンテキストデータを生成
   */
  private generateDemoContexts(): DiaryContext[] {
    const demoData = [
      {
        id: '1',
        content: '今日は新しいプロジェクトが始まって緊張したけど、チームメンバーが優しくて安心した。初日は色々覚えることが多くて大変だったが、やりがいを感じる。',
        date: new Date('2024-08-01'),
        emotions: {
          overallScore: 3.5,
          dominantEmotions: ['緊張', '期待', '安心'],
          emotionScores: { 緊張: 0.4, 期待: 0.3, 安心: 0.3 }
        },
        keywords: ['プロジェクト', 'チーム', '仕事', '新しい']
      },
      {
        id: '2',
        content: '週末に家族と過ごした時間が本当に幸せだった。子供の成長を感じて、時間の大切さを改めて実感した。',
        date: new Date('2024-08-10'),
        emotions: {
          overallScore: 4.8,
          dominantEmotions: ['幸せ', '感動', '充実'],
          emotionScores: { 幸せ: 0.6, 感動: 0.3, 充実: 0.1 }
        },
        keywords: ['家族', '週末', '子供', '幸せ']
      },
      {
        id: '3',
        content: 'プレゼンテーションがうまくいかなくて落ち込んだ。準備不足を痛感した。次はもっとしっかり準備しよう。',
        date: new Date('2024-08-15'),
        emotions: {
          overallScore: 2.0,
          dominantEmotions: ['落胆', '反省', '決意'],
          emotionScores: { 落胆: 0.5, 反省: 0.3, 決意: 0.2 }
        },
        keywords: ['プレゼン', '仕事', '失敗', '学び']
      },
      {
        id: '4',
        content: '友人と久しぶりに会って、昔話に花が咲いた。学生時代を思い出して懐かしかった。',
        date: new Date('2024-08-20'),
        emotions: {
          overallScore: 4.2,
          dominantEmotions: ['懐かしさ', '楽しさ', '友情'],
          emotionScores: { 懐かしさ: 0.4, 楽しさ: 0.4, 友情: 0.2 }
        },
        keywords: ['友人', '思い出', '懐かしい', '楽しい']
      },
      {
        id: '5',
        content: '運動を始めて1ヶ月。体調が良くなってきた気がする。習慣化することの大切さを実感。',
        date: new Date('2024-08-25'),
        emotions: {
          overallScore: 4.0,
          dominantEmotions: ['達成感', '健康', '前向き'],
          emotionScores: { 達成感: 0.5, 健康: 0.3, 前向き: 0.2 }
        },
        keywords: ['運動', '健康', '習慣', '成長']
      }
    ]
    
    // 埋め込みベクトルを事前計算
    return demoData.map(data => ({
      ...data,
      embedding: this.generateEmbedding(data.content)
    }))
  }
  
  /**
   * ユーザーの長期的な傾向を分析
   */
  analyzeUserTrends(userId: string): {
    commonThemes: string[]
    emotionalPattern: string
    suggestions: string[]
  } {
    const contexts = this.contextCache.get(userId) || this.generateDemoContexts()
    
    // テーマの頻度分析
    const themeCount = new Map<string, number>()
    contexts.forEach(ctx => {
      ctx.keywords.forEach(keyword => {
        themeCount.set(keyword, (themeCount.get(keyword) || 0) + 1)
      })
    })
    
    const commonThemes = Array.from(themeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme]) => theme)
    
    // 感情パターンの分析
    const avgScore = contexts.reduce((sum, ctx) => sum + ctx.emotions.overallScore, 0) / contexts.length
    let emotionalPattern = '安定'
    if (avgScore > 4) emotionalPattern = 'ポジティブ'
    else if (avgScore < 2.5) emotionalPattern = '要サポート'
    
    // 提案の生成
    const suggestions = []
    if (commonThemes.includes('仕事') && avgScore < 3) {
      suggestions.push('仕事のストレス管理について考えてみましょう')
    }
    if (commonThemes.includes('家族') && avgScore > 4) {
      suggestions.push('家族との時間が幸せの源になっているようです')
    }
    if (!commonThemes.includes('運動') && !commonThemes.includes('健康')) {
      suggestions.push('健康的な習慣を取り入れることを検討してみては？')
    }
    
    return {
      commonThemes,
      emotionalPattern,
      suggestions
    }
  }
}

// シングルトンインスタンス
export const ragService = new RAGService()

export default ragService