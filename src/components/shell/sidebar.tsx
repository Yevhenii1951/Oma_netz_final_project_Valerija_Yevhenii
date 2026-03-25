'use client'

import { cn } from '@/lib/utils'
import { Lock, LogOut, Shield } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Avatar } from './avatar'
import { HELPER_LOCKED_ROUTES, navItems } from './nav-config'
import { PendingModal } from './pending-modal'

export function Sidebar() {
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
		<aside className='hidden lg:flex flex-col w-64 min-h-screen bg-[#ffffff] border-r border-[#ddd0be] px-4 py-6 fixed left-0 top-0 z-40'>
			{/* Logo */}
			<Link href='/landing' className='flex items-center gap-2.5 px-2 mb-8'>
				<div className='w-9 h-9 rounded-xl bg-[#f5ede0] flex items-center justify-center shadow-sm border border-[#ddd0be]'>
					<span className='text-xl leading-none select-none'>👵</span>
				</div>
				<div>
					<span className='font-bold text-[#3d2b1f] text-lg leading-none block'>
						OMA-NETZ
					</span>
					<span className='text-xs text-[#b09880] font-medium'>Kassel</span>
				</div>
			</Link>

			{/* Nav items */}
			<nav className='flex-1 space-y-1'>
				{navItems
					.filter(
						item =>
							!(role === 'HELPER' && item.href === '/requests/new') &&
							!(
								role === 'ADMIN' &&
								(item.href === '/requests/new' || item.href === '/chat')
							) &&
							!(
								item.href === '/rewards' &&
								(role === 'ADMIN' || role === 'SENIOR' || role === 'RELATIVE')
							) &&
							!(
								item.href === '/map' &&
								(role === 'SENIOR' || role === 'RELATIVE')
							),
					)
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
									className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#b09880] cursor-not-allowed opacity-60'
								>
									<Icon size={18} strokeWidth={2} />
									<span>{label}</span>
									<Lock size={13} className='ml-auto opacity-70' />
								</button>
							)
						}

						return (
							<Link
								key={href}
								href={href}
								className={cn(
									'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
									primary
										? 'bg-[#8b5e3c] text-[#ffffff] shadow-sm hover:bg-[#6b4226] mt-2'
										: active
											? 'bg-[#e8d5be] text-[#6b4226]'
											: 'text-[#7a6050] hover:bg-[#ede3d4] hover:text-[#3d2b1f]',
								)}
							>
								<Icon size={18} strokeWidth={active || primary ? 2.5 : 2} />
								<span>{label}</span>
								{primary && (
									<span className='ml-auto bg-[#ffffff]/25 rounded-full px-1.5 py-0.5 text-xs'>
										Neu
									</span>
								)}
							</Link>
						)
					})}

				{/* Admin link */}
				{session?.user.role === 'ADMIN' && (
					<Link
						href='/admin'
						className={cn(
							'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
							pathname.startsWith('/admin')
								? 'bg-[#e8d5be] text-[#6b4226]'
								: 'text-[#7a6050] hover:bg-[#ede3d4]',
						)}
					>
						<Shield
							size={18}
							className='transition-transform duration-200 group-hover:scale-125 group-hover:rotate-6'
						/>
						<span>Administration</span>
					</Link>
				)}
			</nav>

			{/* Bottom: user card */}
			<div className='border-t border-[#ddd0be] pt-4 mt-4'>
				{session?.user && (
					<div className='flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#ede3d4] transition-colors'>
						<Avatar
							name={session.user.name}
							image={session.user.image}
							size='sm'
						/>
						<div className='flex-1 min-w-0'>
							<p className='text-sm font-semibold text-[#3d2b1f] truncate'>
								{session.user.name ?? 'Kein Name'}
							</p>
							<p className='text-xs font-semibold capitalize px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-600 border border-sky-100 inline-block mt-0.5'>
								{session.user.role?.toLowerCase()}
							</p>
						</div>
						<button
							onClick={() => signOut({ callbackUrl: '/login' })}
							className='p-1.5 rounded-lg text-[#b09880] hover:text-red-600 hover:bg-red-50 transition-colors'
							title='Abmelden'
						>
							<LogOut size={15} />
						</button>
					</div>
				)}
			</div>

			{showBlock && <PendingModal onClose={() => setShowBlock(false)} />}
		</aside>
	)
}
