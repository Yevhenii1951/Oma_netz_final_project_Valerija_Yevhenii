import { requireAuth, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/notifications — returns user's recent notifications

export async function GET() {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const notifications = await prisma.notification.findMany({
			where: { userId: session.user.id },
			orderBy: { createdAt: 'desc' },
			take: 30,
		})

		return NextResponse.json({ data: notifications })
	} catch (err) {
		return logAndError('[GET /api/notifications]', err)
	}
}

// PATCH /api/notifications — mark all as read

export async function PATCH() {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		await prisma.notification.updateMany({
			where: { userId: session.user.id, read: false },
			data: { read: true },
		})

		return NextResponse.json({ message: 'Alle als gelesen markiert.' })
	} catch (err) {
		return logAndError('[PATCH /api/notifications]', err)
	}
}
