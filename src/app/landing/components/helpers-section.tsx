import { motion } from 'framer-motion'
import { ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'
import { HELPER_REWARDS, POINT_BONUSES } from '../landing-data'
import { FadeUp } from './fade-up'

export function HelpersSection() {
	return (
		<section
			id='helpers'
			className='max-w-5xl mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20'
		>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center'>
				<FadeUp>
					<div className='inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 rounded-full px-3 py-1.5 text-xs font-semibold mb-4 sm:mb-6 border border-emerald-100 min-h-9'>
						<Users size={12} /> Für Freiwillige Helfer
					</div>
					<h2 className='heading-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#3d2b1f] mb-3 sm:mb-4 leading-tight'>
						Helfen und dabei
						<span className='shimmer-text'> Punkte sammeln</span>
					</h2>
					<p className='text-sm sm:text-base text-[#7a6050] mb-6 sm:mb-8 leading-relaxed'>
						Als freiwilliger Helfer sammelst du Punkte für jede geleistete
						Hilfe. Diese kannst du gegen echte Prämien einlösen — von Kinokarten
						bis zu offiziellen Ehrenamtszertifikaten der Stadt Kassel.
					</p>
					<div className='space-y-2 sm:space-y-3 mb-8 sm:mb-10'>
						{HELPER_REWARDS.map(({ icon: RewardIcon, text }, i) => (
							<motion.div
								key={text}
								initial={{ opacity: 0, x: -16 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.08, duration: 0.4 }}
								className='flex items-center gap-3 min-h-10'
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
						className='btn-primary btn-glow inline-flex min-h-11 px-6 sm:px-8 py-2.5 sm:py-3 items-center'
					>
						Jetzt Helfer werden <ArrowRight size={16} />
					</Link>
				</FadeUp>

				<FadeUp delay={0.15}>
					<div className='bg-linear-to-br from-[#f5ede0] to-[#ffffff] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#e8d5be] shadow-[0_8px_36px_rgba(139,94,60,0.1)]'>
						<div className='flex flex-col gap-3 sm:gap-4'>
							{POINT_BONUSES.map(({ points, desc, icon: PointIcon }, i) => (
								<motion.div
									key={desc}
									initial={{ opacity: 0, x: 16 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ delay: i * 0.1, duration: 0.45 }}
									className='bg-[#ffffff] rounded-xl sm:rounded-2xl p-4 flex items-center gap-4 shadow-[0_2px_12px_rgba(61,43,31,0.08)] border border-[#ede3d4] min-h-20'
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
	)
}
