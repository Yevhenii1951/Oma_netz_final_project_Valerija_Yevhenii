import { logAndError, requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import {
	browseForbidden,
	coarsenCoordinates,
	isApprovedHelper,
} from '@/lib/request-access'
import { NextResponse } from 'next/server'

// GET /api/map — open requests for the helper map view

export async function GET() {
	try {
		// Addresses and names of elderly residents are personal data. The
		// /map page is already behind the auth gate in src/proxy.ts, but the
		// API was reachable anonymously and returned home addresses, names and
		// exact coordinates to anyone who asked.
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		// The map is the helper job board. A senior or relative has no use for
		// every open request in Kassel on a map, and it is a directory of where
		// elderly people live, so it stays behind the helper check.
		if (!isApprovedHelper(session.user)) {
			return NextResponse.json(
				{ error: browseForbidden(session.user) },
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

		// Pin positions are rounded to a ~1.1 km grid and the address is left out
		// entirely. The accepted helper gets the real address on the request
		// page, which is where it is needed.
		const data = requests.map(({ lat, lng, ...rest }) => ({
			...rest,
			...coarsenCoordinates(lat as number, lng as number),
		}))

		return NextResponse.json({ data })
	} catch (err) {
		return logAndError('[GET /api/map]', err)
	}
}
