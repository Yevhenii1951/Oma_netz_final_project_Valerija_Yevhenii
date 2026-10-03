import { prisma } from '@/lib/prisma'
import type {
	AdminStats,
	PendingHelperRow,
	RedemptionRow,
	RequestRow,
} from './admin-client-data'

/**
 * The activity feed merges the three most recent source rows and keeps the
 * six newest overall, so a row can only reach the feed if it is among the
 * six newest of its own kind. Six per source is therefore exact, not an
 * approximation, and the admin page stops depending on the full tables.
 */
const PER_SOURCE = 6

export interface AdminOverview {
	stats: AdminStats
	helperCount: number
	pendingRedemptions: number
	latestRequests: RequestRow[]
	activityHelpers: PendingHelperRow[]
	activityRedemptions: RedemptionRow[]
}

export async function getAdminOverview(): Promise<AdminOverview> {
	const [
		userCount,
		requestCount,
		offerCount,
		ratingCount,
		openRequests,
		doneRequests,
		pendingHelpers,
		helperCount,
		pendingRedemptions,
		latestRequests,
		activityHelpers,
		activityRedemptions,
	] = await Promise.all([
		prisma.user.count({ where: { deletedAt: null } }),
		prisma.request.count(),
		prisma.offer.count(),
		prisma.rating.count(),
		prisma.request.count({ where: { status: 'OPEN' } }),
		prisma.request.count({ where: { status: 'DONE' } }),
		prisma.user.count({
			where: { role: 'HELPER', helperStatus: 'PENDING_REVIEW', deletedAt: null },
		}),
		prisma.user.count({ where: { role: 'HELPER', deletedAt: null } }),
		prisma.redemption.count({ where: { status: 'pending' } }),
		prisma.request.findMany({
			orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
			take: 4,
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
		prisma.user.findMany({
			where: { role: 'HELPER', helperStatus: 'PENDING_REVIEW', deletedAt: null },
			orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
			take: PER_SOURCE,
			select: { id: true, name: true, email: true, createdAt: true },
		}),
		prisma.redemption.findMany({
			orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
			take: PER_SOURCE,
			select: {
				id: true,
				createdAt: true,
				status: true,
				user: { select: { name: true, email: true } },
				reward: { select: { title: true, pointsCost: true } },
			},
		}),
	])

	return {
		stats: {
			userCount,
			requestCount,
			offerCount,
			ratingCount,
			openRequests,
			doneRequests,
			pendingHelpers,
		},
		helperCount,
		pendingRedemptions,
		latestRequests: latestRequests.map(r => ({
			...r,
			createdAt: r.createdAt.toISOString(),
		})),
		activityHelpers: activityHelpers.map(h => ({
			...h,
			createdAt: h.createdAt.toISOString(),
		})),
		activityRedemptions: activityRedemptions.map(r => ({
			...r,
			createdAt: r.createdAt.toISOString(),
		})),
	}
}
