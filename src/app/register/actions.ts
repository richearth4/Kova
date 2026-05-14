'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const staffId = formData.get('staffId') as string
  const phoneNumber = formData.get('phoneNumber') as string

  // 1. Sign up in Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return redirect(`/register?error=${encodeURIComponent(authError.message)}`)
  }

  if (!authData.user) {
    return redirect('/register?error=Could not create user')
  }

  // 2. Create user in Prisma DB
  try {
    await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        firstName,
        lastName,
        staffId,
        phoneNumber,
        role: 'MEMBER', // Default role
      },
    })
  } catch (dbError) {
    console.error('Database error during registration:', dbError)
    // If DB creation fails, we might want to handle cleanup in Supabase, 
    // but for now we'll just report the error.
    return redirect('/register?error=Database synchronization failed')
  }

  revalidatePath('/', 'layout')
  redirect('/member')
}
