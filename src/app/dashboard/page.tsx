import { auth } from '@/auth'
import { AiAssistantButton } from '@/components/ai-assistant'
import { AlertBanners } from '@/components/alert-banners'
import {
	CategoryBadge,
	EmptyState,
	PageShell,
	SeeAllLink,
	StatCard,
	StatusBadge,
} from '@/components/shell'
import { prisma } from '@/lib/prisma'
//import { getRoleUiTokens } from '@/lib/role-ui'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import {
	ArrowRight,
	Calendar,
	Car,
	CheckCircle,
	Clock,
	Cross,
	Heart,
	House,
	type LucideIcon,
	Laptop,
	MapPin,
	Footprints,
	PlusCircle,
	ShoppingCart,
	Star,
	TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
	const session = await auth()
	if (!session?.user) redirect('/login')

	const userId = session.user.id
	const role = session.user.role

	// Fetch user profile
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			name: true,
			points: true,
			ratingAvg: true,
			helpCount: true,
			helperStatus: true,
			_count: { select: { sentRequests: true, offers: true } },
		},
	})

	// Fetch recent open requests (for display)
	const openRequests = await prisma.request.findMany({
		where: { status: 'OPEN' },
		orderBy: { createdAt: 'desc' },
		take: 5,
		include: {
			senior: { select: { id: true, name: true, image: true, role: true } },
			_count: { select: { offers: true } },
		},
	})

	// Fetch user's own requests (if senior/relative)
	const myRequests =
		role !== 'HELPER'
			? await prisma.request.findMany({
					where: { seniorId: userId },
					orderBy: { createdAt: 'desc' },
					take: 3,
					include: { _count: { select: { offers: true } } },
				})
			: []

	// Fetch accepted offers for helper
	const myActivity =
		role === 'HELPER'
			? await prisma.offer.findMany({
					where: { helperId: userId, status: 'ACCEPTED' },
					orderBy: { createdAt: 'desc' },
					take: 3,
					include: {
						request: {
							select: {
								id: true,
								title: true,
								category: true,
								status: true,
								address: true,
								desiredTime: true,
							},
						},
					},
				})
			: []

	// Count completed requests for senior/relative
	const doneCount =
		role !== 'HELPER' && role !== 'ADMIN'
			? await prisma.request.count({
					where: { seniorId: userId, status: 'DONE' },
				})
			: 0

	const isHelper = role === 'HELPER'
	const greeting = getGreeting()

	// Fetch recent unread notifications (for alert banners)
	// eslint-disable-next-line react-hooks/purity
	const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
	const recentAlerts = await prisma.notification.findMany({
		where: {
			userId: userId,
			read: false,
			createdAt: { gte: weekAgo },
		},
		orderBy: { createdAt: 'desc' },
		take: 5,
	})

	return (
		<PageShell title='Dashboard'>
			<div className='max-w-4xl mx-auto px-4 py-8'>
				{/* ─── HELPER STATUS BANNERS ─── */}
				{isHelper && user?.helperStatus === 'PENDING_REVIEW' && (
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
				{isHelper && user?.helperStatus === 'REJECTED' && (
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

				{/* ─── GREETING ─── */}
				<div className='mb-6'>
					<p className='text-[#7a6050] text-sm mb-1'>{greeting}</p>
					<h1 className='text-2xl font-bold text-[#3d2b1f]'>
						{user?.name?.split(' ')[0] ?? 'Willkommen'} 👋
					</h1>
				</div>

				{/* ─── STATS ROW (senior/relative — right under name) ─── */}
				{!isHelper && role !== 'ADMIN' && (
					<div className='grid grid-cols-3 gap-3 mb-6'>
						<StatCard
							label='Meine Anfragen'
							value={user?._count.sentRequests ?? 0}
							icon={<PlusCircle size={20} />}
							color='text-[#8b5e3c]'
							bg='bg-[#f5ede0]'
						/>
						<StatCard
							label='Helfer verfügbar'
							value={openRequests.length}
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

				{/* ─── ALERT BANNERS (unread notifications) ─── */}
				<AlertBanners
					alerts={recentAlerts.map(a => ({
						id: a.id,
						title: a.title,
						body: a.body,
						link: a.link,
					}))}
				/>

				{/* ─── STATS ROW (helper) ─── */}
				{isHelper && (
					<div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-8'>
						<StatCard
							label='Geholfen'
							value={user?.helpCount ?? 0}
							icon={<Heart size={20} />}
							color='text-[#8b5e3c]'
							bg='bg-[#f5ede0]'
						/>
						<StatCard
							label='Bewertung'
							value={user?.ratingAvg ? `${user.ratingAvg.toFixed(1)}★` : '—'}
							icon={<Star size={20} />}
							color='text-amber-500'
							bg='bg-amber-50'
						/>
						<StatCard
							label='Punkte'
							value={user?.points ?? 0}
							icon={<TrendingUp size={20} />}
							color='text-emerald-500'
							bg='bg-emerald-50'
						/>
						<StatCard
							label='Offen'
							value={openRequests.length}
							icon={<Clock size={20} />}
							color='text-sky-500'
							bg='bg-sky-50'
						/>
					</div>
				)}

				{/* ─── QUICK ACTIONS ─── */}
				<div className='grid grid-cols-2 gap-3 mb-8'>
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
									<p className='font-semibold text-[#3d2b1f] text-sm'>
										Anfragen
									</p>
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
									<p className='text-xs text-[#b09880]'>
										{user?.points ?? 0} Punkte
									</p>
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
								href='/requests'
								className='card p-4 flex items-center gap-3 card-hover group'
							>
								<div className='w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center group-hover:bg-sky-500 transition-colors'>
									<Calendar
										size={18}
										className='text-sky-500 group-hover:text-[#ffffff] transition-colors'
									/>
								</div>
								<div>
									<p className='font-semibold text-[#3d2b1f] text-sm'>
										Anfragen
									</p>
									<p className='text-xs text-[#b09880]'>Alle ansehen</p>
								</div>
								<ArrowRight size={15} className='ml-auto text-[#b09880]' />
							</Link>
						</>
					)}
				</div>

				{/* ─── MY ACTIVITY (helper) ─── */}
				{isHelper && myActivity.length > 0 && (
					<section className='mb-8'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='font-bold text-[#3d2b1f]'>Meine Aktivitäten</h2>
							<SeeAllLink href='/chat' />
						</div>
						<div className='space-y-3'>
							{myActivity.map(({ id, request }) => {
								const CategoryIcon = getCategoryIcon(request.category)
								return (
								<Link
									key={id}
									href={`/chat/${request.id}`}
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
				)}

				{/* ─── MY REQUESTS (senior/relative) ─── */}
				{!isHelper && (
					<section className='mb-8'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='font-bold text-[#3d2b1f]'>Meine Anfragen</h2>
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
									const hasOffers =
										req._count.offers > 0 && req.status === 'OPEN'
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
											{/* Pulsing dot — new offer notification */}
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
													className={`text-xs mt-0.5 ${hasOffers ? 'text-[#8b5e3c] font-semibold' : 'text-[#b09880]'}`}
												>
													{hasOffers
														? `🙋 ${req._count.offers} ${req._count.offers === 1 ? 'neues Angebot' : 'neue Angebote'}!`
														: `${req._count.offers} Angebote · ${formatRelativeTime(req.createdAt)}`}
												</p>
											</div>
											<StatusBadge
												status={
													req.status as
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
						)}
					</section>
				)}

				{/* ─── OPEN REQUESTS FEED ─── */}
				{(!isHelper || user?.helperStatus === 'APPROVED') && (
					<section>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='font-bold text-[#3d2b1f]'>
								{isHelper ? 'Neue Anfragen in Kassel' : 'Aktuelle Anfragen'}
							</h2>
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
									// const srole = req.senior.role
									// const {
									// 	cardAccent,
									// 	iconBg,
									// 	rolePill,
									// 	roleLabel,
									// 	descBorder,
									// } = getRoleUiTokens(srole)
									const CategoryIcon = getCategoryIcon(req.category)
									return (
										<Link
											key={req.id}
											href={`/requests/${req.id}`}
											// className={`card p-4 card-hover block ${cardAccent}`}
											className='card p-4 card-hover block'
										>
											<div className='flex items-start gap-3'>
												<div
													// className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
													className='w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#f5ede0]'
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
																	// className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rolePill}`}
																	className='text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f5ede0] text-[#8b5e3c]'
															>
																	{/* {roleLabel} */}
																	{req.senior.role}
															</span>
															<CategoryBadge
																category={req.category as string}
															/>
														</div>
													</div>

													{req.description && (
														<div
															// className={`mt-2 pl-2.5 border-l-2 ${descBorder}`}
															className='mt-2 pl-2.5 border-l-2 border-[#e8d5be]'
														>
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
																<Calendar size={11} />{' '}
																{formatDate(req.desiredTime)}
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
				)}
			</div>

			{/* Floating AI Assistant */}
			{/* <AiAssistantButton /> */}
		</PageShell>
	)
}

function getGreeting(): string {
	const h = new Date().getHours()
	if (h < 12) return 'Guten Morgen,'
	if (h < 17) return 'Guten Tag,'
	return 'Guten Abend,'
}

function getCategoryIcon(category: string): LucideIcon {
	const icons: Record<string, LucideIcon> = {
		EINKAUF: ShoppingCart,
		ARZT: Cross,
		SPAZIERGANG: Footprints,
		TECHNIK: Laptop,
		TRANSPORT: Car,
		HAUSHALT: House,
		ANDERES: Heart,
	}
	return icons[category] ?? Heart
}
