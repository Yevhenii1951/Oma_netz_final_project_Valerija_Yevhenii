import { logAndError, requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { redactRequest, requestVisibility } from '@/lib/request-access'
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

const patchSchema = z.object({
	status: z.enum(['CANCELLED', 'DONE']).optional(),
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

		const request = await prisma.request.findUnique({ where: { id } })
		if (!request)
			return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })

		// Only the author (or admin) can update
		if (request.seniorId !== session.user.id && session.user.role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'Keine Berechtigung.' },
				{ status: 403 },
			)
		}

		const updated = await prisma.request.update({
			where: { id },
			data: { status: data.status },
		})

		return NextResponse.json({ data: updated })
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
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
