import type { AdminTab } from '@/app/admin/components/admin-ui'
import { Search, SlidersHorizontal } from 'lucide-react'

interface AdminTableToolbarProps {
	activeTab: AdminTab
	resultCount: number
	query: string
	statusFilter: string
	activeStatusOptions: string[]
	onQueryChange: (value: string) => void
	onStatusFilterChange: (value: string) => void
	getFilterLabel: (option: string, tab: AdminTab) => string
}

export function AdminTableToolbar({
	activeTab,
	resultCount,
	query,
	statusFilter,
	activeStatusOptions,
	onQueryChange,
	onStatusFilterChange,
	getFilterLabel,
}: AdminTableToolbarProps) {
	return (
		<div className='p-4 border-b border-[#f0e8dc]'>
			<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
				<div>
					<h3 className='text-base font-semibold text-[#3d2b1f]'>
						{activeTab === 'pending'
							? 'Offene Helfer-Bewerbungen'
							: activeTab === 'helpers'
								? 'Helfer-Verzeichnis'
								: activeTab === 'seniors'
									? 'Senioren und Angehörige'
									: activeTab === 'requests'
										? 'Anfragen-Übersicht'
										: 'Belohnungs-Einlösungen'}
					</h3>
					<p className='text-sm text-[#7a6050]'>
						Suche, Statusfilter, sortierbare Spalten und Seitennavigation für
						schnellere Admin-Workflows.
					</p>
				</div>
				<div className='text-xs px-2.5 py-1.5 rounded-lg bg-[#f5ede0] border border-[#e8d5be] text-[#7a6050] font-medium w-max'>
					{resultCount} Ergebnisse
				</div>
			</div>

			<div className='mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2.5'>
				<label className='relative'>
					<Search className='w-4 h-4 text-[#b09880] absolute left-3 top-1/2 -translate-y-1/2' />
					<input
						value={query}
						onChange={e => onQueryChange(e.target.value)}
						placeholder='Suche nach Name, E-Mail, Titel oder Ort'
						className='w-full h-10 rounded-xl border border-[#ddd0be] bg-white pl-9 pr-3 text-sm text-[#3d2b1f] outline-none focus:border-[#8b5e3c]'
					/>
				</label>
				<div className='flex items-center gap-2'>
					<label className='relative'>
						<SlidersHorizontal className='w-4 h-4 text-[#b09880] absolute left-3 top-1/2 -translate-y-1/2' />
						<select
							value={statusFilter}
							onChange={e => onStatusFilterChange(e.target.value)}
							className='h-10 rounded-xl border border-[#ddd0be] bg-white pl-9 pr-9 text-sm text-[#3d2b1f] outline-none focus:border-[#8b5e3c]'
						>
							{activeStatusOptions.map(option => (
								<option key={option} value={option}>
									{getFilterLabel(option, activeTab)}
								</option>
							))}
						</select>
					</label>
				</div>
			</div>
		</div>
	)
}
