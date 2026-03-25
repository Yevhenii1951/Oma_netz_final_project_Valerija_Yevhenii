import { logAndError, requireAdmin } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// PATCH /api/rewards/[id] — admin marks redemption as fulfilled
export async function PATCH(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAdmin()
		if (session instanceof NextResponse) return session

		const { id } = await params

		const redemption = await prisma.redemption.findUnique({
			where: { id },
			include: {
				user: { select: { id: true, name: true } },
				reward: { select: { title: true } },
			},
		})
		if (!redemption) {
			return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })
		}
		if (redemption.status === 'fulfilled') {
			return NextResponse.json({ message: 'Bereits als erledigt markiert.' })
		}

		await prisma.$transaction([
			prisma.redemption.update({
				where: { id },
				data: { status: 'fulfilled' },
			}),
			prisma.notification.updateMany({
				where: {
					userId: session.user.id,
					read: false,
					link: '/admin',
					title: '🎁 Belohnung eingelöst',
					body: { contains: redemption.reward.title },
				},
				data: { read: true },
			}),
			prisma.notification.create({
				data: {
					userId: redemption.user.id,
					title: '✅ Belohnung bestätigt',
					body: `Deine Einlösung für "${redemption.reward.title}" wurde vom Admin bestätigt. Wir melden uns in Kürze bei dir.`,
					link: '/rewards',
				},
			}),
		])

		return NextResponse.json({ message: 'Als erledigt markiert.' })
	} catch (err) {
		return logAndError('[PATCH /api/rewards/[id]]', err)
	}
}
