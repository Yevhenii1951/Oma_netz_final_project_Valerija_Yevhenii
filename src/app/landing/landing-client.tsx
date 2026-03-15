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
	Handshake,
	Heart,
	Home,
	Laptop,
	MapPin,
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
	HandHelping,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

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

	// Автоматическое переключение каждые 5 секунд, если не наведена мышь
	useEffect(() => {
		if (isPaused) return
		const id = setInterval(() => {
			setActive(p => (p + 1) % STEPS.length)
		}, 5000)
		return () => clearInterval(id)
	}, [isPaused])

	// Картинки из папки /carussel (используются разные для каждого шага, но могут повторяться)
	const carusselImages = useMemo(
		() => [
			'/carussel/frame_01.svg',
			'/carussel/frame_02.svg',
			'/carussel/frame_03.svg',
			'/carussel/frame_04.svg',
			'/carussel/frame_05.svg',
			'/carussel/frame_06.svg',
			'/carussel/frame_07.svg',
			'/carussel/frame_08.svg',
			'/carussel/frame_09.svg',
			'/carussel/frame_10.svg',
			'/carussel/frame_11.svg',
			'/carussel/frame_12.svg',
			'/carussel/frame_14.svg',
			'/carussel/frame_15.svg',
		],
		[],
	)

	// Индикаторы прогресса (кружочки)
	const progressIndicators = STEPS.map((_, i) => (
		<button
			key={i}
			onClick={() => setActive(i)}
			className={`w-2 h-2 rounded-full transition-all duration-300 ${
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
		<div className='flex flex-col items-center gap-8 py-8 w-full'>
			{/* Горизонтальная цепочка иконок (упрощённая, без сложной анимации) */}
			<div className='hidden md:flex items-center justify-center gap-2 w-full max-w-5xl px-4'>
				{STEPS.map((step, i) => {
					const isActive = i === active
					const isPast = i < active
					return (
						<motion.button
							key={i}
							onClick={() => setActive(i)}
							className='relative flex items-center justify-center'
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							onMouseEnter={() => setIsPaused(true)}
							onMouseLeave={() => setIsPaused(false)}
						>
							{/* Линия между иконками */}
							{i < STEPS.length - 1 && (
								<div className='absolute left-1/2 top-1/2 w-12 h-0.5 bg-[#e8d5be] -z-10'>
									<motion.div
										className='h-full bg-gradient-to-r from-[#8b5e3c] to-[#d97706]'
										initial={{ width: 0 }}
										animate={{ width: isPast || isActive ? '100%' : '0%' }}
										transition={{ duration: 0.5, delay: i * 0.05 }}
									/>
								</div>
							)}
							{/* Кружок с иконкой */}
							<div
								className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
									isActive
										? 'bg-gradient-to-br from-[#8b5e3c] to-[#d97706] shadow-lg shadow-[#8b5e3c]/30 scale-110'
										: isPast
											? 'bg-[#8b5e3c]/20'
											: 'bg-[#e8d5be]'
								}`}
							>
								<step.icon
									className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8b5e3c]'}`}
								/>
							</div>
							{/* Бегущая точка под активным шагом */}
							{isActive && (
								<motion.div
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0 }}
									className='absolute -bottom-2 w-2 h-2 rounded-full bg-[#d97706]'
								/>
							)}
						</motion.button>
					)
				})}
			</div>

			{/* Мобильная версия: упрощённые индикаторы (без иконок) */}
			<div className='md:hidden flex justify-center gap-2 mb-4'>
				{progressIndicators}
			</div>

			{/* Основной блок с картинкой и описанием */}
			<div
				className='w-full max-w-xl px-4'
				onMouseEnter={() => setIsPaused(true)}
				onMouseLeave={() => setIsPaused(false)}
			>
				<AnimatePresence mode='wait'>
					<motion.div
						key={active}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.5, ease: 'easeInOut' }}
						className='bg-white rounded-3xl p-6 shadow-xl border border-[#e8d5be] text-center'
					>
						{/* Картинка с эффектом увеличения */}
						<motion.div
							key={`img-${active}`}
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 1.2, opacity: 0 }}
							transition={{ duration: 0.6, ease: 'easeOut' }}
							className='w-72 h-72 mx-auto mb-4 flex items-center justify-center'
						>
							<img
								src={carusselImages[active % carusselImages.length]}
								alt=''
								className='w-full h-full object-contain drop-shadow-md'
							/>
						</motion.div>

						{/* Тэг (номер шага) */}
						<span className='inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 bg-[#8b5e3c]/10 text-[#8b5e3c]'>
							{STEPS[active].tag}
						</span>

						{/* Заголовок */}
						<h3 className='heading-serif text-xl md:text-2xl font-bold text-[#3d2b1f] mb-2'>
							{STEPS[active].title}
						</h3>

						{/* Описание */}
						<p className='text-[#7a6050] leading-relaxed text-sm'>
							{STEPS[active].desc}
						</p>

						{/* Индикаторы прогресса (для десктопа, чтобы не терять навигацию) */}
						<div className='mt-6 flex items-center justify-center gap-2'>
							{progressIndicators}
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	)
}

