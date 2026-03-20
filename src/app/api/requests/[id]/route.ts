import { requireAuth, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ─── GET single request ───────────────────────────────────────────────────────

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
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
					include: {
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

		return NextResponse.json({ data: request })
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
