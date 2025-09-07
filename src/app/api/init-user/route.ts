import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // テストユーザーを作成または取得
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        username: user.username || 'テストユーザー',
        passwordHash: 'dummy-hash',
        emailVerified: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: dbUser,
      message: 'ユーザーを初期化しました',
    })
  } catch (error) {
    console.error('ユーザー初期化エラー:', error)
    return NextResponse.json(
      { 
        error: 'ユーザーの初期化に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}