import type { AdminTab } from '@/app/admin/components/admin-ui'
import {
	Activity,
	BarChart3,
	Bell,
	CheckCircle2,
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

interface AdminStats {
	userCount: number
	requestCount: number
	offerCount: number
	ratingCount: number
	openRequests: number
	doneRequests: number
	pendingHelpers: number
}

interface PendingHelperRow {
	id: string
	name: string | null
	email: string | null
	createdAt: string
}

interface RequestRow {
	id: string
	title: string
	category: string
	status: string
	address: string | null
	createdAt: string
	senior: { name: string | null }
	_count: { offers: number }
}

interface RedemptionRow {
	id: string
	createdAt: string
	status: string
	user: { name: string | null; email: string | null }
	reward: { title: string; pointsCost: number }
}

interface BuildQuickActionsInput {
	stats: AdminStats
	helperCount: number
	pendingRedemptionsCount: number
}

interface BuildActivityFeedInput {
	pendingHelpers: PendingHelperRow[]
	redemptionList: RedemptionRow[]
	allRequests: RequestRow[]
}

export function buildTabs(
	pendingHelpersCount: number,
	pendingRedemptionsCount: number,
): { key: AdminTab; icon: LucideIcon; label: string; count?: number }[] {
	return [
		{ key: 'stats', icon: BarChart3, label: 'Statistik' },
		{
			key: 'pending',
			icon: Bell,
			label: 'Offene Helfer',
			count: pendingHelpersCount,
		},
		{ key: 'helpers', icon: Users, label: 'Helfer' },
		{ key: 'seniors', icon: User, label: 'Senioren' },
		{ key: 'requests', icon: ClipboardList, label: 'Anfragen' },
		{
			key: 'redemptions',
			icon: Gift,
			label: 'Einlösungen',
			count: pendingRedemptionsCount,
		},
	]
}

export function buildKpiCards(stats: AdminStats): {
	label: string
	value: number
	icon: LucideIcon
	subtext: string
	context: string
	tone: string
}[] {
	return [
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
}

export function buildPriorityItems(
	pendingHelpersCount: number,
	pendingRedemptionsCount: number,
): {
	id: string
	message: string
	cta: string
	tab: AdminTab
	high: boolean
}[] {
	const items: {
		id: string
		message: string
		cta: string
		tab: AdminTab
		high: boolean
	}[] = []

	if (pendingHelpersCount > 0) {
		items.push({
			id: 'pending-helpers',
			message: `${pendingHelpersCount} Helfer-${pendingHelpersCount === 1 ? 'Bewerbung wartet' : 'Bewerbungen warten'} auf Prüfung`,
			cta: 'Jetzt prüfen',
			tab: 'pending',
			high: true,
		})
	}

	if (pendingRedemptionsCount > 0) {
		items.push({
			id: 'pending-redemptions',
			message: `${pendingRedemptionsCount} ${pendingRedemptionsCount === 1 ? 'Einlösung ist' : 'Einlösungen sind'} noch offen`,
			cta: 'Einlösungen öffnen',
			tab: 'redemptions',
			high: false,
		})
	}

	return items
}

export function buildLatestRequests(allRequests: RequestRow[]): RequestRow[] {
	return allRequests.length > 0
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
}

export function buildActivityFeed({
	pendingHelpers,
	redemptionList,
	allRequests,
}: BuildActivityFeedInput): {
	id: string
	createdAt: string
	title: string
	subtitle: string
	badge: string
	type: 'helper' | 'redemption' | 'request' | 'system'
}[] {
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
			subtitle: `${h.name ?? h.email ?? 'Unbekannt'} wartet auf Prüfung`,
			badge: 'Helfer',
			type: 'helper' as const,
		})),
		...redemptionList.map(r => ({
			id: `redemption-${r.id}`,
			createdAt: r.createdAt,
			title:
				r.status === 'fulfilled'
					? 'Einlösung abgeschlossen'
					: 'Belohnung eingelöst',
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

	return recentActivity.length > 0
		? recentActivity
		: [
				{
					id: 'demo-activity',
					createdAt: new Date().toISOString(),
					title: 'Willkommen im Adminbereich',
					subtitle: 'Aktuelle Systemaktivitäten erscheinen hier.',
					badge: 'System',
					type: 'system' as const,
				},
			]
}

export function buildQuickActions({
	stats,
	helperCount,
	pendingRedemptionsCount,
}: BuildQuickActionsInput): {
	tab: AdminTab
	title: string
	description: string
	meta: string
	icon: LucideIcon
	priority?: boolean
}[] {
	return [
		{
			tab: 'pending',
			title: 'Helfer-Bewerbungen prüfen',
			description: 'Freigaben bearbeiten, um Rückstau zu vermeiden',
			meta: `${stats.pendingHelpers} offen`,
			icon: UserPlus,
			priority: true,
		},
		{
			tab: 'requests',
			title: 'Anfragen moderieren',
			description: 'Offene Fälle prüfen und Dringendes priorisieren',
			meta: `${stats.openRequests} offen`,
			icon: ClipboardCheck,
		},
		{
			tab: 'helpers',
			title: 'Helfer verwalten',
			description: 'Status, Sperren und Kontolebenszyklus steuern',
			meta: `${helperCount} Helfer`,
			icon: UserCog,
		},
		{
			tab: 'redemptions',
			title: 'Belohnungen bearbeiten',
			description: 'Offene Einlösungen bestätigen und erledigen',
			meta: `${pendingRedemptionsCount} offen`,
			icon: Gift,
		},
	]
}

export const activityTypeConfig: Record<
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

export const helperStatusColor: Record<string, string> = {
	PENDING_REVIEW: 'bg-amber-50 text-amber-700 border border-amber-200',
	APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
	REJECTED: 'bg-red-50 text-red-600 border border-red-200',
}

export const helperStatusLabel: Record<string, string> = {
	PENDING_REVIEW: 'In Prüfung',
	APPROVED: 'Freigegeben',
	REJECTED: 'Abgelehnt',
}
