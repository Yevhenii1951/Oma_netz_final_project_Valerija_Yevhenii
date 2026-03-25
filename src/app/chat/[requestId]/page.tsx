import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ChatRoomClient from './chat-room-client'

interface Props {
	params: Promise<{ requestId: string }>
}

export default async function ChatRoomPage({ params }: Props) {
	const session = await auth()
	if (!session) redirect('/login')

	const { requestId } = await params

	const chat = await prisma.chat.findUnique({
		where: { requestId },
		include: {
			request: {
				select: {
					id: true,
					title: true,
					category: true,
					status: true,
					seniorId: true,
					senior: { select: { id: true, name: true, image: true } },
				},
			},
			messages: {
				orderBy: { createdAt: 'asc' },
				include: {
					sender: { select: { id: true, name: true, image: true } },
				},
			},
		},
	})

	if (!chat) notFound()

	const request = chat.request
	const isParticipant =
		request.seniorId === session.user.id ||
		(await prisma.offer.findFirst({
			where: { requestId, helperId: session.user.id, status: 'ACCEPTED' },
		})) !== null

	if (!isParticipant) redirect('/chat')

	return (
		<ChatRoomClient
			chat={JSON.parse(JSON.stringify(chat))}
			currentUserId={session.user.id}
			currentUserName={session.user.name || 'You'}
		/>
	)
}
