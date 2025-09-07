const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  console.log('Testing database connection...')
  console.log('=====================================')
  
  try {
    // 接続テスト
    await prisma.$connect()
    console.log('✓ Database connected successfully!')
    
    // ユーザー数を取得
    const userCount = await prisma.user.count()
    console.log(`✓ Users in database: ${userCount}`)
    
    // 日記エントリー数を取得
    const entryCount = await prisma.diaryEntry.count()
    console.log(`✓ Diary entries in database: ${entryCount}`)
    
    // テーブル一覧を確認
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `
    console.log('\n✓ Database tables created:')
    tables.forEach(table => {
      console.log(`  - ${table.tablename}`)
    })
    
    console.log('\n✅ Database setup completed successfully!')
    console.log('\nYou can now view your database with:')
    console.log('  npx prisma studio')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.log('\nTroubleshooting tips:')
    console.log('1. Make sure Prisma dev server is running: npx prisma dev')
    console.log('2. Check your DATABASE_URL in .env file')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()