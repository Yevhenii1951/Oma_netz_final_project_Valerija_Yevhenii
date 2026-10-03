import { logAndError, requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
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

		// Create the rating and refresh the helper's average, in one transaction
		await prisma.$transaction(async tx => {
			await tx.rating.create({
				data: {
					requestId: data.requestId,
					score: data.score,
					comment: data.comment,
					authorId: session.user.id,
					helperId,
				},
			})

			// Averaged in SQL rather than by loading every row into memory, and
			// stored unrounded: rounding to one decimal here meant the number the
			// residents saw was not the mean of the scores they gave.
			const aggregate = await tx.rating.aggregate({
				where: { helperId },
				_avg: { score: true },
			})

			// helpCount and the points are awarded when the request is completed,
			// not here, so a rating can no longer change how often a helper is
			// counted as having helped.
			await tx.user.update({
				where: { id: helperId },
				data: { ratingAvg: aggregate._avg.score ?? 0 },
			})
		})

		// Notify helper about the new rating
		const stars = '⭐'.repeat(data.score)
		await prisma.notification
			.create({
				data: {
					userId: helperId,
					title: `${stars} Neue Bewertung erhalten!`,
					body: `${session.user.name ?? 'Jemand'} hat dir ${data.score} Stern${data.score !== 1 ? 'e' : ''} gegeben.${data.comment?.trim() ? ` Feedback: "${data.comment.trim()}".` : ''}`,
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
