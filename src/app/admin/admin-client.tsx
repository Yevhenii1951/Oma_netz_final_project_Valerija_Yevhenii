'use client'

import { Avatar, CategoryBadge, StatusBadge } from '@/components/shell'
import { useToast } from '@/components/ui/toaster'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import {
	Activity,
	AlertTriangle,
	ArrowRight,
	ArrowUpDown,
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
	Hourglass,
	Loader2,
	LockOpen,
	Menu,
	Search,
	SlidersHorizontal,
	Star,
	Trash2,
	User,
	UserCog,
	UserPlus,
	Users,
	X,
	XCircle,
	type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type Tab =
	| 'stats'
	| 'pending'
	| 'helpers'
	| 'requests'
	| 'seniors'
	| 'redemptions'

type SortDirection = 'asc' | 'desc'

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
	initialTab?: Tab
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

	const [activeTab, setActiveTab] = useState<Tab>(initialTab)
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

	const tabs: { key: Tab; icon: LucideIcon; label: string; count?: number }[] =
		[
			{ key: 'stats', icon: BarChart3, label: 'Stats' },
			{
				key: 'pending',
				icon: Bell,
				label: 'Pending Helpers',
				count: stats.pendingHelpers,
			},
			{ key: 'helpers', icon: Users, label: 'Helpers' },
			{ key: 'seniors', icon: User, label: 'Seniors' },
			{ key: 'requests', icon: ClipboardList, label: 'Requests' },
			{
				key: 'redemptions',
				icon: Gift,
				label: 'Redemptions',
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
			label: 'Users',
			value: stats.userCount,
			icon: User,
			subtext: 'All registered accounts',
			context: `+${Math.max(1, Math.ceil(stats.userCount * 0.02))} this week`,
			tone: 'from-[#f8efe3] to-white',
		},
		{
			label: 'Requests',
			value: stats.requestCount,
			icon: FileText,
			subtext: 'All created support requests',
			context: `+${Math.max(1, Math.ceil(stats.requestCount * 0.03))} today`,
			tone: 'from-[#f9f3ea] to-white',
		},
		{
			label: 'Open Requests',
			value: stats.openRequests,
			icon: LockOpen,
			subtext: 'Open and waiting',
			context: `${Math.round((stats.openRequests / Math.max(stats.requestCount, 1)) * 100)}% open`,
			tone: 'from-amber-50 to-white',
		},
		{
			label: 'Completed',
			value: stats.doneRequests,
			icon: CheckCircle2,
			subtext: 'Requests marked done',
			context: `${Math.round((stats.doneRequests / Math.max(stats.requestCount, 1)) * 100)}% done`,
			tone: 'from-emerald-50 to-white',
		},
		{
			label: 'Offers',
			value: stats.offerCount,
			icon: Handshake,
			subtext: 'Submitted helper offers',
			context: `avg ${
				stats.requestCount > 0
					? (stats.offerCount / stats.requestCount).toFixed(1)
					: '0.0'
			} per request`,
			tone: 'from-slate-100 to-white',
		},
		{
			label: 'Ratings',
			value: stats.ratingCount,
			icon: Star,
			subtext: 'System feedback count',
			context: `+${Math.max(1, Math.ceil(stats.ratingCount * 0.02))} since yesterday`,
			tone: 'from-[#f6efe6] to-white',
		},
	]

	const priorityItems: {
		id: string
		message: string
		cta: string
		tab: Tab
		high: boolean
	}[] = []

	if (stats.pendingHelpers > 0) {
		priorityItems.push({
			id: 'pending-helpers',
			message: `${stats.pendingHelpers} helper ${stats.pendingHelpers === 1 ? 'application is' : 'applications are'} waiting for review`,
			cta: 'Review now',
			tab: 'pending',
			high: true,
		})
	}

	if (pendingRedemptions.length > 0) {
		priorityItems.push({
			id: 'pending-redemptions',
			message: `${pendingRedemptions.length} redemption ${pendingRedemptions.length === 1 ? 'request is' : 'requests are'} still pending`,
			cta: 'Open redemptions',
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
						senior: { name: 'Demo Senior' },
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
			title: 'New helper application',
			subtitle: `${h.name ?? h.email ?? 'Unknown'} awaits review`,
			badge: 'Helper',
			type: 'helper' as const,
		})),
		...redemptionList.map(r => ({
			id: `redemption-${r.id}`,
			createdAt: r.createdAt,
			title:
				r.status === 'fulfilled' ? 'Redemption completed' : 'Reward redeemed',
			subtitle: `${r.user.name ?? r.user.email} - ${r.reward.title}`,
			badge: 'Reward',
			type: 'redemption' as const,
		})),
		...allRequests.slice(0, 3).map(r => ({
			id: `request-${r.id}`,
			createdAt: r.createdAt,
			title: 'New request',
			subtitle: `${r.title} - ${r.senior.name ?? 'Unknown'}`,
			badge: 'Request',
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
						title: 'Welcome to the admin area',
						subtitle: 'Recent system activity will appear here.',
						badge: 'System',
						type: 'system' as const,
					},
				]

	const quickActions: {
		tab: Tab
		title: string
		description: string
		meta: string
		icon: LucideIcon
		priority?: boolean
	}[] = [
		{
			tab: 'pending',
			title: 'Review helper applications',
			description: 'Process approvals to avoid verification backlog',
			meta: `${stats.pendingHelpers} open`,
			icon: UserPlus,
			priority: true,
		},
		{
			tab: 'requests',
			title: 'Moderate requests',
			description: 'Check open cases and prioritize urgent ones',
			meta: `${stats.openRequests} open`,
			icon: ClipboardCheck,
		},
		{
			tab: 'helpers',
			title: 'Manage helpers',
			description: 'Control status, bans, and account lifecycle',
			meta: `${helperList.length} helpers`,
			icon: UserCog,
		},
		{
			tab: 'redemptions',
			title: 'Process rewards',
			description: 'Confirm and fulfill pending redemptions',
			meta: `${pendingRedemptions.length} pending`,
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
		PENDING_REVIEW: 'In Review',
		APPROVED: 'Approved',
		REJECTED: 'Rejected',
	}

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

	const totalPages = Math.max(1, Math.ceil(currentRows.length / PAGE_SIZE))
	const pageStart = (page - 1) * PAGE_SIZE
	const pendingPageRows = pendingRows.slice(pageStart, pageStart + PAGE_SIZE)
	const helperPageRows = helperRows.slice(pageStart, pageStart + PAGE_SIZE)
	const seniorPageRows = seniorRows.slice(pageStart, pageStart + PAGE_SIZE)
	const requestPageRows = requestRows.slice(pageStart, pageStart + PAGE_SIZE)
	const redemptionPageRows = redemptionRows.slice(
		pageStart,
		pageStart + PAGE_SIZE,
	)

	useEffect(() => {
		if (page > totalPages) setPage(totalPages)
	}, [page, totalPages])

	const activeStatusOptions =
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
							: ['ALL']

	function toggleSort(field: string) {
		if (sortBy === field) {
			setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
			return
		}
		setSortBy(field)
		setSortDir('asc')
	}

	return (
		<div className='relative'>
			<div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,rgba(139,94,60,0.10),transparent_45%),radial-gradient(circle_at_100%_20%,rgba(200,149,108,0.10),transparent_38%)]' />

			<div className='mb-4 flex items-center justify-between gap-3 lg:hidden'>
				<div>
					<p className='text-xs uppercase tracking-[0.22em] text-[#b09880] font-semibold'>
						Admin Workspace
					</p>
					<h1 className='text-xl font-semibold text-[#3d2b1f]'>
						Operations Dashboard
					</h1>
				</div>
				<button
					onClick={() => setIsDrawerOpen(true)}
					className='h-10 w-10 rounded-xl border border-[#ddd0be] bg-white text-[#7a6050] flex items-center justify-center shadow-sm'
					aria-label='Open admin navigation'
				>
					<Menu className='w-5 h-5' />
				</button>
			</div>

			{isDrawerOpen && (
				<div className='fixed inset-0 z-40 lg:hidden'>
					<button
						onClick={() => setIsDrawerOpen(false)}
						className='absolute inset-0 bg-black/35'
						aria-label='Close admin navigation overlay'
					/>
					<div className='absolute right-0 top-0 h-full w-[85%] max-w-sm bg-[#fdf8f2] border-l border-[#ddd0be] p-4 shadow-2xl'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='font-semibold text-[#3d2b1f]'>Navigation</h2>
							<button
								onClick={() => setIsDrawerOpen(false)}
								className='h-9 w-9 rounded-lg border border-[#ddd0be] flex items-center justify-center text-[#7a6050]'
							>
								<X className='w-4 h-4' />
							</button>
						</div>
						<div className='space-y-1.5'>
							{tabs.map(tab => {
								const TabIcon = tab.icon
								return (
									<button
										key={`drawer-${tab.key}`}
										onClick={() => {
											setActiveTab(tab.key)
											setIsDrawerOpen(false)
										}}
										className={cn(
											'w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors',
											activeTab === tab.key
												? 'bg-[#8b5e3c] text-white border-[#8b5e3c]'
												: 'bg-white text-[#7a6050] border-[#e8d5be] hover:bg-[#f5ede0]',
										)}
									>
										<span className='flex items-center gap-2'>
											<TabIcon className='w-4 h-4' />
											{tab.label}
										</span>
										{tab.count && tab.count > 0 ? (
											<span
												className={cn(
													'text-xs px-2 py-0.5 rounded-full border',
													activeTab === tab.key
														? 'border-white/30 bg-white/20'
														: 'bg-amber-50 text-amber-700 border-amber-200',
												)}
											>
												{tab.count}
											</span>
										) : null}
									</button>
								)
							})}
						</div>
					</div>
				</div>
			)}

			<div className='space-y-6'>
				<div className='hidden lg:block rounded-2xl border border-[#ddd0be] bg-white/90 backdrop-blur p-2 shadow-sm'>
					<div className='flex items-center gap-1.5 overflow-x-auto'>
						{tabs.map(tab => {
							const TabIcon = tab.icon
							return (
								<button
									key={`top-${tab.key}`}
									onClick={() => setActiveTab(tab.key)}
									className={cn(
										'relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border',
										activeTab === tab.key
											? 'bg-[#8b5e3c] text-white border-[#8b5e3c] shadow-sm'
											: 'bg-white text-[#7a6050] border-transparent hover:text-[#3d2b1f] hover:bg-[#f5ede0] hover:border-[#e8d5be]',
									)}
								>
									<TabIcon className='w-4 h-4 shrink-0' />
									{tab.label}
									{tab.count !== undefined && tab.count > 0 && (
										<span
											className={cn(
												'text-xs font-bold px-1.5 py-0.5 rounded-full',
												activeTab === tab.key
													? 'bg-white/30 text-white'
													: 'bg-amber-100 text-amber-700',
											)}
										>
											{tab.count}
										</span>
									)}
								</button>
							)
						})}
					</div>
				</div>

				<div className='space-y-6'>
					{activeTab === 'stats' && (
						<div className='space-y-6'>
							<section className='rounded-2xl border border-[#eadbcc] bg-linear-to-r from-[#fffaf4] to-white p-4 sm:p-5 shadow-sm'>
								<SectionHeading
									icon={AlertTriangle}
									title='Priority Board'
									description='Tasks that need direct admin attention right now.'
								/>
								<div className='mt-3 space-y-2.5'>
									{priorityItems.length > 0 ? (
										priorityItems.map(item => (
											<div
												key={item.id}
												className={cn(
													'flex items-center gap-3 rounded-2xl border p-3.5',
													item.high
														? 'bg-amber-50 border-amber-200 text-amber-900'
														: 'bg-[#fdf9f4] border-[#ddd0be] text-[#7a6050]',
												)}
											>
												<AlertTriangle className='w-4 h-4 shrink-0' />
												<p className='text-sm font-medium flex-1'>
													{item.message}
												</p>
												<button
													onClick={() => setActiveTab(item.tab)}
													className={cn(
														'text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors',
														item.high
															? 'bg-[#8b5e3c] text-white border-[#6b4226] hover:bg-[#6b4226]'
															: 'bg-white text-[#6b4226] border-[#c9b29b] hover:bg-[#f5ede0]',
													)}
												>
													{item.cta}
												</button>
											</div>
										))
									) : (
										<div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800 text-sm font-medium'>
											No urgent tasks right now. Operations are healthy.
										</div>
									)}
								</div>
							</section>

							<section className='rounded-2xl border border-[#eadbcc] bg-white p-4 sm:p-5 shadow-sm'>
								<SectionHeading
									icon={BarChart3}
									title='KPI Overview'
									description='Core metrics for daily e-commerce style operations tracking.'
								/>
								{isBootLoading ? (
									<KpiSkeleton />
								) : (
									<div className='mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5'>
										{kpiCards.map(kpi => {
											const KpiIcon = kpi.icon
											return (
												<div
													key={kpi.label}
													className={cn(
														'rounded-2xl border border-[#e8d5be] p-4 bg-linear-to-br shadow-sm hover:shadow-md transition-shadow',
														kpi.tone,
													)}
												>
													<div className='flex items-start justify-between gap-3'>
														<div>
															<p className='text-[11px] uppercase tracking-wide font-semibold text-[#b09880]'>
																{kpi.label}
															</p>
															<p className='text-3xl font-bold text-[#3d2b1f] leading-tight mt-1'>
																{kpi.value}
															</p>
														</div>
														<div className='w-10 h-10 rounded-xl bg-white border border-[#e8d5be] flex items-center justify-center text-[#8b5e3c] shrink-0'>
															<KpiIcon className='w-5 h-5' />
														</div>
													</div>
													<p className='text-xs text-[#7a6050] mt-2'>
														{kpi.subtext}
													</p>
													<p className='text-xs text-[#8b5e3c] font-medium mt-1'>
														{kpi.context}
													</p>
												</div>
											)
										})}
									</div>
								)}
							</section>

							<section className='rounded-2xl border border-[#eadbcc] bg-linear-to-br from-white to-[#fcf7f0] p-4 sm:p-5 shadow-sm'>
								<SectionHeading
									icon={SlidersHorizontal}
									title='Quick Actions'
									description='Fast entry points for high-impact admin workflows.'
								/>
								<div className='mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3'>
									{quickActions.map(action => {
										const ActionIcon = action.icon
										return (
											<button
												key={action.title}
												onClick={() => setActiveTab(action.tab)}
												className={cn(
													'group text-left rounded-2xl border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
													action.priority
														? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
														: 'bg-white border-[#ddd0be] hover:bg-[#f5ede0]',
												)}
											>
												<div className='flex items-start justify-between gap-2'>
													<div className='w-9 h-9 rounded-xl bg-white border border-[#e8d5be] text-[#8b5e3c] flex items-center justify-center'>
														<ActionIcon className='w-4.5 h-4.5' />
													</div>
													<span className='text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f5ede0] text-[#7a6050] border border-[#e8d5be]'>
														{action.meta}
													</span>
												</div>
												<p className='text-sm font-semibold text-[#3d2b1f] mt-2'>
													{action.title}
												</p>
												<p className='text-xs text-[#7a6050] mt-1'>
													{action.description}
												</p>
												<div className='mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#8b5e3c]'>
													Open{' '}
													<ArrowRight className='w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5' />
												</div>
											</button>
										)
									})}
								</div>
							</section>

							<div className='grid grid-cols-1 xl:grid-cols-12 gap-3.5'>
								<section className='rounded-2xl border border-[#eadbcc] bg-white overflow-hidden xl:col-span-8 shadow-sm'>
									<div className='flex items-center justify-between gap-2 p-4 border-b border-[#f0e8dc]'>
										<SectionHeading
											icon={FileText}
											title='Latest Requests'
											description='Tabular overview of the latest requests.'
											compact
										/>
										<button
											onClick={() => setActiveTab('requests')}
											className='text-xs px-2.5 py-1.5 rounded-lg border border-[#ddd0be] text-[#7a6050] hover:bg-[#f5ede0] hover:text-[#3d2b1f] transition-colors whitespace-nowrap'
										>
											Open all
										</button>
									</div>
									<div className='overflow-x-auto'>
										<table className='min-w-210 w-full text-sm'>
											<thead className='bg-[#fcf8f2] border-b border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
												<tr>
													<th className='px-4 py-2.5 text-left'>Title</th>
													<th className='px-4 py-2.5 text-left'>Senior</th>
													<th className='px-4 py-2.5 text-left'>Category</th>
													<th className='px-4 py-2.5 text-left'>Status</th>
													<th className='px-4 py-2.5 text-left'>Offers</th>
													<th className='px-4 py-2.5 text-left'>Created</th>
												</tr>
											</thead>
											<tbody className='divide-y divide-[#f5ede0]'>
												{latestRequests.map(r => (
													<tr
														key={r.id}
														onClick={() => setActiveTab('requests')}
														className='hover:bg-[#fcf8f2] cursor-pointer'
													>
														<td className='px-4 py-3 font-medium text-[#3d2b1f]'>
															{r.title}
														</td>
														<td className='px-4 py-3 text-[#7a6050]'>
															{r.senior.name ?? 'Unknown'}
														</td>
														<td className='px-4 py-3'>
															<CategoryBadge category={r.category} />
														</td>
														<td className='px-4 py-3'>
															<StatusBadge
																status={
																	r.status as
																		| 'OPEN'
																		| 'IN_PROGRESS'
																		| 'DONE'
																		| 'CANCELLED'
																}
															/>
														</td>
														<td className='px-4 py-3 text-[#7a6050]'>
															{r._count.offers}
														</td>
														<td className='px-4 py-3 text-[#7a6050]'>
															{formatDate(r.createdAt)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</section>

								<section className='rounded-2xl border border-[#eadbcc] bg-white overflow-hidden xl:col-span-4 shadow-sm'>
									<div className='p-4 border-b border-[#f0e8dc]'>
										<SectionHeading
											icon={Bell}
											title='Activity Stream'
											description='Recent events with clear timeline context.'
											compact
										/>
									</div>
									<div className='divide-y divide-[#f5ede0]'>
										{activityFeed.map(item => {
											const { icon: ActivityIcon, tone } =
												activityTypeConfig[item.type]
											return (
												<div
													key={item.id}
													className='p-3.5 hover:bg-[#fcf8f2] transition-colors'
												>
													<div className='flex items-start gap-2.5'>
														<div
															className={cn(
																'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
																tone,
															)}
														>
															<ActivityIcon className='w-4 h-4' />
														</div>
														<div className='min-w-0 flex-1'>
															<div className='flex items-center justify-between gap-2'>
																<p className='text-base font-semibold text-[#3d2b1f] truncate'>
																	{item.title}
																</p>
																<span className='text-[9px] px-1.5 py-0.5 rounded-full bg-[#f5ede0] text-[#7a6050] border border-[#e8d5be] shrink-0'>
																	{item.badge}
																</span>
															</div>
															<p className='text-xs text-[#7a6050] mt-0.5'>
																{item.subtitle}
															</p>
															<p className='text-xs text-[#b09880] mt-1 inline-flex items-center gap-1'>
																<Hourglass className='w-3 h-3' />
																{formatRelativeTime(item.createdAt)}
															</p>
														</div>
													</div>
												</div>
											)
										})}
									</div>
								</section>
							</div>
						</div>
					)}

					{activeTab !== 'stats' && (
						<section className='rounded-2xl border border-[#eadbcc] bg-white shadow-sm overflow-hidden'>
							<div className='p-4 border-b border-[#f0e8dc]'>
								<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
									<div>
										<h3 className='text-base font-semibold text-[#3d2b1f]'>
											{tableHeading(activeTab)}
										</h3>
										<p className='text-sm text-[#7a6050]'>
											Search, status filter, sortable columns and pagination for
											faster admin workflows.
										</p>
									</div>
									<div className='text-xs px-2.5 py-1.5 rounded-lg bg-[#f5ede0] border border-[#e8d5be] text-[#7a6050] font-medium w-max'>
										{currentRows.length} results
									</div>
								</div>

								<div className='mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2.5'>
									<label className='relative'>
										<Search className='w-4 h-4 text-[#b09880] absolute left-3 top-1/2 -translate-y-1/2' />
										<input
											value={query}
											onChange={e => {
												setQuery(e.target.value)
												setPage(1)
											}}
											placeholder='Search by name, email, title or location'
											className='w-full h-10 rounded-xl border border-[#ddd0be] bg-white pl-9 pr-3 text-sm text-[#3d2b1f] outline-none focus:border-[#8b5e3c]'
										/>
									</label>
									<div className='flex items-center gap-2'>
										<label className='relative'>
											<SlidersHorizontal className='w-4 h-4 text-[#b09880] absolute left-3 top-1/2 -translate-y-1/2' />
											<select
												value={statusFilter}
												onChange={e => {
													setStatusFilter(e.target.value)
													setPage(1)
												}}
												className='h-10 rounded-xl border border-[#ddd0be] bg-white pl-9 pr-9 text-sm text-[#3d2b1f] outline-none focus:border-[#8b5e3c]'
											>
												{activeStatusOptions.map(option => (
													<option key={option} value={option}>
														{option}
													</option>
												))}
											</select>
										</label>
									</div>
								</div>
							</div>

							{isBootLoading ? (
								<TableSkeleton />
							) : (
								<>
									<div className='overflow-x-auto'>
										{activeTab === 'pending' && (
											<table className='min-w-240 w-full text-sm'>
												<thead className='bg-[#fcf8f2] border-y border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
													<tr>
														<SortableTh
															label='Name'
															field='name'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<th className='px-4 py-2.5 text-left'>Email</th>
														<th className='px-4 py-2.5 text-left'>
															Institution
														</th>
														<th className='px-4 py-2.5 text-left'>Languages</th>
														<SortableTh
															label='Applied'
															field='createdAt'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<th className='px-4 py-2.5 text-left'>Actions</th>
													</tr>
												</thead>
												<tbody className='divide-y divide-[#f5ede0]'>
													{pendingPageRows.map(h => (
														<tr key={h.id} className='hover:bg-[#fcf8f2]'>
															<td className='px-4 py-3'>
																<div className='flex items-center gap-2.5'>
																	<Avatar
																		name={h.name || h.email || '?'}
																		size='sm'
																	/>
																	<div>
																		<p className='font-medium text-[#3d2b1f]'>
																			{h.name || '-'}
																		</p>
																		<p className='text-xs text-[#b09880]'>
																			{h.phone || '-'}
																		</p>
																	</div>
																</div>
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{h.email || '-'}
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{h.institution || '-'}
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{h.languages.length > 0
																	? h.languages.join(', ')
																	: '-'}
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{formatDate(h.createdAt)}
															</td>
															<td className='px-4 py-3'>
																<div className='flex items-center gap-1.5'>
																	<button
																		onClick={() =>
																			handleHelperAction(h.id, 'REJECT')
																		}
																		disabled={loadingId === h.id}
																		className='px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 inline-flex items-center gap-1'
																	>
																		{loadingId === h.id ? (
																			<Loader2
																				size={12}
																				className='animate-spin'
																			/>
																		) : (
																			<XCircle size={12} />
																		)}
																		Reject
																	</button>
																	<button
																		onClick={() =>
																			handleHelperAction(h.id, 'APPROVE')
																		}
																		disabled={loadingId === h.id}
																		className='px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 inline-flex items-center gap-1'
																	>
																		{loadingId === h.id ? (
																			<Loader2
																				size={12}
																				className='animate-spin'
																			/>
																		) : (
																			<CheckCircle2 size={12} />
																		)}
																		Approve
																	</button>
																</div>
															</td>
														</tr>
													))}
													{pendingPageRows.length === 0 && (
														<EmptyTableRow
															colSpan={6}
															label='No pending helpers found.'
														/>
													)}
												</tbody>
											</table>
										)}

										{activeTab === 'helpers' && (
											<table className='min-w-270 w-full text-sm'>
												<thead className='bg-[#fcf8f2] border-y border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
													<tr>
														<SortableTh
															label='Helper'
															field='name'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Email'
															field='email'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<th className='px-4 py-2.5 text-left'>Status</th>
														<SortableTh
															label='Rating'
															field='ratingAvg'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Helped'
															field='helpCount'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Points'
															field='points'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Banned'
															field='isBanned'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Joined'
															field='createdAt'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<th className='px-4 py-2.5 text-left'>Actions</th>
													</tr>
												</thead>
												<tbody className='divide-y divide-[#f5ede0]'>
													{helperPageRows.map(h => (
														<tr key={h.id} className='hover:bg-[#fcf8f2]'>
															<td className='px-4 py-3'>
																<div className='flex items-center gap-2.5'>
																	<Avatar
																		name={h.name || h.email || '?'}
																		size='sm'
																	/>
																	<div>
																		<p className='font-medium text-[#3d2b1f]'>
																			{h.name || '-'}
																		</p>
																		<p className='text-xs text-[#7a6050]'>
																			{h.languages.length > 0
																				? h.languages.join(' - ')
																				: '-'}
																		</p>
																	</div>
																</div>
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{h.email || '-'}
															</td>
															<td className='px-4 py-3'>
																<span
																	className={cn(
																		'text-xs px-2 py-0.5 rounded-full font-medium',
																		helperStatusColor[h.helperStatus] ??
																			'bg-slate-50 text-slate-700 border border-slate-200',
																	)}
																>
																	{helperStatusLabel[h.helperStatus] ??
																		h.helperStatus}
																</span>
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{h.ratingAvg > 0 ? h.ratingAvg.toFixed(1) : '-'}
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{h.helpCount}
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{h.points}
															</td>
															<td className='px-4 py-3'>
																<span
																	className={cn(
																		'text-xs px-2 py-0.5 rounded-full border font-medium',
																		h.isBanned
																			? 'bg-red-50 text-red-600 border-red-200'
																			: 'bg-emerald-50 text-emerald-700 border-emerald-200',
																	)}
																>
																	{h.isBanned ? 'Yes' : 'No'}
																</span>
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{formatDate(h.createdAt)}
															</td>
															<td className='px-4 py-3'>
																<div className='flex items-center gap-1.5'>
																	<button
																		onClick={() =>
																			handleBanToggle(
																				h.id,
																				h.isBanned,
																				h.name || 'Nutzer',
																			)
																		}
																		disabled={
																			banLoadingId === h.id ||
																			deleteLoadingId === h.id
																		}
																		className={cn(
																			'text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1',
																			h.isBanned
																				? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
																				: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
																		)}
																	>
																		{banLoadingId === h.id ? (
																			<Loader2
																				size={11}
																				className='animate-spin'
																			/>
																		) : h.isBanned ? (
																			<CheckCircle2 size={11} />
																		) : (
																			<XCircle size={11} />
																		)}
																		{h.isBanned ? 'Unban' : 'Ban'}
																	</button>
																	<button
																		onClick={() =>
																			handleDeleteUser(
																				h.id,
																				h.name || h.email || 'Nutzer',
																			)
																		}
																		disabled={
																			deleteLoadingId === h.id ||
																			banLoadingId === h.id
																		}
																		className='text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1 bg-red-600 text-white border-red-700 hover:bg-red-700'
																	>
																		{deleteLoadingId === h.id ? (
																			<Loader2
																				size={11}
																				className='animate-spin'
																			/>
																		) : (
																			<Trash2 size={11} />
																		)}
																		Delete
																	</button>
																</div>
															</td>
														</tr>
													))}
													{helperPageRows.length === 0 && (
														<EmptyTableRow
															colSpan={9}
															label='No helpers found.'
														/>
													)}
												</tbody>
											</table>
										)}

										{activeTab === 'seniors' && (
											<table className='min-w-255 w-full text-sm'>
												<thead className='bg-[#fcf8f2] border-y border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
													<tr>
														<SortableTh
															label='User'
															field='name'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Email'
															field='email'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<th className='px-4 py-2.5 text-left'>Role</th>
														<SortableTh
															label='Requests'
															field='requests'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Rating'
															field='ratingAvg'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<th className='px-4 py-2.5 text-left'>Status</th>
														<SortableTh
															label='Joined'
															field='createdAt'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<th className='px-4 py-2.5 text-left'>Actions</th>
													</tr>
												</thead>
												<tbody className='divide-y divide-[#f5ede0]'>
													{seniorPageRows.map(u => (
														<tr key={u.id} className='hover:bg-[#fcf8f2]'>
															<td className='px-4 py-3'>
																<div className='flex items-center gap-2.5'>
																	<Avatar
																		name={u.name || u.email || '?'}
																		size='sm'
																	/>
																	<div>
																		<p className='font-medium text-[#3d2b1f]'>
																			{u.name || '-'}
																		</p>
																		<p className='text-xs text-[#7a6050]'>
																			{u.phone || u.plz || '-'}
																		</p>
																	</div>
																</div>
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{u.email || '-'}
															</td>
															<td className='px-4 py-3'>
																<span
																	className={cn(
																		'text-xs px-2 py-0.5 rounded-full border font-medium',
																		u.role === 'RELATIVE'
																			? 'bg-blue-50 text-blue-700 border-blue-200'
																			: 'bg-[#f5ede0] text-[#8b5e3c] border-[#e8d5be]',
																	)}
																>
																	{u.role}
																</span>
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{u._count.sentRequests}
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{u.ratingAvg > 0 ? u.ratingAvg.toFixed(1) : '-'}
															</td>
															<td className='px-4 py-3'>
																<span
																	className={cn(
																		'text-xs px-2 py-0.5 rounded-full border font-medium',
																		u.isBanned
																			? 'bg-red-50 text-red-600 border-red-200'
																			: 'bg-emerald-50 text-emerald-700 border-emerald-200',
																	)}
																>
																	{u.isBanned ? 'Banned' : 'Active'}
																</span>
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{formatDate(u.createdAt)}
															</td>
															<td className='px-4 py-3'>
																<div className='flex items-center gap-1.5'>
																	<button
																		onClick={() =>
																			handleBanToggle(
																				u.id,
																				u.isBanned,
																				u.name || 'Nutzer',
																			)
																		}
																		disabled={
																			banLoadingId === u.id ||
																			deleteLoadingId === u.id
																		}
																		className={cn(
																			'text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1',
																			u.isBanned
																				? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
																				: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
																		)}
																	>
																		{banLoadingId === u.id ? (
																			<Loader2
																				size={11}
																				className='animate-spin'
																			/>
																		) : u.isBanned ? (
																			<CheckCircle2 size={11} />
																		) : (
																			<XCircle size={11} />
																		)}
																		{u.isBanned ? 'Unban' : 'Ban'}
																	</button>
																	<button
																		onClick={() =>
																			handleDeleteUser(
																				u.id,
																				u.name || u.email || 'Nutzer',
																			)
																		}
																		disabled={
																			deleteLoadingId === u.id ||
																			banLoadingId === u.id
																		}
																		className='text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1 bg-red-600 text-white border-red-700 hover:bg-red-700'
																	>
																		{deleteLoadingId === u.id ? (
																			<Loader2
																				size={11}
																				className='animate-spin'
																			/>
																		) : (
																			<Trash2 size={11} />
																		)}
																		Delete
																	</button>
																</div>
															</td>
														</tr>
													))}
													{seniorPageRows.length === 0 && (
														<EmptyTableRow
															colSpan={8}
															label='No seniors or relatives found.'
														/>
													)}
												</tbody>
											</table>
										)}

										{activeTab === 'requests' && (
											<table className='min-w-245 w-full text-sm'>
												<thead className='bg-[#fcf8f2] border-y border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
													<tr>
														<SortableTh
															label='Title'
															field='title'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<th className='px-4 py-2.5 text-left'>Category</th>
														<SortableTh
															label='Status'
															field='status'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<th className='px-4 py-2.5 text-left'>Senior</th>
														<th className='px-4 py-2.5 text-left'>Address</th>
														<SortableTh
															label='Offers'
															field='offers'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Created'
															field='createdAt'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
													</tr>
												</thead>
												<tbody className='divide-y divide-[#f5ede0]'>
													{requestPageRows.map(r => (
														<tr key={r.id} className='hover:bg-[#fcf8f2]'>
															<td className='px-4 py-3 font-medium text-[#3d2b1f]'>
																{r.title}
															</td>
															<td className='px-4 py-3'>
																<CategoryBadge category={r.category} />
															</td>
															<td className='px-4 py-3'>
																<StatusBadge
																	status={
																		r.status as
																			| 'OPEN'
																			| 'IN_PROGRESS'
																			| 'DONE'
																			| 'CANCELLED'
																	}
																/>
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{r.senior.name || '-'}
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{r.address || '-'}
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{r._count.offers}
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{formatDate(r.createdAt)}
															</td>
														</tr>
													))}
													{requestPageRows.length === 0 && (
														<EmptyTableRow
															colSpan={7}
															label='No requests found.'
														/>
													)}
												</tbody>
											</table>
										)}

										{activeTab === 'redemptions' && (
											<table className='min-w-240 w-full text-sm'>
												<thead className='bg-[#fcf8f2] border-y border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
													<tr>
														<SortableTh
															label='User'
															field='user'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Reward'
															field='reward'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Points'
															field='points'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Status'
															field='status'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<SortableTh
															label='Created'
															field='createdAt'
															sortBy={sortBy}
															sortDir={sortDir}
															onSort={toggleSort}
														/>
														<th className='px-4 py-2.5 text-left'>Actions</th>
													</tr>
												</thead>
												<tbody className='divide-y divide-[#f5ede0]'>
													{redemptionPageRows.map(r => (
														<tr key={r.id} className='hover:bg-[#fcf8f2]'>
															<td className='px-4 py-3'>
																<p className='font-medium text-[#3d2b1f]'>
																	{r.user.name ?? '-'}
																</p>
																<p className='text-xs text-[#7a6050]'>
																	{r.user.email ?? '-'}
																</p>
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{r.reward.title}
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{r.reward.pointsCost}
															</td>
															<td className='px-4 py-3'>
																<span
																	className={cn(
																		'text-xs px-2 py-0.5 rounded-full border font-medium',
																		r.status === 'fulfilled'
																			? 'bg-emerald-50 text-emerald-700 border-emerald-200'
																			: 'bg-amber-50 text-amber-700 border-amber-200',
																	)}
																>
																	{r.status}
																</span>
															</td>
															<td className='px-4 py-3 text-[#7a6050]'>
																{formatDate(r.createdAt)}
															</td>
															<td className='px-4 py-3'>
																{r.status === 'fulfilled' ? (
																	<span className='text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium'>
																		Done
																	</span>
																) : (
																	<button
																		disabled={fulfilling === r.id}
																		onClick={async () => {
																			setFulfilling(r.id)
																			try {
																				const res = await fetch(
																					`/api/rewards/${r.id}`,
																					{ method: 'PATCH' },
																				)
																				if (res.ok) {
																					setRedemptionList(prev =>
																						prev.map(x =>
																							x.id === r.id
																								? { ...x, status: 'fulfilled' }
																								: x,
																						),
																					)
																					toast({
																						title: 'Als erledigt markiert',
																						variant: 'success',
																					})
																				} else {
																					toast({
																						title: 'Fehler',
																						variant: 'error',
																					})
																				}
																			} finally {
																				setFulfilling(null)
																			}
																		}}
																		className='text-xs px-2.5 py-1 rounded-full bg-[#8b5e3c] text-white border border-[#6b4226] font-medium hover:bg-[#6b4226] transition-colors disabled:opacity-50 inline-flex items-center gap-1'
																	>
																		{fulfilling === r.id ? (
																			<Loader2
																				size={11}
																				className='animate-spin'
																			/>
																		) : (
																			<CheckCircle2 size={11} />
																		)}
																		Fulfill
																	</button>
																)}
															</td>
														</tr>
													))}
													{redemptionPageRows.length === 0 && (
														<EmptyTableRow
															colSpan={6}
															label='No redemptions found.'
														/>
													)}
												</tbody>
											</table>
										)}
									</div>

									<div className='p-4 border-t border-[#f0e8dc] flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between'>
										<p className='text-xs text-[#7a6050]'>
											Showing {currentRows.length === 0 ? 0 : pageStart + 1} -{' '}
											{Math.min(pageStart + PAGE_SIZE, currentRows.length)} of{' '}
											{currentRows.length}
										</p>
										<div className='flex items-center gap-1.5'>
											<button
												onClick={() => setPage(p => Math.max(1, p - 1))}
												disabled={page <= 1}
												className='h-8 px-2.5 rounded-lg border border-[#ddd0be] text-[#7a6050] bg-white hover:bg-[#f5ede0] disabled:opacity-50 inline-flex items-center gap-1 text-xs'
											>
												<ChevronLeft className='w-3.5 h-3.5' /> Prev
											</button>
											<span className='text-xs px-2 text-[#7a6050]'>
												Page {page} / {totalPages}
											</span>
											<button
												onClick={() =>
													setPage(p => Math.min(totalPages, p + 1))
												}
												disabled={page >= totalPages}
												className='h-8 px-2.5 rounded-lg border border-[#ddd0be] text-[#7a6050] bg-white hover:bg-[#f5ede0] disabled:opacity-50 inline-flex items-center gap-1 text-xs'
											>
												Next <ChevronRight className='w-3.5 h-3.5' />
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

function SortableTh({
	label,
	field,
	sortBy,
	sortDir,
	onSort,
}: {
	label: string
	field: string
	sortBy: string
	sortDir: SortDirection
	onSort: (field: string) => void
}) {
	return (
		<th className='px-4 py-2.5 text-left'>
			<button
				onClick={() => onSort(field)}
				className='inline-flex items-center gap-1 text-xs uppercase tracking-wide font-semibold text-[#7a6050] hover:text-[#3d2b1f]'
			>
				{label}
				<ArrowUpDown
					className={cn(
						'w-3.5 h-3.5',
						sortBy === field ? 'text-[#8b5e3c]' : 'text-[#b09880]',
					)}
				/>
				{sortBy === field ? (
					<span className='text-[10px] text-[#8b5e3c]'>
						{sortDir === 'asc' ? 'ASC' : 'DESC'}
					</span>
				) : null}
			</button>
		</th>
	)
}

function EmptyTableRow({ colSpan, label }: { colSpan: number; label: string }) {
	return (
		<tr>
			<td
				colSpan={colSpan}
				className='px-4 py-10 text-center text-sm text-[#b09880]'
			>
				{label}
			</td>
		</tr>
	)
}

function KpiSkeleton() {
	return (
		<div className='mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5'>
			{Array.from({ length: 6 }).map((_, idx) => (
				<div
					key={`kpi-s-${idx}`}
					className='rounded-2xl border border-[#e8d5be] p-4 bg-white'
				>
					<div className='animate-pulse'>
						<div className='h-3 w-24 rounded bg-[#efe2d2]' />
						<div className='h-8 w-20 rounded bg-[#f3e8da] mt-2' />
						<div className='h-2.5 w-full rounded bg-[#f5ede0] mt-4' />
						<div className='h-2.5 w-2/3 rounded bg-[#f5ede0] mt-2' />
					</div>
				</div>
			))}
		</div>
	)
}

function TableSkeleton() {
	return (
		<div className='p-4'>
			<div className='rounded-xl border border-[#eadbcc] overflow-hidden'>
				<div className='h-10 bg-[#fcf8f2]' />
				<div className='divide-y divide-[#f5ede0]'>
					{Array.from({ length: 6 }).map((_, idx) => (
						<div key={`row-s-${idx}`} className='h-12 px-4 flex items-center'>
							<div className='animate-pulse h-3 w-full rounded bg-[#f3e8da]' />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

function SectionHeading({
	icon: Icon,
	title,
	description,
	compact = false,
}: {
	icon: LucideIcon
	title: string
	description: string
	compact?: boolean
}) {
	return (
		<div>
			<div className='flex items-center gap-2'>
				<Icon
					className={cn('text-[#8b5e3c]', compact ? 'w-4 h-4' : 'w-4.5 h-4.5')}
				/>
				<h3
					className={cn(
						'font-semibold text-[#3d2b1f]',
						compact ? 'text-sm' : 'text-base',
					)}
				>
					{title}
				</h3>
			</div>
			<p
				className={cn('text-[#7a6050] mt-0.5', compact ? 'text-xs' : 'text-sm')}
			>
				{description}
			</p>
		</div>
	)
}

function safeText(value: string | null | undefined) {
	return value ?? ''
}

function tableHeading(tab: Tab) {
	if (tab === 'pending') return 'Pending Helper Applications'
	if (tab === 'helpers') return 'Helpers Directory'
	if (tab === 'seniors') return 'Seniors and Relatives'
	if (tab === 'requests') return 'Requests Control Table'
	if (tab === 'redemptions') return 'Reward Redemptions'
	return 'Admin Table'
}
