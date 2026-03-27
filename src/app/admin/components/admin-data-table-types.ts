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
