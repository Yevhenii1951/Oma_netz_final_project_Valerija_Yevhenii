import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { TRUST_BADGES } from '../landing-data'
import { FadeUp } from './fade-up'

export function TrustSection() {
	return (
		<section
			id='trust'
			className='relative overflow-hidden bg-linear-to-br from-[#8b5e3c] via-[#7a5035] to-[#6b4226] py-12 sm:py-16 md:py-20 text-center text-[#ffffff] scroll-mt-24'
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
						{TRUST_BADGES.map((t, i) => (
							<motion.span
								key={t}
								initial={{ opacity: 0, scale: 0.85 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.07 }}
								className='bg-[#ffffff]/15 rounded-full px-3 sm:px-4 py-1.5 border border-[#ffffff]/20 backdrop-blur-sm min-h-9 flex items-center'
							>
								{t}
							</motion.span>
						))}
					</div>
				</FadeUp>
			</div>
		</section>
	)
}
