import { logAndError, requireAdmin } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
	action: z.enum(['APPROVE', 'REJECT']),
	note: z.string().optional(), // optional admin note/reason
})

// PATCH /api/admin/helpers/[id]  — approve or reject a helper
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAdmin()
		if (session instanceof NextResponse) return session

		const { id } = await params
		const body = await req.json()
		const { action, note } = schema.parse(body)

		const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'

		const user = await prisma.user.update({
			where: { id },
			data: { helperStatus: newStatus },
			select: { id: true, name: true, email: true, helperStatus: true },
		})
		const matchToken = user.name ?? user.email ?? user.id

		// Mark related admin notification as read for the admin who handled this registration
		await prisma.notification.updateMany({
			where: {
				userId: session.user.id,
				read: false,
				link: '/admin',
				title: { startsWith: '👤 Neue Registrierung:' },
				body: { contains: matchToken },
			},
			data: { read: true },
		})

		// Create notification for the helper
		await prisma.notification.create({
			data: {
				userId: id,
				title:
					action === 'APPROVE'
						? '✅ Profil freigegeben!'
						: '❌ Profil abgelehnt',
				body:
					action === 'APPROVE'
						? 'Dein Helfer-Profil wurde vom Admin geprüft und freigegeben. Du kannst jetzt Anfragen annehmen!'
						: `Dein Profil wurde leider abgelehnt.${note ? ' Grund: ' + note : ''} Bitte wende dich an das OMA-NETZ Team.`,
			},
		})

		return NextResponse.json({
			data: user,
			message: `Helfer ${action === 'APPROVE' ? 'freigegeben' : 'abgelehnt'}.`,
		})
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		return logAndError('[Admin/Helpers PATCH]', err)
	}
}
