/**
 * Fixed-window rate limiter for API routes.
 *
 * Why this exists: registration is open to anyone, so authentication alone
 * does not bound the number of LLM calls or bcrypt comparisons. This module
 * is the second gate.
 *
 * Storage is per-process memory. That is enough for a single-instance
 * deployment (the current target). Behind more than one instance the limit
 * becomes per-instance, so the effective ceiling is `limit * instances` —
 * see README "Skalierung" before scaling out.
 */

interface Bucket {
	count: number
	resetAt: number
}

export interface RateLimitResult {
	ok: boolean
	/** Seconds until the window resets. Only meaningful when `ok` is false. */
	retryAfterSeconds: number
}

const buckets = new Map<string, Bucket>()

/** Buckets are swept on access so the map cannot grow without bound. */
function sweep(now: number) {
	if (buckets.size < 1000) return
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key)
	}
}

/**
 * Count one call against `key` and report whether it is allowed.
 *
 * @param key       identifies the caller, e.g. `ai:user_123` or `login:1.2.3.4`
 * @param limit     calls allowed per window
 * @param windowMs  window length in milliseconds
 */
export function rateLimit(
	key: string,
	limit: number,
	windowMs: number,
): RateLimitResult {
	const now = Date.now()
	sweep(now)

	const bucket = buckets.get(key)
	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + windowMs })
		return { ok: true, retryAfterSeconds: 0 }
	}

	if (bucket.count >= limit) {
		return {
			ok: false,
			retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
		}
	}

	bucket.count += 1
	return { ok: true, retryAfterSeconds: 0 }
}

/**
 * Best-effort caller IP. `x-forwarded-for` is set by the platform (Vercel,
 * nginx) and its first entry is the original client.
 */
export function clientIp(headers: Headers): string {
	const forwarded = headers.get('x-forwarded-for')
	if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
	return headers.get('x-real-ip') ?? 'unknown'
}
