import { logAndError, requireAdmin } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
	action: z.enum(['BAN', 'UNBAN']),
	reason: z.string().max(300).optional(),
})

// PATCH /api/admin/users/[id] — ban or unban a user
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAdmin()
		if (session instanceof NextResponse) return session

		const { id } = await params
		const body = await req.json()
		const { action, reason } = schema.parse(body)

		const target = await prisma.user.findUnique({
			where: { id },
			select: { id: true, role: true, isBanned: true },
		})

		if (!target) {
			return NextResponse.json(
				{ error: 'Nutzer nicht gefunden.' },
				{ status: 404 },
			)
		}

		if (target.role === 'ADMIN') {
			return NextResponse.json(
				{ error: 'Admin-Konten können hier nicht gebannt werden.' },
				{ status: 403 },
			)
		}

		if (session.user.id === id) {
			return NextResponse.json(
				{ error: 'Du kannst dein eigenes Konto nicht sperren.' },
				{ status: 400 },
			)
		}

		const isBanned = action === 'BAN'
		if (target.isBanned === isBanned) {
			return NextResponse.json({
				message: isBanned ? 'Bereits gebannt.' : 'Bereits aktiv.',
			})
		}

		const user = await prisma.user.update({
			where: { id },
			data: { isBanned },
			select: { id: true, name: true, email: true, role: true, isBanned: true },
		})

		await prisma.notification
			.create({
				data: {
					userId: id,
					title: isBanned ? '⛔ Konto gesperrt' : '✅ Konto entsperrt',
					body: isBanned
						? `Dein Konto wurde vom Admin gesperrt.${reason ? ` Grund: ${reason}` : ''}`
						: 'Dein Konto wurde wieder freigeschaltet. Du kannst dich erneut anmelden.',
					link: '/login',
				},
			})
			.catch(() => null)

		return NextResponse.json({
			data: user,
			message: isBanned ? 'Nutzer wurde gebannt.' : 'Nutzer wurde entbannt.',
		})
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		return logAndError('[Admin/Users PATCH]', err)
	}
}

// DELETE /api/admin/users/[id] — delete a user (minimal MVP)
export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAdmin()
		if (session instanceof NextResponse) return session

		const { id } = await params

		const target = await prisma.user.findUnique({
			where: { id },
			select: { id: true, role: true },
		})

		if (!target) {
			return NextResponse.json(
				{ error: 'Nutzer nicht gefunden.' },
				{ status: 404 },
			)
		}

		if (session.user.id === id) {
			return NextResponse.json(
				{ error: 'Du kannst dein eigenes Konto nicht löschen.' },
				{ status: 400 },
			)
		}

		if (target.role === 'ADMIN') {
			return NextResponse.json(
				{ error: 'Admin-Konten können hier nicht gelöscht werden.' },
				{ status: 403 },
			)
		}

		await prisma.user.delete({ where: { id } })

		return NextResponse.json({ message: 'Nutzer wurde gelöscht.' })
	} catch (err) {
		const code = (err as { code?: string })?.code
		if (code === 'P2003') {
			return NextResponse.json(
				{
					error:
						'Nutzer kann nicht gelöscht werden, da verknüpfte Daten existieren.',
				},
				{ status: 409 },
			)
		}
		return logAndError('[Admin/Users DELETE]', err)
	}
}
