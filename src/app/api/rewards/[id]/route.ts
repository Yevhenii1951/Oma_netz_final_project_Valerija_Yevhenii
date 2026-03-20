import { requireAdmin, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// PATCH /api/rewards/[id] — admin marks redemption as fulfilled
export async function PATCH(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAdmin()
		if (session instanceof NextResponse) return session

		const { id } = await params

		const redemption = await prisma.redemption.findUnique({ where: { id } })
		if (!redemption) {
			return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })
		}

		await prisma.redemption.update({
			where: { id },
			data: { status: 'fulfilled' },
		})

		return NextResponse.json({ message: 'Als erledigt markiert.' })
	} catch (err) {
		return logAndError('[PATCH /api/rewards/[id]]', err)
	}
}
