'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function uploadLoanRepayment(formData: FormData) {
  const { dbUser } = await requireAuth()
  const supabase = await createClient()

  const loanId = formData.get('loanId') as string
  const amount = formData.get('amount') as string
  const file = formData.get('file') as File

  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' }
  }

  // 1. Upload to Supabase Storage (using the same bucket)
  const fileExt = file.name.split('.').pop()
  const fileName = `repayments/${dbUser.id}/${Date.now()}.${fileExt}`
  
  const { error: storageError } = await supabase.storage
    .from('payment-proofs')
    .upload(fileName, file)

  if (storageError) {
    console.error('Storage error:', storageError)
    return { success: false, error: 'Failed to upload image' }
  }

  // 2. Save to Database
  try {
    await prisma.loanRepayment.create({
      data: {
        tenantId: dbUser.tenantId,
        loanId,
        amount: parseFloat(amount),
        fileUrl: fileName, // Save private relative storage path
        status: 'PENDING_VERIFICATION',
      },
    })

    revalidatePath('/member/loans')
    revalidatePath('/member')
    return { success: true }
  } catch (dbError) {
    console.error('Database error:', dbError)
    // Secure rollback: clean up uploaded storage file on db error
    try {
      await supabase.storage.from('payment-proofs').remove([fileName])
    } catch (cleanupError) {
      console.error('Failed to remove orphaned storage file:', cleanupError)
    }
    return { success: false, error: 'Failed to save repayment record' }
  }
}
