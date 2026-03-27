'use client'

import { Star } from 'lucide-react'
import Link from 'next/link'
import { FEATURES, SOCIAL_ICONS, STATS } from '../landing-data'
import { Counter, JourneyTimeline } from '../landing-timeline'
import { FadeUp } from './fade-up'
export { FinalCtaSection } from './final-cta-section'
export { HelpersSection } from './helpers-section'
export { HeroSection } from './hero-section'
export { TrustSection } from './trust-section'

export function StatsSection() {
	return (
		<section className='bg-[#ffffff] border-y border-[#ddd0be] py-10 sm:py-12 md:py-16 shadow-[inset_0_1px_0_rgba(61,43,31,0.05)]'>
			<div className='max-w-4xl mx-auto px-3 sm:px-4 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center'>
				{STATS.map(({ value, suffix, label }, i) => (
					<FadeUp key={label} delay={i * 0.08}>
						<p className='heading-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#3d2b1f] mb-1'>
							<Counter to={value} suffix={suffix} />
						</p>
						<p className='text-xs sm:text-sm text-[#7a6050] font-medium'>
							{label}
						</p>
					</FadeUp>
				))}
			</div>
		</section>
	)
}

export function JourneySection() {
	return (
		<section
			id='journey'
			className='max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20'
		>
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
	)
}

export function CategoriesSection() {
	return (
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
					{FEATURES.map(({ icon: FeatureIcon, title, desc }, i) => (
						<FadeUp key={title} delay={i * 0.07}>
							<div className='card card-hover p-4 sm:p-5 rounded-xl sm:rounded-2xl h-full group cursor-default min-h-40 sm:min-h-45 flex flex-col'>
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
	)
}

export function SocialProofSection() {
	return (
		<section className='bg-[#fdf8f2] border-y border-[#ddd0be] py-10 sm:py-12 md:py-16'>
			<div className='max-w-4xl mx-auto px-3 sm:px-4 flex flex-col md:flex-row items-center gap-4 sm:gap-6 text-center md:text-left'>
				<div className='flex -space-x-3 shrink-0 justify-center'>
					{SOCIAL_ICONS.map((Icon, i) => (
						<div
							key={i}
							className='w-10 h-10 rounded-full bg-[#f5ede0] border-2 border-[#ffffff] flex items-center justify-center shadow-sm min-h-11 min-w-11'
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
	)
}

export function LandingFooter() {
	return (
		<footer className='border-t border-[#ddd0be] bg-[#ffffff] py-6 sm:py-8 md:py-10'>
			<div className='max-w-6xl mx-auto px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left'>
				<div className='flex items-center gap-2 min-h-11'>
					<div className='w-6 sm:w-7 h-6 sm:h-7 rounded-lg bg-linear-to-br from-[#8b5e3c] to-[#6b4226] flex items-center justify-center shadow-sm'>
						<span className='text-[#ffffff] font-bold text-xs sm:text-sm'>
							O
						</span>
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
						className='hover:text-[#3d2b1f] transition-colors min-h-9 flex items-center'
					>
						Impressum
					</Link>
					<Link
						href='/datenschutz'
						className='hover:text-[#3d2b1f] transition-colors min-h-9 flex items-center'
					>
						Datenschutz
					</Link>
				</div>
			</div>
		</footer>
	)
}
