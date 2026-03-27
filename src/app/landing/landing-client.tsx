'use client'

import BackgroundPaths from '@/components/background-paths'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
	ArrowRight,
	Award,
	Bell,
	Bus,
	Car,
	ClipboardList,
	Coins,
	FilePlus,
	HandHelping,
	Handshake,
	Heart,
	Home,
	Laptop,
	MapPin,
	Menu,
	MessageCircle,
	MessageSquareText,
	PersonStanding,
	Shield,
	ShoppingCart,
	Star,
	Stethoscope,
	Sun,
	ThumbsUp,
	Ticket,
	TreePine,
	User,
	UserPlus,
	UserRoundPlus,
	Users,
	X,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const CAROUSEL_AUTOPLAY_MS = 4000
const CAROUSEL_TRANSITION_SEC = 0.72

const CAROUSEL_IMAGES = [
	'/carussel/oma1.png',
	'/carussel/oma2.png',
	'/carussel/oma3.png',
	'/carussel/oma4.png',
	'/carussel/oma5.png',
	'/carussel/oma6.png',
	'/carussel/oma7.png',
	'/carussel/oma8.png',
	'/carussel/oma9.png',
	'/carussel/oma11.png',
	'/carussel/oma12.png',
	'/carussel/oma13.png',
	'/carussel/oma14.png',
	'/carussel/oma15.png',
]

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
	const [val, setVal] = useState(0)
	useEffect(() => {
		let n = 0
		const step = Math.ceil(to / 60)
		const id = setInterval(() => {
			n += step
			if (n >= to) {
				setVal(to)
				clearInterval(id)
			} else setVal(n)
		}, 16)
		return () => clearInterval(id)
	}, [to])
	return (
		<>
			<span>{val}</span>
			{suffix}
		</>
	)
}

const FadeUp = ({
	children,
	delay = 0,
	className = '',
}: {
	children: React.ReactNode
	delay?: number
	className?: string
}) => (
	<motion.div
		initial={{ opacity: 0, y: 28 }}
		whileInView={{ opacity: 1, y: 0 }}
		viewport={{ once: true }}
		transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
		className={className}
	>
		{children}
	</motion.div>
)

