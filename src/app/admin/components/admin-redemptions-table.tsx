import { cn, formatDate } from '@/lib/utils'
import { CheckCircle2, Loader2 } from 'lucide-react'
import type { RedemptionRow, SortDirection } from './admin-data-table-types'
import { EmptyTableRow, SortableTh } from './admin-ui'

interface AdminRedemptionsTableProps {
	sortBy: string
	sortDir: SortDirection
	onSort: (field: string) => void
	redemptionPageRows: RedemptionRow[]
	fulfilling: string | null
	onFulfillRedemption: (id: string) => void
}

export function AdminRedemptionsTable({
	sortBy,
	sortDir,
	onSort,
	redemptionPageRows,
	fulfilling,
	onFulfillRedemption,
}: AdminRedemptionsTableProps) {
	return (
		<table className='min-w-240 w-full text-sm'>
			<thead className='bg-[#fcf8f2] border-y border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
				<tr>
					<SortableTh
						label='Nutzer'
						field='user'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<SortableTh
						label='Belohnung'
						field='reward'
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
						label='Status'
						field='status'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<SortableTh
						label='Erstellt'
						field='createdAt'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<th className='px-4 py-2.5 text-left'>Aktionen</th>
				</tr>
			</thead>
			<tbody className='divide-y divide-[#f5ede0]'>
				{redemptionPageRows.map(r => (
					<tr key={r.id} className='hover:bg-[#fcf8f2]'>
						<td className='px-4 py-3'>
							<p className='font-medium text-[#3d2b1f]'>{r.user.name ?? '-'}</p>
							<p className='text-xs text-[#7a6050]'>{r.user.email ?? '-'}</p>
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>{r.reward.title}</td>
						<td className='px-4 py-3 text-[#7a6050]'>{r.reward.pointsCost}</td>
						<td className='px-4 py-3'>
							<span
								className={cn(
									'text-xs px-2 py-0.5 rounded-full border font-medium',
									r.status === 'fulfilled'
										? 'bg-emerald-50 text-emerald-700 border-emerald-200'
										: 'bg-amber-50 text-amber-700 border-amber-200',
								)}
							>
								{r.status}
							</span>
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>
							{formatDate(r.createdAt)}
						</td>
						<td className='px-4 py-3'>
							{r.status === 'fulfilled' ? (
								<span className='text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium'>
									Erledigt
								</span>
							) : (
								<button
									disabled={fulfilling === r.id}
									onClick={() => onFulfillRedemption(r.id)}
									className='text-xs px-2.5 py-1 rounded-full bg-[#8b5e3c] text-white border border-[#6b4226] font-medium hover:bg-[#6b4226] transition-colors disabled:opacity-50 inline-flex items-center gap-1'
								>
									{fulfilling === r.id ? (
										<Loader2 size={11} className='animate-spin' />
									) : (
										<CheckCircle2 size={11} />
									)}
									Erledigen
								</button>
							)}
						</td>
					</tr>
				))}
				{redemptionPageRows.length === 0 && (
					<EmptyTableRow colSpan={6} label='Keine Einloesungen gefunden.' />
				)}
			</tbody>
		</table>
	)
}
