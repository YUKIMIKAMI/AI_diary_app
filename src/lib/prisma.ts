import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// デモモードまたはVercel環境ではPrismaを使用しない
const createPrismaClient = () => {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.VERCEL) {
    return null
  }
  
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } catch (e) {
    console.warn('Prisma Client could not be initialized:', e)
    return null
  }
}

export const prisma = process.env.NODE_ENV === 'production'
  ? createPrismaClient()
  : (global.prisma || createPrismaClient())

if (process.env.NODE_ENV !== 'production' && prisma) {
  global.prisma = prisma as PrismaClient
}

export default prisma