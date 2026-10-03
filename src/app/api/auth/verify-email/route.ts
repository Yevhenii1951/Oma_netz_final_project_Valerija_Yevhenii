import { checkToken, isWellFormedToken } from '@/lib/auth-token'
import { appUrl, findByToken, spendToken } from '@/lib/auth-token-service'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * GET /api/auth/verify-email?token=…
 *
 * Consumes the token and marks the address verified. Visiting the link twice
 * is therefore not an error the user can act on: the row is gone, so the second
 * visit reports an unknown token, same as a forged one.
 *
 * Redirects to a page rather than rendering, so a mail client that pre-fetches
 * links cannot spend the token.
 */
export async function GET(req: NextRequest) {
	const token = req.nextUrl.searchParams.get('token')

	if (!isWellFormedToken(token)) {
		return NextResponse.redirect(appUrl('/email-bestaetigt?status=invalid'))
	}

	try {
		const stored = await findByToken(token)

		if (!stored || !checkToken(stored).ok) {
			return NextResponse.redirect(appUrl('/email-bestaetigt?status=invalid'))
		}

		// A soft-deleted account keeps its row, so a verification link mailed
		// before the deactivation could still arrive afterwards. Refusing here
		// keeps that link from quietly resurrecting a closed account.
		if (stored.user.deletedAt) {
			return NextResponse.redirect(appUrl('/email-bestaetigt?status=deleted'))
		}

		const spent = await spendToken(stored, (tx) =>
			tx.user.update({
				where: { id: stored.userId },
				data: { emailVerified: new Date() },
			}),
		)

		return NextResponse.redirect(
			appUrl(`/email-bestaetigt?status=${spent ? 'ok' : 'invalid'}`),
		)
	} catch (err) {
		console.error('[Auth/VerifyEmail]', err)
		return NextResponse.redirect(appUrl('/email-bestaetigt?status=error'))
	}
}
