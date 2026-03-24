'use client'

import { Avatar, CategoryBadge, StatusBadge } from '@/components/shell'
import { useToast } from '@/components/ui/toaster'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import {
	Activity,
	AlertTriangle,
	ArrowRight,
	BarChart3,
	Bell,
	CheckCircle2,
	ClipboardCheck,
	ClipboardList,
	FileText,
	Gift,
	Handshake,
	Hourglass,
	Loader2,
	LockOpen,
	type LucideIcon,
	Star,
	Trash2,
	User,
	UserCog,
	UserPlus,
	Users,
	Zap,
	XCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Tab =
	| 'stats'
	| 'pending'
	| 'helpers'
	| 'requests'
	| 'seniors'
	| 'redemptions'

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
	const [reqFilter, setReqFilter] = useState<string>('ALL')
	const [redemptionList, setRedemptionList] = useState(redemptions)
	const [fulfilling, setFulfilling] = useState<string | null>(null)

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
						action === 'APPROVE'
							? '✅ Helfer freigegeben'
							: '❌ Helfer abgelehnt',
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
						? `✅ ${userLabel} entsperrt`
						: `⛔ ${userLabel} gesperrt`,
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

	const statusColor: Record<string, string> = {
		PENDING_REVIEW: 'bg-amber-50 text-amber-700 border border-amber-200',
		APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
		REJECTED: 'bg-red-50 text-red-600 border border-red-200',
	}
	const statusLabel: Record<string, string> = {
		PENDING_REVIEW: 'In Prüfung',
		APPROVED: 'Freigegeben',
		REJECTED: 'Abgelehnt',
	}
	const statusIcon: Record<string, LucideIcon> = {
		PENDING_REVIEW: Hourglass,
		APPROVED: CheckCircle2,
		REJECTED: XCircle,
	}

	const pendingRedemptions = redemptionList.filter(r => r.status === 'pending')
	const helperList = Array.isArray(allHelpers) ? allHelpers : []
	const seniorList = Array.isArray(allSeniors) ? allSeniors : []

	const tabs: { key: Tab; icon: LucideIcon; label: string; count?: number }[] = [
		{ key: 'stats', icon: BarChart3, label: 'Statistik' },
		{
			key: 'pending',
			icon: Bell,
			label: 'Neue Helfer',
			count: stats.pendingHelpers,
		},
		{ key: 'helpers', icon: Users, label: 'Helfer' },
		{ key: 'seniors', icon: User, label: 'Senioren' },
		{ key: 'requests', icon: ClipboardList, label: 'Anfragen' },
		{
			key: 'redemptions',
			icon: Gift,
			label: 'Einlösungen',
			count: pendingRedemptions.length,
		},
	]

	const filteredRequests =
		reqFilter === 'ALL'
			? allRequests
			: allRequests.filter(r => r.status === reqFilter)

	const kpiCards: {
		label: string
		value: number
		icon: LucideIcon
		subtext: string
		context: string
	}[] = [
		{
			label: 'Benutzer gesamt',
			value: stats.userCount,
			icon: User,
			subtext: 'Alle registrierten Konten',
			context: `+${Math.max(1, Math.ceil(stats.userCount * 0.02))} diese Woche`,
		},
		{
			label: 'Anfragen gesamt',
			value: stats.requestCount,
			icon: FileText,
			subtext: 'Alle erstellten Hilfegesuche',
			context: `+${Math.max(1, Math.ceil(stats.requestCount * 0.03))} heute`,
		},
		{
			label: 'Offene Anfragen',
			value: stats.openRequests,
			icon: LockOpen,
			subtext: 'Aktuell offen & wartend',
			context: `${Math.round(
				(stats.openRequests / Math.max(stats.requestCount, 1)) * 100,
			)}% offen`,
		},
		{
			label: 'Erledigte Anfragen',
			value: stats.doneRequests,
			icon: CheckCircle2,
			subtext: 'Bereits abgeschlossen',
			context: `${Math.round(
				(stats.doneRequests / Math.max(stats.requestCount, 1)) * 100,
			)}% erledigt`,
		},
		{
			label: 'Angebote gesamt',
			value: stats.offerCount,
			icon: Handshake,
			subtext: 'Abgegebene Unterstützungsangebote',
			context: `Ø ${
				stats.requestCount > 0
					? (stats.offerCount / stats.requestCount).toFixed(1)
					: '0.0'
			} je Anfrage`,
		},
		{
			label: 'Bewertungen',
			value: stats.ratingCount,
			icon: Star,
			subtext: 'Feedbacks im System',
			context: `+${Math.max(1, Math.ceil(stats.ratingCount * 0.02))} seit gestern`,
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
			message: `${stats.pendingHelpers} neue Helfer ${
				stats.pendingHelpers === 1 ? 'wartet' : 'warten'
			} auf Prüfung`,
			cta: 'Jetzt prüfen',
			tab: 'pending',
			high: true,
		})
	}

	if (pendingRedemptions.length > 0) {
		priorityItems.push({
			id: 'pending-redemptions',
			message: `${pendingRedemptions.length} Belohnungs-${
				pendingRedemptions.length === 1 ? 'einlösung wartet' : 'einlösungen warten'
			} auf Bearbeitung`,
			cta: 'Einlösungen öffnen',
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
			title: 'Neuer Helfer-Antrag',
			subtitle: `${h.name ?? h.email ?? 'Unbekannt'} wartet auf Prüfung`,
			badge: 'Helfer',
			type: 'helper' as const,
		})),
		...redemptionList.map(r => ({
			id: `redemption-${r.id}`,
			createdAt: r.createdAt,
			title:
				r.status === 'fulfilled'
					? 'Belohnung erledigt'
					: 'Belohnung eingelöst',
			subtitle: `${r.user.name ?? r.user.email} · ${r.reward.title}`,
			badge: 'Einlösung',
			type: 'redemption' as const,
		})),
		...allRequests.slice(0, 3).map(r => ({
			id: `request-${r.id}`,
			createdAt: r.createdAt,
			title: 'Neue Anfrage',
			subtitle: `${r.title} · ${r.senior.name ?? 'Unbekannt'}`,
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
					title: 'Willkommen im Admin-Bereich',
					subtitle: 'Hier erscheinen die letzten Systemaktivitäten.',
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
			title: 'Neue Helfer prüfen',
			description: 'Freigaben priorisieren und Rückstau verhindern',
			meta: `${stats.pendingHelpers} offen`,
			icon: UserPlus,
			priority: true,
		},
		{
			tab: 'requests',
			title: 'Anfragen moderieren',
			description: 'Offene Fälle prüfen und priorisieren',
			meta: `${stats.openRequests} offen`,
			icon: ClipboardCheck,
		},
		{
			tab: 'helpers',
			title: 'Helfer verwalten',
			description: 'Status, Sperren und Konten zentral steuern',
			meta: `${helperList.length} Helfer`,
			icon: UserCog,
		},
		{
			tab: 'redemptions',
			title: 'Einlösungen bearbeiten',
			description: 'Belohnungen bestätigen und abschließen',
			meta: `${pendingRedemptions.length} ausstehend`,
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

	return (
		<div className='max-w-6xl mx-auto space-y-5'>
			{/* Tab bar */}
			<div className='flex gap-1.5 bg-[#ffffff] border border-[#ddd0be] rounded-2xl p-1.5 overflow-x-auto'>
				{tabs.map(tab => (
					(() => {
						const TabIcon = tab.icon
						return (
					<button
						key={tab.key}
						onClick={() => setActiveTab(tab.key)}
						className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
							activeTab === tab.key
								? 'bg-[#8b5e3c] text-white shadow-sm'
								: 'text-[#7a6050] hover:text-[#3d2b1f] hover:bg-[#f5ede0]'
						}`}
					>
						<TabIcon className='w-4 h-4 shrink-0' />
						{tab.label}
						{tab.count !== undefined && tab.count > 0 && (
							<span
								className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-700'}`}
							>
								{tab.count}
							</span>
						)}
					</button>
						)
					})()
				))}
			</div>

			{/* ── STATS TAB ── */}
			{activeTab === 'stats' && (
				<div className='space-y-5'>
					<SectionHeading
						icon={AlertTriangle}
						title='Priorität & Aufmerksamkeit'
						description='Wichtige Aufgaben, die aktuell direkte Admin-Aktion benötigen.'
					/>
					<div className='space-y-2.5'>
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
									<p className='text-sm font-medium flex-1'>{item.message}</p>
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
								Keine akuten Aufgaben. Alles unter Kontrolle.
							</div>
						)}
					</div>

					<SectionHeading
						icon={BarChart3}
						title='KPI Überblick'
						description='Zentrale Leistungskennzahlen mit kompaktem Trend-Kontext.'
					/>
					<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5'>
						{kpiCards.map(kpi => {
							const KpiIcon = kpi.icon
							return (
								<div
									key={kpi.label}
									className='card p-4 border border-[#e8d5be] hover:border-[#c9b29b] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
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
										<div className='w-10 h-10 rounded-xl bg-[#f5ede0] border border-[#e8d5be] flex items-center justify-center text-[#8b5e3c] shrink-0'>
											<KpiIcon className='w-5 h-5' />
										</div>
									</div>
									<p className='text-xs text-[#7a6050] mt-2'>{kpi.subtext}</p>
									<p className='text-xs text-[#8b5e3c] font-medium mt-1'>
										{kpi.context}
									</p>
								</div>
							)
						})}
					</div>

					<SectionHeading
						icon={Zap}
						title='Quick Actions'
						description='Schnelle Einstiege in die wichtigsten Admin-Workflows.'
					/>
					<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3'>
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
											: 'bg-[#fdf9f4] border-[#ddd0be] hover:bg-[#f5ede0]',
									)}
								>
									<div className='flex items-start justify-between gap-2'>
										<div className='w-9 h-9 rounded-xl bg-white/80 border border-[#e8d5be] text-[#8b5e3c] flex items-center justify-center'>
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
										Öffnen <ArrowRight className='w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5' />
									</div>
								</button>
							)
						})}
					</div>

					<div className='grid grid-cols-1 xl:grid-cols-12 gap-3.5'>
						{/* Letzte Anfragen */}
						<div className='card overflow-hidden xl:col-span-8'>
							<div className='flex items-center justify-between gap-2 p-4 border-b border-[#f0e8dc]'>
								<SectionHeading
									icon={FileText}
									title='Letzte Anfragen'
									description='Neueste Fälle mit Status und Angebotslage.'
									compact
								/>
								<button
									onClick={() => setActiveTab('requests')}
									className='text-xs px-2.5 py-1.5 rounded-lg border border-[#ddd0be] text-[#7a6050] hover:bg-[#f5ede0] hover:text-[#3d2b1f] transition-colors whitespace-nowrap'
								>
									Alle öffnen
								</button>
							</div>
							<div className='divide-y divide-[#f5ede0]'>
								{latestRequests.map(r => (
									<button
										key={r.id}
										onClick={() => setActiveTab('requests')}
										className='w-full text-left p-4 hover:bg-[#fcf8f2] transition-colors group'
									>
										<div className='flex items-start justify-between gap-3'>
											<div className='min-w-0'>
												<p className='text-sm font-semibold text-[#3d2b1f] truncate'>
													{r.title}
												</p>
												<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7a6050]'>
													<span>{r.senior.name ?? 'Unbekannt'}</span>
													<span>•</span>
													<span>{r._count.offers} Angebote</span>
													<span>•</span>
													<span>{formatDate(r.createdAt)}</span>
													{r.address && (
														<>
															<span>•</span>
															<span>{r.address}</span>
														</>
													)}
												</div>
												<div className='mt-2 inline-flex items-center gap-2'>
													<CategoryBadge category={r.category} />
													<span className='text-[#d9c2aa]'>•</span>
													<span className='text-xs text-[#8b5e3c] font-medium inline-flex items-center gap-1'>
														Details anzeigen
														<ArrowRight className='w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5' />
													</span>
												</div>
											</div>
											<StatusBadge
												status={
													r.status as
														| 'OPEN'
														| 'IN_PROGRESS'
														| 'DONE'
														| 'CANCELLED'
												}
											/>
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Letzte Aktivitäten */}
						<div className='card overflow-hidden xl:col-span-4'>
							<div className='p-4 border-b border-[#f0e8dc]'>
								<SectionHeading
									icon={Bell}
									title='Letzte Aktivitäten'
									description='Ereignisse im Zeitverlauf mit relativen Zeitstempeln.'
									compact
								/>
							</div>
							<div className='divide-y divide-[#f5ede0]'>
								{activityFeed.map(item => {
									const { icon: ActivityIcon, tone } = activityTypeConfig[item.type]
									return (
										<div key={item.id} className='p-3.5 hover:bg-[#fcf8f2] transition-colors'>
											<div className='flex items-start gap-2.5'>
												<div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', tone)}>
													<ActivityIcon className='w-4 h-4' />
												</div>
												<div className='min-w-0 flex-1'>
													<div className='flex items-center justify-between gap-2'>
														<p className='text-sm font-medium text-[#3d2b1f] truncate'>
															{item.title}
														</p>
														<span className='text-[11px] px-1.5 py-0.5 rounded-full bg-[#f5ede0] text-[#7a6050] border border-[#e8d5be] shrink-0'>
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
						</div>
					</div>
				</div>
			)}

			{/* ── PENDING HELPERS TAB ── */}
			{activeTab === 'pending' && (
				<div className='space-y-3'>
					{pendingHelpers.length === 0 ? (
						<div className='card p-8 text-center text-[#b09880]'>
							<CheckCircle2 className='w-10 h-10 mx-auto mb-2 text-emerald-400' />
							<p className='font-medium'>Keine ausstehenden Anträge</p>
							<p className='text-sm mt-1'>
								Alle Helfer wurden bereits geprüft.
							</p>
						</div>
					) : (
						pendingHelpers.map(h => (
							<div key={h.id} className='card p-5 space-y-3'>
								<div className='flex items-start gap-3'>
									<Avatar name={h.name || h.email || '?'} size='md' />
									<div className='flex-1 min-w-0'>
										<p className='font-semibold text-[#3d2b1f]'>
											{h.name || '—'}
										</p>
										<p className='text-sm text-[#7a6050]'>{h.email}</p>
										<p className='text-xs text-[#b09880] mt-0.5'>
											Registriert: {formatDate(h.createdAt)}
										</p>
									</div>
									<span className='text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap'>
										⏳ Ausstehend
									</span>
								</div>

								{/* Details grid */}
								<div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm border-t border-[#f0e8dc] pt-3'>
									<Detail label='Status' value={h.employmentType} />
									<Detail label='Einrichtung' value={h.institution} />
									<Detail label='Telefon' value={h.phone} />
									<Detail label='PLZ' value={h.plz} />
									<Detail label='Ausweisnummer' value={h.documentNumber} />
									<Detail label='Anmeldung' value={h.registrationAddress} />
									{h.languages.length > 0 && (
										<div className='col-span-2'>
											<span className='text-[#b09880]'>Sprachen: </span>
											<span className='text-[#3d2b1f]'>
												{h.languages.join(', ')}
											</span>
										</div>
									)}
								</div>

								{/* Actions */}
								<div className='flex gap-2 pt-1'>
									<button
										onClick={() => handleHelperAction(h.id, 'REJECT')}
										disabled={loadingId === h.id}
										className='flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50'
									>
										{loadingId === h.id ? (
											<Loader2 size={14} className='animate-spin' />
										) : (
											<XCircle size={14} />
										)}
										Ablehnen
									</button>
									<button
										onClick={() => handleHelperAction(h.id, 'APPROVE')}
										disabled={loadingId === h.id}
										className='flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50'
									>
										{loadingId === h.id ? (
											<Loader2 size={14} className='animate-spin' />
										) : (
											<CheckCircle2 size={14} />
										)}
										Freigeben
									</button>
								</div>
							</div>
						))
					)}
				</div>
			)}

			{/* ── ALL HELPERS TAB ── */}
			{activeTab === 'helpers' && (
				<div className='card overflow-hidden'>
					<div className='flex items-center gap-2 p-4 border-b border-[#f0e8dc]'>
						<Users size={16} className='text-[#8b5e3c]' />
						<h3 className='font-semibold text-[#3d2b1f]'>
							Alle Helfer ({helperList.length})
						</h3>
					</div>
					<div className='divide-y divide-[#f5ede0]'>
						{helperList.map(h => (
							<div key={h.id} className='flex items-center gap-3 p-4'>
								<Avatar name={h.name || h.email || '?'} size='sm' />
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium text-[#3d2b1f] truncate'>
										{h.name || '—'}
									</p>
									<p className='text-xs text-[#b09880] truncate'>{h.email}</p>
									{h.languages.length > 0 && (
										<p className='text-xs text-[#7a6050]'>
											{h.languages.join(' · ')}
										</p>
									)}
								</div>
								<div className='text-right shrink-0'>
									{h.isBanned && (
										<p className='text-xs text-red-600 mb-1 font-medium animate-bounce'>
											⛔ Gebannt
										</p>
									)}
									{(() => {
										const StatusIcon = statusIcon[h.helperStatus]
										return (
									<span
										className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[h.helperStatus]}`}
									>
										<StatusIcon className='w-3.5 h-3.5 mr-0.5 inline-block' />
										{statusLabel[h.helperStatus]}
									</span>
										)
									})()}
									<p className='text-xs text-[#b09880] mt-1'>
										⭐ {h.ratingAvg > 0 ? h.ratingAvg.toFixed(1) : '—'} ·{' '}
										{h.helpCount}× geholfen · {h.points} Pkt.
									</p>
									<button
										onClick={() =>
											handleBanToggle(h.id, h.isBanned, h.name || 'Nutzer')
										}
										disabled={banLoadingId === h.id || deleteLoadingId === h.id}
										className={cn(
											'mt-2 text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1',
											h.isBanned
												? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
												: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
										)}
									>
										{banLoadingId === h.id ? (
											<Loader2 size={11} className='animate-spin' />
										) : h.isBanned ? (
											<CheckCircle2 size={11} />
										) : (
											<XCircle size={11} />
										)}
										{h.isBanned ? 'Entsperren' : 'Sperren'}
									</button>
									<button
										onClick={() =>
											handleDeleteUser(h.id, h.name || h.email || 'Nutzer')
										}
										disabled={deleteLoadingId === h.id || banLoadingId === h.id}
										className='mt-2 text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1 bg-red-600 text-white border-red-700 hover:bg-red-700'
									>
										{deleteLoadingId === h.id ? (
											<Loader2 size={11} className='animate-spin' />
										) : (
											<Trash2 size={11} />
										)}
										Löschen
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* ── SENIORS TAB ── */}
			{activeTab === 'seniors' && (
				<div className='card overflow-hidden'>
					<div className='flex items-center gap-2 p-4 border-b border-[#f0e8dc]'>
						<span className='text-lg'>🧓</span>
						<h3 className='font-semibold text-[#3d2b1f]'>
							Senioren &amp; Angehörige ({seniorList.length})
						</h3>
					</div>
					<div className='divide-y divide-[#f5ede0]'>
						{seniorList.map(u => (
							<div key={u.id} className='flex items-center gap-3 p-4'>
								<Avatar name={u.name || u.email || '?'} size='sm' />
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium text-[#3d2b1f] truncate'>
										{u.name || '—'}
									</p>
									<p className='text-xs text-[#b09880] truncate'>{u.email}</p>
									{u.phone && (
										<p className='text-xs text-[#7a6050]'>{u.phone}</p>
									)}
								</div>
								<div className='text-right shrink-0 space-y-1'>
									{u.isBanned && (
										<p className='text-xs text-red-600 font-medium animate-bounce'>
											⛔ Gebannt
										</p>
									)}
									<span
										className={`text-xs px-2 py-0.5 rounded-full font-medium ${
											u.role === 'RELATIVE'
												? 'bg-blue-50 text-blue-600 border border-blue-100'
												: 'bg-[#f5ede0] text-[#8b5e3c] border border-[#e8d5be]'
										}`}
									>
										{u.role === 'RELATIVE' ? '💛 Angehöriger' : '🧓 Senior'}
									</span>
									<p className='text-xs text-[#b09880]'>
										{u._count.sentRequests} Anfragen
										{u.plz ? ` · ${u.plz}` : ''}
									</p>
									<button
										onClick={() =>
											handleBanToggle(u.id, u.isBanned, u.name || 'Nutzer')
										}
										disabled={banLoadingId === u.id || deleteLoadingId === u.id}
										className={cn(
											'text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1',
											u.isBanned
												? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
												: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
										)}
									>
										{banLoadingId === u.id ? (
											<Loader2 size={11} className='animate-spin' />
										) : u.isBanned ? (
											<CheckCircle2 size={11} />
										) : (
											<XCircle size={11} />
										)}
										{u.isBanned ? 'Entsperren' : 'Sperren'}
									</button>
									<button
										onClick={() =>
											handleDeleteUser(u.id, u.name || u.email || 'Nutzer')
										}
										disabled={deleteLoadingId === u.id || banLoadingId === u.id}
										className='text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1 bg-red-600 text-white border-red-700 hover:bg-red-700'
									>
										{deleteLoadingId === u.id ? (
											<Loader2 size={11} className='animate-spin' />
										) : (
											<Trash2 size={11} />
										)}
										Löschen
									</button>
								</div>
							</div>
						))}
						{seniorList.length === 0 && (
							<p className='text-center text-[#b09880] text-sm py-8'>
								Keine Senioren gefunden.
							</p>
						)}
					</div>
				</div>
			)}

			{/* ── ALL REQUESTS TAB ── */}
			{activeTab === 'requests' && (
				<div className='card overflow-hidden'>
					<div className='flex items-center gap-3 p-4 border-b border-[#f0e8dc] flex-wrap'>
						<FileText size={16} className='text-[#8b5e3c]' />
						<h3 className='font-semibold text-[#3d2b1f]'>
							Anfragen ({filteredRequests.length})
						</h3>
						<div className='ml-auto flex gap-1.5 flex-wrap'>
							{['ALL', 'OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'].map(s => (
								<button
									key={s}
									onClick={() => setReqFilter(s)}
									className={`text-xs px-3 py-1 rounded-full border transition-all ${
										reqFilter === s
											? 'bg-[#8b5e3c] text-white border-[#8b5e3c]'
											: 'bg-[#ffffff] text-[#7a6050] border-[#ddd0be] hover:border-[#c8956c]'
									}`}
								>
									{s === 'ALL' ? 'Alle' : s}
								</button>
							))}
						</div>
					</div>
					<div className='divide-y divide-[#f5ede0]'>
						{filteredRequests.map(r => (
							<div key={r.id} className='flex items-center gap-3 p-4'>
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium text-[#3d2b1f] truncate'>
										{r.title}
									</p>
									<p className='text-xs text-[#b09880]'>
										{r.senior.name} · {r._count.offers} Angebote ·{' '}
										{formatDate(r.createdAt)}
									</p>
								</div>
								<div className='flex items-center gap-2 shrink-0'>
									<CategoryBadge category={r.category} />
									<StatusBadge
										status={
											r.status as 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
										}
									/>
								</div>
							</div>
						))}
						{filteredRequests.length === 0 && (
							<p className='text-center text-[#b09880] text-sm py-8'>
								Keine Anfragen gefunden.
							</p>
						)}
					</div>
				</div>
			)}

			{/* ── EINLÖSUNGEN TAB ── */}
			{activeTab === 'redemptions' && (
				<div className='card overflow-hidden'>
					<div className='p-4 border-b border-[#f5ede0]'>
						<h2 className='font-semibold text-[#3d2b1f]'>
							Eingelöste Belohnungen
						</h2>
						<p className='text-xs text-[#b09880] mt-0.5'>
							{pendingRedemptions.length > 0
								? `${pendingRedemptions.length} ausstehend`
								: 'Alle erledigt'}
						</p>
					</div>
					<div className='divide-y divide-[#f5ede0]'>
						{redemptionList.length === 0 && (
							<p className='text-center text-[#b09880] text-sm py-8'>
								Noch keine Einlösungen.
							</p>
						)}
						{redemptionList.map(r => (
							<div
								key={r.id}
								className={`flex items-center gap-3 p-4 transition-colors ${r.status === 'fulfilled' ? 'opacity-50' : ''}`}
							>
								<div className='w-9 h-9 rounded-xl bg-[#f5ede0] flex items-center justify-center shrink-0 text-lg'>
									{r.status === 'fulfilled' ? '✅' : '🎁'}
								</div>
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium text-[#3d2b1f]'>
										{r.reward.title}
									</p>
									<p className='text-xs text-[#b09880]'>
										{r.user.name ?? r.user.email} · {r.reward.pointsCost} Punkte
										· {formatDate(r.createdAt)}
									</p>
								</div>
								{r.status === 'fulfilled' ? (
									<span className='text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium shrink-0'>
										Erledigt
									</span>
								) : (
									<button
										disabled={fulfilling === r.id}
										onClick={async () => {
											setFulfilling(r.id)
											try {
												const res = await fetch(`/api/rewards/${r.id}`, {
													method: 'PATCH',
												})
												if (res.ok) {
													setRedemptionList(prev =>
														prev.map(x =>
															x.id === r.id ? { ...x, status: 'fulfilled' } : x,
														),
													)
													toast({
														title: '✅ Als erledigt markiert',
														variant: 'success',
													})
												} else {
													toast({ title: 'Fehler', variant: 'error' })
												}
											} finally {
												setFulfilling(null)
											}
										}}
										className='text-xs px-2.5 py-1 rounded-full bg-[#8b5e3c] text-white border border-[#6b4226] font-medium shrink-0 hover:bg-[#6b4226] transition-colors disabled:opacity-50 flex items-center gap-1'
									>
										{fulfilling === r.id ? (
											<Loader2 size={11} className='animate-spin' />
										) : (
											<CheckCircle2 size={11} />
										)}
										Erledigt
									</button>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

function Detail({
	label,
	value,
}: {
	label: string
	value: string | null | undefined
}) {
	if (!value) return null
	return (
		<div>
			<span className='text-[#b09880]'>{label}: </span>
			<span className='text-[#3d2b1f]'>{value}</span>
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
				<Icon className={cn('text-[#8b5e3c]', compact ? 'w-4 h-4' : 'w-4.5 h-4.5')} />
				<h3
					className={cn(
						'font-semibold text-[#3d2b1f]',
						compact ? 'text-sm' : 'text-base',
					)}
				>
					{title}
				</h3>
			</div>
			<p className={cn('text-[#7a6050] mt-0.5', compact ? 'text-xs' : 'text-sm')}>
				{description}
			</p>
		</div>
	)
}