function JourneyTimeline() {
	const [active, setActive] = useState(0)
	const [isPaused, setIsPaused] = useState(false)
	const [isInView, setIsInView] = useState(true)
	const carouselRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const node = carouselRef.current
		if (!node || typeof IntersectionObserver === 'undefined') return

		const observer = new IntersectionObserver(
			entries => {
				setIsInView(entries[0]?.isIntersecting ?? false)
			},
			{ threshold: 0.25 },
		)

		observer.observe(node)
		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		if (isPaused || !isInView) return
		const id = setInterval(() => {
			setActive(p => (p + 1) % STEPS.length)
		}, CAROUSEL_AUTOPLAY_MS)
		return () => clearInterval(id)
	}, [isPaused, isInView])

	useEffect(() => {
		if (!isInView) return

		// Preload only current and next frame to avoid heavy bulk decode work.
		const nextIndex = (active + 1) % CAROUSEL_IMAGES.length
		const preloadSet = [CAROUSEL_IMAGES[active], CAROUSEL_IMAGES[nextIndex]]

		const preloaded: HTMLImageElement[] = []
		for (const src of preloadSet) {
			const image = new Image()
			image.decoding = 'async'
			image.src = src
			preloaded.push(image)
		}

		return () => {
			for (const image of preloaded) image.src = ''
		}
	}, [active, isInView])

	const progressIndicators = STEPS.map((_, i) => (
		<button
			key={i}
			onClick={() => setActive(i)}
			className={`w-2.5 h-2.5 rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center -m-2.5 ${
				i === active
					? 'bg-[#8b5e3c] scale-125 w-4'
					: i < active
						? 'bg-[#8b5e3c]/40'
						: 'bg-[#e8d5be] hover:bg-[#b09880]'
			}`}
			aria-label={`Перейти к шагу ${i + 1}`}
		/>
	))

	return (
		<div
			ref={carouselRef}
			className='flex flex-col items-center gap-4 sm:gap-6 md:gap-8 py-8 w-full'
		>
			<div className='hidden md:flex items-center justify-center gap-2 w-full max-w-5xl px-4'>
				{STEPS.map((step, i) => {
					const isActive = i === active
					const isPast = i < active
					return (
						<motion.button
							key={i}
							onClick={() => setActive(i)}
							aria-label={`Перейти к шагу ${i + 1}`}
							className='relative flex items-center justify-center min-h-[56px] min-w-[56px]'
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							onMouseEnter={() => setIsPaused(true)}
							onMouseLeave={() => setIsPaused(false)}
						>
							<div
								className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
									isActive
										? 'bg-linear-to-br from-[#8b5e3c] to-[#d97706] shadow-lg shadow-[#8b5e3c]/30 scale-110'
										: isPast
											? 'bg-[#8b5e3c]/20'
											: 'bg-[#e8d5be]'
								}`}
							>
								<step.icon
									className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8b5e3c]'}`}
								/>
							</div>
						</motion.button>
					)
				})}
			</div>

			<div className='md:hidden flex justify-center gap-3 mb-2 flex-wrap px-2'>
				{progressIndicators}
			</div>

			<div
				className='w-full max-w-xl px-3 sm:px-4'
				onMouseEnter={() => setIsPaused(true)}
				onMouseLeave={() => setIsPaused(false)}
			>
				<div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-[#e8d5be] text-center'>
					<div className='mx-auto mb-3 sm:mb-4 max-w-2xl'>
						<div className='relative w-full aspect-4/3 overflow-hidden rounded-lg sm:rounded-2xl'>
							<AnimatePresence initial={false} mode='sync'>
								<motion.img
									key={CAROUSEL_IMAGES[active % CAROUSEL_IMAGES.length]}
									src={CAROUSEL_IMAGES[active % CAROUSEL_IMAGES.length]}
									alt=''
									className='absolute inset-0 w-full h-full object-contain drop-shadow-md will-change-transform'
									initial={{ opacity: 0, scale: 1.01 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.995 }}
									transition={{
										duration: CAROUSEL_TRANSITION_SEC,
										ease: [0.22, 1, 0.36, 1],
									}}
								/>
							</AnimatePresence>
						</div>
					</div>

					<span className='inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 sm:mb-3 bg-[#8b5e3c]/10 text-[#8b5e3c]'>
						Schritt {active + 1}
					</span>

					<h3 className='heading-serif text-base sm:text-xl md:text-2xl font-bold text-[#3d2b1f] mb-1 sm:mb-2'>
						{STEPS[active].title}
					</h3>

					<p className='text-[#7a6050] leading-relaxed text-xs sm:text-sm'>
						{STEPS[active].desc}
					</p>
				</div>
			</div>
		</div>
	)
}

