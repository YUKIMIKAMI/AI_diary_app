import { NextRequest, NextResponse } from 'next/server'

// GET: 日記一覧取得（デモモード）
export async function GET(request: NextRequest) {
  try {
    // デモモードでは空配列を返す
    return NextResponse.json([])
  } catch (error) {
    console.error('日記取得エラー:', error)
    return NextResponse.json(
      { error: '日記の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新規日記作成（デモモード）  
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // デモモード用のシンプルなレスポンス
    const diary = {
      id: `diary_${Date.now()}`,
      content: body.content || '',
      mood: body.mood || 'calm',
      tags: body.tags || [],
      entryDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    return NextResponse.json({
      success: true,
      id: diary.id,
      ...diary,
      message: '日記を保存しました',
    })
  } catch (error) {
    console.error('日記作成エラー:', error)
    return NextResponse.json(
      { 
        error: '日記の作成に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}