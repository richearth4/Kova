import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
    {
      cookies: {
        getAll() { return [] },
        setAll() { },
      },
    }
  )
}

export async function getSignedUrl(filePath: string | null) {
  if (!filePath) return null
  if (filePath.startsWith('http')) return filePath // legacy support for public URLs

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(filePath, 600) // 10 minutes (600 seconds) TTL

    if (error) {
      console.error('[STORAGE] Error generating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (err) {
    console.error('[STORAGE] Failed to get signed URL:', err)
    return null
  }
}
