import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;

    try {
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(rawBody, signature as string, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        // Fallback for dev mode without signature
        event = JSON.parse(rawBody);
      }
    } catch (err: unknown) {
      return NextResponse.json({ error: `Webhook Error: ${(err instanceof Error ? err.message : String(err))}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const reference = session.client_reference_id; // stripe_sub_{userId}_{orgId}_{timestamp}
      
      if (reference) {
        const parts = reference.split('_');
        if (parts.length >= 4 && parts[0] === 'stripe' && parts[1] === 'sub') {
          const userId = parts[2];
          const orgId = parts[3];

          // Upsert Subscription
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

          try {
            await prisma.subscription.delete({ where: { userId: userId } });
          } catch (e) { }
          try {
            await prisma.subscription.delete({ where: { organizationId: orgId } });
          } catch (e) { }

          await prisma.subscription.create({
             data: {
                organizationId: orgId,
                userId: userId,
                status: 'ACTIVE',
                currentPeriodEnd: thirtyDaysFromNow,
                gateway: 'STRIPE'
             }
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Stripe webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
