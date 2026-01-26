import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // --- PART 1: YOUR EXISTING REDIRECTS ---
  // If the user hits these specific paths, we move them and EXIT immediately.
  
  if (pathname === '/project/studio' || pathname.startsWith('/project/studio/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/studio'
    return NextResponse.redirect(url)
  }

  if (pathname === '/project/admin' || pathname.startsWith('/project/admin/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin' // Assuming you have an admin route, or did you mean studio?
    return NextResponse.redirect(url)
  }

  // --- PART 2: NEW SECURITY SHIELD (Runs on every other page) ---
  
  // A Strict Content Security Policy (CSP)
  // This tells the browser: "Only load images/scripts from ME and Sanity. Block everything else."
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://cdn.sanity.io;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sanity.io;
  `
  
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()
 
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })

  // Apply the headers
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)
  response.headers.set('X-Frame-Options', 'DENY') // Stops people from putting your site in an iframe
  response.headers.set('X-Content-Type-Options', 'nosniff') // Stops browser from guessing file types

  return response
}

export const config = {
  // CRITICAL CHANGE: We must expand the matcher to cover the WHOLE website
  // otherwise the security headers won't protect your homepage.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - studio (Let Sanity handle its own security)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|studio).*)',
  ],
}