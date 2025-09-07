// デモモードまたはVercel環境ではPrismaを使用しない
let prisma: any = null

if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true' && !process.env.VERCEL) {
  try {
    const { PrismaClient } = require('@prisma/client')
    
    const globalForPrisma = global as unknown as { prisma: any }
    
    prisma = globalForPrisma.prisma || new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma
    }
  } catch (e) {
    console.warn('Prisma Client is not available in this environment')
    prisma = null
  }
}

export { prisma }
export default prisma