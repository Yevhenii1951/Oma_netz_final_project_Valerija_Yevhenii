import { prisma } from '@/lib/prisma'
import { logAndError } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'

// GET /api/map — returns all open requests with coordinates for the map

export async function GET() {
	try {
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
