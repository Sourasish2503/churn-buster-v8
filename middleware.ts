import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('whop_access_token')
  const { pathname } = request.nextUrl
  
  // 1. PUBLIC ROUTES (Allow these to pass without a token)
  const isPublic = 
      pathname === '/' ||                       // Home Page
      pathname.startsWith('/api/log') ||        // Logging
      pathname.startsWith('/api/auth') ||       // Login
      pathname.startsWith('/api/oauth') ||      // OAuth Callback
      pathname.startsWith('/api/webhook') ||    // Webhooks
      pathname.startsWith('/_next') ||          // Next.js internals
      pathname.includes('.')                    // Static files

  if (isPublic) {
      return NextResponse.next()
  }

  // 2. PROTECTED ROUTES (Everything else needs a token)
  if (!token) {
    // A: If it's an API call (like fetching data), return JSON error
    if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized: No session found' },
          { status: 401 }
        )
    }
    
    // B: If it's a USER trying to visit a page (like /admin), REDIRECT to login
    // This is the specific fix for your issue:
    const loginUrl = new URL('/api/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}