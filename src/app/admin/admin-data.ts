import { prisma } from '@/lib/prisma'
import {
	buildHelperQuery,
	buildPendingQuery,
	buildRedemptionQuery,
	buildRequestQuery,
	buildSeniorQuery,
	PENDING_STATUS_OPTIONS,
	SENIOR_STATUS_OPTIONS,
	type AdminTableParams,
} from './admin-table-query'
import type { AdminTableData } from './components/admin-data-table-types'

const PENDING_SELECT = {
	id: true,
	name: true,
	email: true,
	institution: true,
	languages: true,
	phone: true,
	createdAt: true,
} as const

const HELPER_SELECT = {
	id: true,
	name: true,
	email: true,
	isBanned: true,
	helperStatus: true,
	ratingAvg: true,
	helpCount: true,
	points: true,
	languages: true,
	createdAt: true,
} as const

const SENIOR_SELECT = {
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
} as const

const REQUEST_SELECT = {
	id: true,
	title: true,
	category: true,
	status: true,
	address: true,
	createdAt: true,
	senior: { select: { name: true } },
	_count: { select: { offers: true } },
} as const

const REDEMPTION_SELECT = {
	id: true,
	createdAt: true,
	status: true,
	user: { select: { name: true, email: true } },
	reward: { select: { title: true, pointsCost: true } },
} as const

function iso<T extends { createdAt: Date }>(row: T) {
	return { ...row, createdAt: row.createdAt.toISOString() }
}

function paging(total: number, params: AdminTableParams) {
	const totalPages = Math.max(1, Math.ceil(total / params.pageSize))
	// A page past the end (deleted rows, a narrowed filter) would render an
	// empty table with no way back, so it is clamped to the last real page.
	const page = Math.min(params.page, totalPages)
	return { total, totalPages, page, pageSize: params.pageSize }
}

async function distinctStatuses(
	model: 'user' | 'request' | 'redemption',
): Promise<string[]> {
	if (model === 'user') {
		const groups = await prisma.user.groupBy({
			by: ['helperStatus'],
			where: { role: 'HELPER', deletedAt: null },
		})
		return ['ALL', ...groups.map(g => g.helperStatus)]
	}
	if (model === 'request') {
		const groups = await prisma.request.groupBy({ by: ['status'] })
		return ['ALL', ...groups.map(g => g.status)]
	}
	const groups = await prisma.redemption.groupBy({ by: ['status'] })
	return ['ALL', ...groups.map(g => g.status)]
}

/**
 * Filtering, sorting and slicing happen here rather than in the browser: the
 * admin tables are unbounded in principle, so sending every row and paging
 * client-side made the page grow with the database instead of with the page
 * size.
 */
export async function getAdminTable(
	params: AdminTableParams,
): Promise<AdminTableData> {
	const { tab, pageSize } = params
	const skip = (params.page - 1) * pageSize

	if (tab === 'pending') {
		const { where, orderBy } = buildPendingQuery(params)
		const [rows, total] = await prisma.$transaction([
			prisma.user.findMany({
				where,
				orderBy,
				select: PENDING_SELECT,
				skip,
				take: pageSize,
			}),
			prisma.user.count({ where }),
		])
		return {
			tab,
			rows: rows.map(iso),
			statusOptions: PENDING_STATUS_OPTIONS,
			...paging(total, params),
		}
	}

	if (tab === 'helpers') {
		const { where, orderBy } = buildHelperQuery(params)
		const [rows, total] = await prisma.$transaction([
			prisma.user.findMany({
				where,
				orderBy,
				select: HELPER_SELECT,
				skip,
				take: pageSize,
			}),
			prisma.user.count({ where }),
		])
		return {
			tab,
			rows: rows.map(iso),
			statusOptions: await distinctStatuses('user'),
			...paging(total, params),
		}
	}

	if (tab === 'seniors') {
		const { where, orderBy } = buildSeniorQuery(params)
		const [rows, total] = await prisma.$transaction([
			prisma.user.findMany({
				where,
				orderBy,
				select: SENIOR_SELECT,
				skip,
				take: pageSize,
			}),
			prisma.user.count({ where }),
		])
		return {
			tab,
			rows: rows.map(iso),
			statusOptions: SENIOR_STATUS_OPTIONS,
			...paging(total, params),
		}
	}

	if (tab === 'requests') {
		const { where, orderBy } = buildRequestQuery(params)
		const [rows, total] = await prisma.$transaction([
			prisma.request.findMany({
				where,
				orderBy,
				select: REQUEST_SELECT,
				skip,
				take: pageSize,
			}),
			prisma.request.count({ where }),
		])
		return {
			tab,
			rows: rows.map(iso),
			statusOptions: await distinctStatuses('request'),
			...paging(total, params),
		}
	}

	if (tab === 'redemptions') {
		const { where, orderBy } = buildRedemptionQuery(params)
		const [rows, total] = await prisma.$transaction([
			prisma.redemption.findMany({
				where,
				orderBy,
				select: REDEMPTION_SELECT,
				skip,
				take: pageSize,
			}),
			prisma.redemption.count({ where }),
		])
		return {
			tab,
			rows: rows.map(iso),
			statusOptions: await distinctStatuses('redemption'),
			...paging(total, params),
		}
	}

	return {
		tab: 'stats',
		rows: [],
		total: 0,
		totalPages: 1,
		page: 1,
		pageSize,
		statusOptions: ['ALL'],
	}
}
