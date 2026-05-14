import { prisma } from '../src/lib/prisma';

async function test() {
  try {
    console.log('Testing Prisma Loan model fields...');
    // We don't actually need to run it, just check if it compiles or what keys it expects
    // But since this is a JS/TS environment, we can just try a dry run of a create with a non-existent ID
    const loan = await (prisma.loan as any).create({
      data: {
        userId: 'non-existent',
        principal: 1000,
        interestAmount: 50,
        totalRepayment: 1050,
        durationMonths: 6,
        loanType: 'PERSONAL',
        status: 'PENDING'
      }
    });
    console.log('Loan created:', loan);
  } catch (err: any) {
    console.log('Error caught:', err.message);
    if (err.message.includes('Unknown argument `loanType`')) {
      console.log('FAIL: loanType is still unknown');
    } else if (err.message.includes('Foreign key constraint failed')) {
      console.log('SUCCESS: loanType was recognized (but foreign key failed as expected)');
    } else {
      console.log('Unexpected error:', err.message);
    }
  }
}

test();
