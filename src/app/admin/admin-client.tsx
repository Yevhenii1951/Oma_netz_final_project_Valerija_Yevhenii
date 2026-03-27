'use client'

import {
	activityTypeConfig,
	buildActivityFeed,
	buildKpiCards,
	buildLatestRequests,
	buildPriorityItems,
	buildQuickActions,
	buildTabs,
	helperStatusColor,
	helperStatusLabel,
} from '@/app/admin/admin-client-data'
import { AdminDataTables } from '@/app/admin/components/admin-data-tables'
import { AdminNavigation } from '@/app/admin/components/admin-navigation'
import { AdminPagination } from '@/app/admin/components/admin-pagination'
import { AdminStatsTab } from '@/app/admin/components/admin-stats-tab'
import { AdminTableToolbar } from '@/app/admin/components/admin-table-toolbar'
import {
	filterOptionLabel,
	TableSkeleton,
	type AdminTab,
} from '@/app/admin/components/admin-ui'
import { useAdminClientActions } from '@/app/admin/hooks/use-admin-client-actions'
import {
	useAdminTableState,
	type SortDirection,
} from '@/app/admin/hooks/use-admin-table-state'
import { useToast } from '@/components/ui/toaster'
import { type LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
	stats: {
		userCount: number
		requestCount: number
		offerCount: number
		ratingCount: number
		openRequests: number
		doneRequests: number
		pendingHelpers: number
	}
	pendingHelpers: Array<{
		id: string
		name: string | null
		email: string | null
		employmentType: string | null
		institution: string | null
		languages: string[]
		documentNumber: string | null
		registrationAddress: string | null
		phone: string | null
		plz: string | null
		createdAt: string
	}>
	allHelpers: Array<{
		id: string
		name: string | null
		email: string | null
		isBanned: boolean
		helperStatus: string
		ratingAvg: number
		helpCount: number
		points: number
		employmentType: string | null
		languages: string[]
		createdAt: string
	}>
	allRequests: Array<{
		id: string
		title: string
		category: string
		status: string
		address: string | null
		createdAt: string
		senior: { name: string | null }
		_count: { offers: number }
	}>
	allSeniors: Array<{
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
	}>
	redemptions: Array<{
		id: string
		createdAt: string
		status: string
		user: { name: string | null; email: string | null }
		reward: { title: string; pointsCost: number }
	}>
	initialTab?: AdminTab
}

const PAGE_SIZE = 8

