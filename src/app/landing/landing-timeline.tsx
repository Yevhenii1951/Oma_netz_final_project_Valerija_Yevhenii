import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
	Bell,
	ChevronLeft,
	ChevronRight,
	ClipboardList,
	Coins,
	FilePlus,
	Heart,
	Home,
	MapPin,
	MessageSquareText,
	Star,
	ThumbsUp,
	Ticket,
	UserPlus,
	UserRoundPlus,
} from 'lucide-react'
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

export function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
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

export function JourneyTimeline() {
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
			className={`h-2.5 rounded-full transition-all duration-300 min-h-11 min-w-11 flex items-center justify-center -m-2.5 ${
				i === active
					? 'bg-[#8b5e3c] scale-125 w-4'
					: i < active
						? 'bg-[#8b5e3c]/40 w-2.5'
						: 'bg-[#e8d5be] hover:bg-[#b09880] w-2.5'
			}`}
			aria-label={`Zu Schritt ${i + 1} wechseln`}
		/>
	))

	function goPrev() {
		setActive(prev => (prev - 1 + STEPS.length) % STEPS.length)
	}

	function goNext() {
		setActive(prev => (prev + 1) % STEPS.length)
	}

	return (
		<div
			ref={carouselRef}
			className='flex flex-col items-center gap-4 sm:gap-6 md:gap-8 py-8 w-full'
		>
			<div className='hidden xl:flex items-center justify-center gap-2 w-full max-w-5xl px-4'>
				{STEPS.map((step, i) => {
					const isActive = i === active
					const isPast = i < active
					return (
						<motion.button
							key={i}
							onClick={() => setActive(i)}
							aria-label={`Перейти к шагу ${i + 1}`}
							className='relative flex items-center justify-center min-h-14 min-w-14'
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

			<div className='xl:hidden flex items-center justify-center gap-2 mb-2 w-full max-w-xl px-2'>
				<button
					type='button'
					onClick={goPrev}
					className='h-10 w-10 rounded-full border border-[#ddd0be] bg-white text-[#7a6050] hover:bg-[#f5ede0] hover:text-[#3d2b1f] transition-colors flex items-center justify-center shrink-0'
					aria-label='Vorheriger Schritt'
				>
					<ChevronLeft size={16} />
				</button>

				<div className='hidden lg:flex items-center justify-center gap-3 flex-wrap'>
					{progressIndicators}
				</div>

				<button
					type='button'
					onClick={goNext}
					className='h-10 w-10 rounded-full border border-[#ddd0be] bg-white text-[#7a6050] hover:bg-[#f5ede0] hover:text-[#3d2b1f] transition-colors flex items-center justify-center shrink-0'
					aria-label='Naechster Schritt'
				>
					<ChevronRight size={16} />
				</button>
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
