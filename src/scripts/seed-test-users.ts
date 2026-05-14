import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  const users = [
    { email: 'admin@kova.test', role: 'ADMIN', first: 'Super', last: 'Admin', staff: 'ADM001' },
    { email: 'secretary@kova.test', role: 'SECRETARY', first: 'Operations', last: 'Secretary', staff: 'SEC001' },
    { email: 'member@kova.test', role: 'MEMBER', first: 'John', last: 'Member', staff: 'MEM001' },
  ]

  console.log('🚀 Provisioning Test Accounts...')

  for (const u of users) {
    // 1. Get User ID (Create or Fetch)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: 'Password123!',
      email_confirm: true
    })

    let userId = authUser?.user?.id

    if (!userId) {
      // Fetch existing user
      const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers()
      userId = existingUsers.find(au => au.email === u.email)?.id
    }

    if (!userId) {
      console.error(`❌ Could not find or create ID for ${u.email}`)
      continue
    }

    // 2. Sync to Prisma
    await prisma.user.upsert({
      where: { id: userId },
      update: { role: u.role as any, active: true },
      create: {
        id: userId,
        email: u.email,
        firstName: u.first,
        lastName: u.last,
        role: u.role as any,
        staffId: u.staff,
        active: true
      }
    })
    console.log(`✅ ${u.role} (Synced): ${u.email} [${userId}]`)
  }

  console.log('✨ Seeding complete. All passwords are: Password123!')
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
