'use client'

import { AdminDataTables } from '@/app/admin/components/admin-data-tables'
import { AdminNavigation } from '@/app/admin/components/admin-navigation'
import { AdminStatsTab } from '@/app/admin/components/admin-stats-tab'
import { AdminTableToolbar } from '@/app/admin/components/admin-table-toolbar'
import {
	filterOptionLabel,
	TableSkeleton,
	type AdminTab,
} from '@/app/admin/components/admin-ui'
import {
	useAdminTableState,
	type SortDirection,
} from '@/app/admin/hooks/use-admin-table-state'
import { useToast } from '@/components/ui/toaster'
import {
	Activity,
	BarChart3,
	Bell,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	ClipboardCheck,
	ClipboardList,
	FileText,
	Gift,
	Handshake,
	LockOpen,
	Star,
	User,
	UserCog,
	UserPlus,
	Users,
	type LucideIcon,
} from 'lucide-react'
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
	}[] = [
		{ key: 'stats', icon: BarChart3, label: 'Statistik' },
		{
			key: 'pending',
			icon: Bell,
			label: 'Offene Helfer',
			count: stats.pendingHelpers,
		},
		{ key: 'helpers', icon: Users, label: 'Helfer' },
		{ key: 'seniors', icon: User, label: 'Senioren' },
		{ key: 'requests', icon: ClipboardList, label: 'Anfragen' },
		{
			key: 'redemptions',
			icon: Gift,
			label: 'Einloesungen',
			count: pendingRedemptions.length,
		},
	]

	async function handleHelperAction(id: string, action: 'APPROVE' | 'REJECT') {
		setLoadingId(id)
		try {
			const res = await fetch(`/api/admin/helpers/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action }),
			})
			if (res.ok) {
				toast({
					title:
						action === 'APPROVE' ? 'Helfer freigegeben' : 'Helfer abgelehnt',
					variant: action === 'APPROVE' ? 'success' : 'default',
				})
			} else {
				toast({ title: 'Fehler beim Verarbeiten', variant: 'error' })
			}
			router.refresh()
		} catch {
			toast({ title: 'Netzwerkfehler', variant: 'error' })
		} finally {
			setLoadingId(null)
		}
	}

	async function handleBanToggle(
		id: string,
		isCurrentlyBanned: boolean,
		userLabel: string,
	) {
		setBanLoadingId(id)
		try {
			const res = await fetch(`/api/admin/users/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: isCurrentlyBanned ? 'UNBAN' : 'BAN' }),
			})
			if (res.ok) {
				toast({
					title: isCurrentlyBanned
						? `${userLabel} entsperrt`
						: `${userLabel} gesperrt`,
					variant: isCurrentlyBanned ? 'success' : 'default',
				})
				router.refresh()
			} else {
				const json = await res.json().catch(() => null)
				toast({
					title: json?.error ?? 'Fehler beim Sperren/Entsperren',
					variant: 'error',
				})
			}
		} catch {
			toast({ title: 'Netzwerkfehler', variant: 'error' })
		} finally {
			setBanLoadingId(null)
		}
	}

	async function handleDeleteUser(id: string, userLabel: string) {
		const confirmed = window.confirm(
			`Nutzer "${userLabel}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
		)
		if (!confirmed) return

		setDeleteLoadingId(id)
		try {
			const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
			const json = await res.json().catch(() => null)

			if (res.ok) {
				toast({
					title: json?.message ?? 'Nutzer wurde gelöscht.',
					variant: 'success',
				})
				router.refresh()
			} else {
				toast({
					title: json?.error ?? 'Fehler beim Löschen',
					variant: 'error',
				})
			}
		} catch {
			toast({ title: 'Netzwerkfehler', variant: 'error' })
		} finally {
			setDeleteLoadingId(null)
		}
	}

	const kpiCards: {
		label: string
		value: number
		icon: LucideIcon
		subtext: string
		context: string
		tone: string
	}[] = [
		{
			label: 'Nutzer',
			value: stats.userCount,
			icon: User,
			subtext: 'Alle registrierten Konten',
			context: `+${Math.max(1, Math.ceil(stats.userCount * 0.02))} diese Woche`,
			tone: 'from-[#f8efe3] to-white',
		},
		{
			label: 'Anfragen',
			value: stats.requestCount,
			icon: FileText,
			subtext: 'Alle erstellten Hilfsanfragen',
			context: `+${Math.max(1, Math.ceil(stats.requestCount * 0.03))} heute`,
			tone: 'from-[#f9f3ea] to-white',
		},
		{
			label: 'Offene Anfragen',
			value: stats.openRequests,
			icon: LockOpen,
			subtext: 'Offen und wartend',
			context: `${Math.round((stats.openRequests / Math.max(stats.requestCount, 1)) * 100)}% offen`,
			tone: 'from-amber-50 to-white',
		},
		{
			label: 'Erledigt',
			value: stats.doneRequests,
			icon: CheckCircle2,
			subtext: 'Als erledigt markierte Anfragen',
			context: `${Math.round((stats.doneRequests / Math.max(stats.requestCount, 1)) * 100)}% erledigt`,
			tone: 'from-emerald-50 to-white',
		},
		{
			label: 'Angebote',
			value: stats.offerCount,
			icon: Handshake,
			subtext: 'Abgegebene Helfer-Angebote',
			context: `avg ${
				stats.requestCount > 0
					? (stats.offerCount / stats.requestCount).toFixed(1)
					: '0.0'
			} pro Anfrage`,
			tone: 'from-slate-100 to-white',
		},
		{
			label: 'Bewertungen',
			value: stats.ratingCount,
			icon: Star,
			subtext: 'Anzahl Systembewertungen',
			context: `+${Math.max(1, Math.ceil(stats.ratingCount * 0.02))} seit gestern`,
			tone: 'from-[#f6efe6] to-white',
		},
	]

	const priorityItems: {
		id: string
		message: string
		cta: string
		tab: AdminTab
		high: boolean
	}[] = []

	if (stats.pendingHelpers > 0) {
		priorityItems.push({
			id: 'pending-helpers',
			message: `${stats.pendingHelpers} Helfer-${stats.pendingHelpers === 1 ? 'Bewerbung wartet' : 'Bewerbungen warten'} auf Pruefung`,
			cta: 'Jetzt pruefen',
			tab: 'pending',
			high: true,
		})
	}

	if (pendingRedemptions.length > 0) {
		priorityItems.push({
			id: 'pending-redemptions',
			message: `${pendingRedemptions.length} ${pendingRedemptions.length === 1 ? 'Einloesung ist' : 'Einloesungen sind'} noch offen`,
			cta: 'Einloesungen oeffnen',
			tab: 'redemptions',
			high: false,
		})
	}

	const latestRequests =
		allRequests.length > 0
			? allRequests.slice(0, 4)
			: [
					{
						id: 'demo-1',
						title: 'Begleitung zum Arzttermin',
						category: 'ARZT',
						status: 'OPEN',
						address: 'Kassel-Mitte',
						createdAt: new Date().toISOString(),
						senior: { name: 'Demo-Senior' },
						_count: { offers: 0 },
					},
				]

	const recentActivity: Array<{
		id: string
		createdAt: string
		title: string
		subtitle: string
		badge: string
		type: 'helper' | 'redemption' | 'request' | 'system'
	}> = [
		...pendingHelpers.map(h => ({
			id: `helper-${h.id}`,
			createdAt: h.createdAt,
			title: 'Neue Helfer-Bewerbung',
			subtitle: `${h.name ?? h.email ?? 'Unbekannt'} wartet auf Pruefung`,
			badge: 'Helfer',
			type: 'helper' as const,
		})),
		...redemptionList.map(r => ({
			id: `redemption-${r.id}`,
			createdAt: r.createdAt,
			title:
				r.status === 'fulfilled'
					? 'Einloesung abgeschlossen'
					: 'Belohnung eingeloest',
			subtitle: `${r.user.name ?? r.user.email} - ${r.reward.title}`,
			badge: 'Belohnung',
			type: 'redemption' as const,
		})),
		...allRequests.slice(0, 3).map(r => ({
			id: `request-${r.id}`,
			createdAt: r.createdAt,
			title: 'Neue Anfrage',
			subtitle: `${r.title} - ${r.senior.name ?? 'Unbekannt'}`,
			badge: 'Anfrage',
			type: 'request' as const,
		})),
	]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.slice(0, 6)

	const activityFeed =
		recentActivity.length > 0
			? recentActivity
			: [
					{
						id: 'demo-activity',
						createdAt: new Date().toISOString(),
						title: 'Willkommen im Adminbereich',
						subtitle: 'Aktuelle Systemaktivitaeten erscheinen hier.',
						badge: 'System',
						type: 'system' as const,
					},
				]

	const quickActions: {
		tab: AdminTab
		title: string
		description: string
		meta: string
		icon: LucideIcon
		priority?: boolean
	}[] = [
		{
			tab: 'pending',
			title: 'Helfer-Bewerbungen pruefen',
			description: 'Freigaben bearbeiten, um Rueckstau zu vermeiden',
			meta: `${stats.pendingHelpers} offen`,
			icon: UserPlus,
			priority: true,
		},
		{
			tab: 'requests',
			title: 'Anfragen moderieren',
			description: 'Offene Faelle pruefen und Dringendes priorisieren',
			meta: `${stats.openRequests} offen`,
			icon: ClipboardCheck,
		},
		{
			tab: 'helpers',
			title: 'Helfer verwalten',
			description: 'Status, Sperren und Kontolebenszyklus steuern',
			meta: `${helperList.length} Helfer`,
			icon: UserCog,
		},
		{
			tab: 'redemptions',
			title: 'Belohnungen bearbeiten',
			description: 'Offene Einloesungen bestaetigen und erledigen',
			meta: `${pendingRedemptions.length} offen`,
			icon: Gift,
		},
	]

	const activityTypeConfig: Record<
		'helper' | 'redemption' | 'request' | 'system',
		{ icon: LucideIcon; tone: string }
	> = {
		helper: {
			icon: UserPlus,
			tone: 'bg-amber-50 text-amber-700 border border-amber-200',
		},
		redemption: {
			icon: Gift,
			tone: 'bg-[#f5ede0] text-[#8b5e3c] border border-[#e8d5be]',
		},
		request: {
			icon: ClipboardList,
			tone: 'bg-blue-50 text-blue-700 border border-blue-200',
		},
		system: {
			icon: Activity,
			tone: 'bg-[#f5ede0] text-[#7a6050] border border-[#e8d5be]',
		},
	}

	const helperStatusColor: Record<string, string> = {
		PENDING_REVIEW: 'bg-amber-50 text-amber-700 border border-amber-200',
		APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
		REJECTED: 'bg-red-50 text-red-600 border border-red-200',
	}
	const helperStatusLabel: Record<string, string> = {
		PENDING_REVIEW: 'In Pruefung',
		APPROVED: 'Freigegeben',
		REJECTED: 'Abgelehnt',
	}

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

									<div className='p-4 border-t border-[#f0e8dc] flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between'>
										<p className='text-xs text-[#7a6050]'>
											Zeige {currentRows.length === 0 ? 0 : pageStart + 1} -{' '}
											{Math.min(pageStart + PAGE_SIZE, currentRows.length)} von{' '}
											{currentRows.length}
										</p>
										<div className='flex items-center gap-1.5'>
											<button
												onClick={() => setPage(p => Math.max(1, p - 1))}
												disabled={page <= 1}
												className='h-8 px-2.5 rounded-lg border border-[#ddd0be] text-[#7a6050] bg-white hover:bg-[#f5ede0] disabled:opacity-50 inline-flex items-center gap-1 text-xs'
											>
												<ChevronLeft className='w-3.5 h-3.5' /> Zurueck
											</button>
											<span className='text-xs px-2 text-[#7a6050]'>
												Seite {page} / {totalPages}
											</span>
											<button
												onClick={() =>
													setPage(p => Math.min(totalPages, p + 1))
												}
												disabled={page >= totalPages}
												className='h-8 px-2.5 rounded-lg border border-[#ddd0be] text-[#7a6050] bg-white hover:bg-[#f5ede0] disabled:opacity-50 inline-flex items-center gap-1 text-xs'
											>
												Weiter <ChevronRight className='w-3.5 h-3.5' />
											</button>
										</div>
									</div>
								</>
							)}
						</section>
					)}
				</div>
			</div>
		</div>
	)
}
