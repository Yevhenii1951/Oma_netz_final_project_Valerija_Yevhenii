import { CategoryBadge, StatusBadge } from '@/components/shell'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import {
	AlertTriangle,
	ArrowRight,
	BarChart3,
	Bell,
	FileText,
	Hourglass,
	SlidersHorizontal,
	type LucideIcon,
} from 'lucide-react'
import { KpiSkeleton, SectionHeading, type AdminTab } from './admin-ui'

interface PriorityItem {
	id: string
	message: string
	cta: string
	tab: AdminTab
	high: boolean
}

interface KpiCard {
	label: string
	value: number
	icon: LucideIcon
	subtext: string
	context: string
	tone: string
}

interface QuickAction {
	tab: AdminTab
	title: string
	description: string
	meta: string
	icon: LucideIcon
	priority?: boolean
}

interface LatestRequest {
	id: string
	title: string
	category: string
	status: string
	address: string | null
	createdAt: string
	senior: { name: string | null }
	_count: { offers: number }
}

interface ActivityFeedItem {
	id: string
	createdAt: string
	title: string
	subtitle: string
	badge: string
	type: 'helper' | 'redemption' | 'request' | 'system'
}

interface ActivityTypeConfig {
	icon: LucideIcon
	tone: string
}

interface AdminStatsTabProps {
	priorityItems: PriorityItem[]
	kpiCards: KpiCard[]
	quickActions: QuickAction[]
	latestRequests: LatestRequest[]
	activityFeed: ActivityFeedItem[]
	activityTypeConfig: Record<
		'helper' | 'redemption' | 'request' | 'system',
		ActivityTypeConfig
	>
	isBootLoading: boolean
	onTabChange: (tab: AdminTab) => void
}

export function AdminStatsTab({
	priorityItems,
	kpiCards,
	quickActions,
	latestRequests,
	activityFeed,
	activityTypeConfig,
	isBootLoading,
	onTabChange,
}: AdminStatsTabProps) {
	return (
		<div className='space-y-6'>
			<section className='rounded-2xl border border-[#eadbcc] bg-linear-to-r from-[#fffaf4] to-white p-4 sm:p-5 shadow-sm'>
				<SectionHeading
					icon={AlertTriangle}
					title='Prioritaeten'
					description='Aufgaben, die jetzt direkte Admin-Aufmerksamkeit brauchen.'
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
								<p className='text-sm font-medium flex-1'>{item.message}</p>
								<button
									onClick={() => onTabChange(item.tab)}
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
							Aktuell keine dringenden Aufgaben. Alles laeuft stabil.
						</div>
					)}
				</div>
			</section>

			<section className='rounded-2xl border border-[#eadbcc] bg-white p-4 sm:p-5 shadow-sm'>
				<SectionHeading
					icon={BarChart3}
					title='KPI-Ueberblick'
					description='Kernmetriken fuer den taeglichen Betrieb.'
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
									<p className='text-xs text-[#7a6050] mt-2'>{kpi.subtext}</p>
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
					title='Schnellaktionen'
					description='Direkte Einstiege fuer wichtige Admin-Workflows.'
				/>
				<div className='mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3'>
					{quickActions.map(action => {
						const ActionIcon = action.icon
						return (
							<button
								key={action.title}
								onClick={() => onTabChange(action.tab)}
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
									Oeffnen{' '}
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
							title='Neueste Anfragen'
							description='Tabellarische Uebersicht der neuesten Anfragen.'
							compact
						/>
						<button
							onClick={() => onTabChange('requests')}
							className='text-xs px-2.5 py-1.5 rounded-lg border border-[#ddd0be] text-[#7a6050] hover:bg-[#f5ede0] hover:text-[#3d2b1f] transition-colors whitespace-nowrap'
						>
							Alle oeffnen
						</button>
					</div>
					<div className='overflow-x-auto'>
						<table className='min-w-210 w-full text-sm'>
							<thead className='bg-[#fcf8f2] border-b border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
								<tr>
									<th className='px-4 py-2.5 text-left'>Titel</th>
									<th className='px-4 py-2.5 text-left'>Senior</th>
									<th className='px-4 py-2.5 text-left'>Kategorie</th>
									<th className='px-4 py-2.5 text-left'>Status</th>
									<th className='px-4 py-2.5 text-left'>Angebote</th>
									<th className='px-4 py-2.5 text-left'>Erstellt</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-[#f5ede0]'>
								{latestRequests.map(r => (
									<tr
										key={r.id}
										onClick={() => onTabChange('requests')}
										className='hover:bg-[#fcf8f2] cursor-pointer'
									>
										<td className='px-4 py-3 font-medium text-[#3d2b1f]'>
											{r.title}
										</td>
										<td className='px-4 py-3 text-[#7a6050]'>
											{r.senior.name ?? 'Unbekannt'}
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
							title='Aktivitaets-Feed'
							description='Aktuelle Ereignisse mit klarer Zeitleiste.'
							compact
						/>
					</div>
					<div className='divide-y divide-[#f5ede0]'>
						{activityFeed.map(item => {
							const { icon: ActivityIcon, tone } = activityTypeConfig[item.type]
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
	)
}
