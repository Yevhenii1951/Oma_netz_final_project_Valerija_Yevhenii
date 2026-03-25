import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import RequestDetailClient from './request-detail-client'

interface Props {
	params: Promise<{ id: string }>
}

export default async function RequestDetailPage({ params }: Props) {
	const session = await auth()
	if (!session) redirect('/login')

	const { id } = await params

	const request = await prisma.request.findUnique({
		where: { id },
		include: {
			senior: {
				select: {
					id: true,
					name: true,
					image: true,
					ratingAvg: true,
					role: true,
				},
			},
			offers: {
				include: {
					helper: {
						select: {
							id: true,
							name: true,
							image: true,
							ratingAvg: true,
							helpCount: true,
						},
					},
				},
				orderBy: { createdAt: 'asc' },
			},
			_count: { select: { offers: true } },
			rating: { select: { score: true } },
			chat: {
				select: {
					messages: {
						orderBy: { createdAt: 'desc' },
						take: 5,
						include: {
							sender: { select: { id: true, name: true } },
						},
					},
				},
			},
		},
	})

	if (!request) notFound()

	if (
		(session.user.role === 'SENIOR' || session.user.role === 'RELATIVE') &&
		request.seniorId !== session.user.id
	) {
		redirect('/requests?mine=true')
	}

	const isOwner = session.user.id === request.seniorId
	const isHelper = session.user.id !== request.seniorId
	const isSameRole = request.senior.role === session.user.role
	const hasRating = !!request.rating

	const myOffer = request.offers.find(o => o.helperId === session.user.id)

	return (
		<RequestDetailClient
			request={JSON.parse(JSON.stringify(request))}
			isOwner={isOwner}
			isHelper={isHelper}
			isSameRole={isSameRole}
			myOffer={myOffer ? JSON.parse(JSON.stringify(myOffer)) : null}
			currentUserId={session.user.id}
			userRole={session.user.role}
			hasRating={hasRating}
			chatPreviewMessages={
				request.chat
					? JSON.parse(JSON.stringify(request.chat.messages.reverse()))
					: []
			}
		/>
	)
}
