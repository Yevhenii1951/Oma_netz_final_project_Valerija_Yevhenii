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

// DELETE /api/admin/users/[id] — soft delete a user
//
// The row is kept on purpose. A deleted helper still appears in the requests
// and ratings they took part in, and the FKs on ratings are RESTRICT, so a hard
// delete either destroys that history or fails outright. Clearing deletedAt
// reverses it.
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
			select: { id: true, role: true, deletedAt: true },
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

		if (target.deletedAt) {
			return NextResponse.json({ message: 'Nutzer ist bereits gelöscht.' })
		}

		await prisma.$transaction([
			prisma.user.update({
				where: { id },
				data: { deletedAt: new Date() },
				select: { id: true, name: true, email: true },
			}),
			// A JWT session survives a database write, so the tokens are dropped
			// explicitly. The jwt callback also rejects the next request; this
			// makes the revocation immediate rather than eventual.
			prisma.session.deleteMany({ where: { userId: id } }),
		])

		await prisma.notification
			.create({
				data: {
					userId: id,
					title: 'Konto gelöscht',
					body: 'Dein Konto wurde vom Admin deaktiviert. Deine Daten wurden nicht vernichtet.',
					link: '/login',
				},
			})
			.catch(() => null)

		return NextResponse.json({ message: 'Nutzer wurde deaktiviert.' })
	} catch (err) {
		return logAndError('[Admin/Users DELETE]', err)
	}
}
