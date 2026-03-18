'use client'

import { cn, getInitials } from '@/lib/utils'

export interface AvatarProps {
	name?: string | null
	image?: string | null
	size?: 'xs' | 'sm' | 'md' | 'lg'
	className?: string
}

const sizeMap = {
	xs: 'w-7 h-7 text-xs',
	sm: 'w-8 h-8 text-xs',
	md: 'w-10 h-10 text-sm',
	lg: 'w-14 h-14 text-base',
}

export function Avatar({ name, image, size = 'md', className }: AvatarProps) {
	const initials = getInitials(name)
	const colors = [
		'bg-[#e8d5be] text-[#6b4226]',
		'bg-sky-100 text-sky-700',
		'bg-emerald-100 text-emerald-700',
		'bg-[#ede3d4] text-[#8b5e3c]',
		'bg-rose-100 text-rose-700',
	]
	const colorIndex = initials.charCodeAt(0) % colors.length
	const color = colors[colorIndex]

	if (image) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={image}
				alt={name ?? 'Avatar'}
				className={cn(
					'rounded-full object-cover shrink-0',
					sizeMap[size],
					className,
				)}
			/>
		)
	}

	return (
		<div
			className={cn(
				'rounded-full flex items-center justify-center font-semibold shrink-0',
				sizeMap[size],
				color,
				className,
			)}
		>
			{initials}
		</div>
	)
}
