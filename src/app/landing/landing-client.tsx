'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
	CategoriesSection,
	FinalCtaSection,
	HelpersSection,
	HeroSection,
	JourneySection,
	LandingFooter,
	SocialProofSection,
	StatsSection,
	TrustSection,
} from './components/landing-sections'
import { NAV_LINKS } from './landing-data'

export default function LandingClient() {
	const pathname = usePathname()
	const router = useRouter()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const scrollToSectionById = useCallback((id: string) => {
		const el = document.getElementById(id)
		if (!el) return false

		const stickyNav = document.querySelector('nav.sticky') as HTMLElement | null
		const offset = stickyNav?.offsetHeight ?? 88
		const y = el.getBoundingClientRect().top + window.scrollY - offset - 8
		window.scrollTo({ top: y, behavior: 'smooth' })
		return true
	}, [])

	function scrollToSection(href: string) {
		const id = href.replace('#', '')

		if (pathname !== '/landing') {
			router.push(`/landing${href}`)
			setMobileMenuOpen(false)
			return
		}

		setMobileMenuOpen(false)
		window.history.replaceState(null, '', href)
		requestAnimationFrame(() => {
			scrollToSectionById(id)
		})
	}

	useEffect(() => {
		if (pathname !== '/landing') return

		const id = window.location.hash.replace('#', '')
		if (!id) return

		const timer = window.setTimeout(() => {
			scrollToSectionById(id)
		}, 60)

		return () => window.clearTimeout(timer)
	}, [pathname, scrollToSectionById])

	return (
		<div className='min-h-screen bg-[#f5ede0]'>
			{/* Navigation */}
			<nav className='sticky top-0 z-50 bg-[#ffffff]/90 backdrop-blur-xl border-b border-[#ddd0be]/80 shadow-[0_1px_8px_rgba(61,43,31,0.06)]'>
				<div className='max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4'>
					{/* Logo */}
					<motion.div
						initial={{ opacity: 0, x: -12 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className='flex items-center gap-2 shrink-0 min-h-11'
					>
						<a href='#hero' className='flex items-center gap-2 group'>
							<div className='w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-linear-to-br from-[#8b5e3c] to-[#6b4226] flex items-center justify-center shadow-[0_2px_8px_rgba(139,94,60,0.3)] group-hover:shadow-[0_4px_14px_rgba(139,94,60,0.45)] transition-shadow'>
								<span className='text-[#ffffff] font-bold text-sm sm:text-base'>
									O
								</span>
							</div>
							<div className='hidden sm:block'>
								<span className='font-bold text-[#3d2b1f] text-base leading-none block tracking-tight'>
									OMA-NETZ
								</span>
								<span className='text-[10px] text-[#b09880] font-medium'>
									Kassel
								</span>
							</div>
						</a>
					</motion.div>

					{/* Desktop Navigation */}
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.15 }}
						className='hidden md:flex items-center gap-1'
					>
						{NAV_LINKS.map(({ href, label }) => (
							<a
								key={href}
								href={href}
								className='relative px-1.5 py-2.5 text-sm md:text-[10.5px] lg:text-sm font-medium text-[#7a6050] hover:text-[#3d2b1f] transition-colors rounded-lg hover:bg-[#f5ede0] group min-h-11 flex items-center'
							>
								{label}
								<span className='absolute bottom-0.5 left-3 right-3 h-px bg-[#8b5e3c] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full' />
							</a>
						))}
					</motion.div>

					{/* Desktop Auth Buttons */}
					<motion.div
						initial={{ opacity: 0, x: 12 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className='hidden md:flex items-center gap-3 shrink-0'
					>
						<Link
							href='/login'
							className='text-[#7a6050] font-medium text-sm md:text-[10.5px] lg:text-sm hover:text-[#3d2b1f] transition-colors px-1.5 py-2.5 rounded min-h-11 flex items-center'
						>
							Anmelden
						</Link>
						<Link
							href='/register'
							className='btn-primary text-sm md:text-[10.5px] lg:text-sm py-2.5 px-2.5 min-h-11 flex items-center'
						>
							Registrieren
						</Link>
					</motion.div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className='md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#f5ede0] transition-colors min-h-11 min-w-11'
						aria-label='Menü öffnen'
					>
						{mobileMenuOpen ? (
							<X size={20} className='text-[#3d2b1f]' />
						) : (
							<Menu size={20} className='text-[#3d2b1f]' />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3 }}
							className='md:hidden border-t border-[#ddd0be] bg-[#f5ede0]'
						>
							<div className='px-3 py-4 space-y-1'>
								{NAV_LINKS.map(({ href, label }) => (
									<button
										key={href}
										type='button'
										onClick={() => scrollToSection(href)}
										className='w-full text-left px-4 py-3 text-[#3d2b1f] font-medium hover:bg-[#e8d5be] rounded-lg transition-colors min-h-11 flex items-center'
									>
										{label}
									</button>
								))}
								<div className='flex flex-col gap-2 pt-2 border-t border-[#ddd0be]'>
									<Link
										href='/login'
										onClick={() => setMobileMenuOpen(false)}
										className='text-center px-4 py-3 text-[#3d2b1f] font-medium hover:bg-[#e8d5be] rounded-lg transition-colors min-h-11 flex items-center justify-center'
									>
										Anmelden
									</Link>
									<Link
										href='/register'
										onClick={() => setMobileMenuOpen(false)}
										className='btn-primary text-center py-3 px-4 w-full min-h-11 flex items-center justify-center'
									>
										Registrieren
									</Link>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</nav>

			<HeroSection />
			<StatsSection />
			<JourneySection />
			<CategoriesSection />
			<HelpersSection />
			<TrustSection />
			<SocialProofSection />
			<FinalCtaSection />
			<LandingFooter />
		</div>
	)
}
