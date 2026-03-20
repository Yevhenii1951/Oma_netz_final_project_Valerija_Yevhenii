import { requireAuth, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/rewards — list all active rewards
export async function GET() {
	try {
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

		const { rewardId } = await req.json()
		if (!rewardId) {
			return NextResponse.json({ error: 'rewardId fehlt.' }, { status: 400 })
		}

		// Load reward and user in parallel
		const [reward, user] = await Promise.all([
			prisma.reward.findUnique({ where: { id: rewardId } }),
			prisma.user.findUnique({
				where: { id: session.user.id },
				select: { points: true, name: true },
			}),
		])

		if (!reward || !reward.isActive) {
			return NextResponse.json(
				{ error: 'Belohnung nicht gefunden oder nicht verfügbar.' },
				{ status: 404 },
			)
		}

		if (!user || user.points < reward.pointsCost) {
			return NextResponse.json(
				{ error: 'Nicht genügend Punkte.' },
				{ status: 400 },
			)
		}

		// Check if already redeemed
		const existing = await prisma.redemption.findFirst({
			where: { userId: session.user.id, rewardId },
		})
		if (existing) {
			return NextResponse.json(
				{ error: 'Diese Belohnung wurde bereits eingelöst.' },
				{ status: 409 },
			)
		}

		// Find all admins to notify
		const admins = await prisma.user.findMany({
			where: { role: 'ADMIN' },
			select: { id: true },
		})

		// Create redemption + deduct points + notify admins — all atomic
		await prisma.$transaction([
			prisma.redemption.create({
				data: { userId: session.user.id, rewardId },
			}),
			prisma.user.update({
				where: { id: session.user.id },
				data: { points: { decrement: reward.pointsCost } },
			}),
			...admins.map(admin =>
				prisma.notification.create({
					data: {
						userId: admin.id,
						title: '🎁 Belohnung eingelöst',
						body: `${user?.name ?? 'Ein Nutzer'} hat "${reward.title}" gegen ${reward.pointsCost} Punkte eingelöst. Bitte prüfen und veranlassen.`,
						link: '/admin',
					},
				}),
			),
		])

		return NextResponse.json(
			{ message: 'Belohnung erfolgreich eingelöst!' },
			{ status: 201 },
		)
	} catch (err) {
		return logAndError('[POST /api/rewards]', err)
	}
}
