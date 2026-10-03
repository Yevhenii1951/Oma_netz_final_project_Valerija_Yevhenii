import type {
	AdminTableData,
	SortDirection,
} from './admin-data-table-types'
import { AdminHelpersTable } from './admin-helpers-table'
import { AdminPendingTable } from './admin-pending-table'
import { AdminRedemptionsTable } from './admin-redemptions-table'
import { AdminRequestsTable } from './admin-requests-table'
import { AdminSeniorsTable } from './admin-seniors-table'

interface AdminDataTablesProps {
	table: AdminTableData
	sortBy: string
	sortDir: SortDirection
	onSort: (field: string) => void
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
	table,
	sortBy,
	sortDir,
	onSort,
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
	// Switching on the payload's own tab narrows the row type, so each table
	// gets its concrete rows without a cast.
	switch (table.tab) {
		case 'pending':
			return (
				<div className='overflow-x-auto'>
					<AdminPendingTable
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
						pendingPageRows={table.rows}
						loadingId={loadingId}
						onHelperAction={onHelperAction}
					/>
				</div>
			)
		case 'helpers':
			return (
				<div className='overflow-x-auto'>
					<AdminHelpersTable
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
						helperPageRows={table.rows}
						helperStatusColor={helperStatusColor}
						helperStatusLabel={helperStatusLabel}
						banLoadingId={banLoadingId}
						deleteLoadingId={deleteLoadingId}
						onBanToggle={onBanToggle}
						onDeleteUser={onDeleteUser}
					/>
				</div>
			)
		case 'seniors':
			return (
				<div className='overflow-x-auto'>
					<AdminSeniorsTable
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
						seniorPageRows={table.rows}
						banLoadingId={banLoadingId}
						deleteLoadingId={deleteLoadingId}
						onBanToggle={onBanToggle}
						onDeleteUser={onDeleteUser}
					/>
				</div>
			)
		case 'requests':
			return (
				<div className='overflow-x-auto'>
					<AdminRequestsTable
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
						requestPageRows={table.rows}
					/>
				</div>
			)
		case 'redemptions':
			return (
				<div className='overflow-x-auto'>
					<AdminRedemptionsTable
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={onSort}
						redemptionPageRows={table.rows}
						fulfilling={fulfilling}
						onFulfillRedemption={onFulfillRedemption}
					/>
				</div>
			)
		default:
			return <div className='overflow-x-auto' />
	}
}