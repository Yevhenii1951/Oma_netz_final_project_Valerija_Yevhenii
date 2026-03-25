'use client'

import { BottomNav } from './bottom-nav'
import { MobileHeader } from './mobile-header'
import { Sidebar } from './sidebar'

export function PageShell({
	children,
	title,
}: {
	children: React.ReactNode
	title?: string
}) {
	return (
		<>
			<Sidebar />
			<div className='lg:pl-64 min-h-screen bg-[#f5ede0]'>
				<MobileHeader title={title} />
				<main className='pb-24 lg:pb-8 lg:pl-4'>{children}</main>
			</div>
			<BottomNav />
		</>
	)
}
