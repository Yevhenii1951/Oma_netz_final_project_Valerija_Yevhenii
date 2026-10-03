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
import type {
	AdminTableData,
	SortDirection,
} from '@/app/admin/components/admin-data-table-types'
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
import { useToast } from '@/components/ui/toaster'
import { type LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

type Overview = {
	stats: {
		userCount: number
		requestCount: number
		offerCount: number
		ratingCount: number
		openRequests: number
		doneRequests: number
		pendingHelpers: number
	}
	helperCount: number
	pendingRedemptions: number
	latestRequests: Parameters<typeof buildLatestRequests>[0]
	activityHelpers: Parameters<typeof buildActivityFeed>[0]['pendingHelpers']
	activityRedemptions: Parameters<
		typeof buildActivityFeed
	>[0]['redemptionList']
}

interface Props {
	overview: Overview
	table: AdminTableData
	filters: {
		q: string
		status: string
		sort: string
		dir: SortDirection
		size: number
	}
}

/** Per-tab default sort, matching what the tab used to reset to on change. */
const DEFAULT_SORT: Record<AdminTab, { sort: string; dir: SortDirection }> = {
	stats: { sort: 'createdAt', dir: 'desc' },
	pending: { sort: 'createdAt', dir: 'asc' },
	helpers: { sort: 'createdAt', dir: 'desc' },
	seniors: { sort: 'createdAt', dir: 'desc' },
	requests: { sort: 'createdAt', dir: 'desc' },
	redemptions: { sort: 'createdAt', dir: 'desc' },
}

export default function AdminClient({ overview, table, filters }: Props) {
	const router = useRouter()
	const { toast } = useToast()
	const [isPending, startTransition] = useTransition()

	const [loadingId, setLoadingId] = useState<string | null>(null)
	const [banLoadingId, setBanLoadingId] = useState<string | null>(null)
	const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
	const [fulfilling, setFulfilling] = useState<string | null>(null)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	// The search box stays local and is debounced: filtering happens on the
	// server now, so one request per keystroke would hit the database.
	const [queryInput, setQueryInput] = useState(filters.q)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		setQueryInput(filters.q)
	}, [filters.q])

	useEffect(
		() => () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		},
		[],
	)

	function changeQuery(value: string) {
		setQueryInput(value)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			applyParams({ q: value.trim(), page: '1' })
		}, 300)
	}
	const { handleHelperAction, handleBanToggle, handleDeleteUser } =
		useAdminClientActions({
			router,
			setLoadingId,
			setBanLoadingId,
			setDeleteLoadingId,
		})

	const activeTab = table.tab
	const { stats, pendingRedemptions } = overview

	// Filtering, sorting and paging are the server's job now, so the URL is
	// the single source of truth. Anything that changes them rewrites the
	// query string and the server component re-runs with the new slice.
	function applyParams(changes: Record<string, string | undefined>) {
		const next = new URLSearchParams()
		const keep: Record<string, string> = {
			tab: activeTab,
			q: filters.q,
			status: filters.status,
			sort: filters.sort,
			dir: filters.dir,
			size: String(filters.size),
		}
		for (const [key, value] of Object.entries({ ...keep, ...changes })) {
			if (value) next.set(key, value)
		}
		startTransition(() => {
			router.replace(`/admin?${next.toString()}`, { scroll: false })
		})
	}

	function changeTab(tab: string) {
		const next = tab as AdminTab
		const defaults = DEFAULT_SORT[next]
		startTransition(() => {
			router.replace(
				`/admin?${new URLSearchParams({
					tab: next,
					sort: defaults.sort,
					dir: defaults.dir,
				}).toString()}`,
				{ scroll: false },
			)
		})
	}

	function toggleSort(field: string) {
		if (filters.sort === field) {
			applyParams({ dir: filters.dir === 'asc' ? 'desc' : 'asc', page: '1' })
			return
		}
		applyParams({ sort: field, dir: 'asc', page: '1' })
	}

	async function handleFulfillRedemption(id: string) {
		setFulfilling(id)
		try {
			const res = await fetch(`/api/rewards/${id}`, { method: 'PATCH' })
			if (res.ok) {
				// The row came from the server, so re-read instead of patching
				// local state that no longer exists.
				startTransition(() => router.refresh())
				toast({ title: 'Als erledigt markiert', variant: 'success' })
			} else {
				toast({ title: 'Fehler', variant: 'error' })
			}
		} finally {
			setFulfilling(null)
		}
	}

	const tabs: {
		key: AdminTab
		icon: LucideIcon
		label: string
		count?: number
	}[] = buildTabs(stats.pendingHelpers, pendingRedemptions)
	const kpiCards = buildKpiCards(stats)
	const priorityItems = buildPriorityItems(stats.pendingHelpers, pendingRedemptions)
	const latestRequests = buildLatestRequests(overview.latestRequests)
	const activityFeed = buildActivityFeed({
		pendingHelpers: overview.activityHelpers,
		redemptionList: overview.activityRedemptions,
		allRequests: overview.latestRequests,
	})
	const quickActions = buildQuickActions({
		stats,
		helperCount: overview.helperCount,
		pendingRedemptionsCount: pendingRedemptions,
	})

	const { rows, total, totalPages, page, pageSize, statusOptions } = table

	return (
		<div className='relative'>
			<div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,rgba(139,94,60,0.10),transparent_45%),radial-gradient(circle_at_100%_20%,rgba(200,149,108,0.10),transparent_38%)]' />

			<AdminNavigation
				tabs={tabs}
				activeTab={activeTab}
				isDrawerOpen={isDrawerOpen}
				onOpenDrawer={() => setIsDrawerOpen(true)}
				onCloseDrawer={() => setIsDrawerOpen(false)}
				onTabChange={changeTab}
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
						isBootLoading={isPending}
						onTabChange={changeTab}
						/>
					)}

					{activeTab !== 'stats' && (
						<section className='rounded-2xl border border-[#eadbcc] bg-white shadow-sm overflow-hidden'>
							<AdminTableToolbar
								activeTab={activeTab}
								resultCount={total}
								query={queryInput}
								statusFilter={filters.status}
								activeStatusOptions={statusOptions}
								onQueryChange={changeQuery}
								onStatusFilterChange={value =>
									applyParams({ status: value, page: '1' })
								}
								getFilterLabel={filterOptionLabel}
							/>

							{isPending ? (
								<TableSkeleton />
							) : (
								<>
									<AdminDataTables
										table={table}
										sortBy={filters.sort}
										sortDir={filters.dir}
										onSort={toggleSort}
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
										total={total}
										pageSize={pageSize}
										page={page}
										totalPages={totalPages}
										onPrev={() =>
											applyParams({ page: String(Math.max(1, page - 1)) })
										}
										onNext={() =>
											applyParams({
												page: String(Math.min(totalPages, page + 1)),
											})
										}
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