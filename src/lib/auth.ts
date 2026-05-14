import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  const allUsersWithEmail = await prisma.user.findMany({
    where: { email: dbUser?.email || '' }
  })

  console.log(`[AUTH] DEBUG: ID=${user.id}, Email=${dbUser?.email}, Active=${dbUser?.active}, TotalFound=${allUsersWithEmail.length}`)

  if (!dbUser) {
    console.error(`[AUTH] User record not found for ID: ${user.id}`)
    redirect('/login?error=User record not found in database')
  }

  if (!dbUser.active) {
    console.error(`[AUTH] Account suspended for ID: ${user.id}, Email: ${dbUser.email}, Name: ${dbUser.firstName}`)
    redirect('/login?error=Account suspended. Contact administration.')
  }

  return { supabaseUser: user, dbUser }
}

export async function requireRole(allowedRoles: string[]) {
  const { dbUser } = await requireAuth()

  if (!allowedRoles.includes(dbUser.role)) {
    redirect('/unauthorized')
  }

  return dbUser
}
