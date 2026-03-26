import { auth } from '@/auth'
import { PageShell } from '@/components/shell'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminClient from './admin-client'

export const metadata = { title: 'Adminbereich' }

export default async function AdminPage() {
	const session = await auth()
	if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')

	const [
		userCount,
		requestCount,
		offerCount,
		ratingCount,
		openCount,
		doneCount,
		pendingHelpers,
		allHelpersRaw,
		allRequestsRaw,
		allSeniorsRaw,
		allRedemptionsRaw,
	] = await Promise.all([
		prisma.user.count(),
		prisma.request.count(),
		prisma.offer.count(),
		prisma.rating.count(),
		prisma.request.count({ where: { status: 'OPEN' } }),
		prisma.request.count({ where: { status: 'DONE' } }),
		// Helpers awaiting approval
		prisma.user.findMany({
			where: { role: 'HELPER', helperStatus: 'PENDING_REVIEW' },
			orderBy: { createdAt: 'asc' },
			select: {
				id: true,
				name: true,
				email: true,
				employmentType: true,
				institution: true,
				languages: true,
				documentNumber: true,
				registrationAddress: true,
				phone: true,
				plz: true,
				createdAt: true,
			},
		}),
		// All helpers
		prisma.user.findMany({
			where: { role: 'HELPER' },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				email: true,
				isBanned: true,
				helperStatus: true,
				ratingAvg: true,
				helpCount: true,
				points: true,
				employmentType: true,
				languages: true,
				createdAt: true,
			},
		}),
		// All requests
		prisma.request.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				title: true,
				category: true,
				status: true,
				address: true,
				createdAt: true,
				senior: { select: { name: true } },
				_count: { select: { offers: true } },
			},
		}),
		// All seniors + relatives
		prisma.user.findMany({
			where: { role: { in: ['SENIOR', 'RELATIVE'] } },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				email: true,
				isBanned: true,
				role: true,
				phone: true,
				plz: true,
				ratingAvg: true,
				createdAt: true,
				_count: { select: { sentRequests: true } },
			},
		}),
		// All redemptions
		prisma.redemption.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				createdAt: true,
				status: true,
				user: { select: { name: true, email: true } },
				reward: { select: { title: true, pointsCost: true } },
			},
		}),
	])

	const ser = <T extends { createdAt: Date }>(arr: T[]) =>
		arr.map(item => ({ ...item, createdAt: item.createdAt.toISOString() }))

	const initialTab = pendingHelpers.length > 0 ? 'pending' : 'stats'

	return (
		<PageShell title='Adminbereich' hideSidebar>
			<AdminClient
				key={initialTab}
				stats={{
					userCount,
					requestCount,
					offerCount,
					ratingCount,
					openRequests: openCount,
					doneRequests: doneCount,
					pendingHelpers: pendingHelpers.length,
				}}
				pendingHelpers={ser(pendingHelpers)}
				allHelpers={ser(allHelpersRaw)}
				allRequests={ser(allRequestsRaw)}
				allSeniors={allSeniorsRaw.map(u => ({
					...u,
					createdAt: u.createdAt.toISOString(),
				}))}
				redemptions={allRedemptionsRaw.map(r => ({
					...r,
					createdAt: r.createdAt.toISOString(),
				}))}
				initialTab={initialTab}
			/>
		</PageShell>
	)
}
