import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function seedAdmin() {
  const userId = '6fe5b7a6-fb83-47e1-a642-23d1d4d79912'
  const email = 'admin@coopapp.com' // You can update this later

  console.log('Seeding admin user...')

  try {
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        role: 'ADMIN',
      },
      create: {
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
