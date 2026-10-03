import { logAndError, requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import {
	browseForbidden,
	isApprovedHelper,
	redactRequest,
} from '@/lib/request-access'
import { geocodeAddress } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createRequestSchema = z.object({
	title: z.string().min(5, 'Titel zu kurz').max(100),
	description: z.string().min(10, 'Beschreibung zu kurz').max(1000),
	category: z.enum([
		'EINKAUF',
		'ARZT',
		'SPAZIERGANG',
		'TECHNIK',
		'TRANSPORT',
		'HAUSHALT',
		'ANDERES',
	]),
	address: z.string().min(3),
	plz: z.string().optional(),
	desiredTime: z.string().optional(),
})

// ─── GET: list open requests (with filter/pagination) ────────────────────────

export async function GET(req: NextRequest) {
	try {
		// This list exposes the title, description, author and home address of
		// residents looking for help. src/proxy.ts does not cover /api, so the
		// endpoint had no gate at all, and `?status=ALL` let any caller read
		// requests that were already finished or cancelled.
		const session = await requireAuth()
		if (session instanceof NextResponse) return session
		if (!isApprovedHelper(session.user)) {
			return NextResponse.json(
				{ error: browseForbidden(session.user) },
				{ status: 403 },
			)
		}

		const { searchParams } = new URL(req.url)
		const category = searchParams.get('category') as string | null
		const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
		const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
		const skip = (page - 1) * limit

		// The status is fixed rather than read from the query string: this is a
		// job board for open requests, and closed ones are not anyone's business.
		const where: Record<string, unknown> = { status: 'OPEN' }
		if (category) where.category = category

		const [rows, total] = await Promise.all([
			prisma.request.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
				include: {
					senior: {
						select: { id: true, name: true, image: true, ratingAvg: true },
					},
					_count: { select: { offers: true } },
				},
			}),
			prisma.request.count({ where }),
		])

		// Browsing is a summary view: no address, no postcode, no coordinates.
		const items = rows.map(redactRequest)

		return NextResponse.json({
			data: { items, total, page, limit, hasMore: skip + items.length < total },
		})
	} catch (err) {
		return logAndError('[GET /api/requests]', err)
	}
}

// ─── POST: create new request ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session
		if (session.user.role === 'HELPER' || session.user.role === 'ADMIN') {
			return NextResponse.json(
				{
					error: 'Nur Hilfesuchende oder Angehörige können Anfragen erstellen.',
				},
				{ status: 403 },
			)
		}

		const body = await req.json()
		const data = createRequestSchema.parse(body)

		// Geocode the address
		const coords = await geocodeAddress(data.address, 'Kassel')

		const request = await prisma.request.create({
			data: {
				title: data.title,
				description: data.description,
				category: data.category,
				address: data.address,
				plz: data.plz,
				lat: coords?.lat,
				lng: coords?.lng,
				desiredTime: data.desiredTime,
				seniorId: session.user.id,
			},
		})

		return NextResponse.json(
			{ data: request, message: 'Anfrage erstellt!' },
			{ status: 201 },
		)
	} catch (err) {
		if (err instanceof z.ZodError) {
			console.error('[POST /api/requests] Validation:', err.issues)
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		return logAndError('[POST /api/requests]', err)
	}
}
