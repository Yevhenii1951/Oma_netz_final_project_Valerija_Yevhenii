import { safeText, type AdminTab } from '@/app/admin/components/admin-ui'
import { useMemo } from 'react'

export type SortDirection = 'asc' | 'desc'

interface PendingHelper {
	id: string
	name: string | null
	email: string | null
	institution: string | null
	languages: string[]
	phone: string | null
	createdAt: string
}

interface Helper {
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

interface Request {
	id: string
	title: string
	category: string
	status: string
	address: string | null
	createdAt: string
	senior: { name: string | null }
	_count: { offers: number }
}

interface Senior {
	id: string
	name: string | null
	email: string | null
	isBanned: boolean
	role: string
	phone: string | null
	plz: string | null
	ratingAvg: number
	createdAt: string
	_count: { sentRequests: number }
}

interface Redemption {
	id: string
	createdAt: string
	status: string
	user: { name: string | null; email: string | null }
	reward: { title: string; pointsCost: number }
}

interface UseAdminTableStateInput {
	activeTab: AdminTab
	pendingHelpers: PendingHelper[]
	helperList: Helper[]
	seniorList: Senior[]
	allRequests: Request[]
	redemptionList: Redemption[]
	query: string
	statusFilter: string
	sortBy: string
	sortDir: SortDirection
	page: number
	pageSize: number
}

export function useAdminTableState({
	activeTab,
	pendingHelpers,
	helperList,
	seniorList,
	allRequests,
	redemptionList,
	query,
	statusFilter,
	sortBy,
	sortDir,
	page,
	pageSize,
}: UseAdminTableStateInput) {
	const pendingStatusOptions = ['ALL', 'PENDING_REVIEW']
	const helperStatusOptions = [
		'ALL',
		...new Set(helperList.map(h => h.helperStatus)),
	]
	const requestStatusOptions = [
		'ALL',
		...new Set(allRequests.map(r => r.status)),
	]
	const seniorStatusOptions = ['ALL', 'ACTIVE', 'BANNED']
	const redemptionStatusOptions = [
		'ALL',
		...new Set(redemptionList.map(r => r.status)),
	]

	const pendingRows = useMemo(() => {
		const term = query.toLowerCase().trim()
		const filtered = pendingHelpers.filter(h => {
			const matchesQuery =
				term.length === 0 ||
				`${h.name ?? ''} ${h.email ?? ''} ${h.institution ?? ''} ${h.phone ?? ''} ${h.languages.join(' ')}`
					.toLowerCase()
					.includes(term)
			const matchesStatus =
				statusFilter === 'ALL' || statusFilter === 'PENDING_REVIEW'
			return matchesQuery && matchesStatus
		})

		const sorted = [...filtered].sort((a, b) => {
			if (sortBy === 'name') {
				return safeText(a.name).localeCompare(safeText(b.name))
			}
			if (sortBy === 'createdAt') {
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			}
			return 0
		})

		if (sortDir === 'desc') sorted.reverse()
		return sorted
	}, [pendingHelpers, query, sortBy, sortDir, statusFilter])

	const helperRows = useMemo(() => {
		const term = query.toLowerCase().trim()
		const filtered = helperList.filter(h => {
			const matchesQuery =
				term.length === 0 ||
				`${h.name ?? ''} ${h.email ?? ''} ${h.languages.join(' ')}`
					.toLowerCase()
					.includes(term)
			const matchesStatus =
				statusFilter === 'ALL' || h.helperStatus === statusFilter
			return matchesQuery && matchesStatus
		})

		const sorted = [...filtered].sort((a, b) => {
			if (sortBy === 'name')
				return safeText(a.name).localeCompare(safeText(b.name))
			if (sortBy === 'email')
				return safeText(a.email).localeCompare(safeText(b.email))
			if (sortBy === 'ratingAvg') return a.ratingAvg - b.ratingAvg
			if (sortBy === 'helpCount') return a.helpCount - b.helpCount
			if (sortBy === 'points') return a.points - b.points
			if (sortBy === 'isBanned') return Number(a.isBanned) - Number(b.isBanned)
			if (sortBy === 'createdAt')
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			return 0
		})
		if (sortDir === 'desc') sorted.reverse()
		return sorted
	}, [helperList, query, statusFilter, sortBy, sortDir])

	const seniorRows = useMemo(() => {
		const term = query.toLowerCase().trim()
		const filtered = seniorList.filter(u => {
			const matchesQuery =
				term.length === 0 ||
				`${u.name ?? ''} ${u.email ?? ''} ${u.phone ?? ''} ${u.plz ?? ''}`
					.toLowerCase()
					.includes(term)
			const derivedStatus = u.isBanned ? 'BANNED' : 'ACTIVE'
			const matchesStatus =
				statusFilter === 'ALL' || derivedStatus === statusFilter
			return matchesQuery && matchesStatus
		})

		const sorted = [...filtered].sort((a, b) => {
			if (sortBy === 'name')
				return safeText(a.name).localeCompare(safeText(b.name))
			if (sortBy === 'email')
				return safeText(a.email).localeCompare(safeText(b.email))
			if (sortBy === 'ratingAvg') return a.ratingAvg - b.ratingAvg
			if (sortBy === 'requests')
				return a._count.sentRequests - b._count.sentRequests
			if (sortBy === 'createdAt')
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			return 0
		})
		if (sortDir === 'desc') sorted.reverse()
		return sorted
	}, [seniorList, query, statusFilter, sortBy, sortDir])

	const requestRows = useMemo(() => {
		const term = query.toLowerCase().trim()
		const filtered = allRequests.filter(r => {
			const matchesQuery =
				term.length === 0 ||
				`${r.title} ${r.category} ${r.senior.name ?? ''} ${r.address ?? ''}`
					.toLowerCase()
					.includes(term)
			const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
			return matchesQuery && matchesStatus
		})

		const sorted = [...filtered].sort((a, b) => {
			if (sortBy === 'title')
				return safeText(a.title).localeCompare(safeText(b.title))
			if (sortBy === 'status')
				return safeText(a.status).localeCompare(safeText(b.status))
			if (sortBy === 'offers') return a._count.offers - b._count.offers
			if (sortBy === 'createdAt')
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			return 0
		})
		if (sortDir === 'desc') sorted.reverse()
		return sorted
	}, [allRequests, query, statusFilter, sortBy, sortDir])

	const redemptionRows = useMemo(() => {
		const term = query.toLowerCase().trim()
		const filtered = redemptionList.filter(r => {
			const matchesQuery =
				term.length === 0 ||
				`${r.user.name ?? ''} ${r.user.email ?? ''} ${r.reward.title}`
					.toLowerCase()
					.includes(term)
			const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
			return matchesQuery && matchesStatus
		})

		const sorted = [...filtered].sort((a, b) => {
			if (sortBy === 'user') {
				return safeText(a.user.name ?? a.user.email).localeCompare(
					safeText(b.user.name ?? b.user.email),
				)
			}
			if (sortBy === 'reward')
				return a.reward.title.localeCompare(b.reward.title)
			if (sortBy === 'points') return a.reward.pointsCost - b.reward.pointsCost
			if (sortBy === 'status') return a.status.localeCompare(b.status)
			if (sortBy === 'createdAt')
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			return 0
		})
		if (sortDir === 'desc') sorted.reverse()
		return sorted
	}, [redemptionList, query, statusFilter, sortBy, sortDir])

	const currentRows =
		activeTab === 'pending'
			? pendingRows
			: activeTab === 'helpers'
				? helperRows
				: activeTab === 'seniors'
					? seniorRows
					: activeTab === 'requests'
						? requestRows
						: activeTab === 'redemptions'
							? redemptionRows
							: []

	const totalPages = Math.max(1, Math.ceil(currentRows.length / pageSize))
	const pageStart = (page - 1) * pageSize

	return {
		pendingStatusOptions,
		helperStatusOptions,
		requestStatusOptions,
		seniorStatusOptions,
		redemptionStatusOptions,
		pendingRows,
		helperRows,
		seniorRows,
		requestRows,
		redemptionRows,
		currentRows,
		totalPages,
		pageStart,
		pendingPageRows: pendingRows.slice(pageStart, pageStart + pageSize),
		helperPageRows: helperRows.slice(pageStart, pageStart + pageSize),
		seniorPageRows: seniorRows.slice(pageStart, pageStart + pageSize),
		requestPageRows: requestRows.slice(pageStart, pageStart + pageSize),
		redemptionPageRows: redemptionRows.slice(pageStart, pageStart + pageSize),
		activeStatusOptions:
			activeTab === 'pending'
				? pendingStatusOptions
				: activeTab === 'helpers'
					? helperStatusOptions
					: activeTab === 'seniors'
						? seniorStatusOptions
						: activeTab === 'requests'
							? requestStatusOptions
							: activeTab === 'redemptions'
								? redemptionStatusOptions
								: ['ALL'],
	}
}
