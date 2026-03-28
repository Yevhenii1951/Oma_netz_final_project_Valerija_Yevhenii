import { cn } from '@/lib/utils'
import { ArrowUpDown, type LucideIcon } from 'lucide-react'

export type AdminTab =
	| 'stats'
	| 'pending'
	| 'helpers'
	| 'requests'
	| 'seniors'
	| 'redemptions'

export function SortableTh({
	label,
	field,
	sortBy,
	sortDir,
	onSort,
}: {
	label: string
	field: string
	sortBy: string
	sortDir: 'asc' | 'desc'
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
						{sortDir === 'asc' ? 'AUF' : 'AB'}
					</span>
				) : null}
			</button>
		</th>
	)
}

export function EmptyTableRow({
	colSpan,
	label,
}: {
	colSpan: number
	label: string
}) {
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

export function KpiSkeleton() {
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

export function TableSkeleton() {
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

export function SectionHeading({
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

export function safeText(value: string | null | undefined) {
	return value ?? ''
}

export function tableHeading(tab: AdminTab) {
	if (tab === 'pending') return 'Offene Helfer-Bewerbungen'
	if (tab === 'helpers') return 'Helfer-Verzeichnis'
	if (tab === 'seniors') return 'Senioren und Angehoerige'
	if (tab === 'requests') return 'Anfragen-Uebersicht'
	if (tab === 'redemptions') return 'Belohnungs-Einloesungen'
	return 'Admin-Tabelle'
}

export function filterOptionLabel(option: string, tab: AdminTab) {
	if (option === 'ALL') return 'Alle'
	if (option === 'ACTIVE') return 'Aktiv'
	if (option === 'BANNED') return 'Gesperrt'
	if (option === 'PENDING_REVIEW') return 'In Pruefung'
	if (option === 'APPROVED') return 'Freigegeben'
	if (option === 'REJECTED') return 'Abgelehnt'
	if (tab === 'redemptions' && option === 'pending') return 'Offen'
	if (tab === 'redemptions' && option === 'fulfilled') return 'Erledigt'
	return option
}
