import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    // デモモード用の固定質問
    const demoQuestions = [
      {
        id: 'q1',
        question: 'その時、どんな感情を感じましたか？',
        type: 'emotion'
      },
      {
        id: 'q2',
        question: 'その経験から何を学びましたか？',
        type: 'learning'
      },
      {
        id: 'q3',
        question: '今後、同じような状況になったらどうしますか？',
        type: 'future'
      }
    ]
    
    return NextResponse.json({
      success: true,
      questions: demoQuestions
    })
  } catch (error) {
    console.error('質問生成エラー:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '質問生成に失敗しました' 
      },
      { status: 500 }
    )
  }
}