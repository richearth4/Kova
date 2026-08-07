import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Paystack webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
