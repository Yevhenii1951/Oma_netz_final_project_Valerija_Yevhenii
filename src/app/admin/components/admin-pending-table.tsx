import { Avatar } from '@/components/shell'
import { formatDate } from '@/lib/utils'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import type { PendingRow, SortDirection } from './admin-data-table-types'
import { EmptyTableRow, SortableTh } from './admin-ui'

interface AdminPendingTableProps {
	sortBy: string
	sortDir: SortDirection
	onSort: (field: string) => void
	pendingPageRows: PendingRow[]
	loadingId: string | null
	onHelperAction: (id: string, action: 'APPROVE' | 'REJECT') => void
}

export function AdminPendingTable({
	sortBy,
	sortDir,
	onSort,
	pendingPageRows,
	loadingId,
	onHelperAction,
}: AdminPendingTableProps) {
	return (
		<table className='min-w-240 w-full text-sm'>
			<thead className='bg-[#fcf8f2] border-y border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
				<tr>
					<SortableTh
						label='Name'
						field='name'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<th className='px-4 py-2.5 text-left'>E-Mail</th>
					<th className='px-4 py-2.5 text-left'>Institution</th>
					<th className='px-4 py-2.5 text-left'>Sprachen</th>
					<SortableTh
						label='Beworben am'
						field='createdAt'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<th className='px-4 py-2.5 text-left'>Aktionen</th>
				</tr>
			</thead>
			<tbody className='divide-y divide-[#f5ede0]'>
				{pendingPageRows.map(h => (
					<tr key={h.id} className='hover:bg-[#fcf8f2]'>
						<td className='px-4 py-3'>
							<div className='flex items-center gap-2.5'>
								<Avatar name={h.name || h.email || '?'} size='sm' />
								<div>
									<p className='font-medium text-[#3d2b1f]'>{h.name || '-'}</p>
									<p className='text-xs text-[#b09880]'>{h.phone || '-'}</p>
								</div>
							</div>
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>{h.email || '-'}</td>
						<td className='px-4 py-3 text-[#7a6050]'>{h.institution || '-'}</td>
						<td className='px-4 py-3 text-[#7a6050]'>
							{h.languages.length > 0 ? h.languages.join(', ') : '-'}
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>
							{formatDate(h.createdAt)}
						</td>
						<td className='px-4 py-3'>
							<div className='flex items-center gap-1.5'>
								<button
									onClick={() => onHelperAction(h.id, 'REJECT')}
									disabled={loadingId === h.id}
									className='px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 inline-flex items-center gap-1'
								>
									{loadingId === h.id ? (
										<Loader2 size={12} className='animate-spin' />
									) : (
										<XCircle size={12} />
									)}
									Ablehnen
								</button>
								<button
									onClick={() => onHelperAction(h.id, 'APPROVE')}
									disabled={loadingId === h.id}
									className='px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 inline-flex items-center gap-1'
								>
									{loadingId === h.id ? (
										<Loader2 size={12} className='animate-spin' />
									) : (
										<CheckCircle2 size={12} />
									)}
									Freigeben
								</button>
							</div>
						</td>
					</tr>
				))}
				{pendingPageRows.length === 0 && (
					<EmptyTableRow colSpan={6} label='Keine offenen Helfer gefunden.' />
				)}
			</tbody>
		</table>
	)
}
