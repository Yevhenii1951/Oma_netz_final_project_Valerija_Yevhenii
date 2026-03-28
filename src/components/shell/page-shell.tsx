'use client'

import { AiAssistantButton } from '@/components/ai-assistant'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
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
	const { data: session } = useSession()
	const role = session?.user.role
	const showAiAssistant = session?.user.role === 'SENIOR'

	useEffect(() => {
		const compact = role === 'SENIOR' || role === 'HELPER'
		document.documentElement.classList.toggle('role-mobile-compact-sm', compact)

		return () => {
			document.documentElement.classList.remove('role-mobile-compact-sm')
		}
	}, [role])

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
			{showAiAssistant && <AiAssistantButton />}
			<BottomNav />
		</>
	)
}
