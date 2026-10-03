/**
 * The request lifecycle against a real database.
 *
 * The status used to be written straight from the PATCH body, so the API
 * accepted transitions the UI never offers, and a completed request paid
 * POINTS_PER_HELP. That made CANCELLED -> DONE -> CANCELLED -> DONE a way to
 * mint points, and it let helpCount be incremented by double-clicking
 * "Als erledigt markieren".
 *
 * The transaction below is the one in
 * src/app/api/requests/[id]/route.ts, re-implemented to keep next-auth out of
 * the test.
 */

import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { canTransition, transitionError } from '@/lib/request-status'
import { POINTS_PER_HELP } from '@/lib/utils'

import { cleanupFixtures } from './cleanup'
import { prisma } from './client'

const TAG = 'test:lifecycle'

class StatusChangedError extends Error {}

/** Mirrors the PATCH handler, without the session and the HTTP layer. */
async function patchStatus(
	requestId: string,
	target: 'DONE' | 'CANCELLED',
): Promise<{ status: number; error?: string }> {
	const request = await prisma.request.findUnique({
		where: { id: requestId },
		select: { id: true, seniorId: true, status: true },
	})
	if (!request) return { status: 404 }

	const illegal = transitionError(request.status, target)
	if (illegal) return { status: 409, error: illegal }

	const acceptedOffer = await prisma.offer.findFirst({
		where: { requestId, status: 'ACCEPTED' },
		select: { id: true, helperId: true },
	})

	if (target === 'DONE' && !acceptedOffer) {
		return { status: 409, error: 'Niemand angenommen' }
	}

	try {
		await prisma.$transaction(async tx => {
			const claimed = await tx.request.updateMany({
				where: { id: requestId, status: request.status },
				data: { status: target },
			})
			if (claimed.count === 0) throw new StatusChangedError()

			if (target === 'DONE' && acceptedOffer) {
				await tx.user.update({
					where: { id: acceptedOffer.helperId },
					data: {
						helpCount: { increment: 1 },
						points: { increment: POINTS_PER_HELP },
					},
				})
			}

			await tx.offer.updateMany({
				where: { requestId, status: 'PENDING' },
				data: { status: 'DECLINED' },
			})
			if (target === 'CANCELLED' && acceptedOffer) {
				await tx.offer.update({
					where: { id: acceptedOffer.id },
					data: { status: 'DECLINED' },
				})
			}
		})
		return { status: 200 }
	} catch (err) {
		if (err instanceof StatusChangedError) {
			return { status: 409, error: 'Status hat sich geändert' }
		}
		throw err
	}
}

let sequence = 0

async function makeRequest(
	status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' = 'IN_PROGRESS',
) {
	sequence += 1
	const suffix = `${TAG}:${sequence}:${Math.random().toString(36).slice(2)}`

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
			description: 'Fixture for the lifecycle',
			category: 'HAUSHALT',
			address: 'Teststraße 1',
			plz: '34117',
			seniorId: senior.id,
			status,
		},
	})

	return { senior, helper, request }
}

async function giveOffer(requestId: string, helperId: string) {
	return prisma.offer.create({
		data: { requestId, helperId, status: 'ACCEPTED' },
	})
}

