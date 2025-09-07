import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/services/ai-service'
import { wandbService } from '@/lib/wandb-service'
import { z } from 'zod'

// リクエストボディのバリデーション
const requestSchema = z.object({
  content: z.string().min(1, '日記の内容は必須です')
})

export async function POST(request: NextRequest) {
  console.log('感情分析API - 開始')
  
  try {
    const body = await request.json()
    
    // バリデーション
    const validatedData = requestSchema.parse(body)
    console.log('リクエストデータ:', { contentLength: validatedData.content.length })
    
    // AI による感情分析
    const startTime = Date.now()
    const emotions = await aiService.analyzeEmotions(validatedData.content)
    console.log('感情分析結果:', { 
      overallScore: emotions.overallScore,
      dominantEmotions: emotions.dominantEmotions 
    })
    
    // W&Bに感情分析結果を記録
    wandbService.logEmotionAnalysis(
      emotions.overallScore,
      emotions.dominantEmotions,
      0.85 // デモモードなのでconfidenceは固定値
    )
    wandbService.logResponseTime(startTime, 'emotion-analysis')
    
    // キーワード抽出も同時に実行
    const keywords = await aiService.extractKeywords(validatedData.content)
    console.log('抽出されたキーワード:', keywords)
    
    return NextResponse.json({
      success: true,
      emotions: emotions,
      keywords: keywords
    })
  } catch (error) {
    console.error('感情分析エラー:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'バリデーションエラー',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: '感情分析に失敗しました' 
      },
      { status: 500 }
    )
  }
}