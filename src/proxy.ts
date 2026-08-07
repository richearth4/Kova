import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  // Allow public routes
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/onboarding') || pathname.startsWith('/api/webhooks') || pathname.includes('/webhook') || pathname.startsWith('/mock-checkout')) {
    return response
  }

  // Require auth for everything else
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Extract tenantId from user metadata (assuming it was injected during onboarding/login)
  const tenantId = session.user.user_metadata?.tenantId

  // If user has no tenantId and is not a super-admin, force them to onboarding
  if (!tenantId && !pathname.startsWith('/super-admin') && !pathname.startsWith('/onboarding') && !pathname.startsWith('/api/billing') && !pathname.startsWith('/mock-checkout')) {
     return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // Tenant isolation could be enforced by passing tenantId in headers to downstream server components
  response.headers.set('x-tenant-id', tenantId || '')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
