import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/services/billing';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { dbUser } = await requireAuth();
    const { orgName, slug, orgId } = await req.json();

    let targetOrgId = orgId || dbUser.tenantId;

    // If onboarding (we have orgName and slug), create a pending Organization
    if (orgName && slug && !orgId) {
      // Check if slug is taken
      const existing = await prisma.organization.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: 'Workspace URL slug is already taken' }, { status: 400 });
      }

      const org = await prisma.organization.create({
        data: { name: orgName, slug }
      });
      targetOrgId = org.id;

      // Ensure the admin user is attached to this tenant
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { tenantId: org.id }
      });

      // Sync with Supabase Auth to update the session JWT immediately
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      await supabase.auth.updateUser({
        data: { tenantId: org.id }
      });
    }

    if (!targetOrgId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Format: paystack_sub_{userId}_{orgId}_{timestamp}
    const reference = `paystack_sub_${dbUser.id}_${targetOrgId}_${Date.now()}`;

    // 100,000 NGN platform fee
    const paystackResponse = await BillingService.createPaystackTransaction(
      dbUser.email,
      100000,
      reference
    );

    if (paystackResponse.status && paystackResponse.data) {
      return NextResponse.json({ url: paystackResponse.data.authorization_url });
    } else {
      return NextResponse.json({ error: 'Failed to initialize Paystack checkout' }, { status: 400 });
    }
  } catch (err: unknown) {
    if ((err instanceof Error ? err.message : String(err)) === 'NEXT_REDIRECT') throw err;
    console.error('Paystack init error:', err);
    return NextResponse.json({ error: (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
