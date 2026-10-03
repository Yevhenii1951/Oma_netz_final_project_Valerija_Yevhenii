import { clientIp, rateLimit } from '@/lib/rate-limit'
import { sendVerificationMail } from '@/lib/auth-token-service'
import { prisma } from '@/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'

const RESENDS_PER_HOUR = 3

/**
 * POST /api/auth/resend-verification
 *
 * Resends the verification mail for an address that is registered but not yet
 * verified. The response is the same whether or not the address exists, so the
 * endpoint cannot be used to find out who has an account.
 */
export async function POST(req: NextRequest) {
	try {
		const limit = rateLimit(
			`resend-verification:${clientIp(req.headers)}`,
			RESENDS_PER_HOUR,
			60 * 60 * 1000,
		)
		if (!limit.ok) {
			return NextResponse.json(
				{
					error: `Zu viele Versuche. Bitte in ${limit.retryAfterSeconds} Sekunden erneut versuchen.`,
				},
				{ status: 429 },
			)
		}

		const body = (await req.json().catch(() => ({}))) as { email?: unknown }
		const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
		const answer = {
			message:
				'Falls diese Adresse registriert ist, wurde eine neue Bestätigungsmail versendet.',
		}

		if (!email || !email.includes('@')) {
			return NextResponse.json(answer)
		}

		const user = await prisma.user.findFirst({
			where: { email, emailVerified: null, deletedAt: null },
			select: { id: true, email: true, name: true },
		})

		// Sending must never decide the HTTP status: a failure here has to stay
		// invisible, otherwise the endpoint turns into an account oracle.
		if (user) {
			await sendVerificationMail(user).catch((err: unknown) => {
				console.error('[Auth/ResendVerification]', err)
			})
		}

		return NextResponse.json(answer)
	} catch (err) {
		console.error('[Auth/ResendVerification]', err)
		return NextResponse.json({ error: 'Anfrage konnte nicht verarbeitet werden.' }, { status: 500 })
	}
}