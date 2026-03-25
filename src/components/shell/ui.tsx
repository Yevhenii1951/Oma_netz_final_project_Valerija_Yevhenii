'use client'

import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/types'
import { Icon } from '@iconify/react'
import { ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const statusColors = {
	OPEN: 'bg-sky-100 text-sky-700',
	IN_PROGRESS: 'bg-amber-100 text-amber-700',
	DONE: 'bg-emerald-100 text-emerald-700',
	CANCELLED: 'bg-[#ede3d4] text-[#b09880]',
}

const statusLabels = {
	OPEN: 'Offen',
	IN_PROGRESS: 'In Bearbeitung',
	DONE: 'Abgeschlossen',
	CANCELLED: 'Abgebrochen',
}

export function StatusBadge({ status }: { status: keyof typeof statusColors }) {
	return (
		<span className={cn('badge', statusColors[status])}>
			{statusLabels[status]}
		</span>
	)
}

// ─── CATEGORY BADGE ──────────────────────────────────────────────────────────

export function CategoryBadge({
	category,
	size,
}: {
	category: string
	size?: string
}) {
	const meta = CATEGORIES.find(c => c.value === category)
	if (!meta) return null
	const sizeClass = size === 'xs' ? 'text-[11px]' : 'text-xs'
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 font-semibold leading-none',
				meta.color,
				sizeClass,
				'opacity-90',
			)}
		>
			<Icon icon={meta.icon} className='w-3.5 h-3.5 shrink-0 opacity-90' />
			{meta.label}
		</span>
	)
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

export function StatCard({
	label,
	value,
	icon,
	color = 'text-[#8b5e3c]',
	bg = 'bg-[#e8d5be]',
	trend,
	highlight,
}: {
	label: string
	value: string | number
	icon: React.ReactNode
	color?: string
	bg?: string
	trend?: string
	highlight?: boolean
}) {
	return (
		<div
			className={cn(
				'card p-5 flex items-center gap-4',
				highlight && 'border-[#c8956c] shadow-md',
			)}
		>
			<div
				className={cn(
					'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
					bg,
					color,
				)}
			>
				{icon}
			</div>
			<div className='min-w-0'>
				<p className='text-sm text-[#7a6050] font-medium'>{label}</p>
				<p className='text-2xl font-bold text-[#3d2b1f] leading-tight'>
					{value}
				</p>
				{trend && (
					<p className='text-xs text-emerald-600 font-medium mt-0.5'>{trend}</p>
				)}
			</div>
		</div>
	)
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

export function EmptyState({
	icon,
	title,
	description,
	action,
}: {
	icon: React.ReactNode
	title: string
	description?: string
	action?: React.ReactNode
}) {
	return (
		<div className='flex flex-col items-center justify-center py-16 text-center px-4'>
			<div className='text-5xl mb-4'>{icon}</div>
			<h3 className='text-lg font-semibold text-[#3d2b1f] mb-1'>{title}</h3>
			{description && (
				<p className='text-[#b09880] text-sm max-w-xs mb-6'>{description}</p>
			)}
			{action}
		</div>
	)
}

// ─── STAR RATING DISPLAY ─────────────────────────────────────────────────────

export function StarRating({
	rating,
	value,
	count,
	size,
}: {
	rating?: number
	value?: number
	count?: number
	size?: string
}) {
	const score = rating ?? value ?? 0
	return (
		<div className='flex items-center gap-1'>
			{[1, 2, 3, 4, 5].map(star => (
				<Star
					key={star}
					size={size === 'sm' ? 11 : 13}
					className={
						star <= Math.round(score)
							? 'text-amber-500 fill-amber-500'
							: 'text-[#ddd0be] fill-[#ddd0be]'
					}
				/>
			))}
			<span className='text-xs text-[#7a6050] ml-0.5 font-medium'>
				{score.toFixed(1)}
				{count !== undefined && (
					<span className='text-[#b09880]'> ({count})</span>
				)}
			</span>
		</div>
	)
}

// ─── SEE ALL LINK ─────────────────────────────────────────────────────────────

export function SeeAllLink({
	href,
	label = 'Alle anzeigen',
}: {
	href: string
	label?: string
}) {
	return (
		<Link
			href={href}
			className='flex items-center gap-1 text-sm text-[#8b5e3c] font-semibold hover:text-[#6b4226] transition-colors'
		>
			{label}
			<ChevronRight size={15} />
		</Link>
	)
}
