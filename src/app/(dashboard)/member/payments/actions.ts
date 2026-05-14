'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function uploadPaymentProof(formData: FormData) {
  const { dbUser } = await requireAuth()
  const supabase = await createClient()

  const amount = formData.get('amount') as string
  const file = formData.get('file') as File
  const month = formData.get('month') as string // YYYY-MM format
  const savingsTargetId = formData.get('savingsTargetId') as string || null

  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' }
  }

  // 1. Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${dbUser.id}/${Date.now()}.${fileExt}`
  
  const { data: storageData, error: storageError } = await supabase.storage
    .from('payment-proofs')
    .upload(fileName, file)

  if (storageError) {
    console.error('Storage error:', storageError)
    return { success: false, error: 'Failed to upload image' }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(fileName)

  // 2. Save to Database using a Transaction
  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.paymentProof.create({
        data: {
          userId: dbUser.id,
          amount: parseFloat(amount),
          fileUrl: publicUrl,
          status: 'PENDING_VERIFICATION',
        },
      })

      await tx.contribution.create({
        data: {
          userId: dbUser.id,
          amount: parseFloat(amount),
          month: new Date(`${month}-01`),
          status: 'PENDING_VERIFICATION',
          paymentProofId: payment.id,
          savingsTargetId: savingsTargetId === "" ? null : savingsTargetId,
        },
      })
    })

    revalidatePath('/member/payments')
    revalidatePath('/member')
    return { success: true }
  } catch (dbError) {
    console.error('Database error:', dbError)
    return { success: false, error: 'Failed to save payment record' }
  }
}
