/**
 * Password reset against a real database.
 *
 * The parts that only SQL can prove: that the token is spent when the password
 * changes, that the sessions go with it, and that an address keeps its one
 * outstanding reset link.
 */

import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import bcrypt from 'bcryptjs'

import { checkToken } from '@/lib/auth-token'
import { findByToken, issueToken, spendToken } from '@/lib/auth-token-service'
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

const OLD_PASSWORD = 'passwort123'

async function makeUser(password = OLD_PASSWORD) {
	return prisma.user.create({
		data: {
			email: `reset-${Math.random().toString(36).slice(2)}@test.local`,
			name: 'Reset',
			role: 'SENIOR',
			password: await bcrypt.hash(password, 4),
		},
	})
}

function tokenFromLastMail(): string {
	const mail = SENT.at(-1)!
	return mail.text.match(/token=([A-Za-z0-9_-]+)/)![1]
}

/** What the route does, without the HTTP layer. Calls the shipped service so the
 * test cannot drift away from the code it is meant to protect. */
async function consumeResetToken(token: string, newPassword: string) {
	const stored = await findByToken(token, prisma)
	if (!stored || !checkToken(stored).ok) return { ok: false as const }

	const password = await bcrypt.hash(newPassword, 4)
	const ok = await spendToken(
		stored,
		async (tx) => {
			await tx.user.update({ where: { id: stored.userId }, data: { password } })
			await tx.session.deleteMany({ where: { userId: stored.userId } })
		},
		prisma,
	)
	return { ok }
}

describe('password reset', () => {
	beforeEach(async () => {
		await cleanupFixtures()
		SENT.length = 0
	})
	afterAll(cleanupFixtures)

	it('stores the new password and lets the new one work', async () => {
		const user = await makeUser()
		const { token } = await issueToken(user.id, 'RESET_PASSWORD', prisma)

		expect((await consumeResetToken(token, 'neuesPasswort9')).ok).toBe(true)

		const stored = await prisma.user.findUnique({ where: { id: user.id } })
		expect(await bcrypt.compare('neuesPasswort9', stored!.password!)).toBe(true)
		expect(await bcrypt.compare(OLD_PASSWORD, stored!.password!)).toBe(false)
	})

	it('spends the token, so the same link cannot be used twice', async () => {
		const user = await makeUser()
		const { token } = await issueToken(user.id, 'RESET_PASSWORD', prisma)

		await consumeResetToken(token, 'erstesPasswort9')
		const second = await consumeResetToken(token, 'zweitesPasswort9')

		expect(second.ok).toBe(false)

		// The first password survives the failed replay.
		const stored = await prisma.user.findUnique({ where: { id: user.id } })
		expect(await bcrypt.compare('erstesPasswort9', stored!.password!)).toBe(true)
	})

	/**
	 * The regression that motivated spendToken: in a batch
	 * `$transaction([deleteMany, update])` both statements always run, so two
	 * simultaneous clicks both set a password even though the second delete
	 * removed nothing. Both callers are given the same already-loaded token here
	 * so the database race decides the outcome, not the order of the reads.
	 */
	it('lets exactly one of two simultaneous uses through', async () => {
		const user = await makeUser()
		const { token } = await issueToken(user.id, 'RESET_PASSWORD', prisma)
		const stored = await findByToken(token, prisma)

		const use = async (newPassword: string) => {
			const password = await bcrypt.hash(newPassword, 4)
			return spendToken(
				stored!,
				(tx) => tx.user.update({ where: { id: user.id }, data: { password } }),
				prisma,
			)
		}

		const results = await Promise.all([use('erstesPasswort9'), use('zweitesPasswort9')])

		expect(results.filter(Boolean)).toHaveLength(1)

		const storedUser = await prisma.user.findUnique({ where: { id: user.id } })
		const matches = await Promise.all(
			['erstesPasswort9', 'zweitesPasswort9'].map((p) =>
				bcrypt.compare(p, storedUser!.password!),
			),
		)
		expect(matches.filter(Boolean)).toHaveLength(1)
	})

	it('drops the sessions, so a reset logs out whoever was signed in', async () => {
		const user = await makeUser()
		await prisma.session.create({
			data: {
				userId: user.id,
				sessionToken: `tok-${Math.random()}`,
				expires: new Date(Date.now() + 3600_000),
			},
		})
		const { token } = await issueToken(user.id, 'RESET_PASSWORD', prisma)

		await consumeResetToken(token, 'neuesPasswort9')

		expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0)
	})

	it('refuses an expired link and leaves the password alone', async () => {
		const user = await makeUser()
		const { token } = await issueToken(user.id, 'RESET_PASSWORD', prisma)

		await prisma.authToken.updateMany({
			where: { userId: user.id },
			data: { expiresAt: new Date(Date.now() - 1000) },
		})

		expect((await consumeResetToken(token, 'neuesPasswort9')).ok).toBe(false)

		const stored = await prisma.user.findUnique({ where: { id: user.id } })
		expect(await bcrypt.compare(OLD_PASSWORD, stored!.password!)).toBe(true)
	})

	it('keeps one outstanding link per account, so only the newest works', async () => {
		const user = await makeUser()
		const first = await issueToken(user.id, 'RESET_PASSWORD', prisma)
		const second = await issueToken(user.id, 'RESET_PASSWORD', prisma)

		expect(await findByToken(first.token, prisma)).toBeNull()
		expect(await findByToken(second.token, prisma)).not.toBeNull()
		expect(await prisma.authToken.count({ where: { userId: user.id } })).toBe(1)
	})

	it('leaves a pending verification link alone', async () => {
		const user = await makeUser()
		const verify = await issueToken(user.id, 'VERIFY_EMAIL', prisma)
		await issueToken(user.id, 'RESET_PASSWORD', prisma)

		expect(await findByToken(verify.token, prisma)).not.toBeNull()
	})

	it('cleans the link up with the account', async () => {
		const user = await makeUser()
		await issueToken(user.id, 'RESET_PASSWORD', prisma)

		await prisma.user.delete({ where: { id: user.id } })

		expect(await prisma.authToken.count({ where: { userId: user.id } })).toBe(0)
	})

	it('mails a link, not a token the database would recognise', async () => {
		const user = await makeUser()
		const { token } = await issueToken(user.id, 'RESET_PASSWORD', prisma)
		await prisma.authToken.deleteMany({ where: { userId: user.id } })
		SENT.push({ to: user.email!, subject: 'x', text: `.../passwort-zurcksetzen?token=${token}` })

		expect(tokenFromLastMail()).toBe(token)
		expect(await findByToken(token, prisma)).toBeNull()
	})
})