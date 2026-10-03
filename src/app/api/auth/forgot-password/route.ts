import { passwordResetMail } from '@/lib/auth-mails'
import { appUrl, issueToken } from '@/lib/auth-token-service'
import { sendMail } from '@/lib/email-sender'
import { prisma } from '@/lib/prisma'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { NextResponse, type NextRequest } from 'next/server'

const REQUESTS_PER_HOUR = 3

/**
 * POST /api/auth/forgot-password  { email }
 *
 * Mails a reset link. The answer is identical whether or not the address is
 * registered, so this cannot be used to enumerate accounts.
 *
 * Rate limited per IP because each accepted call writes a row and sends a mail
 * — an open relay is the whole point of an endpoint like this.
 */
export async function POST(req: NextRequest) {
	try {
		const limit = rateLimit(
			`forgot-password:${clientIp(req.headers)}`,
			REQUESTS_PER_HOUR,
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
				'Falls diese Adresse registriert ist, haben wir dir einen Link zum Zurücksetzen geschickt.',
		}

		if (!email || !email.includes('@')) {
			return NextResponse.json(answer)
		}

		const user = await prisma.user.findFirst({
			where: { email, deletedAt: null },
			select: { id: true, email: true, name: true },
		})

// Narrowed into a local const: TypeScript keeps the narrowing of a const
		// inside the closure but not of a property.
		const recipient = user?.email
		if (!recipient) {
			return NextResponse.json(answer)
		}
		const { id, name } = user

		// A send failure stays invisible here, otherwise the answer would
		// differ for registered and unregistered addresses.
		await (async () => {
			const { token } = await issueToken(id, 'RESET_PASSWORD')
			await sendMail(
				passwordResetMail(
					recipient,
					name,
					appUrl(`/passwort-zurucksetzen?token=${token}`),
				),
			)
		})().catch((err: unknown) => {
			console.error('[Auth/ForgotPassword]', err)
		})

		return NextResponse.json(answer)
	} catch (err) {
		console.error('[Auth/ForgotPassword]', err)
		return NextResponse.json(
			{ error: 'Anfrage konnte nicht verarbeitet werden.' },
			{ status: 500 },
		)
	}
}