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
  
  const { data: storageData, error: storageError } = await supabase.storage
    .from('payment-proofs')
    .upload(fileName, file)

  if (storageError) {
    console.error('Storage error:', storageError)
    return { success: false, error: 'Failed to upload image' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(fileName)

  // 2. Save to Database
  try {
    await prisma.loanRepayment.create({
      data: {
        loanId,
        amount: parseFloat(amount),
        fileUrl: publicUrl,
        status: 'PENDING_VERIFICATION',
      },
    })

    revalidatePath('/member/loans')
    revalidatePath('/member')
    return { success: true }
  } catch (dbError) {
    console.error('Database error:', dbError)
    return { success: false, error: 'Failed to save repayment record' }
  }
}
