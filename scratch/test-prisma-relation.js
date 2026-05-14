const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const data = await prisma.paymentProof.findMany({
      take: 1,
      include: {
        user: true,
        contribution: true
      }
    })
    console.log('Success! Data fetched:', JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Validation Error in script:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
