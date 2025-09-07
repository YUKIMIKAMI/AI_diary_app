import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// AIサービスのインターフェース
interface Question {
  question: string
  category: 'reflection' | 'detail' | 'emotion' | 'action'
}

interface EmotionAnalysis {
  overallScore: number // 1-5
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
  dominantEmotions: string[]
}

class AIService {
  private openai: OpenAI | null = null
  private gemini: GoogleGenerativeAI | null = null
  private geminiModel: any = null
  private provider: 'openai' | 'google' | 'mock' = 'mock'
  private isConfigured = false

  constructor() {
    this.initializeService()
  }

  private initializeService() {
    // Google AI APIキーをチェック
    const googleApiKey = process.env.GOOGLE_API_KEY
    if (googleApiKey && googleApiKey !== 'your-google-api-key-here') {
      try {
        this.gemini = new GoogleGenerativeAI(googleApiKey)
        this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })
        this.provider = 'google'
        this.isConfigured = true
        console.log('Google AI (Gemini) サービスが初期化されました')
        return
      } catch (error) {
        console.error('Google AI 初期化エラー:', error)
      }
    }

    // OpenAI APIキーをチェック
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (openaiApiKey && openaiApiKey !== 'your-openai-api-key-here') {
      try {
        this.openai = new OpenAI({
          apiKey: openaiApiKey
        })
        this.provider = 'openai'
        this.isConfigured = true
        console.log('OpenAI APIサービスが初期化されました')
        return
      } catch (error) {
        console.error('OpenAI API初期化エラー:', error)
      }
    }

    console.log('AI APIキーが設定されていません。モック機能を使用します。')
    this.provider = 'mock'
    this.isConfigured = false
  }

  // 質問生成
  async generateQuestions(content: string): Promise<Question[]> {
    if (this.provider === 'mock') {
      return this.generateMockQuestions(content)
    }

    const prompt = `
日記から、書き手の心に寄り添う優しい質問を2つ作ってください。

日記の内容:
${content}

【質問の条件】
- 30-50文字程度の適度な長さ（長すぎず短すぎず）
- 「はい/いいえ」で答えられない開かれた質問
- 今日の具体的な出来事や感情に焦点を当てる
- 批判的でなく、共感と好奇心を持った優しい質問
- 書き手が答えやすく、新しい気づきを得られる質問

【カテゴリ】
reflection: その瞬間の気持ちや感覚を振り返る
detail: 具体的な場面・状況・様子を思い出す
emotion: 感情の変化や理由を優しく探る  
action: 明日からできる小さな一歩を考える

JSON形式で返してください:
[
  {"question": "質問文（30-50文字）", "category": "カテゴリ名"},
  {"question": "質問文（30-50文字）", "category": "カテゴリ名"}
]
`

    try {
      if (this.provider === 'google' && this.geminiModel) {
        const result = await this.geminiModel.generateContent(prompt)
        const response = result.response
        const text = response.text()
        
        // JSONを抽出
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const questions = JSON.parse(jsonMatch[0])
          return Array.isArray(questions) ? questions : []
        }
      } else if (this.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: process.env.AI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'あなたは優れた心理カウンセラーです。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        })

        const result = JSON.parse(response.choices[0].message.content || '[]')
        return Array.isArray(result) ? result : result.questions || []
      }
    } catch (error) {
      console.error('質問生成エラー:', error)
    }

    return this.generateMockQuestions(content)
  }

  // 感情分析
  async analyzeEmotions(content: string): Promise<EmotionAnalysis> {
    if (this.provider === 'mock') {
      return this.analyzeMockEmotions(content)
    }

    const prompt = `
日記の内容を分析し、感情スコアを評価してください。

日記の内容:
${content}

必ず以下のJSON形式で感情分析結果を返してください。他の説明は一切不要です:
{
  "overallScore": 1-5の整数（1:とてもネガティブ、5:とてもポジティブ）,
  "emotions": {
    "joy": 0-100の数値,
    "sadness": 0-100の数値,
    "anger": 0-100の数値,
    "fear": 0-100の数値,
    "surprise": 0-100の数値,
    "disgust": 0-100の数値,
    "trust": 0-100の数値,
    "anticipation": 0-100の数値
  },
  "dominantEmotions": ["主要な感情を日本語で最大3つの配列（例: 喜び, 不安, 期待）"]
}
`

    try {
      if (this.provider === 'google' && this.geminiModel) {
        const result = await this.geminiModel.generateContent(prompt)
        const response = result.response
        const text = response.text()
        
        // JSONを抽出
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const emotions = JSON.parse(jsonMatch[0])
          return emotions
        }
      } else if (this.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: process.env.AI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'あなたは感情分析の専門家です。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        })

        const result = JSON.parse(response.choices[0].message.content || '{}')
        return result
      }
    } catch (error) {
      console.error('感情分析エラー:', error)
    }

    return this.analyzeMockEmotions(content)
  }

  // 相談モード用の応答生成
  async generateConsultationResponse(
    message: string, 
    relevantContext: string, 
    history: any[]
  ): Promise<string> {
    if (this.provider === 'mock') {
      return this.generateMockConsultationResponse(message, relevantContext)
    }

    const systemPrompt = `あなたはユーザーの過去の日記をすべて読み、深く理解している相談相手です。

【重要なルール】
- 過去の日記から具体的な日付と出来事を引用する（例：2024年1月15日の日記では〜）
- 似た経験があれば「○年前の○月○日にも同じような〜」と具体的に言及
- 過去の成功体験や乗り越え方を思い出させる
- 適度な共感と励ましを含める
- 4-6文程度でまとめる

【過去の日記】
${relevantContext || '（まだ日記がありません）'}

過去の具体的な日付と出来事を引用しながら、寄り添いつつ励ます返答をしてください。`

    const userPrompt = message

    try {
      if (this.provider === 'google' && this.geminiModel) {
        const prompt = `${systemPrompt}\n\nユーザーからの質問: ${userPrompt}`
        const result = await this.geminiModel.generateContent(prompt)
        const response = result.response
        return response.text()
      } else if (this.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: process.env.AI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 400
        })
        return response.choices[0].message.content || ''
      }
    } catch (error) {
      console.error('相談応答生成エラー:', error)
    }

    return this.generateMockConsultationResponse(message, relevantContext)
  }

  // モック相談応答
  private generateMockConsultationResponse(message: string, context: string): string {
    // 現在の日付
    const today = new Date()
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
    
    const responses: { [key: string]: string } = {
      '悩み': `悩んでいるんだね。その気持ち、よくわかるよ。
実は${threeMonthsAgo.toLocaleDateString('ja-JP')}の日記でも、似たようなことで悩んでいたよね。
でもその時は「一歩ずつ進む」って決めて、実際に乗り越えてきた。
今回もきっと大丈夫。あの時の強さが今もあなたの中にあるから。`,
      
      '最近': `最近のことを話したいんだね。
${oneMonthAgo.toLocaleDateString('ja-JP')}の日記と比べると、だいぶ環境も変わってきたみたいだね。
特に仕事でのストレスが増えているように見えるけど、過去にも同じような時期があったよ。
その時は運動と読書でリフレッシュしてたよね。今回も試してみたら？`,
      
      '成長': `成長について考えているんだね。
1年前の2023年9月の日記を見ると、「こんなことできるかな」って不安に思ってたことが、今では当たり前にできてるよ。
この1年で本当に成長してる。それは日記が証明してる。
だからこれからの1年も、きっと同じくらい成長できるよ。`,
      
      '仕事': `仕事の話だね。
2ヶ月前の${new Date(today.getFullYear(), today.getMonth() - 2, 15).toLocaleDateString('ja-JP')}の日記でも、同じように仕事のプレッシャーを感じてたよね。
でもその後、プロジェクトを無事完成させて「やればできる」って自信をつけた。
今回も同じように乗り越えられるはずだよ。`,
      
      '疲れ': `お疲れさま。本当に頑張ってるよね。
実は先月の${new Date(today.getFullYear(), today.getMonth() - 1, 20).toLocaleDateString('ja-JP')}の日記でも「疲れた」って書いてた。
でもその翌週には「リフレッシュできた」って書いてある。休息を取ったからだよね。
疲れを感じるのは頑張っている証拠。少し休んでも大丈夫だよ。`
    }

    // キーワードベースでレスポンスを選択
    for (const [keyword, response] of Object.entries(responses)) {
      if (message.includes(keyword)) {
        return response
      }
    }

    // デフォルトレスポンス
    if (context) {
      return `そうなんだね。しっかり聞かせてもらうよ。
過去の日記を読んでいると、あなたがいろいろなことを乗り越えてきたことがわかる。
${oneMonthAgo.toLocaleDateString('ja-JP')}頃の日記でも似たような状況があったけど、ちゃんと前に進んでいるよ。
今回もきっと大丈夫。一緒に考えていこう。`
    } else {
      return `話を聞かせてくれてありがとう。
まだ日記が少ないから、あなたのことをもっと知りたいな。
これから日記が増えるにつれて、もっと的確なアドバイスができるようになるよ。
今はどんなことを話したい？`
    }
  }

  // キーワード抽出
  async extractKeywords(content: string): Promise<string[]> {
    if (this.provider === 'mock') {
      return this.extractMockKeywords(content)
    }

    const prompt = `
日記の内容から重要なキーワードを5つ抽出してください。

日記の内容:
${content}

必ずJSON形式でキーワードの配列を返してください。他の説明は一切不要です:
{"keywords": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"]}
`

    try {
      if (this.provider === 'google' && this.geminiModel) {
        const result = await this.geminiModel.generateContent(prompt)
        const response = result.response
        const text = response.text()
        
        // JSONを抽出
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0])
          return data.keywords || []
        }
      } else if (this.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: process.env.AI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'あなたはテキスト分析の専門家です。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 200,
          response_format: { type: 'json_object' }
        })

        const result = JSON.parse(response.choices[0].message.content || '{}')
        return result.keywords || []
      }
    } catch (error) {
      console.error('キーワード抽出エラー:', error)
    }

    return this.extractMockKeywords(content)
  }

  // モック関数（APIキーが設定されていない場合）
  private generateMockQuestions(content: string): Question[] {
    const questions: Question[] = []
    
    if (content.includes('子供') || content.includes('家族')) {
      questions.push({
        question: '看病の合間に、どんな気持ちで本や映画を楽しみましたか？',
        category: 'reflection'
      })
    }
    
    if (content.includes('仕事') || content.includes('焦')) {
      questions.push({
        question: '焦りを感じた時、体のどこにその感覚を感じましたか？',
        category: 'emotion'
      })
    }
    
    if (content.includes('映画') || content.includes('本') || content.includes('小説')) {
      questions.push({
        question: 'その作品から受け取った一番大切なメッセージは何でしたか？',
        category: 'detail'
      })
    }

    if (content.includes('集中')) {
      questions.push({
        question: '集中できた時間は、普段と何が違っていましたか？',
        category: 'reflection'
      })
    }

    // デフォルトの質問
    while (questions.length < 2) {
      if (questions.length === 0) {
        questions.push({
          question: '今日の中で、自分を褒めてあげたい瞬間はありましたか？',
          category: 'reflection'
        })
      } else {
        questions.push({
          question: '明日も続けたい、今日見つけた小さな習慣は何ですか？',
          category: 'action'
        })
      }
    }

    return questions.slice(0, 2)
  }

  private analyzeMockEmotions(content: string): EmotionAnalysis {
    const emotions = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      trust: 0,
      anticipation: 0
    }
    
    const dominantEmotions: string[] = []
    
    // キーワードベースの簡易感情分析
    if (content.includes('嬉しい') || content.includes('楽しい') || content.includes('良い')) {
      emotions.joy = 70
      dominantEmotions.push('喜び')
    }
    if (content.includes('悲しい') || content.includes('辛い')) {
      emotions.sadness = 60
      dominantEmotions.push('悲しみ')
    }
    if (content.includes('焦る') || content.includes('不安')) {
      emotions.fear = 50
      emotions.anticipation = 40
      dominantEmotions.push('不安')
    }
    if (content.includes('集中') || content.includes('満足')) {
      emotions.trust = 60
      emotions.joy = 50
      if (!dominantEmotions.includes('喜び')) {
        dominantEmotions.push('満足感')
      }
    }
    
    // デフォルト値
    if (dominantEmotions.length === 0) {
      emotions.trust = 40
      emotions.anticipation = 30
      dominantEmotions.push('平穏')
    }
    
    // 全体スコアの計算
    const positiveScore = (emotions.joy + emotions.trust + emotions.anticipation) / 3
    const negativeScore = (emotions.sadness + emotions.anger + emotions.fear + emotions.disgust) / 4
    const overallScore = Math.round(3 + (positiveScore - negativeScore) / 50)
    
    return {
      overallScore: Math.max(1, Math.min(5, overallScore)),
      emotions,
      dominantEmotions: dominantEmotions.slice(0, 3)
    }
  }

  private extractMockKeywords(content: string): string[] {
    const keywords: string[] = []
    
    // 簡単なキーワード抽出
    const keywordMap: { [key: string]: string } = {
      '子供': '家族',
      '仕事': '仕事',
      'メール': '業務',
      '小説': '読書',
      '映画': 'エンタメ',
      '集中': '集中力',
      '焦': 'ストレス',
      '看病': '介護',
      '熱': '体調',
      'インプット': '学習'
    }
    
    for (const [key, value] of Object.entries(keywordMap)) {
      if (content.includes(key) && !keywords.includes(value)) {
        keywords.push(value)
      }
    }
    
    // デフォルトキーワード
    if (keywords.length === 0) {
      keywords.push('日常', '振り返り')
    }
    
    return keywords.slice(0, 5)
  }
}

// シングルトンインスタンスをエクスポート
export const aiService = new AIService()

// 型定義もエクスポート
export type { Question, EmotionAnalysis }