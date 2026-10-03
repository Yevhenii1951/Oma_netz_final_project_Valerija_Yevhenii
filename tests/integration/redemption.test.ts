/**
 * Concurrency tests for the two flows where a read-then-write could double
 * charge or double accept. Both run against a real PostgreSQL, because the
 * behaviour under test is the row lock, not the JavaScript.
 */

import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { prisma } from './client'

const REDEEM = 'test:redeem'

/**
 * Mirrors the transaction in src/app/api/rewards/route.ts. Kept as a copy on
 * purpose: importing the route handler would drag in next-auth and the session,
 * and the point of the test is the sequence of writes, not the HTTP layer.
 */
async function redeem(userId: string, rewardId: string): Promise<string> {
	try {
		return await prisma.$transaction(async tx => {
			const reward = await tx.reward.findUnique({ where: { id: rewardId } })
			if (!reward) return 'NOT_FOUND'

			const debited = await tx.user.updateMany({
				where: { id: userId, points: { gte: reward.pointsCost } },
				data: { points: { decrement: reward.pointsCost } },
			})
			if (debited.count === 0) return 'CONFLICT_POINTS'

			if (reward.stock !== null) {
				const reserved = await tx.reward.updateMany({
					where: { id: rewardId, stock: { gte: 1 } },
					data: { stock: { decrement: 1 } },
				})
				if (reserved.count === 0) return 'CONFLICT_STOCK'
			}

			const created = await tx.redemption.create({
				data: { userId, rewardId },
			})
			return `OK:${created.id}`
		})
	} catch (err) {
		return (err as { code?: string }).code === 'P2002'
			? 'CONFLICT_DUPLICATE'
			: `ERROR:${(err as Error).message}`
	}
}

async function seedUser(points: number) {
	return prisma.user.create({
		data: {
			email: `${REDEEM}:${Math.random().toString(36).slice(2)}`,
			name: 'Test',
			role: 'SENIOR',
			password: 'x',
			points,
		},
	})
}

async function seedReward(pointsCost: number, stock: number | null) {
	return prisma.reward.create({
		data: {
			title: 'Test reward',
			description: 'Fixture',
			pointsCost,
			stock,
			isActive: true,
		},
	})
}

describe('redemption under concurrency', () => {
	beforeEach(async () => {
		await prisma.redemption.deleteMany({
			where: { reward: { title: 'Test reward' } },
		})
		await prisma.reward.deleteMany({ where: { title: 'Test reward' } })
		await prisma.user.deleteMany({ where: { email: { startsWith: REDEEM } } })
	})

	afterAll(async () => {
		await prisma.redemption.deleteMany({
			where: { reward: { title: 'Test reward' } },
		})
		await prisma.reward.deleteMany({ where: { title: 'Test reward' } })
		await prisma.user.deleteMany({ where: { email: { startsWith: REDEEM } } })
		await prisma.$disconnect()
	})

	it('charges exactly once when the balance covers one redemption', async () => {
		const cost = 50
		const user = await seedUser(cost)
		const reward = await seedReward(cost, null)

		const results = await Promise.all(
			Array.from({ length: 10 }, () => redeem(user.id, reward.id)),
		)

		expect(results.filter(r => r.startsWith('OK'))).toHaveLength(1)
		expect(
			results.filter(r => r === 'CONFLICT_POINTS'),
		).toHaveLength(9)

		const after = await prisma.user.findUniqueOrThrow({
			where: { id: user.id },
			select: { points: true },
		})
		expect(after.points).toBe(0)
		expect(
			await prisma.redemption.count({ where: { userId: user.id } }),
		).toBe(1)
	})

	it('never drives the balance negative', async () => {
		const cost = 30
		const user = await seedUser(cost * 2)
		const reward = await seedReward(cost, null)

		await Promise.all(
			Array.from({ length: 10 }, () => redeem(user.id, reward.id)),
		)

		const after = await prisma.user.findUniqueOrThrow({
			where: { id: user.id },
			select: { points: true },
		})
		expect(after.points).toBeGreaterThanOrEqual(0)
	})

	it('rolls the debit back when the duplicate is refused', async () => {
		const cost = 30
		const user = await seedUser(cost * 5)
		const reward = await seedReward(cost, null)

		const results = await Promise.all(
			Array.from({ length: 10 }, () => redeem(user.id, reward.id)),
		)

		expect(results.filter(r => r === 'CONFLICT_DUPLICATE').length).toBeGreaterThan(0)
		// One charge only, even though several transactions passed the balance check.
		const after = await prisma.user.findUniqueOrThrow({
			where: { id: user.id },
			select: { points: true },
		})
		expect(after.points).toBe(cost * 4)
		expect(
			await prisma.redemption.count({ where: { userId: user.id } }),
		).toBe(1)
	})

	it('sells a limited reward at most as often as its stock', async () => {
		const cost = 10
		const user = await seedUser(cost * 10)
		const reward = await seedReward(cost, 1)

		const results = await Promise.all(
			Array.from({ length: 10 }, () => redeem(user.id, reward.id)),
		)

		expect(results.filter(r => r.startsWith('OK'))).toHaveLength(1)
		const after = await prisma.reward.findUniqueOrThrow({
			where: { id: reward.id },
			select: { stock: true },
		})
		expect(after.stock).toBe(0)
	})

	it('leaves an unlimited reward without a stock value alone', async () => {
		const cost = 10
		const user = await seedUser(cost)
		const reward = await seedReward(cost, null)

		const result = await redeem(user.id, reward.id)

		expect(result.startsWith('OK')).toBe(true)
		const after = await prisma.reward.findUniqueOrThrow({
			where: { id: reward.id },
			select: { stock: true },
		})
		expect(after.stock).toBeNull()
	})

	it('refuses a redemption the database already forbids', async () => {
		const cost = 5
		const user = await seedUser(cost * 10)
		const reward = await seedReward(cost, null)

		expect((await redeem(user.id, reward.id)).startsWith('OK')).toBe(true)
		expect(await redeem(user.id, reward.id)).toBe('CONFLICT_DUPLICATE')
		expect(
			await prisma.redemption.count({ where: { userId: user.id } }),
		).toBe(1)
	})
})
