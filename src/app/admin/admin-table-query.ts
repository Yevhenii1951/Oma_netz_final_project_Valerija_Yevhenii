import {
	RequestCategory,
	type HelperStatus,
	type Prisma,
	type RequestStatus,
} from '@prisma/client'
import type { AdminTab } from '@/app/admin/components/admin-ui'

export const DEFAULT_PAGE_SIZE = 8
const MAX_PAGE_SIZE = 100

export type SortDirection = 'asc' | 'desc'

export interface AdminTableParams {
	tab: AdminTab
	q: string
	status: string
	sort: string
	dir: SortDirection
	page: number
	pageSize: number
}

type RawParams = Record<string, string | string[] | undefined>

const TABLE_TABS: AdminTab[] = [
	'pending',
	'helpers',
	'seniors',
	'requests',
	'redemptions',
]

function firstValue(value: string | string[] | undefined): string | undefined {
	if (Array.isArray(value)) return value[0]
	return value
}

function toPositiveInt(raw: string | undefined, fallback: number): number {
	const parsed = Number.parseInt(raw ?? '', 10)
	if (!Number.isFinite(parsed) || parsed < 1) return fallback
	return parsed
}

/**
 * These values come from the URL, so nothing here is trusted: an unknown tab
 * falls back, and page and pageSize are clamped before they reach Prisma.
 */
export function parseAdminTableParams(
	searchParams: RawParams,
	fallbackTab: AdminTab,
): AdminTableParams {
	const rawTab = firstValue(searchParams.tab)
	const tab: AdminTab = TABLE_TABS.includes(rawTab as AdminTab)
		? (rawTab as AdminTab)
		: rawTab === 'stats'
			? 'stats'
			: fallbackTab

	return {
		tab,
		q: (firstValue(searchParams.q) ?? '').trim().slice(0, 100),
		status: (firstValue(searchParams.status) ?? 'ALL').slice(0, 40),
		sort: (firstValue(searchParams.sort) ?? '').slice(0, 40),
		dir: firstValue(searchParams.dir) === 'asc' ? 'asc' : 'desc',
		page: toPositiveInt(firstValue(searchParams.page), 1),
		pageSize: Math.min(
			toPositiveInt(firstValue(searchParams.size), DEFAULT_PAGE_SIZE),
			MAX_PAGE_SIZE,
		),
	}
}

function insensitive(term: string): { contains: string; mode: 'insensitive' } {
	return { contains: term, mode: 'insensitive' }
}

/**
 * Trimming here as well as in the parser keeps a whitespace-only term from
 * becoming a filter that matches nothing.
 */
function searchTerm(raw: string): string {
	return raw.trim()
}

type UserSortField =
	| 'name'
	| 'email'
	| 'createdAt'
	| 'ratingAvg'
	| 'helpCount'
	| 'points'
	| 'isBanned'

/**
 * The id tiebreaker keeps pagination stable. Without it Postgres may return
 * equal sort keys in a different order per query, so a row can repeat on one
 * page and go missing on the next.
 */
function userOrder(
	field: UserSortField,
	dir: Prisma.SortOrder,
): Prisma.UserOrderByWithRelationInput[] {
	return [{ [field]: dir }, { id: 'asc' }]
}

const HELPER_SORTS = new Set<UserSortField>([
	'name',
	'email',
	'ratingAvg',
	'helpCount',
	'points',
	'isBanned',
	'createdAt',
])

export interface UserTableQuery {
	where: Prisma.UserWhereInput
	orderBy: Prisma.UserOrderByWithRelationInput[]
}

export function buildPendingQuery({
	q,
	sort,
	dir,
}: AdminTableParams): UserTableQuery {
	const term = searchTerm(q)
	return {
		where: {
			role: 'HELPER',
			helperStatus: 'PENDING_REVIEW',
			deletedAt: null,
			...(term.length > 0 && {
				OR: [
					{ name: insensitive(term) },
					{ email: insensitive(term) },
					{ institution: insensitive(term) },
					{ phone: insensitive(term) },
					{ languages: { has: term } },
				],
			}),
		},
		orderBy: userOrder(sort === 'name' ? 'name' : 'createdAt', sort === 'name' ? dir : 'asc'),
	}
}