const STEPS: { icon: LucideIcon; title: string; desc: string }[] = [
	{
		icon: UserPlus,
		title: 'Oma Rosa findet die Website',
		desc: 'Sie sucht im Internet nach Hilfe und stößt auf OMA-NETZ.',
	},
	{
		icon: UserRoundPlus,
		title: 'Registrierung von Oma Rosa',
		desc: 'Sie gibt Namen, Adresse und die Art der Hilfe ein (Glühbirne wechseln).',
	},
	{
		icon: FilePlus,
		title: 'Anfrage erstellen',
		desc: 'Oma Rosa erstellt eine Anfrage mit Beschreibung der Aufgabe.',
	},
	{
		icon: UserPlus,
		title: 'Max registriert sich',
		desc: 'Student Max füllt sein Profil aus und bestätigt seine Dokumente.',
	},
	{
		icon: ClipboardList,
		title: 'Admin prüft',
		desc: 'Der Administrator prüft die Anfrage von Max und bestätigt die Registrierung.',
	},
	{
		icon: MapPin,
		title: 'Max sieht die Anfrage auf der Karte',
		desc: "In Max's Dashboard erscheint die Anfrage von Oma Rosa.",
	},
	{
		icon: ThumbsUp,
		title: 'Max meldet sich',
		desc: 'Max klickt auf «Ich helfe» und hinterlässt eine kurze Nachricht.',
	},
	{
		icon: Bell,
		title: 'Oma Rosa erhält die Anfrage',
		desc: 'Oma sieht die Benachrichtigung und bestätigt Max als Helfer.',
	},
	{
		icon: MessageSquareText,
		title: 'Termin vereinbaren',
		desc: 'Im Chat vereinbaren sie, wann Max vorbeikommt.',
	},
	{
		icon: Home,
		title: 'Max kommt vorbei',
		desc: 'Max wechselt die Glühbirne im Kronleuchter.',
	},
	{
		icon: Star,
		title: 'Oma Rosa bewertet',
		desc: 'Oma vergibt 5 Sterne und schreibt eine Bewertung.',
	},
	{
		icon: Coins,
		title: 'Max erhält Punkte',
		desc: 'Max sieht die gutgeschriebenen Punkte und Sterne.',
	},
	{
		icon: Ticket,
		title: 'Umtausch gegen Kino',
		desc: 'Max tauscht seine Punkte gegen eine Kinokarte ein.',
	},
	{
		icon: Heart,
		title: 'Kino mit der Freundin',
		desc: 'Max geht mit seiner Freundin ins Kino. Alle sind zufrieden!',
	},
]

