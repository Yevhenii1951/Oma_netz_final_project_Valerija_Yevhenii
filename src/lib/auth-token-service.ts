import { verificationMail } from '@/lib/auth-mails'
import {
	expiresAt,
	generateToken,
	hashToken,
	type AuthTokenPurpose,
} from '@/lib/auth-token'
import { sendMail } from '@/lib/email-sender'
import { prisma as appDb } from '@/lib/prisma'

import type { Prisma, PrismaClient } from '@prisma/client'

/**
 * The client to work on. Defaults to the application's, but the integration
 * tests pass their own guarded client — the service must never be a way to
 * reach the development database from a test run.
 */
export type Db = PrismaClient

/**
 * Where the user clicks. NEXT_PUBLIC_APP_URL is the same value the rest of the
 * app links with, so the mailed link cannot point somewhere else.
 */
export function appUrl(path: string): string {
	const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
	return `${base.replace(/\/$/, '')}${path}`
}

/**
 * Issues a fresh token for one purpose, invalidating any older one.
 *
 * Invalidating first is what makes "resend" safe: a link mailed twice cannot
 * both work, so there is exactly one valid link per user and purpose at any
 * time. The delete is scoped to the purpose on purpose — asking for a
 * verification mail must not silently kill a pending password reset.
 */
export async function issueToken(
	userId: string,
	purpose: AuthTokenPurpose,
	db: Db = appDb,
): Promise<{ token: string; expiresAt: Date }> {
	const token = generateToken()
	const expiry = expiresAt(purpose)

	await db.$transaction([
		db.authToken.deleteMany({ where: { userId, purpose } }),
		db.authToken.create({
			data: { userId, purpose, tokenHash: hashToken(token), expiresAt: expiry },
		}),
	])

	return { token, expiresAt: expiry }
}

/** Loads a token by its plaintext form. The hash is all the database ever sees. */
export async function findByToken(token: string, db: Db = appDb) {
	return db.authToken.findUnique({
		where: { tokenHash: hashToken(token) },
		include: { user: { select: { id: true, name: true, email: true, deletedAt: true } } },
	})
}

/**
 * Spends a token and applies its effect, or reports that someone else got there
 * first. Returns false when the token was already gone or expired, so a replay
 * is indistinguishable from a forged token.
 *
 * The delete runs first and its row count decides the rest. In Postgres a
 * concurrent DELETE of the same row blocks and then reports zero rows, so
 * exactly one caller wins. A batch `$transaction([deleteMany, update])` cannot
 * promise that: both statements always run, and the second caller would set a
 * password even though its delete removed nothing.
 */
export async function spendToken(
	token: { id: string; userId: string; purpose: AuthTokenPurpose },
	apply: (tx: Prisma.TransactionClient) => Promise<unknown>,
	db: Db = appDb,
): Promise<boolean> {
	return db.$transaction(async (tx) => {
		const { count } = await tx.authToken.deleteMany({
			where: {
				id: token.id,
				purpose: token.purpose,
				expiresAt: { gt: new Date() },
			},
		})
		if (count !== 1) return false
		await apply(tx)
		return true
	})
}

export async function sendVerificationMail(
	user: { id: string; email: string | null; name: string | null },
	db: Db = appDb,
): Promise<void> {
	// email is nullable in the schema; an account without one cannot be
	// verified by mail, and there is nothing useful to send.
	if (!user.email) return

	const { token } = await issueToken(user.id, 'VERIFY_EMAIL', db)
	await sendMail(
		verificationMail(user.email, user.name, appUrl(`/api/auth/verify-email?token=${token}`)),
	)
}
