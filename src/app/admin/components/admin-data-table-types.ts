export interface PendingRow {
	id: string
	name: string | null
	email: string | null
	institution: string | null
	languages: string[]
	phone: string | null
	createdAt: string
}

export interface HelperRow {
	id: string
	name: string | null
	email: string | null
	helperStatus: string
	ratingAvg: number
	helpCount: number
	points: number
	languages: string[]
	isBanned: boolean
	createdAt: string
}

export interface SeniorRow {
	id: string
	name: string | null
	email: string | null
	phone: string | null
	plz: string | null
	role: string
	ratingAvg: number
	isBanned: boolean
	createdAt: string
	_count: { sentRequests: number }
}

export interface RequestRow {
	id: string
	title: string
	category: string
	status: string
	address: string | null
	createdAt: string
	senior: { name: string | null }
	_count: { offers: number }
}

export interface RedemptionRow {
	id: string
	createdAt: string
	status: string
	user: { name: string | null; email: string | null }
	reward: { title: string; pointsCost: number }
}

export type SortDirection = 'asc' | 'desc'

export interface AdminTableDataBase {
	total: number
	totalPages: number
	page: number
	pageSize: number
	statusOptions: string[]
}

/**
 * Server-filtered table state. The tab is part of the payload so the table
 * dispatcher can narrow the row type instead of casting.
 */
export type AdminTableData = AdminTableDataBase &
	(
		| { tab: 'pending'; rows: PendingRow[] }
		| { tab: 'helpers'; rows: HelperRow[] }
		| { tab: 'seniors'; rows: SeniorRow[] }
		| { tab: 'requests'; rows: RequestRow[] }
		| { tab: 'redemptions'; rows: RedemptionRow[] }
		| { tab: 'stats'; rows: [] }
	)
