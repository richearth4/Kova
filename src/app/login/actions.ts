'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data, error } = await supabase.auth.signInWithPassword(credentials)

  if (error || !data.user) {
    redirect('/login?error=Could not authenticate user')
  }

  // Self-healing: Check if Prisma record exists
  const { prisma } = await import('@/lib/prisma')
  const dbUser = await prisma.user.findUnique({
    where: { id: data.user.id }
  })

  if (!dbUser) {
    console.log(`[AUTH] Healing missing Prisma record for user: ${data.user.email}`)
    await prisma.user.create({
      data: {
        id: data.user.id,
        email: data.user.email!,
        firstName: data.user.user_metadata?.firstName || 'User',
        lastName: data.user.user_metadata?.lastName || '',
        role: 'MEMBER'
      }
    })
  }

  revalidatePath('/', 'layout')
  redirect('/member')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=Could not authenticate with Google')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
