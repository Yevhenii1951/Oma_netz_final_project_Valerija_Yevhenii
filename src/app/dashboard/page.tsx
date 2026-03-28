import { auth } from '@/auth'
import { PageShell } from '@/components/shell'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import {
	HelperActivitySection,
	HelperStatusBanners,
	OpenRequestsFeedSection,
	OverviewSection,
	QuickAccessSection,
	SeniorActivitySection,
} from './dashboard-sections'
import { getGreeting } from './dashboard-utils'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
	const session = await auth()
	if (!session?.user) redirect('/login')
	if (session.user.role === 'ADMIN') redirect('/admin')

	const userId = session.user.id
	const role = session.user.role

	// Fetch user profile
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			name: true,
			points: true,
			ratingAvg: true,
			helpCount: true,
			helperStatus: true,
			_count: { select: { sentRequests: true, offers: true } },
		},
	})

	// Fetch recent open requests (for display)
	const openRequests = await prisma.request.findMany({
		where: { status: 'OPEN' },
		orderBy: { createdAt: 'desc' },
		take: 5,
		include: {
			senior: { select: { id: true, name: true, image: true, role: true } },
			_count: { select: { offers: true } },
		},
	})

	const openRequestsCount = await prisma.request.count({
		where: { status: 'OPEN' },
	})

	// Fetch user's own requests (if senior/relative)
	const myRequests =
		role !== 'HELPER'
			? await prisma.request.findMany({
					where: { seniorId: userId },
					orderBy: { createdAt: 'desc' },
					take: 3,
					include: {
						_count: { select: { offers: true } },
						offers: {
							where: { status: 'ACCEPTED' },
							take: 1,
							select: { helper: { select: { name: true } } },
						},
					},
				})
			: []

	// Fetch accepted offers for helper
	const myActivity =
		role === 'HELPER'
			? await prisma.offer.findMany({
					where: { helperId: userId, status: 'ACCEPTED' },
					orderBy: { createdAt: 'desc' },
					take: 3,
					include: {
						request: {
							select: {
								id: true,
								title: true,
								category: true,
								status: true,
								address: true,
								desiredTime: true,
							},
						},
					},
				})
			: []

	// Count completed requests for senior/relative
	const doneCount =
		role !== 'HELPER'
			? await prisma.request.count({
					where: { seniorId: userId, status: 'DONE' },
				})
			: 0

	const isHelper = role === 'HELPER'
	const greeting = getGreeting()
	const unreadNotifications = await prisma.notification.count({
		where: { userId, read: false },
	})

	// Fetch recent unread notifications (for alert banners)
	// eslint-disable-next-line react-hooks/purity
	const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
	const recentAlerts = await prisma.notification.findMany({
		where: {
			userId: userId,
			read: false,
			createdAt: { gte: weekAgo },
		},
		orderBy: { createdAt: 'desc' },
		take: 5,
	})

	return (
		<PageShell title='Dashboard'>
			<div className='max-w-4xl mx-auto px-4 py-8'>
				<HelperStatusBanners
					isHelper={isHelper}
					helperStatus={user?.helperStatus}
				/>
				<OverviewSection
					isHelper={isHelper}
					greeting={greeting}
					firstName={user?.name?.split(' ')[0] ?? 'Willkommen'}
					unreadNotifications={unreadNotifications}
					sentRequestsCount={user?._count.sentRequests ?? 0}
					openRequestsCount={openRequestsCount}
					doneCount={doneCount}
					helpCount={user?.helpCount ?? 0}
					ratingAvg={user?.ratingAvg ?? 0}
					points={user?.points ?? 0}
					recentAlerts={recentAlerts}
				/>
				<QuickAccessSection isHelper={isHelper} points={user?.points ?? 0} />
				<HelperActivitySection isHelper={isHelper} myActivity={myActivity} />
				<SeniorActivitySection isHelper={isHelper} myRequests={myRequests} />
				<OpenRequestsFeedSection
					isHelper={isHelper}
					helperStatus={user?.helperStatus}
					openRequests={openRequests}
				/>
			</div>

			{/* Floating AI Assistant */}
		</PageShell>
	)
}