export default function AdminClient({
	stats,
	pendingHelpers,
	allHelpers,
	allRequests,
	allSeniors,
	redemptions,
	initialTab = 'stats',
}: Props) {
	const router = useRouter()
	const { toast } = useToast()

	const [activeTab, setActiveTab] = useState<AdminTab>(initialTab)
	const [loadingId, setLoadingId] = useState<string | null>(null)
	const [banLoadingId, setBanLoadingId] = useState<string | null>(null)
	const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
	const [fulfilling, setFulfilling] = useState<string | null>(null)
	const [redemptionList, setRedemptionList] = useState(redemptions)

	const [query, setQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState('ALL')
	const [sortBy, setSortBy] = useState('createdAt')
	const [sortDir, setSortDir] = useState<SortDirection>('desc')
	const [page, setPage] = useState(1)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [isBootLoading, setIsBootLoading] = useState(true)
	const { handleHelperAction, handleBanToggle, handleDeleteUser } =
		useAdminClientActions({
			router,
			setLoadingId,
			setBanLoadingId,
			setDeleteLoadingId,
		})

	useEffect(() => {
		const timer = window.setTimeout(() => setIsBootLoading(false), 650)
		return () => window.clearTimeout(timer)
	}, [])

	useEffect(() => {
		setQuery('')
		setStatusFilter('ALL')
		setPage(1)

		if (activeTab === 'helpers') {
			setSortBy('createdAt')
			setSortDir('desc')
		}
		if (activeTab === 'pending') {
			setSortBy('createdAt')
			setSortDir('asc')
		}
		if (activeTab === 'seniors') {
			setSortBy('createdAt')
			setSortDir('desc')
		}
		if (activeTab === 'requests') {
			setSortBy('createdAt')
			setSortDir('desc')
		}
		if (activeTab === 'redemptions') {
			setSortBy('createdAt')
			setSortDir('desc')
		}
	}, [activeTab])

	const helperList = allHelpers
	const seniorList = allSeniors
	const pendingRedemptions = redemptionList.filter(r => r.status === 'pending')

	const tabs: {
		key: AdminTab
		icon: LucideIcon
		label: string
		count?: number
	}[] = buildTabs(stats.pendingHelpers, pendingRedemptions.length)
	const kpiCards = buildKpiCards(stats)
	const priorityItems = buildPriorityItems(
		stats.pendingHelpers,
		pendingRedemptions.length,
	)
	const latestRequests = buildLatestRequests(allRequests)
	const activityFeed = buildActivityFeed({
		pendingHelpers,
		redemptionList,
		allRequests,
	})
	const quickActions = buildQuickActions({
		stats,
		helperCount: helperList.length,
		pendingRedemptionsCount: pendingRedemptions.length,
	})

	const {
		activeStatusOptions,
		currentRows,
		totalPages,
		pageStart,
		pendingPageRows,
		helperPageRows,
		seniorPageRows,
		requestPageRows,
		redemptionPageRows,
	} = useAdminTableState({
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
		pageSize: PAGE_SIZE,
	})

	useEffect(() => {
		if (page > totalPages) setPage(totalPages)
	}, [page, totalPages])

	function toggleSort(field: string) {
		if (sortBy === field) {
			setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
			return
		}
		setSortBy(field)
		setSortDir('asc')
	}

	async function handleFulfillRedemption(id: string) {
		setFulfilling(id)
		try {
			const res = await fetch(`/api/rewards/${id}`, { method: 'PATCH' })
			if (res.ok) {
				setRedemptionList(prev =>
					prev.map(x => (x.id === id ? { ...x, status: 'fulfilled' } : x)),
				)
				toast({
					title: 'Als erledigt markiert',
					variant: 'success',
				})
			} else {
				toast({ title: 'Fehler', variant: 'error' })
			}
		} finally {
			setFulfilling(null)
		}
	}

	return (
		<div className='relative'>
			<div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,rgba(139,94,60,0.10),transparent_45%),radial-gradient(circle_at_100%_20%,rgba(200,149,108,0.10),transparent_38%)]' />

			<AdminNavigation
				tabs={tabs}
				activeTab={activeTab}
				isDrawerOpen={isDrawerOpen}
				onOpenDrawer={() => setIsDrawerOpen(true)}
				onCloseDrawer={() => setIsDrawerOpen(false)}
				onTabChange={tab => setActiveTab(tab as AdminTab)}
			/>

			<div className='space-y-6'>
				<div className='space-y-6'>
					{activeTab === 'stats' && (
						<AdminStatsTab
							priorityItems={priorityItems}
							kpiCards={kpiCards}
							quickActions={quickActions}
							latestRequests={latestRequests}
							activityFeed={activityFeed}
							activityTypeConfig={activityTypeConfig}
							isBootLoading={isBootLoading}
							onTabChange={tab => setActiveTab(tab as AdminTab)}
						/>
					)}

					{activeTab !== 'stats' && (
						<section className='rounded-2xl border border-[#eadbcc] bg-white shadow-sm overflow-hidden'>
							<AdminTableToolbar
								activeTab={activeTab}
								resultCount={currentRows.length}
								query={query}
								statusFilter={statusFilter}
								activeStatusOptions={activeStatusOptions}
								onQueryChange={value => {
									setQuery(value)
									setPage(1)
								}}
								onStatusFilterChange={value => {
									setStatusFilter(value)
									setPage(1)
								}}
								getFilterLabel={filterOptionLabel}
							/>

							{isBootLoading ? (
								<TableSkeleton />
							) : (
								<>
									<AdminDataTables
										activeTab={activeTab}
										sortBy={sortBy}
										sortDir={sortDir}
										onSort={toggleSort}
										pendingPageRows={pendingPageRows}
										helperPageRows={helperPageRows}
										seniorPageRows={seniorPageRows}
										requestPageRows={requestPageRows}
										redemptionPageRows={redemptionPageRows}
										helperStatusColor={helperStatusColor}
										helperStatusLabel={helperStatusLabel}
										loadingId={loadingId}
										banLoadingId={banLoadingId}
										deleteLoadingId={deleteLoadingId}
										fulfilling={fulfilling}
										onHelperAction={handleHelperAction}
										onBanToggle={handleBanToggle}
										onDeleteUser={handleDeleteUser}
										onFulfillRedemption={handleFulfillRedemption}
									/>

									<AdminPagination
										currentRowsLength={currentRows.length}
										pageStart={pageStart}
										pageSize={PAGE_SIZE}
										page={page}
										totalPages={totalPages}
										onPrev={() => setPage(p => Math.max(1, p - 1))}
										onNext={() => setPage(p => Math.min(totalPages, p + 1))}
									/>
								</>
							)}
						</section>
					)}
				</div>
			</div>
		</div>
	)
}
