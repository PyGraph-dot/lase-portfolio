import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect /project/studio to /studio
  if (pathname === '/project/studio' || pathname.startsWith('/project/studio/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/studio'
    return NextResponse.redirect(url)
  }

  // Redirect /project/admin to /admin
  if (pathname === '/project/admin' || pathname.startsWith('/project/admin/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/project/studio',
    '/project/studio/:path*',
    '/project/admin',
    '/project/admin/:path*',
  ],
}
