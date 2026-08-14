import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/services/billing';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { dbUser } = await requireAuth();
    const { orgName, slug, orgId } = await req.json();

    let targetOrgId = orgId || dbUser.tenantId;

    if (orgName && slug && !orgId) {
      const existing = await prisma.organization.findUnique({
        where: { slug },
        include: { users: { select: { id: true } } }
      });

      if (existing) {
        if (existing.users.length > 0) {
          return NextResponse.json({ error: 'Workspace URL slug is already taken' }, { status: 400 });
        }
        targetOrgId = existing.id;
      } else {
        const org = await prisma.organization.create({
          data: { name: orgName, slug }
        });
        targetOrgId = org.id;
      }

      await prisma.user.update({
        where: { id: dbUser.id },
        data: { tenantId: targetOrgId }
      });

      // Sync with Supabase Auth to update the session JWT immediately
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      await supabase.auth.updateUser({
        data: { tenantId: targetOrgId }
      });
    }

    if (!targetOrgId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const reference = `stripe_sub_${dbUser.id}_${targetOrgId}_${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await BillingService.createStripeCheckoutSession(
      dbUser.email,
      100000,
      reference,
      `${baseUrl}/admin/billing?success=true`,
      `${baseUrl}/admin/billing?canceled=true`
    );

    if (session && session.url) {
      return NextResponse.json({ url: session.url });
    } else {
      return NextResponse.json({ error: 'Failed to initialize Stripe checkout' }, { status: 400 });
    }
  } catch (err: unknown) {
    if ((err instanceof Error ? err.message : String(err)) === 'NEXT_REDIRECT') throw err;
    console.error('Stripe init error:', err);
    return NextResponse.json({ error: (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
