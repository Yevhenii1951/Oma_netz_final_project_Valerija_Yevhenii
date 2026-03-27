import { AlertBanners } from '@/components/alert-banners'
import {
	CategoryBadge,
	EmptyState,
	SeeAllLink,
	StatCard,
	StatusBadge,
} from '@/components/shell'
import { getRoleUiTokens } from '@/lib/role-ui'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { Role } from '@prisma/client'
import {
	ArrowRight,
	Bell,
	Calendar,
	CheckCircle,
	Clock,
	Heart,
	MapPin,
	Mic,
	PlusCircle,
	Star,
	TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { getCategoryIcon } from './dashboard-utils'

interface RecentAlert {
	id: string
	title: string
	body: string
	link: string | null
}

interface ActivityRequest {
	id: string
	title: string
	category: string
	status: string
	address: string | null
	desiredTime: string | null
}

interface HelperActivityItem {
	id: string
	request: ActivityRequest
}

interface MyRequestItem {
	id: string
	title: string
	category: string
	status: string
	createdAt: Date
	_count: { offers: number }
	offers: Array<{ helper: { name: string | null } }>
}

interface OpenRequestItem {
	id: string
	title: string
	category: string
	status: string
	address: string | null
	desiredTime: string | null
	description?: string | null
	senior: { id: string; name: string | null; image: string | null; role: Role }
	_count: { offers: number }
}

interface HelperStatusBannersProps {
	isHelper: boolean
	helperStatus?: string | null
}

export function HelperStatusBanners({
	isHelper,
	helperStatus,
}: HelperStatusBannersProps) {
	if (!isHelper) {
		return null
	}

	return (
		<>
			{helperStatus === 'PENDING_REVIEW' && (
				<div className='mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800'>
					<span className='text-xl shrink-0'>⏳</span>
					<div>
						<p className='font-semibold text-sm'>Profil wird geprüft</p>
						<p className='text-xs mt-0.5'>
							Deine Angaben werden vom Admin überprüft. Du kannst dich erst
							bewerben, wenn du freigegeben wirst. Das dauert meist 1–2
							Werktage.
						</p>
					</div>
				</div>
			)}
			{helperStatus === 'REJECTED' && (
				<div className='mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700'>
					<span className='text-xl shrink-0'>❌</span>
					<div>
						<p className='font-semibold text-sm'>Profil abgelehnt</p>
						<p className='text-xs mt-0.5'>
							Dein Helfer-Profil wurde leider nicht freigegeben. Bitte wende
							dich an das OMA-NETZ Team für weitere Informationen.
						</p>
					</div>
				</div>
			)}
		</>
	)
}

interface OverviewSectionProps {
	isHelper: boolean
	greeting: string
	firstName: string
	unreadNotifications: number
	sentRequestsCount: number
	openRequestsCount: number
	doneCount: number
	helpCount: number
	ratingAvg: number
	points: number
	recentAlerts: RecentAlert[]
}

export function OverviewSection({
	isHelper,
	greeting,
	firstName,
	unreadNotifications,
	sentRequestsCount,
	openRequestsCount,
	doneCount,
	helpCount,
	ratingAvg,
	points,
	recentAlerts,
}: OverviewSectionProps) {
	return (
		<section className='mb-8 rounded-3xl border border-[#ddd0be] bg-[#fdf8f2] p-5 md:p-6 shadow-[0_2px_10px_rgba(61,43,31,0.04)]'>
			<div className='mb-4'>
				<p className='text-[11px] font-semibold tracking-[0.16em] uppercase text-[#b09880]'>
					Übersicht
				</p>
			</div>

			<div className='mb-6 flex items-start justify-between gap-3'>
				<div>
					<p className='text-[#7a6050] text-sm mb-1'>{greeting}</p>
					<h1 className='text-2xl font-bold text-[#3d2b1f]'>{firstName} 👋</h1>
				</div>
				{isHelper && (
					<Link
						href='/notifications'
						className='relative h-10 w-10 rounded-xl border border-[#ddd0be] bg-white flex items-center justify-center text-[#7a6050] hover:bg-[#ede3d4] hover:text-[#3d2b1f] transition-colors'
						aria-label='Benachrichtigungen öffnen'
					>
						<Bell size={19} />
						{unreadNotifications > 0 && (
							<span className='absolute -top-1 -right-1 min-w-4.5 h-4.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1'>
								{unreadNotifications > 9 ? '9+' : unreadNotifications}
							</span>
						)}
					</Link>
				)}
			</div>

			{!isHelper && (
				<div className='grid grid-cols-3 gap-3 mb-6'>
					<StatCard
						label='Meine Anfragen'
						value={sentRequestsCount}
						icon={<PlusCircle size={20} />}
						color='text-[#8b5e3c]'
						bg='bg-[#f5ede0]'
					/>
					<StatCard
						label='Helfer verfügbar'
						value={openRequestsCount}
						icon={<Heart size={20} />}
						color='text-rose-500'
						bg='bg-rose-50'
					/>
					<StatCard
						label='Abgeschlossen'
						value={doneCount}
						icon={<CheckCircle size={20} />}
						color='text-sky-500'
						bg='bg-sky-50'
					/>
				</div>
			)}

			<AlertBanners
				alerts={recentAlerts.map(a => ({
					id: a.id,
					title: a.title,
					body: a.body,
					link: a.link,
				}))}
			/>

			{isHelper && (
				<div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-8'>
					<StatCard
						label='Geholfen'
						value={helpCount}
						icon={<Heart size={20} />}
						color='text-[#8b5e3c]'
						bg='bg-[#f5ede0]'
					/>
					<StatCard
						label='Bewertung'
						value={ratingAvg > 0 ? `${ratingAvg.toFixed(1)}★` : '—'}
						icon={<Star size={20} />}
						color='text-amber-500'
						bg='bg-amber-50'
					/>
					<StatCard
						label='Punkte'
						value={points}
						icon={<TrendingUp size={20} />}
						color='text-emerald-500'
						bg='bg-emerald-50'
					/>
					<StatCard
						label='Offen'
						value={openRequestsCount}
						icon={<Clock size={20} />}
						color='text-sky-500'
						bg='bg-sky-50'
					/>
				</div>
			)}
		</section>
	)
}

interface QuickAccessSectionProps {
	isHelper: boolean
	points: number
}

export function QuickAccessSection({
	isHelper,
	points,
}: QuickAccessSectionProps) {
	return (
		<section className='mb-8 rounded-3xl border border-[#ddd0be] bg-[#fdf8f2] p-5 md:p-6 shadow-[0_2px_10px_rgba(61,43,31,0.04)]'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='font-bold text-[#3d2b1f]'>Schnellzugriff</h2>
			</div>
			<div className='grid grid-cols-2 gap-3'>
				{isHelper ? (
					<>
						<Link
							href='/requests'
							className='card p-4 flex items-center gap-3 card-hover group'
						>
							<div className='w-10 h-10 rounded-xl bg-[#e8d5be] flex items-center justify-center group-hover:bg-[#8b5e3c] transition-colors'>
								<Heart
									size={18}
									className='text-[#8b5e3c] group-hover:text-[#ffffff] transition-colors'
								/>
							</div>
							<div>
								<p className='font-semibold text-[#3d2b1f] text-sm'>Anfragen</p>
								<p className='text-xs text-[#b09880]'>Hilfe anbieten</p>
							</div>
							<ArrowRight
								size={15}
								className='ml-auto text-[#b09880] group-hover:text-[#8b5e3c] transition-colors'
							/>
						</Link>
						<Link
							href='/rewards'
							className='card p-4 flex items-center gap-3 card-hover group'
						>
							<div className='w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors'>
								<Star
									size={18}
									className='text-amber-500 group-hover:text-[#ffffff] transition-colors'
								/>
							</div>
							<div>
								<p className='font-semibold text-[#3d2b1f] text-sm'>
									Belohnungen
								</p>
								<p className='text-xs text-[#b09880]'>{points} Punkte</p>
							</div>
							<ArrowRight
								size={15}
								className='ml-auto text-[#b09880] group-hover:text-amber-500 transition-colors'
							/>
						</Link>
					</>
				) : (
					<>
						<Link
							href='/requests/new'
							className='p-4 rounded-2xl bg-[#8b5e3c] flex items-center gap-3 hover:bg-[#6b4226] transition-colors group'
						>
							<div className='w-10 h-10 rounded-xl bg-[#ffffff]/20 flex items-center justify-center'>
								<PlusCircle size={18} className='text-[#ffffff]' />
							</div>
							<div>
								<p className='font-semibold text-[#ffffff] text-sm'>
									Anfrage stellen
								</p>
								<p className='text-xs text-[#e8d5be]'>Hilfe anfordern</p>
							</div>
						</Link>
						<Link
							href='/dashboard?openAi=1&voice=1'
							className='card p-4 flex items-center gap-3 card-hover group bg-[#f5ede0] border-[#e8d5be]'
						>
							<div className='w-10 h-10 rounded-xl bg-[#e8d5be] flex items-center justify-center group-hover:bg-[#8b5e3c] transition-colors'>
								<Mic
									size={18}
									className='text-[#8b5e3c] group-hover:text-[#ffffff] transition-colors'
								/>
							</div>
							<div>
								<p className='font-semibold text-[#3d2b1f] text-sm'>
									Mit Stimme erstellen
								</p>
								<p className='text-xs text-[#7a6050]'>
									KI-Button unten rechts nutzen
								</p>
							</div>
							<ArrowRight
								size={15}
								className='ml-auto text-[#b09880] group-hover:text-[#8b5e3c]'
							/>
						</Link>
					</>
				)}
			</div>
		</section>
	)
}

interface HelperActivitySectionProps {
	isHelper: boolean
	myActivity: HelperActivityItem[]
}

export function HelperActivitySection({
	isHelper,
	myActivity,
}: HelperActivitySectionProps) {
	if (!isHelper || myActivity.length === 0) {
		return null
	}

	return (
		<section className='mb-8 rounded-3xl border border-[#ddd0be] bg-[#fdf8f2] p-5 md:p-6 shadow-[0_2px_10px_rgba(61,43,31,0.04)]'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='font-bold text-[#3d2b1f] animate-pulse [animation-duration:2.4s] [animation-timing-function:ease-in-out]'>
					Meine Aktivitäten
				</h2>
				<SeeAllLink href='/chat' />
			</div>
			<div className='space-y-3'>
				{myActivity.map(({ id, request }) => {
					const CategoryIcon = getCategoryIcon(request.category)
					return (
						<Link
							key={id}
							href={`/requests/${request.id}`}
							className='card p-4 flex items-center gap-3 card-hover'
						>
							<div className='text-2xl'>
								<CategoryIcon className='w-6 h-6' />
							</div>
							<div className='flex-1 min-w-0'>
								<p className='font-semibold text-[#3d2b1f] text-sm truncate'>
									{request.title}
								</p>
								<div className='flex items-center gap-2 mt-0.5'>
									<MapPin size={11} className='text-[#b09880]' />
									<span className='text-xs text-[#b09880] truncate'>
										{request.address}
									</span>
								</div>
							</div>
							<StatusBadge
								status={
									request.status as
										| 'OPEN'
										| 'IN_PROGRESS'
										| 'DONE'
										| 'CANCELLED'
								}
							/>
						</Link>
					)
				})}
			</div>
		</section>
	)
}

interface SeniorActivitySectionProps {
	isHelper: boolean
	myRequests: MyRequestItem[]
}

export function SeniorActivitySection({
	isHelper,
	myRequests,
}: SeniorActivitySectionProps) {
	if (isHelper) {
		return null
	}

	return (
		<section className='mb-8 rounded-3xl border border-[#ddd0be] bg-[#fdf8f2] p-5 md:p-6 shadow-[0_2px_10px_rgba(61,43,31,0.04)]'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='font-bold text-[#3d2b1f] animate-pulse [animation-duration:2.4s] [animation-timing-function:ease-in-out]'>
					Meine Aktivitäten
				</h2>
				<SeeAllLink href='/requests?mine=true' />
			</div>
			{myRequests.length === 0 ? (
				<EmptyState
					icon='📋'
					title='Noch keine Anfragen'
					description='Erstelle deine erste Hilfeanfrage und finde einen Helfer.'
					action={
						<Link href='/requests/new' className='btn-primary'>
							<PlusCircle size={16} /> Anfrage erstellen
						</Link>
					}
				/>
			) : (
				<div className='space-y-3'>
					{myRequests.map(req => {
						const acceptedHelperName = req.offers[0]?.helper.name ?? null
						const hasOffers = req._count.offers > 0 && req.status === 'OPEN'
						const CategoryIcon = getCategoryIcon(req.category)
						return (
							<Link
								key={req.id}
								href={`/requests/${req.id}`}
								className={`card p-4 flex items-center gap-3 card-hover relative ${
									hasOffers
										? 'border-[#c8956c] shadow-[0_0_0_2px_rgba(200,149,108,0.25)]'
										: ''
								}`}
							>
								{hasOffers && (
									<span className='absolute -top-1.5 -right-1.5 flex h-4 w-4'>
										<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8956c] opacity-75' />
										<span className='relative inline-flex rounded-full h-4 w-4 bg-[#8b5e3c] items-center justify-center'>
											<span className='text-[#ffffff] text-[9px] font-bold leading-none'>
												{req._count.offers}
											</span>
										</span>
									</span>
								)}
								<div className='text-2xl'>
									<CategoryIcon className='w-6 h-6' />
								</div>
								<div className='flex-1 min-w-0'>
									<p className='font-semibold text-[#3d2b1f] text-sm truncate'>
										{req.title}
									</p>
									<p
										className={`text-xs mt-0.5 ${
											hasOffers
												? 'text-[#8b5e3c] font-semibold'
												: 'text-[#b09880]'
										}`}
									>
										{hasOffers
											? `🙋 ${req._count.offers} ${req._count.offers === 1 ? 'neues Angebot' : 'neue Angebote'}!`
											: `${req._count.offers} Angebote · ${formatRelativeTime(req.createdAt)}`}
									</p>
									{acceptedHelperName && req.status === 'IN_PROGRESS' && (
										<p className='text-xs mt-1 text-sky-700'>
											In Bearbeitung: {acceptedHelperName}
										</p>
									)}
									{acceptedHelperName && req.status === 'DONE' && (
										<p className='text-xs mt-1 text-emerald-700'>
											Abgeschlossen von: {acceptedHelperName}
										</p>
									)}
								</div>
								<StatusBadge
									status={
										req.status as 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
									}
								/>
							</Link>
						)
					})}
				</div>
			)}
		</section>
	)
}

