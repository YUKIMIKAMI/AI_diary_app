import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, messages, conversationHistory } = body
    
    // 複数のパラメータ名に対応
    const userMessage = message || (messages && messages.length > 0 ? messages[messages.length - 1] : null)
    
    if (!userMessage && !conversationHistory) {
      return NextResponse.json({ error: 'メッセージが必要です' }, { status: 400 })
    }
    
    // デモモード用の固定応答
    const demoResponses = [
      'それは素敵な一日でしたね。その時の気持ちをもう少し詳しく教えていただけますか？',
      'なるほど、興味深い経験をされたのですね。何か学びや気づきはありましたか？',
      'そのことについて、今振り返ってみてどう感じますか？',
      'その経験から、あなたにとって大切なことは何だと思いますか？',
      '今日一日を振り返ってみて、感謝したいことはありますか？',
    ]
    
    // 会話履歴の長さに基づいて応答を選択
    const historyLength = conversationHistory ? conversationHistory.length : 0
    const responseIndex = historyLength % demoResponses.length
    const responseText = demoResponses[responseIndex]
    
    return NextResponse.json({
      message: responseText,
      response: responseText, // 互換性のため両方のフィールドを返す
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('対話エラー:', error)
    return NextResponse.json(
      { error: '対話処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}