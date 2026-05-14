import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const result = await prisma.user.updateMany({
    data: { active: true }
  })
  console.log(`✅ Force activated ${result.count} users.`)
  
  await prisma.user.update({
    where: { email: 'admin@kova.test' },
    data: { firstName: 'TEST-ACTIVE-ADMIN' }
  })
  
  const admin = await prisma.user.findFirst({ where: { email: 'admin@kova.test' } })
  console.log('Admin Status:', admin ? { email: admin.email, active: admin.active, id: admin.id, name: admin.firstName } : 'NOT FOUND')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
