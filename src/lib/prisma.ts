// Vercelデプロイ用にPrismaをオプショナルに
let PrismaClient: any;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  // Prismaが利用できない場合（デモモード）
  PrismaClient = null;
}

declare global {
  var prisma: any | undefined
}

// デモモードまたはPrismaが利用できない場合はnullを返す
export const prisma = process.env.VERCEL || process.env.NODE_ENV === 'production' 
  ? null 
  : (global.prisma || (PrismaClient ? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    }) : null));

if (process.env.NODE_ENV !== 'production' && prisma) {
  global.prisma = prisma
}

export default prisma