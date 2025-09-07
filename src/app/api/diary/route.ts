import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { saveDiary, getDiaries, upsertUser } from '@/lib/json-storage'
import { z } from 'zod'

// バリデーションスキーマ
const createDiarySchema = z.object({
  content: z.string().min(1, '内容を入力してください').max(10000),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
  entryDate: z.string().optional(),
})

// GET: 日記一覧取得
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // JSON保存を使用して日記を取得
    const diaries = await getDiaries(user.id)

    return NextResponse.json(diaries)
  } catch (error) {
    console.error('日記取得エラー:', error)
    return NextResponse.json(
      { error: '日記の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新規日記作成
export async function POST(request: NextRequest) {
  console.log('POST /api/diary - Start')
  
  try {
    const user = await getCurrentUser()
    console.log('Current user:', user)
    
    if (!user) {
      console.log('No user found - returning 401')
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    // バリデーション
    const validatedData = createDiarySchema.parse(body)
    console.log('Validated data:', validatedData)

    // JSON保存を使用してユーザーを作成または取得
    const dbUser = await upsertUser({
      id: user.id,
      email: user.email,
      username: user.username || 'テストユーザー',
    })
    console.log('DB User:', dbUser)

    // 日記エントリー作成（JSON保存）
    const diary = await saveDiary({
      userId: dbUser.id,
      content: validatedData.content,
      mood: validatedData.mood || null,
      tags: validatedData.tags || [],
      entryDate: validatedData.entryDate || new Date().toISOString(),
    })
    console.log('Created diary:', diary)

    // TODO: AI分析と質問生成（TICKET-006で実装）
    // const questions = await generateQuestions(diary.content)
    // const emotions = await analyzeEmotions(diary.content)

    return NextResponse.json({
      success: true,
      diary,
      message: '日記を保存しました',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('日記作成エラー - Full error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      { 
        error: '日記の作成に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}