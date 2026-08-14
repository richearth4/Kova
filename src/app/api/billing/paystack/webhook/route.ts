import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { recordMemberContribution, recordLoanRepayment } from '@/lib/ledger';
import { createNotification, sendSMSNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (process.env.PAYSTACK_SECRET_KEY) {
      // Verify signature
      const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
                         .update(rawBody)
                         .digest('hex');

      if (hash !== signature && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const reference = event.data.reference; // paystack_sub_{userId}_{orgId}_{timestamp}
      
      const parts = reference.split('_');
      if (parts.length >= 4 && parts[0] === 'paystack' && parts[1] === 'sub') {
        const userId = parts[2];
        const orgId = parts[3];

        // Ensure user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
           return NextResponse.json({ received: true });
        }

        // Upsert Subscription
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Delete any existing subscription for this user to prevent UniqueConstraint error
        // since they are re-subscribing with a new organization during testing
        try {
          await prisma.subscription.delete({ where: { userId: userId } });
        } catch (e) {
          // Ignore if it doesn't exist
        }
        try {
          await prisma.subscription.delete({ where: { organizationId: orgId } });
        } catch (e) {
          // Ignore if it doesn't exist
        }

        await prisma.subscription.create({
           data: {
              organizationId: orgId,
              userId: userId,
              status: 'ACTIVE',
              currentPeriodEnd: thirtyDaysFromNow,
              gateway: 'PAYSTACK'
           }
        });
      }
    } else if (event.event === 'dedicatedaccount.payment.success') {
      const accountNumber = event.data.dedicated_account.account_number;
      // Paystack amount is in kobo, convert to Naira
      const amount = event.data.amount / 100;
      const paystackRef = event.data.reference;

      // 1. Locate member by DVA Account Number
      const user = await prisma.user.findFirst({
        where: { dvaAccountNumber: accountNumber }
      });

      if (user) {
        await prisma.$transaction(async (tx) => {
          // Check for active loan to auto-allocate
          const activeLoan = await tx.loan.findFirst({
            where: { userId: user.id, status: 'ACTIVE' }
          });

          if (activeLoan) {
            // Allocate to loan repayment
            const repayment = await tx.loanRepayment.create({
              data: {
                tenantId: user.tenantId,
                loanId: activeLoan.id,
                amount: amount,
                status: 'CONFIRMED'
              }
            });

            await recordLoanRepayment(
              user.tenantId,
              user.id,
              amount,
              repayment.id,
              `Paystack DVA auto-cleared repayment (Ref: ${paystackRef})`,
              tx
            );

            // Close loan if fully paid
            const allConfirmed = await tx.loanRepayment.aggregate({
              where: { loanId: activeLoan.id, status: 'CONFIRMED' },
              _sum: { amount: true }
            });
            const totalPaid = Number(allConfirmed._sum.amount || 0);
            const totalOwed = Number(activeLoan.totalRepayment);

            if (totalPaid >= totalOwed) {
              await tx.loan.update({
                where: { id: activeLoan.id },
                data: { status: 'CLOSED' }
              });
              await sendSMSNotification(user.id, `Congratulations ${user.firstName}, your loan has been fully repaid via DVA transfer and is now CLOSED.`);
            } else {
              await sendSMSNotification(user.id, `DVA Payment: ₦${amount.toLocaleString()} received and credited to your active loan.`);
            }
          } else {
            // No active loan, credit as monthly savings contribution
            const contribution = await tx.contribution.create({
              data: {
                tenantId: user.tenantId,
                userId: user.id,
                amount: amount,
                month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                status: 'CONFIRMED'
              }
            });

            await recordMemberContribution(
              user.tenantId,
              user.id,
              amount,
              contribution.id,
              `Paystack DVA auto-cleared contribution (Ref: ${paystackRef})`,
              tx
            );

            await sendSMSNotification(user.id, `DVA Contribution: ₦${amount.toLocaleString()} received and credited to your savings pool.`);
          }

          await createNotification(
            user.id,
            'Automated Payment Cleared',
            `Your bank transfer of ₦${amount.toLocaleString()} has been received and verified automatically.`
          );

          await logAudit({
            action: 'DVA_PAYMENT_AUTOCLEAR',
            entityId: user.id,
            entityType: 'TRANSACTION',
            details: { amount, reference: paystackRef, accountNumber }
          });
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Paystack webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
