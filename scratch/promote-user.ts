import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const email = 'richie.udoh@gmail.com'
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (user) {
    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.role})`)
    if (user.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      })
      console.log(`Promoted ${email} to ADMIN`)
    }
  } else {
    console.log(`User ${email} not found in database.`)
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
