/**
 * Issuing, hashing and checking one-shot auth tokens.
 *
 * The plaintext token leaves this module exactly once, in the mail. Only its
 * SHA-256 hash is stored, so the tokens table is useless to an attacker who
 * reads it, and the comparison is a plain hash compare — no secret-dependent
 * timing to worry about, since SHA-256 of a 256-bit random token is not
 * guessable token by token.
 *
 * Kept free of Prisma and of `server-only` so the rules can be unit tested
 * without a database.
 */

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export type AuthTokenPurpose = 'VERIFY_EMAIL' | 'RESET_PASSWORD'

export const TOKEN_TTL_MS: Record<AuthTokenPurpose, number> = {
	VERIFY_EMAIL: 24 * 60 * 60 * 1000,
	RESET_PASSWORD: 60 * 60 * 1000,
}

const TOKEN_BYTES = 32

/** 43-char base64url string. Never stored, only mailed. */
export function generateToken(): string {
	return randomBytes(TOKEN_BYTES).toString('base64url')
}

export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex')
}

/** Constant-time compare of two hex digests, tolerant of length differences. */
function digestsMatch(a: string, b: string): boolean {
	const left = Buffer.from(a, 'hex')
	const right = Buffer.from(b, 'hex')
	if (left.length !== right.length) return false
	return timingSafeEqual(left, right)
}

export type StoredToken = {
	tokenHash: string
	expiresAt: Date
}

export type TokenCheck =
	| { ok: true }
	| { ok: false; reason: 'unknown' | 'expired' }

/**
 * Decides whether a token may still be used. The caller has already loaded the
 * row by hash; a spent token has been deleted, so it arrives here as `unknown`
 * rather than as a distinguishable state — which is also what we want to show a
 * visitor replaying a link.
 */
export function checkToken(stored: StoredToken | null, now = new Date()): TokenCheck {
	if (!stored) return { ok: false, reason: 'unknown' }
	if (stored.expiresAt.getTime() <= now.getTime()) {
		return { ok: false, reason: 'expired' }
	}
	return { ok: true }
}

/** Compares a token from a URL against the stored hash. */
export function tokenMatches(token: string, stored: StoredToken | null): boolean {
	if (!stored) return false
	return digestsMatch(hashToken(token), stored.tokenHash)
}

export function expiresAt(purpose: AuthTokenPurpose, now = new Date()): Date {
	return new Date(now.getTime() + TOKEN_TTL_MS[purpose])
}

/** URL-safe form, so the token survives a query string untouched. */
export function isWellFormedToken(token: unknown): token is string {
	return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token)
}
