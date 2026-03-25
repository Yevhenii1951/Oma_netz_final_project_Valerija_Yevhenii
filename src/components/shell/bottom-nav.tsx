'use client'

import { cn } from '@/lib/utils'
import { Lock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { HELPER_LOCKED_ROUTES, mobileItems } from './nav-config'
import { PendingModal } from './pending-modal'

export function BottomNav() {
	const pathname = usePathname()
	const { data: session } = useSession()
	const [showBlock, setShowBlock] = useState(false)
	const role = session?.user.role

	const isPendingHelper =
		session?.user.role === 'HELPER' && session?.user.helperStatus !== 'APPROVED'

	function isLocked(href: string) {
		if (!isPendingHelper) return false
		return HELPER_LOCKED_ROUTES.some(
			r => href === r || href.startsWith(r + '/'),
		)
	}

	return (
		<>
			<nav className='lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ffffff]/95 backdrop-blur-lg border-t border-[#ddd0be] px-2 pb-safe'>
				<div className='flex items-center justify-around max-w-md mx-auto'>
					{mobileItems
						.filter(item => {
							if (role === 'HELPER' && item.href === '/requests/new') return false
							if (
								role === 'ADMIN' &&
								(item.href === '/requests/new' || item.href === '/chat')
							)
								return false
							if (item.href === '/map' && role !== 'HELPER') return false
							if (
								item.href === '/rewards' &&
								(role === 'ADMIN' ||
									role === 'SENIOR' ||
									role === 'RELATIVE' ||
									role === 'HELPER')
							)
								return false
							return true
						})
						.map(({ href, icon: Icon, label, primary }) => {
							const active =
								pathname === href ||
								(href !== '/dashboard' && pathname.startsWith(href))
							const locked = isLocked(href)

							if (locked) {
								return (
									<button
										key={href}
										onClick={() => setShowBlock(true)}
										className='flex-1'
									>
										<div
											className={cn(
												'bottom-nav-item',
												primary ? 'relative' : '',
											)}
										>
											{primary ? (
												<div className='-mt-5 w-13 h-13 bg-[#b09880] rounded-2xl flex items-center justify-center shadow-lg opacity-60'>
													<Lock
														size={20}
														className='text-[#ffffff]'
														strokeWidth={2.5}
													/>
												</div>
											) : (
												<>
													<Icon
														size={22}
														strokeWidth={2}
														className='opacity-40'
													/>
													<span className='text-[10px] font-medium opacity-40'>
														{label}
													</span>
												</>
											)}
										</div>
									</button>
								)
							}

							return (
								<Link key={href} href={href} className='flex-1 group'>
									<div
										className={cn(
											'bottom-nav-item',
											primary ? 'relative' : active && 'active',
										)}
									>
										{primary ? (
											<div className='-mt-5 w-13 h-13 bg-[#8b5e3c] rounded-2xl flex items-center justify-center shadow-lg shadow-[#e8d5be] active:scale-[0.92] transition-transform'>
												<Icon
													size={22}
													className='text-[#ffffff] transition-transform duration-200 group-hover:scale-125 group-hover:rotate-6'
													strokeWidth={2.5}
												/>
											</div>
										) : (
											<Icon
												size={22}
												strokeWidth={active ? 2.5 : 2}
												className='transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-6'
											/>
										)}
										{!primary && (
											<span className='text-[10px] font-medium'>{label}</span>
										)}
									</div>
								</Link>
							)
						})}
				</div>
			</nav>

			{showBlock && <PendingModal onClose={() => setShowBlock(false)} />}
		</>
	)
}
