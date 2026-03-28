import { cn } from '@/lib/utils'
import { Menu, X, type LucideIcon } from 'lucide-react'

interface TabItem {
	key: string
	icon: LucideIcon
	label: string
	count?: number
}

interface AdminNavigationProps {
	tabs: TabItem[]
	activeTab: string
	isDrawerOpen: boolean
	onOpenDrawer: () => void
	onCloseDrawer: () => void
	onTabChange: (tab: string) => void
}

export function AdminNavigation({
	tabs,
	activeTab,
	isDrawerOpen,
	onOpenDrawer,
	onCloseDrawer,
	onTabChange,
}: AdminNavigationProps) {
	return (
		<>
			<div className='mb-4 flex items-center justify-between gap-3 lg:hidden'>
				<div>
					<p className='text-xs uppercase tracking-[0.22em] text-[#b09880] font-semibold'>
						Adminbereich
					</p>
					<h1 className='text-xl font-semibold text-[#3d2b1f]'>
						Betriebs-Dashboard
					</h1>
				</div>
				<button
					onClick={onOpenDrawer}
					className='h-10 w-10 rounded-xl border border-[#ddd0be] bg-white text-[#7a6050] flex items-center justify-center shadow-sm'
					aria-label='Admin-Navigation oeffnen'
				>
					<Menu className='w-5 h-5' />
				</button>
			</div>

			{isDrawerOpen && (
				<div className='fixed inset-0 z-40 lg:hidden'>
					<button
						onClick={onCloseDrawer}
						className='absolute inset-0 bg-black/35'
						aria-label='Admin-Navigation schliessen'
					/>
					<div className='absolute right-0 top-0 h-full w-[85%] max-w-sm bg-[#fdf8f2] border-l border-[#ddd0be] p-4 shadow-2xl'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='font-semibold text-[#3d2b1f]'>Navigation</h2>
							<button
								onClick={onCloseDrawer}
								className='h-9 w-9 rounded-lg border border-[#ddd0be] flex items-center justify-center text-[#7a6050]'
							>
								<X className='w-4 h-4' />
							</button>
						</div>
						<div className='space-y-1.5'>
							{tabs.map(tab => {
								const TabIcon = tab.icon
								return (
									<button
										key={`drawer-${tab.key}`}
										onClick={() => {
											onTabChange(tab.key)
											onCloseDrawer()
										}}
										className={cn(
											'w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors',
											activeTab === tab.key
												? 'bg-[#8b5e3c] text-white border-[#8b5e3c]'
												: 'bg-white text-[#7a6050] border-[#e8d5be] hover:bg-[#f5ede0]',
										)}
									>
										<span className='flex items-center gap-2'>
											<TabIcon className='w-4 h-4' />
											{tab.label}
										</span>
										{tab.count && tab.count > 0 ? (
											<span
												className={cn(
													'text-xs px-2 py-0.5 rounded-full border',
													activeTab === tab.key
														? 'border-white/30 bg-white/20'
														: 'bg-amber-50 text-amber-700 border-amber-200',
												)}
											>
												{tab.count}
											</span>
										) : null}
									</button>
								)
							})}
						</div>
					</div>
				</div>
			)}

			<div className='hidden lg:block rounded-2xl border border-[#ddd0be] bg-white/90 backdrop-blur p-2 shadow-sm'>
				<div className='flex items-center gap-1.5 overflow-x-auto'>
					{tabs.map(tab => {
						const TabIcon = tab.icon
						return (
							<button
								key={`top-${tab.key}`}
								onClick={() => onTabChange(tab.key)}
								className={cn(
									'relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border',
									activeTab === tab.key
										? 'bg-[#8b5e3c] text-white border-[#8b5e3c] shadow-sm'
										: 'bg-white text-[#7a6050] border-transparent hover:text-[#3d2b1f] hover:bg-[#f5ede0] hover:border-[#e8d5be]',
								)}
							>
								<TabIcon className='w-4 h-4 shrink-0' />
								{tab.label}
								{tab.count !== undefined && tab.count > 0 && (
									<span
										className={cn(
											'text-xs font-bold px-1.5 py-0.5 rounded-full',
											activeTab === tab.key
												? 'bg-white/30 text-white'
												: 'bg-amber-100 text-amber-700',
										)}
									>
										{tab.count}
									</span>
								)}
							</button>
						)
					})}
				</div>
			</div>
		</>
	)
}
