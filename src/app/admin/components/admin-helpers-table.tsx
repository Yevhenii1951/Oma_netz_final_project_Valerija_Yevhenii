import { Avatar } from '@/components/shell'
import { cn, formatDate } from '@/lib/utils'
import { CheckCircle2, Loader2, Trash2, XCircle } from 'lucide-react'
import type { HelperRow, SortDirection } from './admin-data-table-types'
import { EmptyTableRow, SortableTh } from './admin-ui'

interface AdminHelpersTableProps {
	sortBy: string
	sortDir: SortDirection
	onSort: (field: string) => void
	helperPageRows: HelperRow[]
	helperStatusColor: Record<string, string>
	helperStatusLabel: Record<string, string>
	banLoadingId: string | null
	deleteLoadingId: string | null
	onBanToggle: (
		id: string,
		isCurrentlyBanned: boolean,
		userLabel: string,
	) => void
	onDeleteUser: (id: string, userLabel: string) => void
}

export function AdminHelpersTable({
	sortBy,
	sortDir,
	onSort,
	helperPageRows,
	helperStatusColor,
	helperStatusLabel,
	banLoadingId,
	deleteLoadingId,
	onBanToggle,
	onDeleteUser,
}: AdminHelpersTableProps) {
	return (
		<table className='min-w-270 w-full text-sm'>
			<thead className='bg-[#fcf8f2] border-y border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
				<tr>
					<SortableTh
						label='Helper'
						field='name'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<SortableTh
						label='E-Mail'
						field='email'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<th className='px-4 py-2.5 text-left'>Status</th>
					<SortableTh
						label='Bewertung'
						field='ratingAvg'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<SortableTh
						label='Hilfen'
						field='helpCount'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<SortableTh
						label='Punkte'
						field='points'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<SortableTh
						label='Gesperrt'
						field='isBanned'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<SortableTh
						label='Seit'
						field='createdAt'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<th className='px-4 py-2.5 text-left'>Aktionen</th>
				</tr>
			</thead>
			<tbody className='divide-y divide-[#f5ede0]'>
				{helperPageRows.map(h => (
					<tr key={h.id} className='hover:bg-[#fcf8f2]'>
						<td className='px-4 py-3'>
							<div className='flex items-center gap-2.5'>
								<Avatar name={h.name || h.email || '?'} size='sm' />
								<div>
									<p className='font-medium text-[#3d2b1f]'>{h.name || '-'}</p>
									<p className='text-xs text-[#7a6050]'>
										{h.languages.length > 0 ? h.languages.join(' - ') : '-'}
									</p>
								</div>
							</div>
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>{h.email || '-'}</td>
						<td className='px-4 py-3'>
							<span
								className={cn(
									'text-xs px-2 py-0.5 rounded-full font-medium',
									helperStatusColor[h.helperStatus] ??
										'bg-slate-50 text-slate-700 border border-slate-200',
								)}
							>
								{helperStatusLabel[h.helperStatus] ?? h.helperStatus}
							</span>
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>
							{h.ratingAvg > 0 ? h.ratingAvg.toFixed(1) : '-'}
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>{h.helpCount}</td>
						<td className='px-4 py-3 text-[#7a6050]'>{h.points}</td>
						<td className='px-4 py-3'>
							<span
								className={cn(
									'text-xs px-2 py-0.5 rounded-full border font-medium',
									h.isBanned
										? 'bg-red-50 text-red-600 border-red-200'
										: 'bg-emerald-50 text-emerald-700 border-emerald-200',
								)}
							>
								{h.isBanned ? 'Ja' : 'Nein'}
							</span>
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>
							{formatDate(h.createdAt)}
						</td>
						<td className='px-4 py-3'>
							<div className='flex items-center gap-1.5'>
								<button
									onClick={() =>
										onBanToggle(h.id, h.isBanned, h.name || 'Nutzer')
									}
									disabled={banLoadingId === h.id || deleteLoadingId === h.id}
									className={cn(
										'text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1',
										h.isBanned
											? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
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
										onDeleteUser(h.id, h.name || h.email || 'Nutzer')
									}
									disabled={deleteLoadingId === h.id || banLoadingId === h.id}
									className='text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1 bg-red-600 text-white border-red-700 hover:bg-red-700'
								>
									{deleteLoadingId === h.id ? (
										<Loader2 size={11} className='animate-spin' />
									) : (
										<Trash2 size={11} />
									)}
									Löschen
								</button>
							</div>
						</td>
					</tr>
				))}
				{helperPageRows.length === 0 && (
					<EmptyTableRow colSpan={9} label='Keine Helfer gefunden.' />
				)}
			</tbody>
		</table>
	)
}
