/**
 * Concurrency test for accepting an offer.
 *
 * The route used to gate the accept on `request.status === 'OPEN'` only, so two
 * senior tabs could each accept a different offer. Both transactions created a
 * chat room and both notified the participants; the loser only failed on the
 * unique index of Chat.requestId, which surfaced as a 500.
 *
 * The fix claims the offer and the request with conditional writes, so the test
 * asserts that exactly one chat exists and the losers are told so.
 */

import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { cleanupFixtures } from './cleanup'
import { prisma } from './client'

const TAG = 'test:accept'

class OfferAlreadyDecided extends Error {}
class RequestNoLongerOpen extends Error {}

/** Mirrors the transaction in src/app/api/offers/[id]/accept/route.ts. */
async function acceptOffer(
	offerId: string,
	requestId: string,
	ownerId: string,
): Promise<string> {
	try {
		await prisma.$transaction(async tx => {
			const claimed = await tx.offer.updateMany({
				where: { id: offerId, status: 'PENDING' },
				data: { status: 'ACCEPTED' },
			})
			if (claimed.count === 0) throw new OfferAlreadyDecided()

			const movedOn = await tx.request.updateMany({
				where: { id: requestId, status: 'OPEN' },
				data: { status: 'IN_PROGRESS' },
			})
			if (movedOn.count === 0) throw new RequestNoLongerOpen()

			await tx.chat.create({ data: { requestId } })

			await tx.offer.updateMany({
				where: { requestId, id: { not: offerId }, status: 'PENDING' },
				data: { status: 'DECLINED' },
			})
		})
		return 'OK'
	} catch (err) {
		if (err instanceof OfferAlreadyDecided) return 'CONFLICT_OFFER'
		if (err instanceof RequestNoLongerOpen) return 'CONFLICT_REQUEST'
		return `ERROR:${(err as Error).message}`
	}
}

let sequence = 0

async function makeRequest() {
	sequence += 1
	const suffix = `${TAG}:${sequence}:${Math.random().toString(36).slice(2)}`

	const owner = await prisma.user.create({
		data: {
			email: `owner-${suffix}@test.local`,
			name: 'Owner',
			role: 'SENIOR',
			password: 'x',
		},
	})
	const helpers = await Promise.all(
		[1, 2].map(n =>
			prisma.user.create({
				data: {
					email: `helper${n}-${suffix}@test.local`,
					name: `Helper ${n}`,
					role: 'HELPER',
					helperStatus: 'APPROVED',
					password: 'x',
				},
			}),
		),
	)
	const request = await prisma.request.create({
		data: {
			title: 'Test request',
			description: 'Fixture for the accept race',
			category: 'HAUSHALT',
			address: 'Teststraße 1',
			plz: '34117',
			seniorId: owner.id,
			status: 'OPEN',
		},
	})
	const offers = await Promise.all(
		helpers.map(h =>
			prisma.offer.create({
				data: { requestId: request.id, helperId: h.id, status: 'PENDING' },
			}),
		),
	)

	return { owner, helpers, request, offers }
}

describe('accepting an offer under concurrency', () => {
	beforeEach(cleanupFixtures)
	afterAll(async () => {
		await cleanupFixtures()
		await prisma.$disconnect()
	})

	it('creates exactly one chat room when two offers are accepted at once', async () => {
		const { request, offers } = await makeRequest()

		const results = await Promise.all([
			acceptOffer(offers[0]!.id, request.id, request.seniorId),
			acceptOffer(offers[1]!.id, request.id, request.seniorId),
		])

		expect(results.filter(r => r === 'OK')).toHaveLength(1)
		expect(await prisma.chat.count({ where: { requestId: request.id } })).toBe(1)
	})

	it('leaves one offer accepted and the other declined', async () => {
		const { request, offers } = await makeRequest()

		await Promise.all([
			acceptOffer(offers[0]!.id, request.id, request.seniorId),
			acceptOffer(offers[1]!.id, request.id, request.seniorId),
		])

		const all = await prisma.offer.findMany({
			where: { requestId: request.id },
			select: { status: true },
		})
		expect(all.filter(o => o.status === 'ACCEPTED')).toHaveLength(1)
		expect(all.filter(o => o.status === 'DECLINED')).toHaveLength(1)
	})

	it('refuses a second accept of the same offer', async () => {
		const { request, offers } = await makeRequest()

		expect(await acceptOffer(offers[0]!.id, request.id, request.seniorId)).toBe('OK')
		expect(await acceptOffer(offers[0]!.id, request.id, request.seniorId)).toBe(
			'CONFLICT_OFFER',
		)
		expect(await prisma.chat.count({ where: { requestId: request.id } })).toBe(1)
	})

	it('refuses any accept once the request left OPEN', async () => {
		const { request, offers } = await makeRequest()
		await prisma.request.update({
			where: { id: request.id },
			data: { status: 'CANCELLED' },
		})

		expect(await acceptOffer(offers[0]!.id, request.id, request.seniorId)).toBe(
			'CONFLICT_REQUEST',
		)
		expect(await prisma.chat.count({ where: { requestId: request.id } })).toBe(0)
	})

	it('reports a losing race as a conflict rather than an error', async () => {
		const { request, offers } = await makeRequest()

		const results = await Promise.all(
			Array.from({ length: 6 }, () =>
				acceptOffer(offers[0]!.id, request.id, request.seniorId),
			),
		)

		expect(results.filter(r => r === 'OK')).toHaveLength(1)
		// Everything else must be a handled conflict, never a 500.
		for (const result of results) {
			expect(result).not.toMatch(/^ERROR:/)
		}
		expect(await prisma.chat.count({ where: { requestId: request.id } })).toBe(1)
	})
})
