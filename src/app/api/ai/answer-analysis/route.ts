import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { answer, originalQuestion, diaryContent } = await request.json()
    
    // デモモード用の固定レスポンス
    return NextResponse.json({
      success: true,
      followUpQuestions: [
        { question: 'それについてもう少し詳しく教えてください', category: 'detail' },
        { question: 'その経験から何を学びましたか？', category: 'reflection' }
      ],
      emotions: ['思考的', '前向き', '穏やか'],
      keywords: ['成長', '学び', '挑戦'],
      integrationData: {
        analysisScore: 3.5
      }
    })
  } catch (error) {
    console.error('回答分析エラー:', error)
    return NextResponse.json(
      { error: '回答分析に失敗しました' },
      { status: 500 }
    )
  }
}