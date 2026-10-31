import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

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
¶»§q«^