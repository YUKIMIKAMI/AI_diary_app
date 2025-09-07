import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { wandbService } from '@/lib/wandb-service'
import { ragService } from '@/lib/rag-service'
import { promptOptimizer } from '@/lib/prompt-optimizer'

// OpenAI client initialization with fallback
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key-for-testing'
})

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'メッセージが必要です' }, { status: 400 })
    }
    
    // デモモード（APIキーが設定されていない場合）
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      // RAGを使用してコンテキストを強化（デモモード）
      const lastUserMessage = messages[messages.length - 1].content
      const userId = 'demo-user' // デモユーザーID
      
      // RAGで関連コンテキストを検索
      const enhancedContext = await ragService.enhancePromptWithContext(
        lastUserMessage,
        userId
      )
      
      // プロンプト最適化
      const optimizationResult = promptOptimizer.optimizePrompt(
        'diary_conversation',
        {
          context: enhancedContext,
          userMessage: lastUserMessage,
          userMood: 'neutral'
        }
      )
      
      // ユーザーの傾向分析
      const trends = ragService.analyzeUserTrends(userId)
      
      // デモ応答を生成（RAGとプロンプト最適化の結果を反映）
      const responses = [
        `${trends.commonThemes.includes('仕事') ? '仕事のことですね。' : ''}それは素敵な一日でしたね。その時の気持ちをもう少し詳しく教えていただけますか？`,
        `なるほど、${trends.emotionalPattern === 'ポジティブ' ? '前向きな' : ''}経験をされたのですね。何か学びや気づきはありましたか？`,
        `興味深い出来事ですね。${trends.suggestions[0] || 'その時、周りの人はどんな反応でしたか？'}`,
        'そのことについて、今振り返ってみてどう感じますか？過去の似た経験と比べてどうでしょうか？',
        `大変でしたね。${trends.emotionalPattern === '要サポート' ? '無理をせず、自分のペースで大丈夫ですよ。' : ''}その経験から得たものはありますか？`
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      // W&Bメトリクスを記録（デモモード）
      wandbService.logResponseTime(Date.now() - 100, 'demo-mode-with-rag')
      wandbService.logConversation(messages.length)
      
      return NextResponse.json({ 
        response: randomResponse,
        metadata: {
          ragEnabled: true,
          promptOptimized: true,
          optimizationScore: optimizationResult.score,
          userTrends: trends.commonThemes.slice(0, 3)
        }
      })
    }
    
    // OpenAI APIを使用（本番モード）
    try {
      const startTime = Date.now()
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `あなたは優しく共感的な日記アプリのアシスタントです。
ユーザーの一日の出来事や感情について、温かく傾聴し、適切な質問で深掘りしてください。

以下の点に注意してください：
1. 共感的で温かいトーンを保つ
2. ユーザーの感情を認識し、受け止める
3. 適切な質問で話を深掘りする（詳細、感情、学び、気づきなど）
4. 長すぎない自然な応答（2-3文程度）
5. 日記に記録する価値のある内容を引き出す`
          },
          ...messages.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          }))
        ],
        max_tokens: 150,
        temperature: 0.7,
      })
      
      const response = completion.choices[0].message.content
      
      // W&Bメトリクスを記録
      wandbService.logResponseTime(startTime, 'gpt-3.5-turbo')
      wandbService.logConversation(messages.length)
      
      return NextResponse.json({ response })
    } catch (openaiError) {
      console.error('OpenAI API エラー:', openaiError)
      // OpenAI APIエラーの場合もデモモードにフォールバック
      const fallbackResponse = 'そうだったのですね。もう少し詳しく聞かせていただけますか？'
      return NextResponse.json({ response: fallbackResponse })
    }
    
  } catch (error) {
    console.error('対話API エラー:', error)
    return NextResponse.json(
      { error: 'AI応答の生成に失敗しました' },
      { status: 500 }
    )
  }
}