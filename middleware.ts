import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { data: user } = await supabase.auth.getUser();

  // If user is logged in and doesn't have an artist profile, redirect to onboarding
  if (
    user && user.user &&
    !request.nextUrl.pathname.startsWith('/artists/onboarding') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const { data: artist, error } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.user.id)
      .single();

    // If no artist profile is found for the user, redirect to onboarding.
    // A null artist and a PGRST116 error from .single() is the expected outcome for a new user.
    if (!artist) {
      return NextResponse.redirect(new URL('/artists/onboarding', request.url))
    }
  }

  // --- Content Security Policy (CSP) ---
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://tdbomtxyevggobphozdu.supabase.co;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://tdbomtxyevggobphozdu.supabase.co wss://tdbomtxyevggobphozdu.supabase.co;
  `
    .replace(/\s{2,}/g, ' ')
    .trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/sign-up|auth/login).*)',
  ],
}