/**
 * Soft delete against a real database.
 *
 * `DELETE /api/admin/users/[id]` used to call prisma.user.delete, which could
 * only ever do two things: destroy a helper's history along with the requests
 * and ratings they took part in, or fail outright — `ratings` is the one child
 * of `requests` set to RESTRICT, so deleting a helper who had been rated hit
 * P2003 and the admin saw "Nutzer kann nicht gelöscht werden, da verknüpfte
 * Daten existieren". Neither outcome is a delete an admin wants.
 *
 * The delete below mirrors the route: set deletedAt, drop the sessions, leave
 * everything else alone.
 */

import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { buildHelperQuery } from '@/app/admin/admin-table-query'

import { cleanupFixtures } from './cleanup'
import { prisma } from './client'

const TAG = 'test:soft-delete'

async function makeRatedHelper() {
	const suffix = `${TAG}:${Math.random().toString(36).slice(2)}`

	const senior = await prisma.user.create({
		data: {
			email: `senior-${suffix}@test.local`,
			name: 'Senior',
			role: 'SENIOR',
			password: 'x',
		},
	})
	const helper = await prisma.user.create({
		data: {
			email: `helper-${suffix}@test.local`,
			name: 'Helper',
			role: 'HELPER',
			helperStatus: 'APPROVED',
			password: 'x',
		},
	})
	const request = await prisma.request.create({
		data: {
			title: 'Einkauf',
			description: 'Bitte einkaufen',
			category: 'EINKAUF',
			address: 'Kassel-Mitte',
			status: 'DONE',
			seniorId: senior.id,
		},
	})
	const offer = await prisma.offer.create({
		data: {
			requestId: request.id,
			helperId: helper.id,
			status: 'ACCEPTED',
		},
	})
	// The RESTRICT edge: this row is why a hard delete could not work.
	const rating = await prisma.rating.create({
		data: { requestId: request.id, score: 5, authorId: senior.id, helperId: helper.id },
	})
	await prisma.session.create({
		data: { userId: helper.id, sessionToken: `tok-${suffix}`, expires: new Date(Date.now() + 3600_000) },
	})

	return { senior, helper, request, offer, rating }
}

/** Mirrors the DELETE handler. */
async function softDelete(userId: string) {
	return prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: { deletedAt: new Date() },
			select: { id: true },
		}),
		prisma.session.deleteMany({ where: { userId } }),
	])
}

describe('soft delete', () => {
	beforeEach(cleanupFixtures)
	afterAll(cleanupFixtures)

	it('keeps the user row and everything attached to it', async () => {
		const { helper, rating, request } = await makeRatedHelper()

		await softDelete(helper.id)

		const user = await prisma.user.findUnique({ where: { id: helper.id } })
		expect(user).not.toBeNull()
		expect(user?.deletedAt).toBeInstanceOf(Date)

		// The point of the change: the history survives.
		const keptRating = await prisma.rating.findUnique({ where: { id: rating.id } })
		expect(keptRating).not.toBeNull()

		const keptRequest = await prisma.request.findUnique({ where: { id: request.id } })
		expect(keptRequest?.seniorId).toBeTruthy()
	})

	it('drops the sessions so the JWT stops being usable immediately', async () => {
		const { helper } = await makeRatedHelper()

		await softDelete(helper.id)

		const sessions = await prisma.session.count({ where: { userId: helper.id } })
		expect(sessions).toBe(0)
	})

	it('is reversible by clearing the timestamp', async () => {
		const { helper } = await makeRatedHelper()
		await softDelete(helper.id)

		await prisma.user.update({ where: { id: helper.id }, data: { deletedAt: null } })

		const restored = await prisma.user.findUnique({
			where: { id: helper.id },
			select: { deletedAt: true },
		})
		expect(restored?.deletedAt).toBeNull()
	})

	it('is a no-op the second time and reports it instead of re-deleting', async () => {
		const { helper } = await makeRatedHelper()
		await softDelete(helper.id)

		const already = await prisma.user.findUnique({
			where: { id: helper.id },
			select: { deletedAt: true },
		})
		expect(already?.deletedAt).toBeInstanceOf(Date)
	})
})

describe('soft delete and the admin tables', () => {
	beforeEach(cleanupFixtures)
	afterAll(cleanupFixtures)

	it('hides a deleted helper from the helper table query', async () => {
		const { helper } = await makeRatedHelper()
		const { where } = buildHelperQuery({
			tab: 'helpers',
			q: '',
			status: 'ALL',
			sort: 'createdAt',
			dir: 'desc',
			page: 1,
			pageSize: 8,
		})

		const before = await prisma.user.findMany({ where, select: { id: true } })
		expect(before.map(u => u.id)).toContain(helper.id)

		await softDelete(helper.id)

		const after = await prisma.user.findMany({ where, select: { id: true } })
		expect(after.map(u => u.id)).not.toContain(helper.id)
	})

	it('excludes deleted users from the user count', async () => {
		const { helper } = await makeRatedHelper()
		const where = { email: { contains: '@test.local' }, deletedAt: null }

		const before = await prisma.user.count({ where })
		await softDelete(helper.id)
		const after = await prisma.user.count({ where })

		expect(after).toBe(before - 1)
	})
})