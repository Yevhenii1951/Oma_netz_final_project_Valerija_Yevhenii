import { auth } from '@/auth'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
	'/dashboard',
	'/requests/new',
	'/profile',
	'/chat',
	'/rewards',
	'/admin',
]
// Routes only for unauthenticated users
const authRoutes = ['/login', '/register']

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl
	const session = await auth()
	const isBannedPage = pathname.startsWith('/banned')

	if (session?.user.isBanned && !isBannedPage) {
		return NextResponse.redirect(new URL('/banned', request.url))
	}

	if (isBannedPage && session && !session.user.isBanned) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
	const isAuthRoute = authRoutes.some(r => pathname.startsWith(r))

	if (isProtected && !session) {
		const url = new URL('/login', request.url)
		url.searchParams.set('callbackUrl', pathname)
		return NextResponse.redirect(url)
	}

	if (isAuthRoute && session) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	// Admin-only guard
	if (pathname.startsWith('/admin') && session?.user.role !== 'ADMIN') {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	// Pending/rejected helper guard — block access to restricted pages
	if (
		session?.user.role === 'HELPER' &&
		session?.user.helperStatus !== 'APPROVED'
	) {
		const helperLockedRoutes = ['/requests', '/chat', '/map']
		const isLocked = helperLockedRoutes.some(r => pathname.startsWith(r))
		if (isLocked) {
			return NextResponse.redirect(new URL('/dashboard', request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)'],
}
