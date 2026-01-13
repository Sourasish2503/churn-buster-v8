import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('whop_access_token')
  const isHomePage = request.nextUrl.pathname === '/'

  // 1. If user has no token...
  if (!token) {
    // 2. BUT they are visiting the home page (where your Dev Mode logic lives)...
    if (isHomePage) {
      // 3. LET THEM PASS! (Your page.tsx will decide what to do)
      return NextResponse.next()
    }

    // Otherwise, block API routes or other protected pages
    return NextResponse.json(
      { error: 'Unauthorized: No session found' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  // Keep your existing matcher that excludes static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}