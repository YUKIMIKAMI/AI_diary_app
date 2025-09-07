import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    // デモモード用の固定レスポンス
    const userMessages = messages
      ?.filter((msg: any) => msg.role === 'user')
      ?.map((msg: any) => msg.content)
      ?.join(' ') || ''
    
    const content = userMessages || '今日は穏やかな一日でした。'
    
    // 簡単な気分判定
    let mood = 'calm'
    if (userMessages.includes('嬉しい') || userMessages.includes('楽しい')) mood = 'happy'
    else if (userMessages.includes('悲しい') || userMessages.includes('つらい')) mood = 'sad'
    else if (userMessages.includes('怒') || userMessages.includes('イライラ')) mood = 'angry'
    else if (userMessages.includes('不安') || userMessages.includes('心配')) mood = 'anxious'
    
    return NextResponse.json({
      content,
      diary: content,
      summary: '対話から日記を生成しました',
      mood,
      tags: ['日常', '振り返り', '対話']
    })
  } catch (error) {
    console.error('日記生成エラー:', error)
    return NextResponse.json(
      { error: '日記の生成に失敗しました' },
      { status: 500 }
    )
  }
}