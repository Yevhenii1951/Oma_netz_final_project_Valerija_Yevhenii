import { motion } from 'framer-motion'
import { ArrowRight, Sun } from 'lucide-react'
import Link from 'next/link'
import { FadeUp } from './fade-up'

export function FinalCtaSection() {
	return (
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
							className='btn-primary btn-glow text-base px-6 sm:px-8 py-3 sm:py-3.5 w-full sm:w-auto min-h-11 flex items-center justify-center'
						>
							Kostenlos registrieren <ArrowRight size={16} />
						</Link>
						<Link
							href='/requests'
							className='btn-secondary text-base px-6 sm:px-8 py-3 sm:py-3.5 w-full sm:w-auto min-h-11 flex items-center justify-center'
						>
							Anfragen ansehen
						</Link>
					</div>
				</FadeUp>
			</div>
		</section>
	)
}
