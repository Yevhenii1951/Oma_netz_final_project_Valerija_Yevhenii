import { requireAuth, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { POINTS_PER_HELP } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ratingSchema = z.object({
	requestId: z.string(),
	score: z.number().int().min(1).max(5),
	comment: z.string().max(500).optional(),
})

// ─── POST: submit a rating after completed help ───────────────────────────────

export async function POST(req: NextRequest) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const body = await req.json()
		const data = ratingSchema.parse(body)

		// Fetch the request and find the accepted helper
		const request = await prisma.request.findUnique({
			where: { id: data.requestId },
			include: {
				offers: { where: { status: 'ACCEPTED' }, select: { helperId: true } },
				rating: true,
			},
		})

		if (!request)
			return NextResponse.json(
				{ error: 'Anfrage nicht gefunden.' },
				{ status: 404 },
			)
		if (request.status !== 'DONE') {
			return NextResponse.json(
				{ error: 'Anfrage ist noch nicht abgeschlossen.' },
				{ status: 400 },
			)
		}
		if (request.seniorId !== session.user.id) {
			return NextResponse.json(
				{ error: 'Keine Berechtigung.' },
				{ status: 403 },
			)
		}
		if (request.rating) {
			return NextResponse.json({ error: 'Bereits bewertet.' }, { status: 409 })
		}

		const helperId = request.offers[0]?.helperId
		if (!helperId)
			return NextResponse.json(
				{ error: 'Kein Helfer gefunden.' },
				{ status: 400 },
			)

		// Create rating and update helper stats in one transaction
		await prisma.$transaction(async tx => {
			// Create rating record
			await tx.rating.create({
				data: {
					requestId: data.requestId,
					score: data.score,
					comment: data.comment,
					authorId: session.user.id,
					helperId,
				},
			})

			// Recalculate helper's average rating
			const allRatings = await tx.rating.findMany({
				where: { helperId },
				select: { score: true },
			})

			const avgRating =
				allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length

			// Update helper: rating, helpCount, points
			await tx.user.update({
				where: { id: helperId },
				data: {
					ratingAvg: Math.round(avgRating * 10) / 10,
					helpCount: { increment: 1 },
					points: { increment: POINTS_PER_HELP },
				},
			})
		})

		// Notify helper about the new rating
		const stars = '⭐'.repeat(data.score)
		await prisma.notification
			.create({
				data: {
					userId: helperId,
					title: `${stars} Neue Bewertung erhalten!`,
					body: `${session.user.name ?? 'Jemand'} hat dir ${data.score} Stern${data.score !== 1 ? 'e' : ''} gegeben. Du erhältst ${POINTS_PER_HELP} Punkte! 🎉`,
					link: `/requests/${data.requestId}`,
				},
			})
			.catch(() => {
				/* non-critical, ignore notification errors */
			})

		return NextResponse.json(
			{ message: 'Bewertung gespeichert!' },
			{ status: 201 },
		)
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		return logAndError('[POST /api/ratings]', err)
	}
}
