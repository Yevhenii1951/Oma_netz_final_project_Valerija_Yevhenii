import { logAndError, requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { getPusherServer } from '@/lib/pusher-server'
import { NextRequest, NextResponse } from 'next/server'

/** Conditional claim inside the transaction lost a parallel race. */
class OfferAlreadyDecided extends Error {}
/** Another request moved the parent out of OPEN first. */
class RequestNoLongerOpen extends Error {}

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

		// An offer can be accepted exactly once. This used to be checked only
		// through the request being OPEN, so clicking accept twice in two tabs
		// created two chat rooms and two sets of notifications — the second one
		// only failed on the unique index of Chat.requestId, surfacing as a 500.
		if (offer.status !== 'PENDING') {
			return NextResponse.json(
				{ error: 'Dieses Angebot ist bereits entschieden.' },
				{ status: 409 },
			)
		}
		if (offer.request.status !== 'OPEN') {
			return NextResponse.json(
				{ error: 'Anfrage ist nicht mehr offen.' },
				{ status: 409 },
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

		// Interactive transaction, because the offer has to be claimed
		// conditionally: `status: PENDING` in the where clause is the check
		// above, performed as a write, so two parallel accepts cannot both win.
		const { chat } = await prisma.$transaction(async tx => {
			const claimed = await tx.offer.updateMany({
				where: { id, status: 'PENDING' },
				data: { status: 'ACCEPTED' },
			})
			if (claimed.count === 0) throw new OfferAlreadyDecided()

			const movedOn = await tx.request.updateMany({
				where: { id: offer.requestId, status: 'OPEN' },
				data: { status: 'IN_PROGRESS' },
			})
			if (movedOn.count === 0) throw new RequestNoLongerOpen()

			const created = await tx.chat.create({ data: { requestId: offer.requestId } })

			// Decline all other pending offers for this request
			await tx.offer.updateMany({
				where: {
					requestId: offer.requestId,
					id: { not: id },
					status: 'PENDING',
				},
				data: { status: 'DECLINED' },
			})

			// Mark old "new offer" notifications as read for the owner
			await tx.notification.updateMany({
				where: {
					userId: session.user.id,
					link: `/requests/${offer.requestId}`,
					read: false,
				},
				data: { read: true },
			})

			await tx.notification.createMany({
				data: [
					{
						userId: session.user.id,
						title: '🎉 Anfrage bestätigt!',
						body: `Du hast ${acceptedHelperName} für "${requestTitle}" ausgewählt. Schreib jetzt im Chat!`,
						link: `/chat/${offer.requestId}`,
					},
					{
						userId: offer.helperId,
						title: '✅ Dein Angebot wurde angenommen!',
						body: `${ownerName} hat dein Angebot für "${requestTitle}" angenommen. Ihr könnt jetzt chatten!`,
						link: `/chat/${offer.requestId}`,
					},
					...declinedOffers.map(o => ({
						userId: o.helperId,
						title: '😔 Anfrage vergeben',
						body: `Leider wurde für "${requestTitle}" jemand anderes gewählt.`,
						link: `/requests/${offer.requestId}`,
					})),
				],
			})

			return { chat: created }
		})

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
		if (err instanceof OfferAlreadyDecided) {
			return NextResponse.json(
				{ error: 'Dieses Angebot ist bereits entschieden.' },
				{ status: 409 },
			)
		}
		if (err instanceof RequestNoLongerOpen) {
			return NextResponse.json(
				{ error: 'Anfrage ist nicht mehr offen.' },
				{ status: 409 },
			)
		}
		return logAndError('[POST /api/offers/[id]/accept]', err)
	}
}
