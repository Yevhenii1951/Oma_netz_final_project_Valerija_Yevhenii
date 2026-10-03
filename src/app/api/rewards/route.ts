import { logAndError, requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const redeemSchema = z.object({ rewardId: z.string().min(1) })

/**
 * Raised by the transaction when a conditional update matches nothing, i.e.
 * someone else changed the balance or the stock first. Translated to a 409
 * rather than a 500, because the caller can act on it.
 */
class RedemptionConflict extends Error {
	constructor(public readonly reason: 'points' | 'stock') {
		super(reason)
	}
}

// GET /api/rewards — list all active rewards
export async function GET() {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const rewards = await prisma.reward.findMany({
			where: { isActive: true },
			orderBy: { pointsCost: 'asc' },
		})
		return NextResponse.json({ data: rewards })
	} catch (err) {
		return logAndError('[GET /api/rewards]', err)
	}
}

// POST /api/rewards — redeem a reward
export async function POST(req: Request) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const { rewardId } = redeemSchema.parse(await req.json())

		const reward = await prisma.reward.findUnique({
			where: { id: rewardId },
			select: { id: true, title: true, pointsCost: true, isActive: true, stock: true },
		})
		if (!reward || !reward.isActive) {
			return NextResponse.json(
				{ error: 'Belohnung nicht gefunden oder nicht verfügbar.' },
				{ status: 404 },
			)
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { name: true },
		})

		const admins = await prisma.user.findMany({
			where: { role: 'ADMIN' },
			select: { id: true },
		})

		// The balance check and the "already redeemed" check used to be plain
		// reads outside the transaction, so two parallel requests both passed
		// them: the user was charged twice and could end up with negative
		// points. Both are now conditional writes that either match a row or
		// match nothing.
		const redemption = await prisma.$transaction(async tx => {
			const debited = await tx.user.updateMany({
				where: { id: session.user.id, points: { gte: reward.pointsCost } },
				data: { points: { decrement: reward.pointsCost } },
			})
			if (debited.count === 0) throw new RedemptionConflict('points')

			// stock === null means unlimited.
			if (reward.stock !== null) {
				const reserved = await tx.reward.updateMany({
					where: { id: reward.id, stock: { gte: 1 } },
					data: { stock: { decrement: 1 } },
				})
				if (reserved.count === 0) throw new RedemptionConflict('stock')
			}

			const created = await tx.redemption.create({
				data: { userId: session.user.id, rewardId: reward.id },
			})

			if (admins.length > 0) {
				await tx.notification.createMany({
					data: admins.map(admin => ({
						userId: admin.id,
						title: '🎁 Belohnung eingelöst',
						body: `${user?.name ?? 'Ein Nutzer'} hat "${reward.title}" gegen ${reward.pointsCost} Punkte eingelöst. Bitte prüfen und veranlassen.`,
						link: '/admin',
					})),
				})
			}

			return created
		})

		return NextResponse.json(
			{ data: redemption, message: 'Belohnung erfolgreich eingelöst!' },
			{ status: 201 },
		)
	} catch (err) {
		if (err instanceof RedemptionConflict) {
			const messages = {
				points: ['Nicht genügend Punkte.', 400],
				stock: ['Diese Belohnung ist nicht mehr auf Lager.', 409],
			} as const
			const [error, status] = messages[err.reason]
			return NextResponse.json({ error }, { status })
		}
		// The unique index on (userId, rewardId) is the last line of defence.
		if ((err as { code?: string }).code === 'P2002') {
			return NextResponse.json(
				{ error: 'Diese Belohnung wurde bereits eingelöst.' },
				{ status: 409 },
			)
		}
		if (err instanceof z.ZodError) {
			return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
		}
		return logAndError('[POST /api/rewards]', err)
	}
}