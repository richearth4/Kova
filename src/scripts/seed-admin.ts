import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedAdmin() {
  const email = 'admin@coopapp.com' // You can update this later

  console.log('Seeding admin user...')

  try {
    const org = await prisma.organization.upsert({
      where: { slug: 'system-org' },
      update: {},
      create: { name: 'System Organization', slug: 'system-org' }
    })

    // 1. Get User ID (Create or Fetch)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'Password123!',
      email_confirm: true
    })

    let userId = authUser?.user?.id

    if (!userId) {
      // Fetch existing user
      const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers()
      userId = existingUsers.find(au => au.email === email)?.id
    }

    if (!userId) {
      console.error(`❌ Could not find or create ID for ${email}`)
      return
    }

    // Clean up any stale prisma record with this email but a different ID 
    // (caused by previous seed runs before Supabase Auth sync was added)
    await prisma.user.deleteMany({ where: { email, id: { not: userId } } })

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        role: 'ADMIN',
      },
      create: {
        tenantId: org.id,
        id: userId,
        email: email,
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
        staffId: 'ADMIN-001',
      },
    })

    console.log('Admin user seeded successfully:', user)
  } catch (error) {
    console.error('Error seeding admin user:', error)
  }
}

seedAdmin()
