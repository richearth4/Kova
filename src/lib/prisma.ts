import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient,
  pool: Pool,
  adapter: PrismaPg
}

// 1. Create/Reuse Pool
if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
    max: 10, // Reduced from 20 to stay within Supabase's 15-connection limit
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: {
      rejectUnauthorized: false
    }
  })
}

// 2. Create/Reuse Adapter
if (!globalForPrisma.adapter) {
  globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool)
}

// 3. Create/Reuse Prisma Client
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter: globalForPrisma.adapter,
    log: ['query', 'error', 'warn'] 
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
