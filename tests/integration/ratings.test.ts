/**
 * Rating submission against a real database.
 *
 * Two things were wrong here. The average was computed by loading every rating
 * row into memory and then rounded to one decimal before storing, so the number
 * shown was not the mean of the scores that were actually given. And the rating
 * incremented helpCount and paid POINTS_PER_HELP, which made the helper's
 * record depend on the resident remembering to leave a review.
 *
 * The transaction below mirrors src/app/api/ratings/route.ts.
 */

import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { cleanupFixtures } from './cleanup'
import { prisma } from './client'

const TAG = 'test:ratings'

/** Mirrors the POST handler, without the session and the HTTP layer. */
async function submitRating(requestId: string, authorId: string, score: number) {
	const request = await prisma.request.findUnique({
		where: { id: requestId },
		include: {
			offers: { where: { status: 'ACCEPTED' }, select: { helperId: true } },
			rating: true,
		},
	})
	if (!request) return 'NOT_FOUND'
	if (request.status !== 'DONE') return 'NOT_DONE'
	if (request.seniorId !== authorId) return 'FORBIDDEN'
	if (request.rating) return 'ALREADY_RATED'

	const helperId = request.offers[0]?.helperId
	if (!helperId) return 'NO_HELPER'

	try {
		await prisma.$transaction(async tx => {
			await tx.rating.create({
				data: { requestId, score, authorId, helperId },
			})
			const aggregate = await tx.rating.aggregate({
				where: { helperId },
				_avg: { score: true },
			})
			await tx.user.update({
				where: { id: helperId },
				data: { ratingAvg: aggregate._avg.score ?? 0 },
			})
		})
		return 'OK'
	} catch {
		// The unique index on requestId makes a second rating for the same
		// request a conflict, not a duplicate.
		return 'CONFLICT'
	}
}

async function makeCompletedRequest() {
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
			title: 'Test request',
			description: 'Fixture for the rating average',
			category: 'HAUSHALT',
			address: 'Teststraße 1',
			plz: '34117',
			seniorId: senior.id,
			status: 'DONE',
		},
	})
	await prisma.offer.create({
		data: { requestId: request.id, helperId: helper.id, status: 'ACCEPTED' },
	})

	return { senior, helper, request }
}

describe('the helper rating average', () => {
	beforeEach(cleanupFixtures)
	afterAll(async () => {
		await cleanupFixtures()
		await prisma.$disconnect()
	})

	it('stores the exact mean, not a one-decimal rounding of it', async () => {
		// One helper, three completed requests, three scores: 5, 4, 4.
		const { helper } = await makeCompletedRequest()

		for (const score of [5, 4, 4]) {
			const { senior, request } = await makeCompletedRequest()
			await prisma.offer.updateMany({
				where: { requestId: request.id },
				data: { helperId: helper.id },
			})
			expect(await submitRating(request.id, senior.id, score)).toBe('OK')
		}

		const after = await prisma.user.findUniqueOrThrow({
			where: { id: helper.id },
		})
		expect(after.ratingAvg).toBeCloseTo(13 / 3, 10)
		// 13/3 is 4.333…, which the old rounding turned into 4.3.
		expect(after.ratingAvg).not.toBe(4.3)
	})

	it('leaves a helper with no ratings at zero rather than undefined', async () => {
		const { helper } = await makeCompletedRequest()
		const after = await prisma.user.findUniqueOrThrow({
			where: { id: helper.id },
		})
		expect(after.ratingAvg).toBe(0)
	})

	it('does not change helpCount or the points', async () => {
		const { helper, senior, request } = await makeCompletedRequest()
		const before = await prisma.user.findUniqueOrThrow({
			where: { id: helper.id },
		})

		expect(await submitRating(request.id, senior.id, 5)).toBe('OK')

		const after = await prisma.user.findUniqueOrThrow({
			where: { id: helper.id },
		})
		expect(after.helpCount).toBe(before.helpCount)
		expect(after.points).toBe(before.points)
	})

	it('refuses a second rating for the same request', async () => {
		const { senior, request } = await makeCompletedRequest()

		expect(await submitRating(request.id, senior.id, 5)).toBe('OK')
		expect(await submitRating(request.id, senior.id, 1)).toBe('ALREADY_RATED')
		expect(await prisma.rating.count({ where: { requestId: request.id } })).toBe(1)
	})

	it('refuses a rating before the request is completed', async () => {
		const { senior, request } = await makeCompletedRequest()
		await prisma.request.update({
			where: { id: request.id },
			data: { status: 'IN_PROGRESS' },
		})

		expect(await submitRating(request.id, senior.id, 5)).toBe('NOT_DONE')
	})

	it('refuses a rating from someone who is not the resident', async () => {
		const { helper, request } = await makeCompletedRequest()

		expect(await submitRating(request.id, helper.id, 1)).toBe('FORBIDDEN')
	})
})