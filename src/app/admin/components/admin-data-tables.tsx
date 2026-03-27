import { Avatar, CategoryBadge, StatusBadge } from '@/components/shell'
import { cn, formatDate } from '@/lib/utils'
import { CheckCircle2, Loader2, Trash2, XCircle } from 'lucide-react'
import { EmptyTableRow, SortableTh, type AdminTab } from './admin-ui'

interface PendingRow {
	id: string
	name: string | null
	email: string | null
	institution: string | null
	languages: string[]
	phone: string | null
	createdAt: string
}

interface HelperRow {
	id: string
	name: string | null
	email: string | null
	helperStatus: string
	ratingAvg: number
	helpCount: number
	points: number
	languages: string[]
	isBanned: boolean
	createdAt: string
}

interface SeniorRow {
	id: string
	name: string | null
	email: string | null
	phone: string | null
	plz: string | null
	role: string
	ratingAvg: number
	isBanned: boolean
	createdAt: string
	_count: { sentRequests: number }
}

interface RequestRow {
	id: string
	title: string
	category: string
	status: string
	address: string | null
	createdAt: string
	senior: { name: string | null }
	_count: { offers: number }
}

interface RedemptionRow {
	id: string
	createdAt: string
	status: string
	user: { name: string | null; email: string | null }
	reward: { title: string; pointsCost: number }
}

interface AdminDataTablesProps {
	activeTab: AdminTab
	sortBy: string
	sortDir: 'asc' | 'desc'
	onSort: (field: string) => void
	pendingPageRows: PendingRow[]
	helperPageRows: HelperRow[]
	seniorPageRows: SeniorRow[]
	requestPageRows: RequestRow[]
	redemptionPageRows: RedemptionRow[]
	helperStatusColor: Record<string, string>
	helperStatusLabel: Record<string, string>
	loadingId: string | null
	banLoadingId: string | null
	deleteLoadingId: string | null
	fulfilling: string | null
	onHelperAction: (id: string, action: 'APPROVE' | 'REJECT') => void
	onBanToggle: (
		id: string,
		isCurrentlyBanned: boolean,
		userLabel: string,
	) => void
	onDeleteUser: (id: string, userLabel: string) => void
	onFulfillRedemption: (id: string) => void
}

export function AdminDataTables({
	activeTab,
	sortBy,
	sortDir,
	onSort,
	pendingPageRows,
	helperPageRows,
	seniorPageRows,
	requestPageRows,
	redemptionPageRows,
	helperStatusColor,
	helperStatusLabel,
	loadingId,
	banLoadingId,
	deleteLoadingId,
	fulfilling,
	onHelperAction,
	onBanToggle,
	onDeleteUser,
	onFulfillRedemption,
}: AdminDataTablesProps) {
	return (
		<div className='overflow-x-auto'>
			{activeTab === 'pending' && (
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
											<p className='font-medium text-[#3d2b1f]'>
												{h.name || '-'}
											</p>
											<p className='text-xs text-[#b09880]'>{h.phone || '-'}</p>
										</div>
									</div>
								</td>
								<td className='px-4 py-3 text-[#7a6050]'>{h.email || '-'}</td>
								<td className='px-4 py-3 text-[#7a6050]'>
									{h.institution || '-'}
								</td>
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
							<EmptyTableRow
								colSpan={6}
								label='Keine offenen Helfer gefunden.'
							/>
						)}
					</tbody>
				</table>
			)}

			{activeTab === 'helpers' && (
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
											<p className='font-medium text-[#3d2b1f]'>
												{h.name || '-'}
											</p>
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
											disabled={
												banLoadingId === h.id || deleteLoadingId === h.id
											}
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
											disabled={
												deleteLoadingId === h.id || banLoadingId === h.id
											}
											className='text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1 bg-red-600 text-white border-red-700 hover:bg-red-700'
										>
											{deleteLoadingId === h.id ? (
												<Loader2 size={11} className='animate-spin' />
											) : (
												<Trash2 size={11} />
											)}
											Loeschen
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
			)}

			{activeTab === 'seniors' && (
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
											<p className='font-medium text-[#3d2b1f]'>
												{u.name || '-'}
											</p>
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
											disabled={
												banLoadingId === u.id || deleteLoadingId === u.id
											}
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
											disabled={
												deleteLoadingId === u.id || banLoadingId === u.id
											}
											className='text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1 bg-red-600 text-white border-red-700 hover:bg-red-700'
										>
											{deleteLoadingId === u.id ? (
												<Loader2 size={11} className='animate-spin' />
											) : (
												<Trash2 size={11} />
											)}
											Loeschen
										</button>
									</div>
								</td>
							</tr>
						))}
						{seniorPageRows.length === 0 && (
							<EmptyTableRow
								colSpan={8}
								label='Keine Senioren oder Angehoerigen gefunden.'
							/>
						)}
					</tbody>
				</table>
			)}

			{activeTab === 'requests' && (
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
								<td className='px-4 py-3 font-medium text-[#3d2b1f]'>
									{r.title}
								</td>
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
								<td className='px-4 py-3 text-[#7a6050]'>
									{r.senior.name || '-'}
								</td>
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
			)}

			{activeTab === 'redemptions' && (
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
									<p className='font-medium text-[#3d2b1f]'>
										{r.user.name ?? '-'}
									</p>
									<p className='text-xs text-[#7a6050]'>
										{r.user.email ?? '-'}
									</p>
								</td>
								<td className='px-4 py-3 text-[#7a6050]'>{r.reward.title}</td>
								<td className='px-4 py-3 text-[#7a6050]'>
									{r.reward.pointsCost}
								</td>
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
			)}
		</div>
	)
}
