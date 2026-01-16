import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('whop_access_token')
  const { pathname } = request.nextUrl
  
  // 1. Define Public Routes (No login needed)
  const isPublic = 
      pathname === '/' || 
      pathname.startsWith('/api/auth') || 
      pathname.startsWith('/api/oauth') || 
      pathname.startsWith('/api/webhook') ||
      pathname.startsWith('/_next') || 
      pathname.includes('.')

  if (isPublic) {
      return NextResponse.next()
  }

  // 2. Protect Private Routes
  if (!token) {
    // API Requests get a 401 Error (Machine friendly)
    if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized: No session found' },
          { status: 401 }
        )
    }
    
    // Page Requests get a Redirect (Human friendly)
    const loginUrl = new URL('/api/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}