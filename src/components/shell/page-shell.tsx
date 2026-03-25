'use client'

import { BottomNav } from './bottom-nav'
import { MobileHeader } from './mobile-header'
import { Sidebar } from './sidebar'

export function PageShell({
	children,
	title,
	hideSidebar = false,
}: {
	children: React.ReactNode
	title?: string
	hideSidebar?: boolean
}) {
	return (
		<>
			{!hideSidebar && <Sidebar />}
			<div
				className={
					hideSidebar
						? 'min-h-screen bg-[#f5ede0]'
						: 'lg:pl-64 min-h-screen bg-[#f5ede0]'
				}
			>
				<MobileHeader title={title} showOnDesktop={hideSidebar} />
				<main className='pb-24 lg:pb-8'>{children}</main>
			</div>
			<BottomNav />
		</>
	)
}
