import { requireAuth, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { geocodeAddress } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
	name: z.string().min(2).optional(),
	phone: z.string().optional(),
	bio: z.string().max(300).optional(),
	address: z.string().optional(),
	plz: z.string().optional(),
	preferredCategories: z
		.array(
			z.enum([
				'EINKAUF',
				'ARZT',
				'SPAZIERGANG',
				'TECHNIK',
				'TRANSPORT',
				'HAUSHALT',
				'ANDERES',
			]),
		)
		.optional(),
})

// ─── GET: current user's profile ─────────────────────────────────────────────

export async function GET() {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
				phone: true,
				bio: true,
				address: true,
				city: true,
				plz: true,
				lat: true,
				lng: true,
				ratingAvg: true,
				helpCount: true,
				points: true,
				preferredCategories: true,
				createdAt: true,
				isBanned: true,
				_count: {
					select: { sentRequests: true, offers: true, ratingsReceived: true },
				},
			},
		})

		if (!user)
			return NextResponse.json(
				{ error: 'Nutzer nicht gefunden.' },
				{ status: 404 },
			)
		return NextResponse.json({ data: user })
	} catch (err) {
		return logAndError('[GET /api/profile]', err)
	}
}

// ─── PATCH: update profile ────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const body = await req.json()
		const data = updateProfileSchema.parse(body)

		// Geocode new address if provided
		let coords: { lat: number; lng: number } | null = null
		if (data.address) {
			coords = await geocodeAddress(data.address, 'Kassel')
		}

		const updated = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				...data,
				...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
			},
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
				phone: true,
				bio: true,
				address: true,
				plz: true,
				ratingAvg: true,
				helpCount: true,
				points: true,
				preferredCategories: true,
			},
		})

		return NextResponse.json({ data: updated, message: 'Profil aktualisiert!' })
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		return logAndError('[PATCH /api/profile]', err)
	}
}
