import { auth } from '@/auth'
import { RequestFilters } from '@/components/request-filters'
import {
	CategoryBadge,
	EmptyState,
	PageShell,
	StatusBadge,
} from '@/components/shell'
import { prisma } from '@/lib/prisma'
import { getRoleUiTokens } from '@/lib/role-ui'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { CATEGORIES } from '@/types'
import { Icon } from '@iconify/react'
import { Calendar, MapPin, PlusCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Anfragen' }

interface Props {
	searchParams: Promise<{ category?: string; status?: string; mine?: string }>
}

export default async function RequestsPage({ searchParams }: Props) {
	const session = await auth()
	if (!session?.user) redirect('/login')
	const role = session.user.role
	const isSeniorView = role === 'SENIOR' || role === 'RELATIVE'
	const canCreateRequest = role !== 'HELPER' && role !== 'ADMIN'

	const params = await searchParams
	const category = params.category as string | undefined
	const status = params.status ?? 'OPEN'
	const mineOnly = isSeniorView || params.mine === 'true'

	const where: Record<string, unknown> = {}
	if (status !== 'ALL') where.status = status
	if (category) where.category = category
	if (mineOnly) where.seniorId = session.user.id

	const requests = await prisma.request.findMany({
		where,
		orderBy: { createdAt: 'desc' },
		take: 50,
		include: {
			senior: { select: { id: true, name: true, image: true, role: true } },
			_count: { select: { offers: true } },
		},
	})

	return (
		<PageShell title='Anfragen'>
			<div className='max-w-4xl mx-auto px-4 py-8'>
				<div className='flex items-center justify-between mb-6'>
					<div>
						<h1 className='text-2xl font-bold text-[#3d2b1f]'>
							{mineOnly ? 'Meine Anfragen' : 'Alle Anfragen'}
						</h1>
						<p className='text-[#7a6050] text-sm mt-0.5'>
							{requests.length} {requests.length === 1 ? 'Anfrage' : 'Anfragen'}{' '}
							gefunden
						</p>
					</div>
					{canCreateRequest && (
						<Link href='/requests/new' className='btn-primary'>
							<PlusCircle size={16} /> Neu
						</Link>
					)}
				</div>

				{/* Filters */}
				<RequestFilters
					categories={CATEGORIES}
					currentCategory={category}
					currentStatus={status}
				/>

				{/* List */}
				<div className='mt-6'>
					{requests.length === 0 ? (
						<EmptyState
							icon='📋'
							title='Keine Anfragen gefunden'
							description={
								canCreateRequest
									? 'Ändere die Filter oder erstelle eine neue Anfrage.'
									: 'Ändere die Filter oder probiere es später erneut.'
							}
							action={
								canCreateRequest ? (
									<Link href='/requests/new' className='btn-primary'>
										<PlusCircle size={16} /> Erste Anfrage erstellen
									</Link>
								) : undefined
							}
						/>
					) : (
						<div className='space-y-3'>
							{requests.map(req => {
								const srole = req.senior.role
								const { cardAccent, iconBg, rolePill, roleLabel, descBorder } =
									getRoleUiTokens(srole)
								const helperCardBg = srole === 'HELPER' ? '!bg-[#f0faf4]' : ''
								return (
									<Link
										key={req.id}
										href={`/requests/${req.id}`}
										className={`card p-4 md:p-5 card-hover block group animate-fade-in ${cardAccent} ${helperCardBg}`}
									>
										<div className='flex items-start gap-4'>
											{/* Category icon */}
											<div
												className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${iconBg}`}
											>
												<Icon
													icon={getCategoryIcon(req.category)}
													className='w-6 h-6'
												/>
											</div>

											{/* Content */}
											<div className='flex-1 min-w-0'>
												<div className='flex items-start gap-2 flex-wrap'>
													<h3 className='font-semibold text-[#3d2b1f] text-base group-hover:text-[#6b4226] transition-colors flex-1'>
														{req.title}
													</h3>
													<div className='flex gap-2 shrink-0 items-center'>
														<span
															className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rolePill}`}
														>
															{roleLabel}
														</span>
														<CategoryBadge category={req.category as string} />
														<StatusBadge
															status={
																req.status as
																	| 'OPEN'
																	| 'IN_PROGRESS'
																	| 'DONE'
																	| 'CANCELLED'
															}
														/>
													</div>
												</div>

												{/* Description — expressive */}
												{req.description && (
													<div className={`mt-2 pl-3 border-l-2 ${descBorder}`}>
														<p className='text-[#7a6050] text-sm italic line-clamp-2 leading-relaxed'>
															{req.description}
														</p>
													</div>
												)}

												<div className='flex items-center gap-4 mt-3 flex-wrap'>
													<span className='flex items-center gap-1.5 text-xs text-[#b09880]'>
														<MapPin size={12} className='text-[#b09880]' />
														{req.address}
													</span>
													{req.desiredTime && (
														<span className='flex items-center gap-1.5 text-xs text-[#b09880]'>
															<Calendar size={12} className='text-[#b09880]' />
															{formatDate(req.desiredTime, {
																day: '2-digit',
																month: 'short',
																hour: '2-digit',
																minute: '2-digit',
															})}
														</span>
													)}
													<span
														className={`flex items-center gap-1.5 text-xs ${
															req._count.offers > 0 &&
															req.status === 'OPEN' &&
															req.senior.id === session.user.id
																? 'text-[#8b5e3c] font-semibold'
																: 'text-[#b09880]'
														}`}
													>
														{req._count.offers > 0 &&
														req.status === 'OPEN' &&
														req.senior.id === session.user.id ? (
															<span className='relative flex h-2 w-2 mr-0.5'>
																<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8956c] opacity-75' />
																<span className='relative inline-flex rounded-full h-2 w-2 bg-[#8b5e3c]' />
															</span>
														) : (
															<Users size={12} className='text-[#b09880]' />
														)}
														{req._count.offers}{' '}
														{req._count.offers === 1 ? 'Angebot' : 'Angebote'}
													</span>
													<span className='text-xs text-[#b09880]'>
														{formatRelativeTime(req.createdAt)}
													</span>
												</div>
											</div>
										</div>
									</Link>
								)
							})}
						</div>
					)}
				</div>
			</div>
		</PageShell>
	)
}

function getCategoryIcon(category: string): string {
	const icons: Record<string, string> = {
		EINKAUF: 'ph:shopping-cart-bold',
		ARZT: 'ph:first-aid-bold',
		SPAZIERGANG: 'ph:person-simple-walk-bold',
		TECHNIK: 'ph:laptop-bold',
		TRANSPORT: 'ph:car-bold',
		HAUSHALT: 'ph:house-bold',
		ANDERES: 'ph:heart-bold',
	}
	return icons[category] ?? 'ph:heart-bold'
}
