import { clientIp, rateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const loginCheckSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
})

/** Each call costs a bcrypt comparison at cost 12 (~250 ms of CPU). */
const ATTEMPTS_PER_MINUTE = 10

export async function POST(req: NextRequest) {
	try {
		// Unauthenticated endpoint doing full bcrypt work on every request:
		// without a limit it is both a brute-force oracle and a cheap way to
		// saturate the server's CPU.
		const limit = rateLimit(
			`login-check:${clientIp(req.headers)}`,
			ATTEMPTS_PER_MINUTE,
			60_000,
		)
		if (!limit.ok) {
			return NextResponse.json(
				{
					error: `Zu viele Versuche. Bitte in ${limit.retryAfterSeconds} Sekunden erneut versuchen.`,
				},
				{ status: 429 },
			)
		}

		const body = await req.json()
		const { email, password } = loginCheckSchema.parse(body)

		const user = await prisma.user.findUnique({
			where: { email },
			select: { password: true, isBanned: true, emailVerified: true },
		})

		if (!user?.password) {
			return NextResponse.json({ ok: true })
		}

		const isValid = await bcrypt.compare(password, user.password)
		if (!isValid) {
			return NextResponse.json({ ok: true })
		}

		if (user.isBanned) {
			return NextResponse.json(
				{
					error:
						'Ihr Konto wurde vom Administrator gesperrt. Bitte kontaktieren Sie den Support.',
				},
				{ status: 403 },
			)
		}

		// Reached only with the correct password, so naming the reason does not
		// turn this endpoint into a way to find out which addresses exist.
		if (!user.emailVerified) {
			return NextResponse.json(
				{
					error: 'Bitte bestätige zuerst deine E-Mail-Adresse.',
					code: 'email_unverified',
				},
				{ status: 403 },
			)
		}

		return NextResponse.json({ ok: true })
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		return NextResponse.json(
			{ error: 'Interner Serverfehler.' },
			{ status: 500 },
		)
	}
}
