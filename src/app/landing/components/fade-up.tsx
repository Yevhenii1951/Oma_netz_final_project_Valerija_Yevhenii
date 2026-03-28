import { motion } from 'framer-motion'

export function FadeUp({
	children,
	delay = 0,
	className = '',
}: {
	children: React.ReactNode
	delay?: number
	className?: string
}) {
	return (
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
}
