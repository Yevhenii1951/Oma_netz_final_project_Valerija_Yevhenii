import { requireAuth, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { getPusherServer } from '@/lib/pusher-server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ─── GET: load messages for a chat ───────────────────────────────────────────

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ requestId: string }> },
) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const { requestId } = await params

		const chat = await prisma.chat.findUnique({
			where: { requestId },
			include: {
				messages: {
					include: {
						sender: { select: { id: true, name: true, image: true } },
					},
					orderBy: { createdAt: 'asc' },
				},
				request: {
					select: {
						seniorId: true,
						offers: {
							where: { status: 'ACCEPTED' },
							select: { helperId: true },
						},
					},
				},
			},
		})

		if (!chat)
			return NextResponse.json(
				{ error: 'Chat nicht gefunden.' },
				{ status: 404 },
			)

		// Verify access: only senior and accepted helper
		const helperId = chat.request.offers[0]?.helperId
		const isParticipant =
			chat.request.seniorId === session.user.id ||
			helperId === session.user.id ||
			session.user.role === 'ADMIN'

		if (!isParticipant) {
			return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
		}

		return NextResponse.json({ data: chat })
	} catch (err) {
		return logAndError('[GET /api/chat/[requestId]/messages]', err)
	}
}

// ─── POST: send a message ─────────────────────────────────────────────────────

const messageSchema = z.object({ content: z.string().min(1).max(2000) })

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ requestId: string }> },
) {
	try {
		const session = await requireAuth()
		if (session instanceof NextResponse) return session

		const { requestId } = await params
		const body = await req.json()
		const { content } = messageSchema.parse(body)

		const chat = await prisma.chat.findUnique({
			where: { requestId },
			include: {
				request: {
					select: {
						seniorId: true,
						offers: {
							where: { status: 'ACCEPTED' },
							select: { helperId: true },
						},
					},
				},
			},
		})

		if (!chat)
			return NextResponse.json(
				{ error: 'Chat nicht gefunden.' },
				{ status: 404 },
			)

		const helperId = chat.request.offers[0]?.helperId
		const isParticipant =
			chat.request.seniorId === session.user.id || helperId === session.user.id
		if (!isParticipant)
			return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })

		const message = await prisma.message.create({
			data: { content, chatId: chat.id, senderId: session.user.id },
			include: { sender: { select: { id: true, name: true, image: true } } },
		})

		// Push message to chat channel (use requestId so client can subscribe without knowing chat.id)
		const pusher = getPusherServer()
		await pusher
			?.trigger(`chat-${requestId}`, 'new-message', message)
			?.catch(() => null)

		// Notify the other party
		const otherId =
			session.user.id === chat.request.seniorId
				? helperId
				: chat.request.seniorId
		if (otherId) {
			await pusher
				?.trigger(`user-${otherId}`, 'chat-notification', {
					requestId,
					senderName: session.user.name,
					preview: content.slice(0, 60),
				})
				?.catch(() => null)
		}

		return NextResponse.json({ data: message }, { status: 201 })
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		return logAndError('[POST /api/chat/[requestId]/messages]', err)
	}
}
