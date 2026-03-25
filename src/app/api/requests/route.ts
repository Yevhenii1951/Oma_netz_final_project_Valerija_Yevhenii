import { requireAuth, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
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
		const { searchParams } = new URL(req.url)
		const category = searchParams.get('category') as string | null
		const status = searchParams.get('status') ?? 'OPEN'
		const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
		const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
		const skip = (page - 1) * limit

		const where: Record<string, unknown> = {}
		if (status !== 'ALL') where.status = status
		if (category) where.category = category

		const [items, total] = await Promise.all([
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
				{ error: 'Nur Hilfesuchende oder Angehörige können Anfragen erstellen.' },
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

		// Notify subscribed helpers via Telegram (fire-and-forget)
		notifyHelpers(request.id, data.category, data.title).catch(console.error)

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

// ─── HELPER: notify Telegram volunteers ──────────────────────────────────────

async function notifyHelpers(
	requestId: string,
	category: string,
	title: string,
) {
	const helpers = await prisma.user.findMany({
		where: {
			role: 'HELPER',
			telegramChatId: { not: null },
			isBanned: false,
		},
		select: { telegramChatId: true },
	})

	const token = process.env.TELEGRAM_BOT_TOKEN
	if (!token || helpers.length === 0) return

	const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
	const text = `🆕 *Neue Anfrage in Kassel!*\n📌 ${title}\n📂 Kategorie: ${category}\n\n👉 [Jetzt ansehen](${appUrl}/requests/${requestId})`

	await Promise.all(
		helpers.map(({ telegramChatId }) =>
			fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chat_id: telegramChatId,
					text,
					parse_mode: 'Markdown',
				}),
			}).catch(() => null),
		),
	)
}
