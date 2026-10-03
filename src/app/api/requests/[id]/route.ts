import { logAndError, requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { redactRequest, requestVisibility } from '@/lib/request-access'
import { transitionError } from '@/lib/request-status'
import { POINTS_PER_HELP } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ─── GET single request ───────────────────────────────────────────────────────

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const { id } = await params
		const request = await prisma.request.findUnique({
			where: { id },
			include: {
				senior: {
					select: {
						id: true,
						name: true,
						image: true,
						phone: true,
						ratingAvg: true,
						helpCount: true,
						role: true,
					},
				},
				offers: {
					select: {
						id: true,
						requestId: true,
						helperId: true,
						message: true,
						status: true,
						createdAt: true,
						helper: {
							select: {
								id: true,
								name: true,
								image: true,
								ratingAvg: true,
								helpCount: true,
								bio: true,
							},
						},
					},
					orderBy: { createdAt: 'asc' },
				},
				chat: { select: { id: true } },
				rating: true,
			},
		})

		if (!request) {
			return NextResponse.json(
				{ error: 'Anfrage nicht gefunden.' },
				{ status: 404 },
			)
		}

		// The old check only refused a SENIOR or RELATIVE reading someone
		// else's request. Any HELPER — approved, pending or not — read every
		// request in the system, including the resident's home address and
		// phone number, and including requests that were already cancelled.
		// See src/lib/request-access.ts for the rule.
		const acceptedHelperId = request.offers.find(o => o.status === 'ACCEPTED')
			?.helper.id
		const visibility = requestVisibility(session.user, request, acceptedHelperId)

		if (!visibility) {
			return NextResponse.json(
				{ error: 'Keine Berechtigung.' },
				{ status: 403 },
			)
		}

		if (visibility === 'full') {
			return NextResponse.json({ data: request })
		}

		// Browsing view: the job, its author and the offers, but neither the
		// location nor the resident's phone number.
		return NextResponse.json({
			data: redactRequest({ ...request, senior: { ...request.senior, phone: null } }),
		})
	} catch (err) {
		return logAndError('[GET /api/requests/[id]]', err)
	}
}

// ─── PATCH: update status (cancel, complete) ──────────────────────────────────

/** Signals that another request changed the status first, so the write was skipped. */
class StatusChangedError extends Error {}

const patchSchema = z.object({
	status: z.enum(['CANCELLED', 'DONE']),
})

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const { id } = await params
		const body = await req.json()
		const data = patchSchema.parse(body)

		const request = await prisma.request.findUnique({
			where: { id },
			select: { id: true, seniorId: true, status: true, title: true },
		})
		if (!request)
			return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })

		// Only the author (or admin) can update
		if (request.seniorId !== session.user.id && session.user.role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'Keine Berechtigung.' },
				{ status: 403 },
			)
		}

		// The status used to be written straight from the body, so the API
		// accepted transitions the UI never offers: a cancelled request could be
		// completed again, a completed one cancelled. Each DONE pays the helper
		// POINTS_PER_HELP, so that loop was a way to farm points.
		const illegal = transitionError(request.status, data.status)
		if (illegal) {
			return NextResponse.json({ error: illegal }, { status: 409 })
		}

		const acceptedOffer = await prisma.offer.findFirst({
			where: { requestId: id, status: 'ACCEPTED' },
			select: { id: true, helperId: true },
		})

		if (data.status === 'DONE' && !acceptedOffer) {
			// Only an accepted helper can be credited with the help and the
			// points, and only an accepted helper can be rated afterwards.
			return NextResponse.json(
				{
					error:
						'Diese Anfrage wurde von niemandem angenommen und kann deshalb nicht abgeschlossen werden.',
				},
				{ status: 409 },
			)
		}

		const updated = await prisma.$transaction(async tx => {
			// Conditional on the status we validated above, so two tabs pressing
			// "Abgeschlossen" at once award the points exactly once.
			const claimed = await tx.request.updateMany({
				where: { id, status: request.status },
				data: { status: data.status },
			})
			if (claimed.count === 0) {
				throw new StatusChangedError()
			}

			// Completing the job is what the helper helped with; awarding it here
			// instead of on the rating means a forgotten rating no longer costs
			// the helper their count and their points.
			if (data.status === 'DONE' && acceptedOffer) {
				await tx.user.update({
					where: { id: acceptedOffer.helperId },
					data: {
						helpCount: { increment: 1 },
						points: { increment: POINTS_PER_HELP },
					},
				})
			}

			// Nobody should keep an accepted offer on a request that is no
			// longer running, or a second one next to the accepted one.
			await tx.offer.updateMany({
				where: { requestId: id, status: 'PENDING' },
				data: { status: 'DECLINED' },
			})
			if (data.status === 'CANCELLED' && acceptedOffer) {
				await tx.offer.update({
					where: { id: acceptedOffer.id },
					data: { status: 'DECLINED' },
				})
			}

			// The points moved here from the rating, so this is the notification
			// that used to be sent when the resident rated.
			if (data.status === 'DONE' && acceptedOffer) {
				await tx.notification.create({
					data: {
						userId: acceptedOffer.helperId,
						title: '🎉 Einsatz abgeschlossen!',
						body: `Die Anfrage "${request.title}" ist abgeschlossen. Du erhältst ${POINTS_PER_HELP} Punkte.`,
						link: `/requests/${id}`,
					},
				})
			}

			return tx.request.findUnique({ where: { id } })
		})

		return NextResponse.json({ data: updated })
	} catch (err) {		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		if (err instanceof StatusChangedError) {
			return NextResponse.json(
				{
					error: 'Der Status dieser Anfrage hat sich gerade geändert. Bitte lade die Seite neu.',
				},
				{ status: 409 },
			)
		}
		return logAndError('[PATCH /api/requests/[id]]', err)
	}
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const { id } = await params
		const request = await prisma.request.findUnique({ where: { id } })
		if (!request)
			return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })

		if (request.seniorId !== session.user.id && session.user.role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'Keine Berechtigung.' },
				{ status: 403 },
			)
		}

		await prisma.request.delete({ where: { id } })
		return NextResponse.json({ message: 'Anfrage gelöscht.' })
	} catch (err) {
		return logAndError('[DELETE /api/requests/[id]]', err)
	}
}
