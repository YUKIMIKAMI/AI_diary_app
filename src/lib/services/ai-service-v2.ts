import { config } from '@/lib/config'
import { isDemoMode, DEMO_RESPONSES } from '@/lib/demo-mode'

/**
 * 2パターン対応のAIサービス
 * - 開発環境: 実際のAPI使用
 * - 本番環境: デモレスポンス使用
 */

interface DialogueResponse {
  response: string
  mode: 'real' | 'demo'
}

interface EmotionAnalysis {
  overallScore: number
  dominantEmotions: string[]
  keywords: string[]
  mode: 'real' | 'demo'
}

class AIServiceV2 {
  private mode: 'real' | 'demo'
  
  constructor() {
    this.mode = config.api.useRealAPI ? 'real' : 'demo'
    console.log(`🤖 AIサービス初期化: ${this.mode}モード`)
  }
  
  /**
   * 対話応答生成
   */
  async generateDialogueResponse(
    message: string,
    context?: any[]
  ): Promise<DialogueResponse> {
    // デモモード
    if (this.mode === 'demo') {
      return this.getDemoDialogueResponse(message)
    }
    
    // 本番モード（実際のAPI使用）
    try {
      const response = await fetch('/api/ai/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context })
      })
      
      if (!response.ok) throw new Error('API error')
      
      const data = await response.json()
      return {
        response: data.response,
        mode: 'real'
      }
    } catch (error) {
      console.error('API呼び出し失敗、デモモードにフォールバック', error)
      return this.getDemoDialogueResponse(message)
    }
  }
  
  /**
   * 感情分析
   */
  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    // デモモード
    if (this.mode === 'demo') {
      return {
        ...DEMO_RESPONSES.emotions,
        mode: 'demo'
      }
    }
    
    // 本番モード
    try {
      const response = await fetch('/api/ai/emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      })
      
      if (!response.ok) throw new Error('API error')
      
      const data = await response.json()
      return {
        ...data,
        mode: 'real'
      }
    } catch (error) {
      console.error('感情分析失敗、デモモードにフォールバック', error)
      return {
        ...DEMO_RESPONSES.emotions,
        mode: 'demo'
      }
    }
  }
  
  /**
   * 質問生成
   */
  async generateQuestions(content: string): Promise<string[]> {
    if (this.mode === 'demo') {
      return DEMO_RESPONSES.questions
    }
    
    try {
      const response = await fetch('/api/ai/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      if (!response.ok) throw new Error('API error')
      
      const data = await response.json()
      return data.questions
    } catch (error) {
      console.error('質問生成失敗、デモモードにフォールバック', error)
      return DEMO_RESPONSES.questions
    }
  }
  
  /**
   * デモ用の対話応答（賢く見せる工夫）
   */
  private getDemoDialogueResponse(message: string): DialogueResponse {
    const lowerMessage = message.toLowerCase()
    
    // キーワードベースで応答を選択
    let response = ''
    
    if (lowerMessage.includes('疲れ') || lowerMessage.includes('つかれ')) {
      response = 'お疲れ様でした。今日は特に大変だったのでしょうか？ゆっくり休むことも大切ですね。'
    } else if (lowerMessage.includes('嬉し') || lowerMessage.includes('楽し')) {
      response = '素晴らしいですね！その喜びをもっと詳しく聞かせてください。どんな瞬間が特に印象的でしたか？'
    } else if (lowerMessage.includes('悩') || lowerMessage.includes('迷')) {
      response = 'それは難しい状況ですね。どんな選択肢があると思いますか？一緒に整理してみましょう。'
    } else if (lowerMessage.includes('不安') || lowerMessage.includes('心配')) {
      response = '不安な気持ち、よくわかります。具体的にどんなことが心配なのか、話してみませんか？'
    } else if (lowerMessage.includes('成功') || lowerMessage.includes('達成')) {
      response = 'おめでとうございます！その成功に至るまでの道のりはどうでしたか？'
    } else if (lowerMessage.includes('失敗') || lowerMessage.includes('ミス')) {
      response = '失敗は成長の機会でもあります。この経験から学んだことはありますか？'
    } else {
      // ランダムな汎用応答
      const responses = DEMO_RESPONSES.dialogue
      response = responses[Math.floor(Math.random() * responses.length)]
    }
    
    return {
      response,
      mode: 'demo'
    }
  }
  
  /**
   * 現在のモードを取得
   */
  getMode(): 'real' | 'demo' {
    return this.mode
  }
  
  /**
   * モード切り替え（開発用）
   */
  setMode(mode: 'real' | 'demo') {
    if (config.mode === 'development') {
      this.mode = mode
      console.log(`🔄 AIモード切り替え: ${mode}`)
    }
  }
}

// シングルトンインスタンス
export const aiService = new AIServiceV2()

// デフォルトエクスポート
export default aiService