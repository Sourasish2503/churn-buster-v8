import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('whop_access_token')
  const isHomePage = request.nextUrl.pathname === '/'

  // Allow static assets to pass through (double safety)
  if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('.')) {
      return NextResponse.next();
  }

  // Allow "Dev Mode" (no token) ONLY on the home page
  if (!token) {
    if (isHomePage) {
      return NextResponse.next() 
    }
    return NextResponse.json(
      { error: 'Unauthorized: No session found' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  // This matcher prevents the middleware from even running on static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}