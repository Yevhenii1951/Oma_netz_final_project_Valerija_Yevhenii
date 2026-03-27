import BackgroundPaths from '@/components/background-paths'
import { motion } from 'framer-motion'
import { ArrowRight, HandHelping, Handshake } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
	return (
		<>
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
							className='btn-primary btn-glow text-base px-6 sm:px-8 py-3 sm:py-3.5 w-full sm:w-auto min-h-11 flex items-center justify-center'
						>
							<HandHelping size={18} className='inline mr-1' /> Ich brauche
							Hilfe <ArrowRight size={16} />
						</Link>
						<Link
							href='/register?role=HELPER'
							className='btn-secondary text-base px-6 sm:px-8 py-3 sm:py-3.5 w-full sm:w-auto min-h-11 flex items-center justify-center'
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
		</>
	)
}
