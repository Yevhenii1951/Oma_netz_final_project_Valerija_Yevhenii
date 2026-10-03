/**
 * Removing the fixtures, in the one order the schema allows.
 *
 * The foreign keys are not uniform. Deleting a request takes its offers, its
 * chat and that chat's messages with it, but NOT its rating — `ratings` is the
 * one child of `requests` set to RESTRICT. Deleting a user cascades accounts,
 * sessions and notifications, but messages, offers, ratings, redemptions and
 * requests all have to be gone first.
 *
 * Confirmed against the database rather than the schema file:
 *
 *   SELECT confdeltype FROM pg_constraint WHERE contype = 'f'
 *
 * so the order below is derived from what is actually deployed.
 */

import { prisma } from './client'

/** Matches every email the fixtures use. */
const FIXTURE_EMAIL = { contains: '@test.local' }

export async function cleanupFixtures(): Promise<void> {
	await prisma.rating.deleteMany({
		where: {
			OR: [
				{ request: { senior: { email: FIXTURE_EMAIL } } },
				{ author: { email: FIXTURE_EMAIL } },
				{ helper: { email: FIXTURE_EMAIL } },
			],
		},
	})

	// Takes the offers, chat and messages of these requests with it.
	await prisma.request.deleteMany({
		where: { senior: { email: FIXTURE_EMAIL } },
	})

	// Offers a fixture made on somebody else's request, which the delete above
	// would not reach.
	await prisma.offer.deleteMany({ where: { helper: { email: FIXTURE_EMAIL } } })
	await prisma.message.deleteMany({ where: { sender: { email: FIXTURE_EMAIL } } })
	await prisma.redemption.deleteMany({ where: { user: { email: FIXTURE_EMAIL } } })

	await prisma.user.deleteMany({ where: { email: FIXTURE_EMAIL } })
}