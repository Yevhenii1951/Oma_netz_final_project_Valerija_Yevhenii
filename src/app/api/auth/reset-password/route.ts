import { checkToken, isWellFormedToken } from '@/lib/auth-token'
import { findByToken, spendToken } from '@/lib/auth-token-service'
import bcrypt from 'bcryptjs'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const resetSchema = z.object({
	token: z.string(),
	// Same rule as registration, so a password that is valid on one path is
	// valid on the other.
	password: z.string().min(8, 'Passwort mindestens 8 Zeichen'),
})

/**
 * POST /api/auth/reset-password  { token, password }
 *
 * Consumes the token and sets a new password.
 *
 * POST rather than GET: the token would otherwise sit in the URL, where it
 * ends up in server logs, browser history and any Referer header on the way to
 * a third party.
 */
export async function POST(req: NextRequest) {
	try {
		const body = resetSchema.parse(await req.json())

		if (!isWellFormedToken(body.token)) {
			return NextResponse.json(
				{ error: 'Dieser Link ist ungültig oder abgelaufen.' },
				{ status: 400 },
			)
		}

		const stored = await findByToken(body.token)

		if (!stored || !checkToken(stored).ok) {
			return NextResponse.json(
				{ error: 'Dieser Link ist ungültig oder abgelaufen.' },
				{ status: 400 },
			)
		}

		// A deactivated account stays deactivated. Proving you own the address
		// is not a reason to undo what an administrator decided.
		if (stored.user.deletedAt) {
			return NextResponse.json(
				{ error: 'Dieses Konto wurde deaktiviert.' },
				{ status: 403 },
			)
		}

		const password = await bcrypt.hash(body.password, 12)

		// Spend the token, change the password and drop the sessions together:
		// whoever had a session before the reset must not keep it, and only the
		// caller that actually deleted the token gets to set the new password.
		const spent = await spendToken(stored, async (tx) => {
			await tx.user.update({
				where: { id: stored.userId },
				data: { password },
			})
			await tx.session.deleteMany({ where: { userId: stored.userId } })
		})

		if (!spent) {
			return NextResponse.json(
				{ error: 'Dieser Link ist ungültig oder abgelaufen.' },
				{ status: 400 },
			)
		}

		return NextResponse.json({
			message: 'Dein Passwort wurde geändert. Du kannst dich jetzt anmelden.',
		})
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
		}
		console.error('[Auth/ResetPassword]', err)
		return NextResponse.json(
			{ error: 'Interner Serverfehler.' },
			{ status: 500 },
		)
	}
}
