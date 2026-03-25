'use client'

import { Bell, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Avatar } from './avatar'

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useUnreadCount() {
	const { data: session } = useSession()
	const [count, setCount] = useState(0)
	const userId = session?.user?.id

	useEffect(() => {
		if (!userId) return
		let cancelled = false

		async function load() {
			try {
				const res = await fetch('/api/notifications')
				if (res.ok && !cancelled) {
					const data = await res.json()
					setCount(
						(data.data ?? []).filter((n: { read: boolean }) => !n.read).length,
					)
				}
			} catch {}
		}

		void load()
		const interval = setInterval(() => {
			void load()
		}, 10000)
		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [userId])

	return count
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MobileHeader({
	title,
	showOnDesktop = false,
}: {
	title?: string
	showOnDesktop?: boolean
}) {
	const { data: session } = useSession()
	const unreadCount = useUnreadCount()
	const showProfileLink = session?.user.role !== 'ADMIN'

	return (
		<header
			className={
				showOnDesktop
					? 'sticky top-0 z-30 bg-[#ffffff]/95 backdrop-blur-lg border-b border-[#ddd0be] px-4 py-3 flex items-center justify-between'
					: 'lg:hidden sticky top-0 z-30 bg-[#ffffff]/95 backdrop-blur-lg border-b border-[#ddd0be] px-4 py-3 flex items-center justify-between'
			}
		>
			<div className='flex items-center gap-2'>
				<Link
					href='/landing'
					className='w-7 h-7 rounded-lg bg-[#f5ede0] flex items-center justify-center border border-[#ddd0be] hover:bg-[#ede3d4] transition-colors'
				>
					<span className='text-base leading-none select-none'>👵</span>
				</Link>
				{!showOnDesktop && (
					<span className='font-bold text-[#3d2b1f] text-base'>
						{title ?? 'OMA-NETZ'}
					</span>
				)}
			</div>
			{showOnDesktop && (
				<span className='absolute left-1/2 -translate-x-1/2 font-bold text-[#3d2b1f] text-base pointer-events-none'>
					{title ?? 'Admin panel'}
				</span>
			)}
			<div className='flex items-center gap-2'>
				<Link
					href='/notifications'
					className='relative p-2 rounded-xl text-[#7a6050] hover:bg-[#ede3d4] transition-colors'
				>
					<Bell size={19} />
					{unreadCount > 0 && (
						<span className='absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 animate-bounce shadow-sm'>
							{unreadCount > 9 ? '9+' : unreadCount}
						</span>
					)}
				</Link>
				{showProfileLink && (
					<Link href='/profile'>
						<Avatar
							name={session?.user?.name}
							image={session?.user?.image}
							size='xs'
						/>
					</Link>
				)}
				<button
					onClick={() => signOut({ callbackUrl: '/login' })}
					className='p-2 rounded-xl text-[#7a6050] hover:bg-[#ede3d4] hover:text-red-600 transition-colors'
					title='Abmelden'
				>
					<LogOut size={18} />
				</button>
			</div>
		</header>
	)
}
