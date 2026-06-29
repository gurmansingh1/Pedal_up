import { NextResponse, type NextRequest } from 'next/server'

// Simple middleware - route protection will be handled client-side
// since we're using localStorage for mock auth
export async function middleware(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
