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
		},
	})

	if (!request) notFound()

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
		/>
	)
}
