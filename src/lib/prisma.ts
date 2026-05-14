import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Configure the pool with robust settings for Supabase
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Limit connections for serverless stability
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter,
    log: ['query', 'error', 'warn'] 
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
