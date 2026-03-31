import { Avatar } from '@/components/shell'
import { cn, formatDate } from '@/lib/utils'
import { CheckCircle2, Loader2, Trash2, XCircle } from 'lucide-react'
import type { SeniorRow, SortDirection } from './admin-data-table-types'
import { EmptyTableRow, SortableTh } from './admin-ui'

interface AdminSeniorsTableProps {
	sortBy: string
	sortDir: SortDirection
	onSort: (field: string) => void
	seniorPageRows: SeniorRow[]
	banLoadingId: string | null
	deleteLoadingId: string | null
	onBanToggle: (
		id: string,
		isCurrentlyBanned: boolean,
		userLabel: string,
	) => void
	onDeleteUser: (id: string, userLabel: string) => void
}

export function AdminSeniorsTable({
	sortBy,
	sortDir,
	onSort,
	seniorPageRows,
	banLoadingId,
	deleteLoadingId,
	onBanToggle,
	onDeleteUser,
}: AdminSeniorsTableProps) {
	return (
		<table className='min-w-255 w-full text-sm'>
			<thead className='bg-[#fcf8f2] border-y border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
				<tr>
					<SortableTh
						label='Nutzer'
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
					<th className='px-4 py-2.5 text-left'>Rolle</th>
					<SortableTh
						label='Anfragen'
						field='requests'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<SortableTh
						label='Bewertung'
						field='ratingAvg'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<th className='px-4 py-2.5 text-left'>Status</th>
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
				{seniorPageRows.map(u => (
					<tr key={u.id} className='hover:bg-[#fcf8f2]'>
						<td className='px-4 py-3'>
							<div className='flex items-center gap-2.5'>
								<Avatar name={u.name || u.email || '?'} size='sm' />
								<div>
									<p className='font-medium text-[#3d2b1f]'>{u.name || '-'}</p>
									<p className='text-xs text-[#7a6050]'>
										{u.phone || u.plz || '-'}
									</p>
								</div>
							</div>
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>{u.email || '-'}</td>
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
								{u.isBanned ? 'Gesperrt' : 'Aktiv'}
							</span>
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>
							{formatDate(u.createdAt)}
						</td>
						<td className='px-4 py-3'>
							<div className='flex items-center gap-1.5'>
								<button
									onClick={() =>
										onBanToggle(u.id, u.isBanned, u.name || 'Nutzer')
									}
									disabled={banLoadingId === u.id || deleteLoadingId === u.id}
									className={cn(
										'text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1',
										u.isBanned
											? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
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
										onDeleteUser(u.id, u.name || u.email || 'Nutzer')
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
						</td>
					</tr>
				))}
				{seniorPageRows.length === 0 && (
					<EmptyTableRow
						colSpan={8}
						label='Keine Senioren oder Angehörigen gefunden.'
					/>
				)}
			</tbody>
		</table>
	)
}
