import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import BillingClient from './BillingClient'

export default async function AdminBillingDashboard() {
  const dbUser = await requireRole(['ADMIN'])

  // Query actual active member counts within this tenant
  const totalActiveMembers = await prisma.user.count({
    where: {
      tenantId: dbUser.tenantId,
      role: 'MEMBER',
      active: true
    }
  })

  // Query actual paid member counts (active subscription status)
  const paidMembers = await prisma.user.count({
    where: {
      tenantId: dbUser.tenantId,
      role: 'MEMBER',
      active: true,
      subscription: {
        status: 'ACTIVE'
      }
    }
  })

  const pastDueMembers = Math.max(0, totalActiveMembers - paidMembers)

  // Fetch tenant subscription cycle info if available
  const sub = await prisma.subscription.findUnique({
    where: { organizationId: dbUser.tenantId }
  })

  const cycleEnd = sub?.currentPeriodEnd 
    ? new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Oct 1st, 2026'

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Organization Billing & Subscriptions</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your Cooperative&apos;s platform subscription and view billing history.
        </p>
      </div>

      <BillingClient 
        stats={{ totalActiveMembers, paidMembers, pastDueMembers }} 
        cycleEnd={cycleEnd} 
      />
    </div>
  )
}
