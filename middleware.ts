import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('whop_access_token')
  const { pathname } = request.nextUrl
  
  // 1. PUBLIC ROUTES (Allow these to pass without a token)
  const isPublic = 
      pathname === '/' ||                       // Home Page (Handles its own redirects)
      pathname.startsWith('/api/log') ||        // Logging (Must be public)
      pathname.startsWith('/api/auth') ||       // Login Route (CRITICAL)
      pathname.startsWith('/api/oauth') ||      // OAuth Callback (CRITICAL)
      pathname.startsWith('/api/webhook') ||    // Webhooks from Whop
      pathname.startsWith('/_next') ||          // Next.js internals
      pathname.includes('.')                    // Static files (images, css, etc.)

  // If it's a public route, let it pass immediately
  if (isPublic) {
      return NextResponse.next()
  }

  // 2. PROTECTED ROUTES (Everything else needs a token)
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized: No session found' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}