export default function LandingClient() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	
	const stats = [
		{ value: 500, suffix: '+', label: 'Aktive Helfer' },
		{ value: 1200, suffix: '+', label: 'Erfüllte Anfragen' },
		{ value: 98, suffix: '%', label: 'Zufriedenheit' },
		{ value: 34, suffix: '', label: 'Stadtteile' },
	]

	const features: { icon: LucideIcon; title: string; desc: string }[] = [
		{
			icon: ShoppingCart,
			title: 'Einkaufen',
			desc: 'Hilfe beim Einkauf oder Besorgungen.',
		},
		{
			icon: Stethoscope,
			title: 'Arzttermine',
			desc: 'Begleitung oder Fahrdienst zum Arzt.',
		},
		{
			icon: PersonStanding,
			title: 'Spaziergänge',
			desc: 'Gemeinsam gegen Einsamkeit.',
		},
		{
			icon: Laptop,
			title: 'Technik-Hilfe',
			desc: 'Smartphone, Tablet oder PC.',
		},
		{
			icon: Car,
			title: 'Transport',
			desc: 'Fahrdienste für Einkäufe oder Termine.',
		},
		{
			icon: Home,
			title: 'Haushalt',
			desc: 'Kleine Erledigungen rund um den Alltag.',
		},
	]

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
						className='flex items-center gap-2 shrink-0 min-h-[44px]'
					>
						<a href='#hero' className='flex items-center gap-2 group'>
							<div className='w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-linear-to-br from-[#8b5e3c] to-[#6b4226] flex items-center justify-center shadow-[0_2px_8px_rgba(139,94,60,0.3)] group-hover:shadow-[0_4px_14px_rgba(139,94,60,0.45)] transition-shadow'>
								<span className='text-[#ffffff] font-bold text-sm sm:text-base'>O</span>
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
						{(
							[
								{ href: '#journey', label: 'So läuft es ab' },
								{ href: '#categories', label: 'Kategorien' },
								{ href: '#helpers', label: 'Helfer werden' },
								{ href: '#trust', label: 'Vertrauen' },
							] as { href: string; label: string }[]
						).map(({ href, label }) => (
							<a
								key={href}
								href={href}
								className='relative px-3 py-2.5 text-sm font-medium text-[#7a6050] hover:text-[#3d2b1f] transition-colors rounded-lg hover:bg-[#f5ede0] group min-h-[44px] flex items-center'
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
							className='text-[#7a6050] font-medium text-sm hover:text-[#3d2b1f] transition-colors px-3 py-2.5 rounded min-h-[44px] flex items-center'
						>
							Anmelden
						</Link>
						<Link href='/register' className='btn-primary text-sm py-2.5 px-5 min-h-[44px] flex items-center'>
							Registrieren
						</Link>
					</motion.div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className='md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#f5ede0] transition-colors min-h-[44px] min-w-[44px]'
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
								{(
									[
										{ href: '#journey', label: 'So läuft es ab' },
										{ href: '#categories', label: 'Kategorien' },
										{ href: '#helpers', label: 'Helfer werden' },
										{ href: '#trust', label: 'Vertrauen' },
									] as { href: string; label: string }[]
								).map(({ href, label }) => (
									<a
										key={href}
										href={href}
										onClick={() => setMobileMenuOpen(false)}
										className='block px-4 py-3 text-[#3d2b1f] font-medium hover:bg-[#e8d5be] rounded-lg transition-colors min-h-[44px] flex items-center'
									>
										{label}
									</a>
								))}
								<div className='flex flex-col gap-2 pt-2 border-t border-[#ddd0be]'>
									<Link
										href='/login'
										onClick={() => setMobileMenuOpen(false)}
										className='text-center px-4 py-3 text-[#3d2b1f] font-medium hover:bg-[#e8d5be] rounded-lg transition-colors min-h-[44px] flex items-center justify-center'
									>
										Anmelden
									</Link>
									<Link 
										href='/register' 
										onClick={() => setMobileMenuOpen(false)}
										className='btn-primary text-center py-3 px-4 w-full min-h-[44px] flex items-center justify-center'
									>
										Registrieren
									</Link>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</nav>

			{/* Hero Section */}
			<div id='hero' />
			<BackgroundPaths>
				<section className='max-w-6xl mx-auto px-3 sm:px-4 pt-12 sm:pt-16 md:pt-24 pb-12 sm:pb-16 md:pb-20 text-center relative z-10 min-h-screen flex flex-col justify-center'>
					<motion.h1
						initial={{ opacity: 0, y: 32 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
						className='heading-serif text-3xl sm:text-5xl md:text-7xl font-bold text-[#3d2b1f] leading-[1.08] tracking-tight mb-2 sm:mb-3'
					>
						Füreinander da sein
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, delay: 0.35 }}
						className='heading-serif text-2xl sm:text-3xl md:text-4xl font-semibold shimmer-text mb-6 sm:mb-8'
					>
						in Kassel
					</motion.p>

					<motion.p
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.5 }}
						className='text-base sm:text-lg md:text-xl text-[#7a6050] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2'
					>
						OMA-NETZ verbindet ältere Menschen mit freiwilligen Helfern für
						alltägliche Aufgaben — kostenlos, unkompliziert und mit Herz.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.65 }}
						className='flex flex-col sm:flex-row items-center justify-center gap-3 mb-6'
					>
						<Link
							href='/register?role=SENIOR'
							className='btn-primary btn-glow text-base px-6 sm:px-8 py-3 sm:py-3.5 w-full sm:w-auto min-h-[44px] flex items-center justify-center'
						>
							<HandHelping size={18} className='inline mr-1' /> Ich brauche
							Hilfe <ArrowRight size={16} />
						</Link>
						<Link
							href='/register?role=HELPER'
							className='btn-secondary text-base px-6 sm:px-8 py-3 sm:py-3.5 w-full sm:w-auto min-h-[44px] flex items-center justify-center'
						>
							<Handshake size={18} className='inline mr-1' /> Ich möchte helfen
						</Link>
					</motion.div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.85 }}
						className='text-xs sm:text-sm text-[#b09880]'
					>
						Kostenlos · Keine Verpflichtung · Jederzeit
					</motion.p>
				</section>
			</BackgroundPaths>

			{/* Stats Section */}
			<section className='bg-[#ffffff] border-y border-[#ddd0be] py-10 sm:py-12 md:py-16 shadow-[inset_0_1px_0_rgba(61,43,31,0.05)]'>
				<div className='max-w-4xl mx-auto px-3 sm:px-4 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center'>
					{stats.map(({ value, suffix, label }, i) => (
						<FadeUp key={label} delay={i * 0.08}>
							<p className='heading-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#3d2b1f] mb-1'>
								<Counter to={value} suffix={suffix} />
							</p>
							<p className='text-xs sm:text-sm text-[#7a6050] font-medium'>{label}</p>
						</FadeUp>
					))}
				</div>
			</section>

			{/* Journey Section */}
			<section id='journey' className='max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20'>
				<FadeUp className='text-center mb-8 sm:mb-10 md:mb-12'>
					<h2 className='heading-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#3d2b1f] mb-2 sm:mb-3'>
						So läuft es ab
					</h2>
					<p className='text-sm sm:text-base text-[#7a6050] px-2'>
						Die Geschichte von Oma Rosa und Max – Schritt für Schritt
					</p>
				</FadeUp>
				<JourneyTimeline />
			</section>

			{/* Categories Section */}
			<section
				id='categories'
				className='bg-[#ffffff] border-y border-[#ddd0be] py-12 sm:py-16 md:py-20'
			>
				<div className='max-w-5xl mx-auto px-3 sm:px-4'>
					<FadeUp className='text-center mb-8 sm:mb-10 md:mb-12'>
						<h2 className='heading-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#3d2b1f] mb-2 sm:mb-3'>
							Womit kann ich helfen?
						</h2>
						<p className='text-sm sm:text-base text-[#7a6050]'>
							Unterstützung bei allem, was den Alltag leichter macht
						</p>
					</FadeUp>
					<div className='grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4'>
						{features.map(({ icon: FeatureIcon, title, desc }, i) => (
							<FadeUp key={title} delay={i * 0.07}>
								<div className='card card-hover p-4 sm:p-5 rounded-xl sm:rounded-2xl h-full group cursor-default min-h-[160px] sm:min-h-[180px] flex flex-col'>
									<div
										className='mb-2 sm:mb-3 inline-block animate-float text-[#8b5e3c]'
										style={{ animationDelay: `${i * 0.3}s` }}
									>
										<FeatureIcon className='w-6 sm:w-8 h-6 sm:h-8' />
									</div>
									<h3 className='font-semibold text-[#3d2b1f] mb-1 group-hover:text-[#6b4226] transition-colors text-sm md:text-base'>
										{title}
									</h3>
									<p className='text-xs sm:text-sm text-[#7a6050] leading-relaxed'>
										{desc}
									</p>
								</div>
							</FadeUp>
						))}
					</div>
				</div>
			</section>

			{/* Helpers Section */}
			<section id='helpers' className='max-w-5xl mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center'>
					<FadeUp>
						<div className='inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 rounded-full px-3 py-1.5 text-xs font-semibold mb-4 sm:mb-6 border border-emerald-100 min-h-[36px]'>
							<Users size={12} /> Für Freiwillige Helfer
						</div>
						<h2 className='heading-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#3d2b1f] mb-3 sm:mb-4 leading-tight'>
							Helfen und dabei
							<span className='shimmer-text'> Punkte sammeln</span>
						</h2>
						<p className='text-sm sm:text-base text-[#7a6050] mb-6 sm:mb-8 leading-relaxed'>
							Als freiwilliger Helfer sammelst du Punkte für jede geleistete
							Hilfe. Diese kannst du gegen echte Prämien einlösen — von
							Kinokarten bis zu offiziellen Ehrenamtszertifikaten der Stadt
							Kassel.
						</p>
						<div className='space-y-2 sm:space-y-3 mb-8 sm:mb-10'>
							{[
								{
									icon: Ticket,
									text: 'Kinogutscheine (Cineplex Kassel)',
								},
								{ icon: Bus, text: 'KVG Tagestickets' },
								{
									icon: Award,
									text: 'Offizielle Ehrenamtsbescheinigung',
								},
								{
									icon: TreePine,
									text: 'Baum pflanzen — soziales Engagement',
								},
							].map(({ icon: RewardIcon, text }, i) => (
								<motion.div
									key={text}
									initial={{ opacity: 0, x: -16 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ delay: i * 0.08, duration: 0.4 }}
									className='flex items-center gap-3 min-h-[40px]'
								>
									<RewardIcon className='w-5 h-5 text-[#8b5e3c] shrink-0' />
									<span className='text-[#3d2b1f] font-medium text-sm'>
										{text}
									</span>
								</motion.div>
							))}
						</div>
						<Link
							href='/register?role=HELPER'
							className='btn-primary btn-glow inline-flex min-h-[44px] px-6 sm:px-8 py-2.5 sm:py-3 items-center'
						>
							Jetzt Helfer werden <ArrowRight size={16} />
						</Link>
					</FadeUp>

					<FadeUp delay={0.15}>
						<div className='bg-linear-to-br from-[#f5ede0] to-[#ffffff] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#e8d5be] shadow-[0_8px_36px_rgba(139,94,60,0.1)]'>
							<div className='flex flex-col gap-3 sm:gap-4'>
								{[
									{
										points: '+10',
										desc: 'Pro geleistete Hilfe',
										icon: Handshake,
									},
									{
										points: '+5',
										desc: 'Für 5-Sterne-Bewertung',
										icon: Star,
									},
									{
										points: '+20',
										desc: 'Ersten Chat abschließen',
										icon: MessageCircle,
									},
								].map(({ points, desc, icon: PointIcon }, i) => (
									<motion.div
										key={desc}
										initial={{ opacity: 0, x: 16 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ delay: i * 0.1, duration: 0.45 }}
										className='bg-[#ffffff] rounded-xl sm:rounded-2xl p-4 flex items-center gap-4 shadow-[0_2px_12px_rgba(61,43,31,0.08)] border border-[#ede3d4] min-h-[80px]'
									>
										<PointIcon className='w-6 sm:w-7 h-6 sm:h-7 text-[#8b5e3c] shrink-0' />
										<div className='min-w-0'>
											<p className='font-bold text-amber-600 text-base sm:text-lg leading-none'>
												{points} Punkte
											</p>
											<p className='text-[#7a6050] text-xs sm:text-sm'>{desc}</p>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					</FadeUp>
				</div>
			</section>

			{/* Trust Section */}
			<section
				id='trust'
				className='relative overflow-hidden bg-linear-to-br from-[#8b5e3c] via-[#7a5035] to-[#6b4226] py-12 sm:py-16 md:py-20 text-center text-[#ffffff]'
			>
				<div className='absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)]' />
				<div className='relative z-10 max-w-2xl mx-auto px-3 sm:px-4'>
					<FadeUp>
						<Shield
							size={40}
							className='mx-auto mb-4 sm:mb-5 opacity-90 animate-float'
						/>
						<h2 className='heading-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4'>
							Sicher & Vertrauenswürdig
						</h2>
						<p className='text-[#e8d5be] mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed px-2'>
							Alle Helfer werden überprüft. Das Bewertungssystem schafft
							Transparenz. Ihre Daten sind sicher nach DSGVO geschützt.
						</p>
						<div className='flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium'>
							{[
								'✓ DSGVO-konform',
								'✓ Verifizierte Helfer',
								'✓ 24h Support',
								'✓ Kostenlos',
							].map((t, i) => (
								<motion.span
									key={t}
									initial={{ opacity: 0, scale: 0.85 }}
									whileInView={{ opacity: 1, scale: 1 }}
									viewport={{ once: true }}
									transition={{ delay: i * 0.07 }}
									className='bg-[#ffffff]/15 rounded-full px-3 sm:px-4 py-1.5 border border-[#ffffff]/20 backdrop-blur-sm min-h-[36px] flex items-center'
								>
									{t}
								</motion.span>
							))}
						</div>
					</FadeUp>
				</div>
			</section>

			{/* Social Proof Section */}
			<section className='bg-[#fdf8f2] border-y border-[#ddd0be] py-10 sm:py-12 md:py-16'>
				<div className='max-w-4xl mx-auto px-3 sm:px-4 flex flex-col md:flex-row items-center gap-4 sm:gap-6 text-center md:text-left'>
					<div className='flex -space-x-3 shrink-0 justify-center'>
						{[User, Users, Heart, UserPlus].map((Icon, i) => (
							<div
								key={i}
								className='w-10 h-10 rounded-full bg-[#f5ede0] border-2 border-[#ffffff] flex items-center justify-center shadow-sm min-h-[44px] min-w-[44px]'
							>
								<Icon size={18} className='text-[#8b5e3c]' />
							</div>
						))}
					</div>
					<div>
						<div className='flex justify-center md:justify-start gap-0.5 mb-1'>
							{[...Array(5)].map((_, i) => (
								<Star
									key={i}
									size={14}
									className='fill-amber-400 text-amber-400'
								/>
							))}
						</div>
						<p className='text-[#3d2b1f] font-medium text-xs sm:text-sm'>
							&bdquo;OMA-NETZ hat mir enorm geholfen &mdash; mein Helfer war
							pünktlich, freundlich und sehr zuverlässig.&ldquo;
						</p>
						<p className='text-[#b09880] text-xs mt-1'>
							— Maria K., 78, Kassel-Mitte
						</p>
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className='bg-[#f5ede0] py-12 sm:py-16 md:py-24'>
				<div className='max-w-3xl mx-auto px-3 sm:px-4 text-center'>
					<FadeUp>
						<motion.div
							animate={{ rotate: [0, 8, -8, 0] }}
							transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
							className='mb-4 sm:mb-6 inline-block text-amber-400'
						>
							<Sun className='w-12 sm:w-14 h-12 sm:h-14' />
						</motion.div>
						<h2 className='heading-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#3d2b1f] mb-3 sm:mb-4'>
							Bereit loszulegen?
						</h2>
						<p className='text-[#7a6050] mb-6 sm:mb-8 text-base sm:text-lg px-2'>
							Registrierung dauert weniger als 2 Minuten.
						</p>
						<div className='flex flex-col sm:flex-row gap-3 justify-center'>
							<Link
								href='/register'
								className='btn-primary btn-glow text-base px-6 sm:px-8 py-3 sm:py-3.5 w-full sm:w-auto min-h-[44px] flex items-center justify-center'
							>
								Kostenlos registrieren <ArrowRight size={16} />
							</Link>
							<Link
								href='/requests'
								className='btn-secondary text-base px-6 sm:px-8 py-3 sm:py-3.5 w-full sm:w-auto min-h-[44px] flex items-center justify-center'
							>
								Anfragen ansehen
							</Link>
						</div>
					</FadeUp>
				</div>
			</section>

			{/* Footer */}
			<footer className='border-t border-[#ddd0be] bg-[#ffffff] py-6 sm:py-8 md:py-10'>
				<div className='max-w-6xl mx-auto px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left'>
					<div className='flex items-center gap-2 min-h-[44px]'>
						<div className='w-6 sm:w-7 h-6 sm:h-7 rounded-lg bg-linear-to-br from-[#8b5e3c] to-[#6b4226] flex items-center justify-center shadow-sm'>
							<span className='text-[#ffffff] font-bold text-xs sm:text-sm'>O</span>
						</div>
						<span className='font-semibold text-[#3d2b1f] text-sm md:text-base'>
							OMA-NETZ Kassel
						</span>
					</div>
					<p className='text-[#b09880] text-xs sm:text-sm'>
						© 2026 OMA-NETZ Kassel · Nachbarschaftshilfe mit Herz
					</p>
					<div className='flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#b09880]'>
						<Link
							href='/impressum'
							className='hover:text-[#3d2b1f] transition-colors min-h-[36px] flex items-center'
						>
							Impressum
						</Link>
						<Link
							href='/datenschutz'
							className='hover:text-[#3d2b1f] transition-colors min-h-[36px] flex items-center'
						>
							Datenschutz
						</Link>
					</div>
				</div>
			</footer>
		</div>
	)
}
