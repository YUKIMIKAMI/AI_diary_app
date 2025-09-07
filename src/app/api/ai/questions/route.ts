import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/services/ai-service'
import { z } from 'zod'

// リクエストボディのバリデーション
const requestSchema = z.object({
  content: z.string().min(1, '日記の内容は必須です')
})

export async function POST(request: NextRequest) {
  console.log('質問生成API - 開始')
  
  try {
    const body = await request.json()
    
    // バリデーション
    const validatedData = requestSchema.parse(body)
    console.log('リクエストデータ:', { contentLength: validatedData.content.length })
    
    // AI による質問生成
    const questions = await aiService.generateQuestions(validatedData.content)
    console.log('生成された質問数:', questions.length)
    
    return NextResponse.json({
      success: true,
      questions: questions
    })
  } catch (error) {
    console.error('質問生成エラー:', error)
    
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
        error: '質問生成に失敗しました' 
      },
      { status: 500 }
    )
  }
}