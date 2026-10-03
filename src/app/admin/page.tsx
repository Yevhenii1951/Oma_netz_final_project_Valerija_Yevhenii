import { auth } from '@/auth'
import { getAdminTable } from '@/app/admin/admin-data'
import { getAdminOverview } from '@/app/admin/admin-overview'
import { parseAdminTableParams } from '@/app/admin/admin-table-query'
import type { AdminTab } from '@/app/admin/components/admin-ui'
import { PageShell } from '@/components/shell'
import { redirect } from 'next/navigation'
import AdminClient from './admin-client'

export const metadata = { title: 'Adminbereich' }

type SearchParams = Record<string, string | string[] | undefined>

export default async function AdminPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const session = await auth()
	if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')

	const resolved = await searchParams

	// The overview decides the landing tab: an admin with helpers waiting for
	// review should land on that queue rather than on the stats tab.
	const overview = await getAdminOverview()
	const fallbackTab: AdminTab =
		overview.stats.pendingHelpers > 0 ? 'pending' : 'stats'

	const params = parseAdminTableParams(resolved, fallbackTab)
	const table = await getAdminTable(params)

	return (
		<PageShell title='Adminbereich' hideSidebar>
			<AdminClient
				overview={overview}
				table={table}
				filters={{
					q: params.q,
					status: params.status,
					sort: params.sort || 'createdAt',
					dir: params.dir,
					size: params.pageSize,
				}}
			/>
		</PageShell>
	)
}