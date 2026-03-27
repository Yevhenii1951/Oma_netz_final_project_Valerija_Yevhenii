import type {
	HelperRow,
	PendingRow,
	RedemptionRow,
	RequestRow,
	SeniorRow,
	SortDirection,
} from './admin-data-table-types'
import { AdminHelpersTable } from './admin-helpers-table'
import { AdminPendingTable } from './admin-pending-table'
import { AdminRedemptionsTable } from './admin-redemptions-table'
import { AdminRequestsTable } from './admin-requests-table'
import { AdminSeniorsTable } from './admin-seniors-table'
import { type AdminTab } from './admin-ui'

interface AdminDataTablesProps {
	activeTab: AdminTab
	sortBy: string
	sortDir: SortDirection
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
	if (activeTab === 'pending') {
		return (
			<div className='overflow-x-auto'>
				<AdminPendingTable
					sortBy={sortBy}
					sortDir={sortDir}
					onSort={onSort}
					pendingPageRows={pendingPageRows}
					loadingId={loadingId}
					onHelperAction={onHelperAction}
				/>
			</div>
		)
	}

	if (activeTab === 'helpers') {
		return (
			<div className='overflow-x-auto'>
				<AdminHelpersTable
					sortBy={sortBy}
					sortDir={sortDir}
					onSort={onSort}
					helperPageRows={helperPageRows}
					helperStatusColor={helperStatusColor}
					helperStatusLabel={helperStatusLabel}
					banLoadingId={banLoadingId}
					deleteLoadingId={deleteLoadingId}
					onBanToggle={onBanToggle}
					onDeleteUser={onDeleteUser}
				/>
			</div>
		)
	}

	if (activeTab === 'seniors') {
		return (
			<div className='overflow-x-auto'>
				<AdminSeniorsTable
					sortBy={sortBy}
					sortDir={sortDir}
					onSort={onSort}
					seniorPageRows={seniorPageRows}
					banLoadingId={banLoadingId}
					deleteLoadingId={deleteLoadingId}
					onBanToggle={onBanToggle}
					onDeleteUser={onDeleteUser}
				/>
			</div>
		)
	}

	if (activeTab === 'requests') {
		return (
			<div className='overflow-x-auto'>
				<AdminRequestsTable
					sortBy={sortBy}
					sortDir={sortDir}
					onSort={onSort}
					requestPageRows={requestPageRows}
				/>
			</div>
		)
	}

	if (activeTab === 'redemptions') {
		return (
			<div className='overflow-x-auto'>
				<AdminRedemptionsTable
					sortBy={sortBy}
					sortDir={sortDir}
					onSort={onSort}
					redemptionPageRows={redemptionPageRows}
					fulfilling={fulfilling}
					onFulfillRedemption={onFulfillRedemption}
				/>
			</div>
		)
	}

	return <div className='overflow-x-auto' />
}
