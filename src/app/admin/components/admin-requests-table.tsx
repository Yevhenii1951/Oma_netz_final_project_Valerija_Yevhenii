import { CategoryBadge, StatusBadge } from '@/components/shell'
import { formatDate } from '@/lib/utils'
import type { RequestRow, SortDirection } from './admin-data-table-types'
import { EmptyTableRow, SortableTh } from './admin-ui'

interface AdminRequestsTableProps {
	sortBy: string
	sortDir: SortDirection
	onSort: (field: string) => void
	requestPageRows: RequestRow[]
}

export function AdminRequestsTable({
	sortBy,
	sortDir,
	onSort,
	requestPageRows,
}: AdminRequestsTableProps) {
	return (
		<table className='min-w-245 w-full text-sm'>
			<thead className='bg-[#fcf8f2] border-y border-[#f0e8dc] text-xs text-[#7a6050] uppercase tracking-wide'>
				<tr>
					<SortableTh
						label='Titel'
						field='title'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<th className='px-4 py-2.5 text-left'>Kategorie</th>
					<SortableTh
						label='Status'
						field='status'
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
					/>
					<th className='px-4 py-2.5 text-left'>Senior</th>
					<th className='px-4 py-2.5 text-left'>Adresse</th>
					<SortableTh
						label='Angebote'
						field='offers'
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
				</tr>
			</thead>
			<tbody className='divide-y divide-[#f5ede0]'>
				{requestPageRows.map(r => (
					<tr key={r.id} className='hover:bg-[#fcf8f2]'>
						<td className='px-4 py-3 font-medium text-[#3d2b1f]'>{r.title}</td>
						<td className='px-4 py-3'>
							<CategoryBadge category={r.category} />
						</td>
						<td className='px-4 py-3'>
							<StatusBadge
								status={
									r.status as 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
								}
							/>
						</td>
						<td className='px-4 py-3 text-[#7a6050]'>{r.senior.name || '-'}</td>
						<td className='px-4 py-3 text-[#7a6050]'>{r.address || '-'}</td>
						<td className='px-4 py-3 text-[#7a6050]'>{r._count.offers}</td>
						<td className='px-4 py-3 text-[#7a6050]'>
							{formatDate(r.createdAt)}
						</td>
					</tr>
				))}
				{requestPageRows.length === 0 && (
					<EmptyTableRow colSpan={7} label='Keine Anfragen gefunden.' />
				)}
			</tbody>
		</table>
	)
}
