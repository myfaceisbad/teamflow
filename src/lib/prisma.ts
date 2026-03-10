import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  console.log('[prisma] Connecting to:', dbUrl)
  const adapter = new PrismaBetterSqlite3({ url: dbUrl })
  return new PrismaClient({ adapter } as any)
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

globalForPrisma.prisma = prisma
