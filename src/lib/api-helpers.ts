/**
 * Centralised API helpers — OMA-NETZ Kassel
 *
 * Usage in route handlers:
 *   const session = await requireAuth()   → throws/returns early on 401
 *   return jsonError('Not found', 404)
 *   return jsonSuccess(data)
 */

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Verify that the incoming request has a valid session.
 * Returns the session object if authenticated.
 * Returns a 401 NextResponse if not — callers should `return` the result.
 *
 * @example
 * const sessionOrResponse = await requireAuth()
 * if (sessionOrResponse instanceof NextResponse) return sessionOrResponse
 * const session = sessionOrResponse
 */
export async function requireAuth() {
	const session = await auth()
	if (!session?.user) {
		return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
	}
	return session
}

/**
 * Require the current user to have ADMIN role.
 * Returns a 403 NextResponse if the user is not an admin.
 */
export async function requireAdmin() {
	const session = await auth()
	if (!session?.user) {
		return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
	}
	if (session.user.role !== 'ADMIN') {
		return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
	}
	return session
}

// ─── Response helpers ─────────────────────────────────────────────────────────

/** Return a JSON error response */
export function jsonError(message: string, status: number = 500) {
	return NextResponse.json({ error: message }, { status })
}

/** Return a JSON success response */
export function jsonSuccess<T>(data: T, status: number = 200) {
	return NextResponse.json(data, { status })
}

// ─── Error logging ────────────────────────────────────────────────────────────

/**
 * Centralised error logger for API route catch blocks.
 * Logs the context label and the error, then returns a 500 response.
 *
 * @example
 * } catch (err) { return logAndError('[REQUESTS GET]', err) }
 */
export function logAndError(label: string, err: unknown) {
	console.error(label, err)
	return jsonError('Interner Serverfehler', 500)
}
