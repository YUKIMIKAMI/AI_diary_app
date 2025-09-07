import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('Testing database connection...')
  
  try {
    // データベース接続テスト
    const users = await prisma.user.findMany({
      take: 1
    })
    
    console.log('Database connection successful')
    console.log('Users found:', users.length)
    
    // テストユーザーを作成してみる
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        id: 'test-user-001',
        email: 'test@example.com',
        username: 'テストユーザー',
        passwordHash: 'dummy-hash',
        emailVerified: true,
      },
    })
    
    console.log('Test user:', testUser)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      testUser: testUser
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}