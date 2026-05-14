import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, id: true }
  })
  console.log('--- USER REGISTRY ---')
  users.forEach(u => console.log(`${u.email} [${u.role}] (${u.id})`))
  console.log('---------------------')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
