'use client'

/**
 * Adapted from KokonutUI BackgroundPaths by @dorianbaffier (MIT)
 * Recolored for OMA-NETZ warm chocolate/caramel palette.
 */

import { motion } from 'framer-motion'
import { memo, useMemo } from 'react'

interface Point {
	x: number
	y: number
}

interface PathData {
	id: string
	d: string
	opacity: number
	width: number
}

function fmt(n: number): string {
	return n.toFixed(3)
}

function generateAestheticPath(
	index: number,
	position: number,
	type: 'primary' | 'secondary' | 'accent',
): string {
	const baseAmplitude =
		type === 'primary' ? 150 : type === 'secondary' ? 100 : 60
	const phase = index * 0.2
	const points: Point[] = []
	const segments = type === 'primary' ? 10 : type === 'secondary' ? 8 : 6

	const startX = 2400
	const startY = 800
	const endX = -2400
	const endY = -800 + index * 25

	for (let i = 0; i <= segments; i++) {
		const progress = i / segments
		const eased = 1 - (1 - progress) ** 2
		const baseX = startX + (endX - startX) * eased
		const baseY = startY + (endY - startY) * eased
		const amplitudeFactor = 1 - eased * 0.3
		const wave1 =
			Math.sin(progress * Math.PI * 3 + phase) *
			(baseAmplitude * 0.7 * amplitudeFactor)
		const wave2 =
			Math.cos(progress * Math.PI * 4 + phase) *
			(baseAmplitude * 0.3 * amplitudeFactor)
		const wave3 =
			Math.sin(progress * Math.PI * 2 + phase) *
			(baseAmplitude * 0.2 * amplitudeFactor)
		points.push({ x: baseX * position, y: baseY + wave1 + wave2 + wave3 })
	}

	const pathCommands = points.map((point: Point, i: number) => {
		if (i === 0) return `M ${fmt(point.x)} ${fmt(point.y)}`
		const prevPoint = points[i - 1]
		const tension = 0.4
		const cp1x = prevPoint.x + (point.x - prevPoint.x) * tension
		const cp1y = prevPoint.y
		const cp2x = prevPoint.x + (point.x - prevPoint.x) * (1 - tension)
		const cp2y = point.y
		return `C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(point.x)} ${fmt(point.y)}`
	})

	return pathCommands.join(' ')
}

const FloatingPaths = memo(function FloatingPaths({
	position,
}: {
	position: number
}) {
	const primaryPaths: PathData[] = useMemo(
		() =>
			Array.from({ length: 12 }, (_, i) => ({
				id: `primary-${i}`,
				d: generateAestheticPath(i, position, 'primary'),
				opacity: 0.12 + i * 0.015,
				width: 3.5 + i * 0.25,
			})),
		[position],
	)

	const secondaryPaths: PathData[] = useMemo(
		() =>
			Array.from({ length: 15 }, (_, i) => ({
				id: `secondary-${i}`,
				d: generateAestheticPath(i, position, 'secondary'),
				opacity: 0.08 + i * 0.012,
				width: 2.5 + i * 0.2,
			})),
		[position],
	)

	const accentPaths: PathData[] = useMemo(
		() =>
			Array.from({ length: 10 }, (_, i) => ({
				id: `accent-${i}`,
				d: generateAestheticPath(i, position, 'accent'),
				opacity: 0.06 + i * 0.01,
				width: 1.5 + i * 0.15,
			})),
		[position],
	)

	const sharedAnim = {
		opacity: 1,
		scale: 1,
		transition: { opacity: { duration: 1 }, scale: { duration: 1 } },
	}

	return (
		<div className='pointer-events-none absolute inset-0 overflow-hidden'>
			<svg
				className='h-full w-full'
				fill='none'
				preserveAspectRatio='xMidYMid slice'
				viewBox='-2400 -800 4800 1600'
			>
				<title>Background decoration</title>
				<defs>
					{/* Warm chocolate-caramel gradient */}
					<linearGradient id='warmGradient' x1='0%' x2='100%' y1='0%' y2='0%'>
						<stop offset='0%' stopColor='rgba(139, 94, 60, 0.55)' />
						<stop offset='40%' stopColor='rgba(200, 149, 108, 0.45)' />
						<stop offset='70%' stopColor='rgba(232, 213, 190, 0.35)' />
						<stop offset='100%' stopColor='rgba(139, 94, 60, 0.4)' />
					</linearGradient>
				</defs>

				<g className='primary-waves'>
					{primaryPaths.map(path => (
						<motion.path
							animate={{ ...sharedAnim, y: [0, -15, 0] }}
							d={path.d}
							initial={{ opacity: 0, scale: 0.8 }}
							key={path.id}
							stroke='url(#warmGradient)'
							strokeLinecap='round'
							strokeWidth={path.width}
							style={{ opacity: path.opacity }}
							transition={{
								...sharedAnim.transition,
								y: {
									duration: 25,
									repeat: Number.POSITIVE_INFINITY,
									ease: 'easeInOut',
									repeatType: 'reverse',
								},
							}}
						/>
					))}
				</g>

				<g className='secondary-waves' style={{ opacity: 0.8 }}>
					{secondaryPaths.map(path => (
						<motion.path
							animate={{ ...sharedAnim, y: [0, -10, 0] }}
							d={path.d}
							initial={{ opacity: 0, scale: 0.9 }}
							key={path.id}
							stroke='url(#warmGradient)'
							strokeLinecap='round'
							strokeWidth={path.width}
							style={{ opacity: path.opacity }}
							transition={{
								...sharedAnim.transition,
								y: {
									duration: 18,
									repeat: Number.POSITIVE_INFINITY,
									ease: 'easeInOut',
									repeatType: 'reverse',
								},
							}}
						/>
					))}
				</g>

				<g className='accent-waves' style={{ opacity: 0.6 }}>
					{accentPaths.map(path => (
						<motion.path
							animate={{ ...sharedAnim, y: [0, -5, 0] }}
							d={path.d}
							initial={{ opacity: 0, scale: 0.95 }}
							key={path.id}
							stroke='url(#warmGradient)'
							strokeLinecap='round'
							strokeWidth={path.width}
							style={{ opacity: path.opacity }}
							transition={{
								...sharedAnim.transition,
								y: {
									duration: 12,
									repeat: Number.POSITIVE_INFINITY,
									ease: 'easeInOut',
									repeatType: 'reverse',
								},
							}}
						/>
					))}
				</g>
			</svg>
		</div>
	)
})

export default memo(function BackgroundPaths({
	children,
}: {
	children?: React.ReactNode
}) {
	return (
		<div className='relative overflow-hidden'>
			<FloatingPaths position={1} />
			{children}
		</div>
	)
})
