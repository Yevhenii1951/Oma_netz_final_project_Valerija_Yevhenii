import { logAndError, requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { getPusherServer } from '@/lib/pusher-server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/offers/[id]/accept — Senior accepts a specific offer

export async function POST(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const { id } = await params

		const offer = await prisma.offer.findUnique({
			where: { id },
			include: {
				request: true,
				helper: { select: { id: true, name: true } },
			},
		})

		if (!offer)
			return NextResponse.json(
				{ error: 'Angebot nicht gefunden.' },
				{ status: 404 },
			)
		if (offer.request.seniorId !== session.user.id) {
			return NextResponse.json(
				{ error: 'Keine Berechtigung.' },
				{ status: 403 },
			)
		}
		if (offer.request.status !== 'OPEN') {
			return NextResponse.json(
				{ error: 'Anfrage ist nicht mehr offen.' },
				{ status: 400 },
			)
		}

		// Get all pending offers for this request (to notify declined ones)
		const allOffers = await prisma.offer.findMany({
			where: { requestId: offer.requestId, status: 'PENDING' },
			select: { id: true, helperId: true, helper: { select: { name: true } } },
		})

		// Transaction: accept this offer, decline others, update request, create chat + notifications
		const acceptedHelperName = offer.helper.name || 'Der Helfer'
		const ownerName = session.user.name || 'Der Auftraggeber'
		const requestTitle = offer.request.title

		const declinedOffers = allOffers.filter(o => o.id !== id)

		const [chat] = await prisma.$transaction([
			// Create chat room
			prisma.chat.create({ data: { requestId: offer.requestId } }),
			// Accept this offer
			prisma.offer.update({ where: { id }, data: { status: 'ACCEPTED' } }),
			// Decline all other pending offers for this request
			prisma.offer.updateMany({
				where: {
					requestId: offer.requestId,
					id: { not: id },
					status: 'PENDING',
				},
				data: { status: 'DECLINED' },
			}),
			// Mark request as in progress
			prisma.request.update({
				where: { id: offer.requestId },
				data: { status: 'IN_PROGRESS' },
			}),
			// Mark old "new offer" notifications as read for the owner
			prisma.notification.updateMany({
				where: {
					userId: session.user.id,
					link: `/requests/${offer.requestId}`,
					read: false,
				},
				data: { read: true },
			}),
			// Notify the owner: deal confirmed!
			prisma.notification.create({
				data: {
					userId: session.user.id,
					title: '🎉 Anfrage bestätigt!',
					body: `Du hast ${acceptedHelperName} für "${requestTitle}" ausgewählt. Schreib jetzt im Chat!`,
					link: `/chat/${offer.requestId}`,
				},
			}),
			// Notify accepted helper/senior: "Your offer was accepted!"
			prisma.notification.create({
				data: {
					userId: offer.helperId,
					title: '✅ Dein Angebot wurde angenommen!',
					body: `${ownerName} hat dein Angebot für "${requestTitle}" angenommen. Ihr könnt jetzt chatten!`,
					link: `/chat/${offer.requestId}`,
				},
			}),
			// Notify all declined applicants
			...declinedOffers.map(o =>
				prisma.notification.create({
					data: {
						userId: o.helperId,
						title: '😔 Anfrage vergeben',
						body: `Leider wurde für "${requestTitle}" jemand anderes gewählt.`,
						link: `/requests/${offer.requestId}`,
					},
				}),
			),
		])

		// Notify accepted helper via Pusher
		await getPusherServer()
			?.trigger(`user-${offer.helperId}`, 'offer-accepted', {
				requestId: offer.requestId,
				chatId: chat.id,
			})
			?.catch(() => null)

		return NextResponse.json({
			data: { chatId: chat.id, requestId: offer.requestId },
			message: 'Helfer wurde angenommen!',
		})
	} catch (err) {
		return logAndError('[POST /api/offers/[id]/accept]', err)
	}
}
