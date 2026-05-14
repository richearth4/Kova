import { prisma } from '../src/lib/prisma';
import fs from 'fs';

async function generateTemplate() {
  try {
    const users = await prisma.user.findMany({
      where: { NOT: { staffId: null } },
      select: { staffId: true, firstName: true, lastName: true },
      take: 10
    });

    let csvContent = 'StaffId,Amount,Name(Optional)\n';
    users.forEach((user: { staffId: string | null; firstName: string; lastName: string }) => {
      csvContent += `${user.staffId},0.00,"${user.firstName} ${user.lastName}"\n`;
    });

    fs.writeFileSync('./public/repayment_template.csv', csvContent);
    console.log('Template generated at ./public/repayment_template.csv');
  } catch (err) {
    console.error('Error generating template:', err);
  }
}

generateTemplate();