/* ─── НОВЫЙ массив STEPS с 14 шагами (полная история) ────────────────────── */
const STEPS: { icon: LucideIcon; title: string; desc: string; tag: string }[] = [
	{
		icon: UserPlus,
		title: 'Oma Rosa findet die Website',
		desc: 'Sie sucht im Internet nach Hilfe und stößt auf OMA-NETZ.',
		tag: '1/14',
	},
	{
		icon: UserRoundPlus,
		title: 'Registrierung von Oma Rosa',
		desc: 'Sie gibt Namen, Adresse und die Art der Hilfe ein (Glühbirne wechseln).',
		tag: '2/14',
	},
	{
		icon: FilePlus,
		title: 'Anfrage erstellen',
		desc: 'Oma Rosa erstellt eine Anfrage mit Beschreibung der Aufgabe.',
		tag: '3/14',
	},
	{
		icon: UserPlus,
		title: 'Max registriert sich',
		desc: 'Student Max füllt sein Profil aus und bestätigt seine Dokumente.',
		tag: '4/14',
	},
	{
		icon: ClipboardList,
		title: 'Admin prüft',
		desc: 'Der Administrator prüft die Anfrage von Max und bestätigt die Registrierung.',
		tag: '5/14',
	},
	{
		icon: MapPin,
		title: 'Max sieht die Anfrage auf der Karte',
		desc: 'In Max\'s Dashboard erscheint die Anfrage von Oma Rosa.',
		tag: '6/14',
	},
	{
		icon: ThumbsUp,
		title: 'Max meldet sich',
		desc: 'Max klickt auf «Ich helfe» und hinterlässt eine kurze Nachricht.',
		tag: '7/14',
	},
	{
		icon: Bell,
		title: 'Oma Rosa erhält die Anfrage',
		desc: 'Oma sieht die Benachrichtigung und bestätigt Max als Helfer.',
		tag: '8/14',
	},
	{
		icon: MessageSquareText,
		title: 'Termin vereinbaren',
		desc: 'Im Chat vereinbaren sie, wann Max vorbeikommt.',
		tag: '9/14',
	},
	{
		icon: Home,
		title: 'Max kommt vorbei',
		desc: 'Max wechselt die Glühbirne im Kronleuchter.',
		tag: '10/14',
	},
	{
		icon: Star,
		title: 'Oma Rosa bewertet',
		desc: 'Oma vergibt 5 Sterne und schreibt eine Bewertung.',
		tag: '11/14',
	},
	{
		icon: Coins,
		title: 'Max erhält Punkte',
		desc: 'Max sieht die gutgeschriebenen Punkte und Sterne.',
		tag: '12/14',
	},
	{
		icon: Ticket,
		title: 'Umtausch gegen Kino',
		desc: 'Max tauscht seine Punkte gegen eine Kinokarte ein.',
		tag: '13/14',
	},
	{
		icon: Heart,
		title: 'Kino mit der Freundin',
		desc: 'Max geht mit seiner Freundin ins Kino. Alle sind zufrieden!',
		tag: '14/14',
	},
]

/* ════════════════════════════════════════════════════════════════════════════ */

