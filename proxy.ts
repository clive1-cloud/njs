import NextAuth from 'next-auth'
import authConfig from './auth.config'

// 1. Change 'default' to a named export called 'proxy'
export const proxy = NextAuth(authConfig).auth

// 2. Your config stays exactly the same
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}