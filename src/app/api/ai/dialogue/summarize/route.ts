import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI client initialization with fallback
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key-for-testing'
})

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    if (!messages || messages.length < 2) {
      return NextResponse.json({ error: '対話が不十分です' }, { status: 400 })
    }
    
    // デモモード（APIキーが設定されていない場合）
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      // ユーザーのメッセージを結合してシンプルな日記を作成
      const userMessages = messages
        .filter((msg: any) => msg.role === 'user')
        .map((msg: any) => msg.content)
        .join(' ')
      
      const diary = `今日は${userMessages.substring(0, 200)}という一日でした。`
      
      // 簡単な気分判定
      let mood = 'calm'
      if (userMessages.includes('嬉しい') || userMessages.includes('楽しい')) mood = 'happy'
      else if (userMessages.includes('悲しい') || userMessages.includes('つらい')) mood = 'sad'
      else if (userMessages.includes('怒') || userMessages.includes('イライラ')) mood = 'angry'
      else if (userMessages.includes('不安') || userMessages.includes('心配')) mood = 'anxious'
      
      return NextResponse.json({
        diary,
        summary: '対話から日記を生成しました',
        mood,
        tags: ['日常', '振り返り', '対話']
      })
    }
    
    // OpenAI APIを使用（本番モード）
    try {
      // 対話の内容を整形
      const conversation = messages.map((msg: any) => 
        `${msg.role === 'assistant' ? 'AI' : 'ユーザー'}: ${msg.content}`
      ).join('\n')
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `あなたは日記作成アシスタントです。
対話の内容から、ユーザーの一日の出来事と感情を日記形式にまとめてください。

必ず以下のJSON形式で出力してください（余計な説明は不要）：
{
  "diary": "日記本文（自然な文章で、ユーザーの視点から書く、300-500文字程度）",
  "summary": "対話の要約（1-2文）",
  "mood": "感情タグ（happy, sad, angry, excited, calm, anxious のいずれか1つ）",
  "tags": ["関連タグ1", "関連タグ2", "関連タグ3"]
}

重要な点：
- 日記は「今日は...」で始まる自然な文章にする
- ユーザーの感情や気づきを含める
- 第一人称で書く`
          },
          {
            role: 'user',
            content: `以下の対話から日記を作成してください：\n\n${conversation}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      })
      
      const responseText = completion.choices[0].message.content || '{}'
      
      // JSON部分を抽出
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('JSONの解析に失敗しました')
      }
      
      const data = JSON.parse(jsonMatch[0])
      
      return NextResponse.json(data)
    } catch (openaiError) {
      console.error('OpenAI API エラー:', openaiError)
      // エラー時のフォールバック
      const userContent = messages
        .filter((msg: any) => msg.role === 'user')
        .map((msg: any) => msg.content)
        .join(' ')
      
      return NextResponse.json({
        diary: `今日は${userContent.substring(0, 200)}という一日でした。`,
        summary: '対話から日記を生成しました',
        mood: 'calm',
        tags: ['日常', '振り返り']
      })
    }
    
  } catch (error) {
    console.error('日記生成API エラー:', error)
    return NextResponse.json(
      { error: '日記の生成に失敗しました' },
      { status: 500 }
    )
  }
}