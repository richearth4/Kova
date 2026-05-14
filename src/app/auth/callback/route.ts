import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/member'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const user = data.user
      
      // Sync with Prisma DB if user doesn't exist
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        })

        const email = user.email || ''

        if (!dbUser) {
          // Extract info from user metadata
          const fullName = user.user_metadata?.full_name || ''
          
          // Split name if possible
          const names = fullName.split(' ')
          const firstName = names[0] || 'User'
          const lastName = names.slice(1).join(' ') || ''

          await prisma.user.create({
            data: {
              id: user.id,
              email: email,
              firstName: firstName,
              lastName: lastName,
              role: email === 'richie.udoh@gmail.com' ? 'ADMIN' : 'MEMBER',
              active: true
            }
          })
          console.log(`[AUTH] Created new Prisma record for OAuth user: ${email}`)
        } else if (email === 'richie.udoh@gmail.com' && dbUser.role !== 'ADMIN') {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
          })
          console.log(`[AUTH] Promoted existing user ${email} to ADMIN`)
        }
      } catch (prismaError) {
        console.error('[AUTH] Failed to sync OAuth user with Prisma:', prismaError)
        // We continue anyway, but requireAuth will catch the missing dbUser later
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Auth callback error:', error)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not verify the authentication code`)
}
