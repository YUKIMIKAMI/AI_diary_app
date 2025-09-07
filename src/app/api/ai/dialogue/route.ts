import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    if (!messages || messages.length === 0) {
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
    
    const responseIndex = messages.length % demoResponses.length
    const response = demoResponses[responseIndex]
    
    return NextResponse.json({
      message: response,
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