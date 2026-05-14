'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'

export async function updateProfile(formData: FormData) {
  try {
    const { dbUser } = await requireAuth()
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const phoneNumber = formData.get('phoneNumber') as string

    if (!firstName || !lastName) {
      return { success: false, error: 'Name is required' }
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        firstName,
        lastName,
        phoneNumber
      }
    })

    revalidatePath('/profile')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updatePassword(formData: FormData) {
  try {
    await requireAuth()
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' }
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