export default function LandingClient() {
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
			{/* ── NAV ─────────────────────────────────────────────────────── */}
			<nav className='sticky top-0 z-50 bg-[#ffffff]/90 backdrop-blur-xl border-b border-[#ddd0be]/80 shadow-[0_1px_8px_rgba(61,43,31,0.06)]'>
				<div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4'>
					{/* LOGO */}
					<motion.div
						initial={{ opacity: 0, x: -12 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className='flex items-center gap-2 shrink-0'
					>
						<a href='#hero' className='flex items-center gap-2 group'>
							<div className='w-9 h-9 rounded-xl bg-linear-to-br from-[#8b5e3c] to-[#6b4226] flex items-center justify-center shadow-[0_2px_8px_rgba(139,94,60,0.3)] group-hover:shadow-[0_4px_14px_rgba(139,94,60,0.45)] transition-shadow'>
								<span className='text-[#ffffff] font-bold text-base'>O</span>
							</div>
							<div>
								<span className='font-bold text-[#3d2b1f] text-base leading-none block tracking-tight'>
									OMA-NETZ
								</span>
								<span className='text-[10px] text-[#b09880] font-medium'>
									Kassel
								</span>
							</div>
						</a>
					</motion.div>

					{/* CENTER NAV LINKS — hidden on mobile */}
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
								className='relative px-3 py-1.5 text-sm font-medium text-[#7a6050] hover:text-[#3d2b1f] transition-colors rounded-lg hover:bg-[#f5ede0] group'
							>
								{label}
								<span className='absolute bottom-0.5 left-3 right-3 h-px bg-[#8b5e3c] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full' />
							</a>
						))}
					</motion.div>

					{/* AUTH BUTTONS */}
					<motion.div
						initial={{ opacity: 0, x: 12 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className='flex items-center gap-3 shrink-0'
					>
						<Link
							href='/login'
							className='text-[#7a6050] font-medium text-sm hover:text-[#3d2b1f] transition-colors'
						>
							Anmelden
						</Link>
						<Link href='/register' className='btn-primary text-sm py-2 px-5'>
							Registrieren
						</Link>
					</motion.div>
				</div>
			</nav>

			{/* ── HERO with animated background paths ─────────────────────── */}
			<div id='hero' />
			<BackgroundPaths>
				<section className='max-w-6xl mx-auto px-4 pt-24 pb-20 text-center relative z-10'>
					{/* headline — Playfair Display serif */}
					<motion.h1
						initial={{ opacity: 0, y: 32 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
						className='heading-serif text-5xl md:text-7xl font-bold text-[#3d2b1f] leading-[1.08] tracking-tight mb-3'
					>
						Füreinander da sein
					</motion.h1>

					{/* shimmer animated subtitle */}
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, delay: 0.35 }}
						className='heading-serif text-3xl md:text-4xl font-semibold shimmer-text mb-8'
					>
						in Kassel
					</motion.p>

					<motion.p
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.5 }}
						className='text-xl text-[#7a6050] max-w-2xl mx-auto mb-10 leading-relaxed'
					>
						OMA-NETZ verbindet ältere Menschen mit freiwilligen Helfern für
						alltägliche Aufgaben — kostenlos, unkompliziert und mit Herz.
					</motion.p>

					{/* CTA buttons */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.65 }}
						className='flex flex-col sm:flex-row items-center justify-center gap-3 mb-6'
					>
						<Link
							href='/dashboard'
							className='btn-primary btn-glow text-base px-8 py-3.5 w-full sm:w-auto'
						>
							<HandHelping size={18} className='inline mr-1' /> Ich brauche Hilfe <ArrowRight size={16} />
						</Link>
						<Link
							href='/dashboard'
							className='btn-secondary text-base px-8 py-3.5 w-full sm:w-auto'
						>
							<Handshake size={18} className='inline mr-1' /> Ich möchte helfen
						</Link>
					</motion.div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.85 }}
						className='text-sm text-[#b09880]'
					>
						Kostenlos · Keine Verpflichtung · Jederzeit
					</motion.p>
				</section>
			</BackgroundPaths>

			{/* ── STATS with animated counters ────────────────────────────── */}
			<section className='bg-[#ffffff] border-y border-[#ddd0be] py-12 shadow-[inset_0_1px_0_rgba(61,43,31,0.05)]'>
				<div className='max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
					{stats.map(({ value, suffix, label }, i) => (
						<FadeUp key={label} delay={i * 0.08}>
							<p className='heading-serif text-4xl font-bold text-[#3d2b1f] mb-1'>
								<Counter to={value} suffix={suffix} />
							</p>
							<p className='text-sm text-[#7a6050] font-medium'>{label}</p>
						</FadeUp>
					))}
				</div>
			</section>

			{/* ── JOURNEY (ПОЛНОСТЬЮ ОБНОВЛЕНО) ────────────────────────────── */}
			<section id='journey' className='max-w-6xl mx-auto px-4 py-16'>
				<FadeUp className='text-center mb-10'>
					<h2 className='heading-serif text-4xl font-bold text-[#3d2b1f] mb-3'>
						So läuft es ab
					</h2>
					<p className='text-[#7a6050]'>
						Die Geschichte von Oma Rosa und Max – Schritt für Schritt
					</p>
				</FadeUp>
				<JourneyTimeline />
			</section>

			{/* ── CATEGORIES ──────────────────────────────────────────────── */}
			<section
				id='categories'
				className='bg-[#ffffff] border-y border-[#ddd0be] py-20'
			>
				<div className='max-w-5xl mx-auto px-4'>
					<FadeUp className='text-center mb-12'>
						<h2 className='heading-serif text-4xl font-bold text-[#3d2b1f] mb-3'>
							Womit kann ich helfen?
						</h2>
						<p className='text-[#7a6050]'>
							Unterstützung bei allem, was den Alltag leichter macht
						</p>
					</FadeUp>
					<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
						{features.map(({ icon: FeatureIcon, title, desc }, i) => (
							<FadeUp key={title} delay={i * 0.07}>
								<div className='card card-hover p-5 rounded-2xl h-full group cursor-default'>
									<div
										className='mb-3 inline-block animate-float text-[#8b5e3c]'
										style={{ animationDelay: `${i * 0.3}s` }}
									>
										<FeatureIcon className='w-8 h-8' />
									</div>
									<h3 className='font-semibold text-[#3d2b1f] mb-1 group-hover:text-[#6b4226] transition-colors'>
										{title}
									</h3>
									<p className='text-sm text-[#7a6050] leading-relaxed'>
										{desc}
									</p>
								</div>
							</FadeUp>
						))}
					</div>
				</div>
			</section>

			{/* ── FOR VOLUNTEERS ──────────────────────────────────────────── */}
			<section id='helpers' className='max-w-5xl mx-auto px-4 py-20'>
				<div className='grid md:grid-cols-2 gap-12 items-center'>
					<FadeUp>
						<div className='inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 rounded-full px-3 py-1 text-xs font-semibold mb-6 border border-emerald-100'>
							<Users size={12} /> Für Freiwillige Helfer
						</div>
						<h2 className='heading-serif text-4xl font-bold text-[#3d2b1f] mb-4 leading-tight'>
							Helfen und dabei
							<span className='shimmer-text'> Punkte sammeln</span>
						</h2>
						<p className='text-[#7a6050] mb-6 leading-relaxed'>
							Als freiwilliger Helfer sammelst du Punkte für jede geleistete
							Hilfe. Diese kannst du gegen echte Prämien einlösen — von
							Kinokarten bis zu offiziellen Ehrenamtszertifikaten der Stadt
							Kassel.
						</p>
						<div className='space-y-3 mb-8'>
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
									className='flex items-center gap-3'
								>
									<RewardIcon
										className='w-5 h-5 text-[#8b5e3c] shrink-0'
									/>
									<span className='text-[#3d2b1f] font-medium text-sm'>
										{text}
									</span>
								</motion.div>
							))}
						</div>
						<Link
							href='/register?role=HELPER'
							className='btn-primary btn-glow inline-flex'
						>
							Jetzt Helfer werden <ArrowRight size={16} />
						</Link>
					</FadeUp>

					<FadeUp delay={0.15}>
						<div className='bg-linear-to-br from-[#f5ede0] to-[#ffffff] rounded-3xl p-8 border border-[#e8d5be] shadow-[0_8px_36px_rgba(139,94,60,0.1)]'>
							<div className='flex flex-col gap-4'>
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
										className='bg-[#ffffff] rounded-2xl p-4 flex items-center gap-4 shadow-[0_2px_12px_rgba(61,43,31,0.08)] border border-[#ede3d4]'
									>
										<PointIcon
											className='w-7 h-7 text-[#8b5e3c] shrink-0'
										/>
										<div>
											<p className='font-bold text-amber-600 text-lg leading-none'>
												{points} Punkte
											</p>
											<p className='text-[#7a6050] text-sm'>{desc}</p>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					</FadeUp>
				</div>
			</section>

			{/* ── TRUST ────────────────────────────────────────────────────── */}
			<section
				id='trust'
				className='relative overflow-hidden bg-linear-to-br from-[#8b5e3c] via-[#7a5035] to-[#6b4226] py-20 text-center text-[#ffffff]'
			>
				<div className='absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)]' />
				<div className='relative z-10 max-w-2xl mx-auto px-4'>
					<FadeUp>
						<Shield
							size={44}
							className='mx-auto mb-5 opacity-90 animate-float'
						/>
						<h2 className='heading-serif text-4xl font-bold mb-4'>
							Sicher & Vertrauenswürdig
						</h2>
						<p className='text-[#e8d5be] mb-8 text-lg leading-relaxed'>
							Alle Helfer werden überprüft. Das Bewertungssystem schafft
							Transparenz. Ihre Daten sind sicher nach DSGVO geschützt.
						</p>
						<div className='flex flex-wrap items-center justify-center gap-3 text-sm font-medium'>
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
									className='bg-[#ffffff]/15 rounded-full px-4 py-1.5 border border-[#ffffff]/20 backdrop-blur-sm'
								>
									{t}
								</motion.span>
							))}
						</div>
					</FadeUp>
				</div>
			</section>

			{/* ── TESTIMONIAL ──────────────────────────────────────────────── */}
			<section className='bg-[#fdf8f2] border-y border-[#ddd0be] py-10'>
				<div className='max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center gap-6 text-center md:text-left'>
					<div className='flex -space-x-3 shrink-0 justify-center'>
						{[User, Users, Heart, UserPlus].map((Icon, i) => (
							<div
								key={i}
								className='w-10 h-10 rounded-full bg-[#f5ede0] border-2 border-[#ffffff] flex items-center justify-center shadow-sm'
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
						<p className='text-[#3d2b1f] font-medium text-sm'>
							&bdquo;OMA-NETZ hat mir enorm geholfen &mdash; mein Helfer war
							pünktlich, freundlich und sehr zuverlässig.&ldquo;
						</p>
						<p className='text-[#b09880] text-xs mt-1'>
							— Maria K., 78, Kassel-Mitte
						</p>
					</div>
				</div>
			</section>

			{/* ── CTA ─────────────────────────────────────────────────────── */}
			<section className='bg-[#f5ede0] py-24'>
				<div className='max-w-3xl mx-auto px-4 text-center'>
					<FadeUp>
						<motion.div
							animate={{ rotate: [0, 8, -8, 0] }}
							transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
							className='mb-6 inline-block text-amber-400'
						>
							<Sun className='w-14 h-14' />
						</motion.div>
						<h2 className='heading-serif text-4xl font-bold text-[#3d2b1f] mb-4'>
							Bereit loszulegen?
						</h2>
						<p className='text-[#7a6050] mb-8 text-lg'>
							Registrierung dauert weniger als 2 Minuten.
						</p>
						<div className='flex flex-col sm:flex-row gap-3 justify-center'>
							<Link
								href='/register'
								className='btn-primary btn-glow text-base px-8 py-3.5'
							>
								Kostenlos registrieren <ArrowRight size={16} />
							</Link>
							<Link
								href='/requests'
								className='btn-secondary text-base px-8 py-3.5'
							>
								Anfragen ansehen
							</Link>
						</div>
					</FadeUp>
				</div>
			</section>

			{/* ── FOOTER ───────────────────────────────────────────────────── */}
			<footer className='border-t border-[#ddd0be] bg-[#ffffff] py-8'>
				<div className='max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4'>
					<div className='flex items-center gap-2'>
						<div className='w-7 h-7 rounded-lg bg-linear-to-br from-[#8b5e3c] to-[#6b4226] flex items-center justify-center shadow-sm'>
							<span className='text-[#ffffff] font-bold text-sm'>O</span>
						</div>
						<span className='font-semibold text-[#3d2b1f]'>
							OMA-NETZ Kassel
						</span>
					</div>
					<p className='text-[#b09880] text-sm'>
						© 2026 OMA-NETZ Kassel · Nachbarschaftshilfe mit Herz
					</p>
					<div className='flex items-center gap-4 text-sm text-[#b09880]'>
						<Link
							href='/impressum'
							className='hover:text-[#3d2b1f] transition-colors'
						>
							Impressum
						</Link>
						<Link
							href='/datenschutz'
							className='hover:text-[#3d2b1f] transition-colors'
						>
							Datenschutz
						</Link>
					</div>
				</div>
			</footer>
		</div>
	)
}