describe('the request lifecycle', () => {
	beforeEach(cleanupFixtures)
	afterAll(async () => {
		await cleanupFixtures()
		await prisma.$disconnect()
	})

	it('completes an in-progress request and credits the helper once', async () => {
		const { helper, request } = await makeRequest()
		await giveOffer(request.id, helper.id)

		expect(await patchStatus(request.id, 'DONE')).toEqual({ status: 200 })
		expect(
			(await prisma.request.findUniqueOrThrow({ where: { id: request.id } }))
				.status,
		).toBe('DONE')
		expect(
			(await prisma.user.findUniqueOrThrow({ where: { id: helper.id } }))
				.helpCount,
		).toBe(1)
	})

	it('awards the points when the job is completed', async () => {
		const { helper, request } = await makeRequest()
		await giveOffer(request.id, helper.id)

		await patchStatus(request.id, 'DONE')
		expect(
			(await prisma.user.findUniqueOrThrow({ where: { id: helper.id } })).points,
		).toBe(POINTS_PER_HELP)
	})

	it('awards the points even if the resident never rates', async () => {
		// The count used to be incremented by the rating, so a forgotten rating
		// silently cost the helper both their count and their points.
		const { helper, request } = await makeRequest()
		await giveOffer(request.id, helper.id)

		await patchStatus(request.id, 'DONE')
		await new Promise(resolve => setTimeout(resolve, 50))

		expect(await prisma.rating.count()).toBe(0)
		expect(
			(await prisma.user.findUniqueOrThrow({ where: { id: helper.id } })).helpCount,
		).toBe(1)
	})

	it('refuses to complete a request nobody accepted', async () => {
		const { request } = await makeRequest('OPEN')

		const result = await patchStatus(request.id, 'DONE')
		expect(result.status).toBe(409)
		expect(
			(await prisma.request.findUniqueOrThrow({ where: { id: request.id } }))
				.status,
		).toBe('OPEN')
	})

	it('refuses to reopen a cancelled request', async () => {
		const { request } = await makeRequest('OPEN')
		expect((await patchStatus(request.id, 'CANCELLED')).status).toBe(200)

		const again = await patchStatus(request.id, 'DONE')
		expect(again.status).toBe(409)
		expect(again.error).toBeDefined()
	})

	it('refuses to uncancel a completed request', async () => {
		const { helper, request } = await makeRequest()
		await giveOffer(request.id, helper.id)
		await patchStatus(request.id, 'DONE')

		expect((await patchStatus(request.id, 'CANCELLED')).status).toBe(409)
		expect(
			(await prisma.request.findUniqueOrThrow({ where: { id: request.id } }))
				.status,
		).toBe('DONE')
	})

	it('does not let a completed request be paid for twice', async () => {
		const { helper, request } = await makeRequest()
		await giveOffer(request.id, helper.id)

		await patchStatus(request.id, 'DONE')
		await patchStatus(request.id, 'DONE')
		await patchStatus(request.id, 'CANCELLED')
		await patchStatus(request.id, 'DONE')

		const after = await prisma.user.findUniqueOrThrow({
			where: { id: helper.id },
		})
		expect(after.helpCount).toBe(1)
		expect(after.points).toBe(POINTS_PER_HELP)
	})

	it('credits exactly one helper when two completion requests race', async () => {
		const { helper, request } = await makeRequest()
		await giveOffer(request.id, helper.id)

		const results = await Promise.all(
			Array.from({ length: 4 }, () => patchStatus(request.id, 'DONE')),
		)

		expect(results.filter(r => r.status === 200)).toHaveLength(1)
		expect(
			(await prisma.user.findUniqueOrThrow({ where: { id: helper.id } })).helpCount,
		).toBe(1)
	})

	it('leaves no accepted offer behind when a request is cancelled', async () => {
		const { helper, request } = await makeRequest()
		const offer = await giveOffer(request.id, helper.id)

		await patchStatus(request.id, 'CANCELLED')

		const after = await prisma.offer.findUniqueOrThrow({
			where: { id: offer.id },
		})
		expect(after.status).toBe('DECLINED')
		// Cancelling is not completed work, so it earns nothing.
		expect(
			(await prisma.user.findUniqueOrThrow({ where: { id: helper.id } })).helpCount,
		).toBe(0)
	})

	it('declines the offers that lost when a request is completed', async () => {
		const { request } = await makeRequest()
		const [winner, loser] = await Promise.all(
			['winner', 'loser'].map(role =>
				prisma.user.create({
					data: {
						email: `${role}-${Math.random().toString(36).slice(2)}@test.local`,
						name: role,
						role: 'HELPER',
						helperStatus: 'APPROVED',
						password: 'x',
					},
				}),
			),
		)
		await giveOffer(request.id, winner.id)
		const pending = await prisma.offer.create({
			data: { requestId: request.id, helperId: loser.id, status: 'PENDING' },
		})

		await patchStatus(request.id, 'CANCELLED')

		expect(
			(await prisma.offer.findUniqueOrThrow({ where: { id: pending.id } })).status,
		).toBe('DECLINED')
	})

	it('agrees with the state machine on every pair of statuses', async () => {
		// A guard against the route and the table drifting apart.
		for (const [from, to] of [
			['CANCELLED', 'DONE'],
			['DONE', 'CANCELLED'],
			['OPEN', 'DONE'],
		] as const) {
			const { request } = await makeRequest(from)
			const result = await patchStatus(request.id, to)
			expect(result.status).toBe(canTransition(from, to) ? 200 : 409)
		}
	})
})
