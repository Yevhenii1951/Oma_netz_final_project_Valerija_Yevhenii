import { describe, expect, it } from 'vitest'

import {
	checkToken,
	expiresAt,
	generateToken,
	hashToken,
	isWellFormedToken,
	TOKEN_TTL_MS,
	tokenMatches,
} from '@/lib/auth-token'

describe('generateToken', () => {
	it('produces 43 base64url characters (32 random bytes)', () => {
		expect(generateToken()).toMatch(/^[A-Za-z0-9_-]{43}$/)
	})

	it('does not repeat', () => {
		const tokens = new Set(Array.from({ length: 500 }, generateToken))
		expect(tokens.size).toBe(500)
	})
})

describe('hashToken', () => {
	it('is stable, so the same token hashes to the same stored value', () => {
		const token = generateToken()
		expect(hashToken(token)).toBe(hashToken(token))
	})

	it('does not store the token itself', () => {
		const token = generateToken()
		expect(hashToken(token)).not.toContain(token)
		expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/)
	})

	it('differs per token', () => {
		expect(hashToken(generateToken())).not.toBe(hashToken(generateToken()))
	})
})

describe('isWellFormedToken', () => {
	it('accepts what generateToken produces', () => {
		expect(isWellFormedToken(generateToken())).toBe(true)
	})

	it.each([
		['missing', undefined],
		['null', null],
		['empty', ''],
		['too short', 'abc'],
		['too long', 'a'.repeat(44)],
		['not base64url', 'a'.repeat(42) + '+'],
		['a number', 12345],
	])('rejects %s', (_label, value) => {
		expect(isWellFormedToken(value)).toBe(false)
	})
})

describe('expiresAt', () => {
	it('uses 24 hours for email verification', () => {
		expect(TOKEN_TTL_MS.VERIFY_EMAIL).toBe(86_400_000)
	})

	it('uses 1 hour for a password reset', () => {
		expect(TOKEN_TTL_MS.RESET_PASSWORD).toBe(3_600_000)
	})

	it('is relative to the moment it is issued', () => {
		const now = new Date('2026-01-01T10:00:00Z')
		expect(expiresAt('VERIFY_EMAIL', now).toISOString()).toBe('2026-01-02T10:00:00.000Z')
	})
})

describe('checkToken', () => {
	const now = new Date('2026-01-01T10:00:00Z')

	it('accepts a token that has not expired', () => {
		expect(checkToken({ tokenHash: 'x', expiresAt: new Date('2026-01-02T10:00:00Z') }, now)).toEqual({
			ok: true,
		})
	})

	it('reports unknown when the row is gone (used, invalid, or forged)', () => {
		expect(checkToken(null, now)).toEqual({ ok: false, reason: 'unknown' })
	})

	it('reports expired once the moment has passed', () => {
		expect(checkToken({ tokenHash: 'x', expiresAt: new Date('2026-01-01T09:59:59Z') }, now)).toEqual({
			ok: false,
			reason: 'expired',
		})
	})

	it('treats the exact expiry second as expired, not valid', () => {
		expect(checkToken({ tokenHash: 'x', expiresAt: now }, now).ok).toBe(false)
	})
})

describe('tokenMatches', () => {
	it('matches the token against its stored hash', () => {
		const token = generateToken()
		expect(tokenMatches(token, { tokenHash: hashToken(token), expiresAt: new Date() })).toBe(true)
	})

	it('rejects a different token', () => {
		const stored = { tokenHash: hashToken(generateToken()), expiresAt: new Date() }
		expect(tokenMatches(generateToken(), stored)).toBe(false)
	})

	it('rejects when there is nothing stored, instead of throwing', () => {
		expect(tokenMatches(generateToken(), null)).toBe(false)
	})
})
