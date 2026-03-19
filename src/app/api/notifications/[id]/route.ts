import { requireAuth, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/notifications/[id] — mark single notification as read

export async function PATCH(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const { id } = await params

		await prisma.notification.updateMany({
			where: { id, userId: session.user.id },
			data: { read: true },
		})

		return NextResponse.json({ message: 'Gelesen.' })
	} catch (err) {
		return logAndError('[PATCH /api/notifications/[id]]', err)
	}
}
