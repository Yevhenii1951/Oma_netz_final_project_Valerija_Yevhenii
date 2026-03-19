import { requireAuth, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { getPusherServer } from '@/lib/pusher-server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createOfferSchema = z.object({
	requestId: z.string(),
	message: z.string().max(500).optional(),
})

// ─── POST: create offer (volunteer responds to request) ──────────────────────

export async function POST(req: NextRequest) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		if (session.user.role === 'ADMIN') {
			return NextResponse.json(
				{ error: 'Admins können keine Angebote abgeben.' },
				{ status: 403 },
			)
		}

		// Block helpers who are not yet approved by admin
		if (session.user.role === 'HELPER') {
			const helperUser = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { helperStatus: true },
			})
			if (helperUser?.helperStatus !== 'APPROVED') {
				return NextResponse.json(
					{
						error:
							'Dein Helfer-Profil wird noch geprüft. Du kannst dich bewerben, sobald der Admin dich freischaltet.',
					},
					{ status: 403 },
				)
			}
		}

		const body = await req.json()
		const data = createOfferSchema.parse(body)

		// Check request exists and is open
		const request = await prisma.request.findUnique({
			where: { id: data.requestId },
			include: { senior: { select: { role: true, name: true } } },
		})
		if (!request)
			return NextResponse.json(
				{ error: 'Anfrage nicht gefunden.' },
				{ status: 404 },
			)
		if (request.status !== 'OPEN') {
			return NextResponse.json(
				{ error: 'Diese Anfrage ist nicht mehr offen.' },
				{ status: 400 },
			)
		}

		// Prevent same-role offers: helpers can't take helper requests, seniors can't take senior requests
		if (request.senior.role === session.user.role) {
			return NextResponse.json(
				{
					error:
						'Du kannst keine Anfragen von Nutzern mit derselben Rolle annehmen.',
				},
				{ status: 403 },
			)
		}
		if (request.seniorId === session.user.id) {
			return NextResponse.json(
				{ error: 'Eigene Anfrage nicht bewerbbar.' },
				{ status: 400 },
			)
		}

		const offer = await prisma.offer.create({
			data: {
				requestId: data.requestId,
				helperId: session.user.id,
				message: data.message,
			},
			include: { helper: { select: { id: true, name: true, image: true } } },
		})

		// Notify the request creator via DB notification
		const senderName = offer.helper.name || 'Jemand'
		const isSeniorApplicant =
			session.user.role === 'SENIOR' || session.user.role === 'RELATIVE'
		await prisma.notification.create({
			data: {
				userId: request.seniorId,
				title: isSeniorApplicant
					? '🤝 Neues Interesse an deiner Anfrage'
					: '🙋 Neue Bewerbung auf deine Anfrage',
				body: `${senderName} möchte bei "${request.title}" ${isSeniorApplicant ? 'mitmachen' : 'helfen'}.`,
				link: `/requests/${request.id}`,
			},
		})

		// Notify the request creator via Pusher
		await getPusherServer()
			?.trigger(`user-${request.seniorId}`, 'new-offer', {
				requestId: data.requestId,
				helper: offer.helper,
			})
			?.catch(() => null)

		return NextResponse.json(
			{ data: offer, message: 'Bewerbung gesendet!' },
			{ status: 201 },
		)
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		if ((err as { code?: string }).code === 'P2002') {
			return NextResponse.json(
				{ error: 'Du hast dich bereits beworben.' },
				{ status: 409 },
			)
		}
		return logAndError('[POST /api/offers]', err)
	}
}