interface OpenRequestsFeedSectionProps {
	isHelper: boolean
	helperStatus?: string | null
	openRequests: OpenRequestItem[]
}

export function OpenRequestsFeedSection({
	isHelper,
	helperStatus,
	openRequests,
}: OpenRequestsFeedSectionProps) {
	if (!isHelper || helperStatus !== 'APPROVED') {
		return null
	}

	return (
		<section className='rounded-3xl border border-[#ddd0be] bg-[#fdf8f2] p-5 md:p-6 shadow-[0_2px_10px_rgba(61,43,31,0.04)]'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='font-bold text-[#3d2b1f]'>Neue Anfragen in Kassel</h2>
				<SeeAllLink href='/requests' />
			</div>

			{openRequests.length === 0 ? (
				<EmptyState
					icon='🌟'
					title='Keine offenen Anfragen'
					description='Gerade gibt es keine offenen Anfragen.'
				/>
			) : (
				<div className='space-y-3'>
					{openRequests.map(req => {
						const srole = req.senior.role as Role
						const { cardAccent, iconBg, rolePill, roleLabel, descBorder } =
							getRoleUiTokens(srole)
						const CategoryIcon = getCategoryIcon(req.category)
						return (
							<Link
								key={req.id}
								href={`/requests/${req.id}`}
								className={`card p-4 card-hover block ${cardAccent}`}
							>
								<div className='flex items-start gap-3'>
									<div
										className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
									>
										<CategoryIcon className='w-5 h-5' />
									</div>
									<div className='flex-1 min-w-0'>
										<div className='flex items-start justify-between gap-2 flex-wrap'>
											<p className='font-semibold text-[#3d2b1f] text-sm leading-snug'>
												{req.title}
											</p>
											<div className='flex items-center gap-1.5 shrink-0'>
												<span
													className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rolePill}`}
												>
													{roleLabel}
												</span>
												<CategoryBadge category={req.category as string} />
											</div>
										</div>

										{req.description && (
											<div className={`mt-2 pl-2.5 border-l-2 ${descBorder}`}>
												<p className='text-xs text-[#7a6050] italic line-clamp-2 leading-relaxed'>
													{req.description}
												</p>
											</div>
										)}

										<div className='flex items-center gap-3 mt-2.5'>
											<span className='flex items-center gap-1 text-xs text-[#b09880]'>
												<MapPin size={11} /> {req.address}
											</span>
											{req.desiredTime && (
												<span className='flex items-center gap-1 text-xs text-[#b09880]'>
													<Calendar size={11} /> {formatDate(req.desiredTime)}
												</span>
											)}
										</div>
									</div>
								</div>
							</Link>
						)
					})}
				</div>
			)}
		</section>
	)
}
