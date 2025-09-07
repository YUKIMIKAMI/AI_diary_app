import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // テストユーザー作成
  const hashedPassword = await bcrypt.hash('testpassword123', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'テストユーザー',
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  })

  console.log('✓ Created test user:', testUser.email)

  // サンプル日記エントリー作成
  const sampleEntries = [
    {
      content: '今日は素晴らしい一日でした。朝から天気も良く、散歩を楽しみました。',
      mood: 'happy',
      tags: ['散歩', '晴れ', '気分爽快'],
      entryDate: new Date('2024-01-01'),
    },
    {
      content: '仕事で新しいプロジェクトが始まりました。チームメンバーとの初顔合わせもあり、期待と少しの緊張を感じています。',
      mood: 'excited',
      tags: ['仕事', 'プロジェクト', '新しい挑戦'],
      entryDate: new Date('2024-01-02'),
    },
    {
      content: '久しぶりに友人と会いました。お互いの近況を話し、楽しい時間を過ごしました。',
      mood: 'joyful',
      tags: ['友人', '再会', '楽しい'],
      entryDate: new Date('2024-01-03'),
    },
  ]

  for (const entry of sampleEntries) {
    const diaryEntry = await prisma.diaryEntry.create({
      data: {
        ...entry,
        userId: testUser.id,
      },
    })

    // 感情分析データを追加
    await prisma.emotionAnalysis.create({
      data: {
        diaryEntryId: diaryEntry.id,
        emotionType: 'JOY',
        score: 0.8,
        colorCode: '#FFD700',
      },
    })

    // サンプル質問ノードを追加
    await prisma.mindmapNode.create({
      data: {
        diaryEntryId: diaryEntry.id,
        nodeType: 'QUESTION',
        content: 'この経験から何を学びましたか？',
        positionX: 100,
        positionY: 100,
      },
    })

    console.log(`✓ Created diary entry for ${entry.entryDate.toLocaleDateString()}`)
  }

  // 単語頻度サンプルデータ
  const words = ['今日', '楽しい', '仕事', '友人', '新しい']
  for (const word of words) {
    await prisma.wordFrequency.create({
      data: {
        userId: testUser.id,
        word,
        frequency: Math.floor(Math.random() * 10) + 1,
        periodType: 'MONTHLY',
        periodDate: new Date('2024-01-01'),
      },
    })
  }

  console.log('✓ Created word frequency data')
  console.log('🌱 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })