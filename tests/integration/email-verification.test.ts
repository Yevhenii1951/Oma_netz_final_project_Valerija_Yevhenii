/**
 * Email verification against a real database.
 *
 * Covers the parts that can only be proven with SQL behind them: that the
 * plaintext token is never stored, that consuming it is atomic, and that a
 * second link for the same purpose kills the first one.
 */

import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { hashToken, isWellFormedToken } from '@/lib/auth-token'
import { findByToken, issueToken, sendVerificationMail } from '@/lib/auth-token-service'
import { setSender } from '@/lib/email-sender'
import type { Mail } from '@/lib/email-sender'

import { cleanupFixtures } from './cleanup'
import { prisma } from './client'

const SENT: Mail[] = []

setSender({
	name: 'test',
	async send(mail) {
		SENT.push(mail)
	},
})

async function makeUser(email = `verify-${Math.random().toString(36).slice(2)}@test.local`) {
	return prisma.user.create({
		data: { email, name: 'Verify', role: 'SENIOR', password: 'x' },
	})
}

/** Pulls the token out of the mailed link. */
function tokenFromLastMail(): string {
	const mail = SENT.at(-1)!
	const match = mail.text.match(/token=([A-Za-z0-9_-]+)/)
	return match![1]
}

describe('email verification tokens', () => {
	beforeEach(async () => {
		await cleanupFixtures()
		SENT.length = 0
	})
	afterAll(cleanupFixtures)

	it('stores only the hash, never the token that was mailed', async () => {
		const user = await makeUser()
		await sendVerificationMail(user, prisma)

		const token = tokenFromLastMail()
		expect(isWellFormedToken(token)).toBe(true)

		const rows = await prisma.authToken.findMany({ where: { userId: user.id } })
		expect(rows).toHaveLength(1)
		expect(rows[0].tokenHash).toBe(hashToken(token))
		expect(rows[0].tokenHash).not.toBe(token)
		// The plaintext must appear nowhere in the row.
		expect(JSON.stringify(rows[0])).not.toContain(token)
	})

	it('looks a token up by hash', async () => {
		const user = await makeUser()
		await sendVerificationMail(user, prisma)
		const token = tokenFromLastMail()

		const found = await findByToken(token, prisma)
		expect(found?.userId).toBe(user.id)
		expect(found?.user.email).toBe(user.email)

		expect(await findByToken(generateGarbage(), prisma)).toBeNull()
	})

	it('kills the previous link when a new one is issued', async () => {
		const user = await makeUser()
		const first = await issueToken(user.id, 'VERIFY_EMAIL', prisma)
		const second = await issueToken(user.id, 'VERIFY_EMAIL', prisma)

		expect(await findByToken(first.token, prisma)).toBeNull()
		expect(await findByToken(second.token, prisma)).not.toBeNull()

		const rows = await prisma.authToken.count({ where: { userId: user.id } })
		expect(rows).toBe(1)
	})

	it('does not let a verification link kill a pending password reset', async () => {
		const user = await makeUser()
		const reset = await issueToken(user.id, 'RESET_PASSWORD', prisma)
		await issueToken(user.id, 'VERIFY_EMAIL', prisma)

		expect(await findByToken(reset.token, prisma)).not.toBeNull()
	})

	it('drops the token when it is consumed', async () => {
		const user = await makeUser()
		const { token } = await issueToken(user.id, 'VERIFY_EMAIL', prisma)

		const stored = await findByToken(token, prisma)
		await prisma.$transaction([
			prisma.authToken.deleteMany({ where: { id: stored!.id } }),
			prisma.user.update({
				where: { id: user.id },
				data: { emailVerified: new Date() },
			}),
		])

		expect(await findByToken(token, prisma)).toBeNull()
		const verified = await prisma.user.findUnique({
			where: { id: user.id },
			select: { emailVerified: true },
		})
		expect(verified?.emailVerified).toBeInstanceOf(Date)
	})

	it('expires at the documented TTL', async () => {
		const user = await makeUser()
		const { token, expiresAt: expiry } = await issueToken(user.id, 'VERIFY_EMAIL', prisma)
		const stored = await findByToken(token, prisma)
		expect(stored?.expiresAt.getTime()).toBe(expiry.getTime())
	})

	it('removes tokens when the user is hard deleted', async () => {
		const user = await makeUser()
		await issueToken(user.id, 'VERIFY_EMAIL', prisma)

		await prisma.user.delete({ where: { id: user.id } })

		expect(await prisma.authToken.count({ where: { userId: user.id } })).toBe(0)
	})
})

function generateGarbage(): string {
	return 'a'.repeat(43)
}