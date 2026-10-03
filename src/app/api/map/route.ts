import { logAndError, requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/map — returns all open requests with coordinates for the map

export async function GET() {
	try {
		// Addresses and names of elderly residents are personal data. The
		// /map page is already behind the auth gate in src/proxy.ts, but the
		// API was reachable anonymously and returned home addresses, names and
		// exact coordinates to anyone who asked.
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		if (
			session.user.role === 'HELPER' &&
			session.user.helperStatus !== 'APPROVED'
		) {
			return NextResponse.json(
				{ error: 'Dein Helfer-Profil wird noch geprüft.' },
				{ status: 403 },
			)
		}

		const requests = await prisma.request.findMany({
			where: {
				status: 'OPEN',
				lat: { not: null },
				lng: { not: null },
			},
			select: {
				id: true,
				title: true,
				category: true,
				address: true,
				lat: true,
				lng: true,
				desiredTime: true,
				createdAt: true,
				senior: {
					select: { id: true, name: true, image: true },
				},
			},
			orderBy: { createdAt: 'desc' },
			take: 200,
		})

		return NextResponse.json({ data: requests })
	} catch (err) {
		return logAndError('[GET /api/map]', err)
	}
}