export function buildHelperQuery({
	q,
	status,
	sort,
	dir,
}: AdminTableParams): UserTableQuery {
	const term = searchTerm(q)
	const field = HELPER_SORTS.has(sort as UserSortField)
		? (sort as UserSortField)
		: 'createdAt'
	return {
		where: {
			role: 'HELPER',
			deletedAt: null,
			...(status !== 'ALL' && {
				helperStatus: status as HelperStatus,
			}),
			...(term.length > 0 && {
				OR: [
					{ name: insensitive(term) },
					{ email: insensitive(term) },
					{ languages: { has: term } },
				],
			}),
		},
		orderBy: userOrder(field, dir),
	}
}

const SENIOR_SORTS = new Set(['name', 'email', 'ratingAvg', 'createdAt'])

export function buildSeniorQuery({
	q,
	status,
	sort,
	dir,
}: AdminTableParams): UserTableQuery {
	const term = searchTerm(q)
	return {
		where: {
			role: { in: ['SENIOR', 'RELATIVE'] },
			deletedAt: null,
			...(status === 'ACTIVE' && { isBanned: false }),
			...(status === 'BANNED' && { isBanned: true }),
			...(term.length > 0 && {
				OR: [
					{ name: insensitive(term) },
					{ email: insensitive(term) },
					{ phone: insensitive(term) },
					{ plz: insensitive(term) },
				],
			}),
		},
		orderBy:
			sort === 'requests'
				? [{ sentRequests: { _count: dir } }, { id: 'asc' }]
				: userOrder(
						SENIOR_SORTS.has(sort) ? (sort as UserSortField) : 'createdAt',
						dir,
					),
	}
}

const REQUEST_SORTS = new Set(['title', 'status', 'createdAt'])

export interface RequestTableQuery {
	where: Prisma.RequestWhereInput
	orderBy: Prisma.RequestOrderByWithRelationInput[]
}

export function buildRequestQuery({
	q,
	status,
	sort,
	dir,
}: AdminTableParams): RequestTableQuery {
	const term = searchTerm(q)
	const tiebreak: Prisma.RequestOrderByWithRelationInput = { id: 'asc' }
	// category is an enum, so the database can only compare it for equality:
	// "ART" cannot match "ARZT" the way a substring filter used to.
	const category = Object.values(RequestCategory).find(
		value => value.toLowerCase() === term.toLowerCase(),
	)
	return {
		where: {
			...(status !== 'ALL' && { status: status as RequestStatus }),
			...(term.length > 0 && {
				OR: [
					{ title: insensitive(term) },
					{ address: insensitive(term) },
					{ senior: { is: { name: insensitive(term) } } },
					...(category ? [{ category }] : []),
				],
			}),
		},
		orderBy:
			sort === 'offers'
				? [{ offers: { _count: dir } }, tiebreak]
				: [
						{
							[REQUEST_SORTS.has(sort) ? sort : 'createdAt']:
								dir,
						} as Prisma.RequestOrderByWithRelationInput,
						tiebreak,
					],
	}
}

export interface RedemptionTableQuery {
	where: Prisma.RedemptionWhereInput
	orderBy: Prisma.RedemptionOrderByWithRelationInput[]
}

export function buildRedemptionQuery({
	q,
	status,
	sort,
	dir,
}: AdminTableParams): RedemptionTableQuery {
	const term = searchTerm(q)
	const tiebreak: Prisma.RedemptionOrderByWithRelationInput = { id: 'asc' }
	let orderBy: Prisma.RedemptionOrderByWithRelationInput[]
	if (sort === 'user') {
		orderBy = [{ user: { name: dir } }, tiebreak]
	} else if (sort === 'reward') {
		orderBy = [{ reward: { title: dir } }, tiebreak]
	} else if (sort === 'points') {
		orderBy = [{ reward: { pointsCost: dir } }, tiebreak]
	} else if (sort === 'status') {
		orderBy = [{ status: dir }, tiebreak]
	} else {
		orderBy = [{ createdAt: dir }, tiebreak]
	}
	return {
		where: {
			...(status !== 'ALL' && { status }),
			...(term.length > 0 && {
				OR: [
					{ user: { is: { name: insensitive(term) } } },
					{ user: { is: { email: insensitive(term) } } },
					{ reward: { is: { title: insensitive(term) } } },
				],
			}),
		},
		orderBy,
	}
}

export const SENIOR_STATUS_OPTIONS = ['ALL', 'ACTIVE', 'BANNED']
export const PENDING_STATUS_OPTIONS = ['ALL', 'PENDING_REVIEW']