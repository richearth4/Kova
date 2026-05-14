const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findJohn() {
  const users = await prisma.user.findMany({
    where: { firstName: { contains: 'John', mode: 'insensitive' } },
    include: { savings: true, contributions: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

findJohn();
