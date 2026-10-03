import { afterEach, describe, expect, it, vi } from 'vitest'

import { clientIp, rateLimit } from '@/lib/rate-limit'

// Every test uses its own key, except the ones that deliberately share one, so
// the module-level bucket map never leaks state between them.
const unique = () => `key-${Math.random().toString(36).slice(2)}`

describe('rateLimit', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('allows exactly `limit` calls inside the window', () => {
		const key = unique()
		for (let i = 1; i <= 3; i++) {
			expect(rateLimit(key, 3, 60_000)).toEqual({
				ok: true,
				retryAfterSeconds: 0,
			})
		}
		expect(rateLimit(key, 3, 60_000).ok).toBe(false)
	})

	it('counts keys independently', () => {
		const a = unique()
		const b = unique()
		for (let i = 0; i < 3; i++) rateLimit(a, 3, 60_000)
		expect(rateLimit(a, 3, 60_000).ok).toBe(false)
		expect(rateLimit(b, 3, 60_000).ok).toBe(true)
	})

	it('starts a fresh window once the old one has passed', () => {
		vi.useFakeTimers()
		const key = unique()
		expect(rateLimit(key, 1, 60_000).ok).toBe(true)
		expect(rateLimit(key, 1, 60_000).ok).toBe(false)

		vi.advanceTimersByTime(60_001)
		expect(rateLimit(key, 1, 60_000).ok).toBe(true)
	})

	it('reports a retry delay of at least one second', () => {
		vi.useFakeTimers()
		const key = unique()
		rateLimit(key, 1, 60_000)
		vi.advanceTimersByTime(59_900)
		const blocked = rateLimit(key, 1, 60_000)
		expect(blocked.ok).toBe(false)
		expect(blocked.retryAfterSeconds).toBe(1)
	})

	it('reports the remaining window in whole seconds', () => {
		vi.useFakeTimers()
		const key = unique()
		rateLimit(key, 1, 60_000)
		vi.advanceTimersByTime(30_000)
		expect(rateLimit(key, 1, 60_000).retryAfterSeconds).toBe(30)
	})

	it('reports no delay while the call is allowed', () => {
		expect(rateLimit(unique(), 5, 60_000).retryAfterSeconds).toBe(0)
	})
})

describe('clientIp', () => {
	it('takes the first entry of x-forwarded-for', () => {
		const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })
		expect(clientIp(headers)).toBe('203.0.113.7')
	})

	it('trims whitespace around the address', () => {
		const headers = new Headers({ 'x-forwarded-for': '  203.0.113.7  ' })
		expect(clientIp(headers)).toBe('203.0.113.7')
	})

	it('falls back to x-real-ip', () => {
		const headers = new Headers({ 'x-real-ip': '198.51.100.4' })
		expect(clientIp(headers)).toBe('198.51.100.4')
	})

	it('returns "unknown" rather than an empty key when no header is present', () => {
		expect(clientIp(new Headers())).toBe('unknown')
	})

	it('does not return an empty string for a malformed header', () => {
		expect(clientIp(new Headers({ 'x-forwarded-for': '  ,  ' }))).toBe('unknown')
	})
})