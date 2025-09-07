import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    // デモモード用の固定感情分析結果
    const emotions = {
      overallScore: 0.65,
      dominantEmotions: ['穏やか', '前向き', '好奇心'],
      emotionScores: {
        joy: 0.3,
        sadness: 0.1,
        anger: 0.05,
        fear: 0.1,
        surprise: 0.2,
        love: 0.25
      },
      suggestions: [
        '今日の良かったことを3つ書き出してみましょう',
        '深呼吸をして、心を落ち着けてみてください',
        '明日の小さな目標を1つ決めてみませんか？'
      ]
    }
    
    const keywords = ['日常', '振り返り', '成長', '気づき']
    
    return NextResponse.json({
      success: true,
      emotions: emotions,
      keywords: keywords
    })
  } catch (error) {
    console.error('感情分析エラー:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '感情分析に失敗しました' 
      },
      { status: 500 }
    )
  }
}