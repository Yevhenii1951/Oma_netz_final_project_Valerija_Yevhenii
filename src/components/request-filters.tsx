'use client'

import { cn } from '@/lib/utils'
import type { CategoryMeta } from '@/types'
import { Icon } from '@iconify/react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
	categories: CategoryMeta[]
	currentCategory?: string
	currentStatus: string
}

export function RequestFilters({
	categories,
	currentCategory,
	currentStatus,
}: Props) {
	const router = useRouter()
	const searchParams = useSearchParams()

	function updateFilter(key: string, value: string | null) {
		const params = new URLSearchParams(searchParams.toString())
		if (value === null || value === '') {
			params.delete(key)
		} else {
			params.set(key, value)
		}
		router.push(`/requests?${params.toString()}`)
	}

	const statusOptions = [
		{ value: 'OPEN', label: 'Offen' },
		{ value: 'IN_PROGRESS', label: 'In Bearbeitung' },
		{ value: 'DONE', label: 'Erledigt' },
		{ value: 'ALL', label: 'Alle' },
	]

	return (
		<div className='space-y-3'>
			{/* Status filter */}
			<div className='flex gap-2 overflow-x-auto pb-1 scrollbar-none'>
				{statusOptions.map(({ value, label }) => (
					<button
						key={value}
						onClick={() => updateFilter('status', value)}
						className={cn(
							'shrink-0 text-sm font-medium rounded-full px-4 py-1.5 border transition-all',
							currentStatus === value
								? 'bg-[#8b5e3c] text-[#ffffff] border-[#8b5e3c]'
								: 'bg-[#ffffff] text-[#7a6050] border-[#ddd0be] hover:border-[#c8956c]',
						)}
					>
						{label}
					</button>
				))}
			</div>

			{/* Category filter */}
			<div className='flex gap-2 overflow-x-auto pb-1 scrollbar-none'>
				<button
					onClick={() => updateFilter('category', null)}
					className={cn(
						'shrink-0 text-sm font-medium rounded-full px-4 py-1.5 border transition-all',
						!currentCategory
							? 'bg-[#3d2b1f] text-[#ffffff] border-stone-900'
							: 'bg-[#ffffff] text-[#7a6050] border-[#ddd0be] hover:border-[#c8956c]',
					)}
				>
					Alle Kategorien
				</button>
				{categories.map(({ value, label, icon }) => (
					<button
						key={value}
						onClick={() =>
							updateFilter('category', currentCategory === value ? null : value)
						}
						className={cn(
							'shrink-0 flex items-center gap-1.5 text-sm font-medium rounded-full px-4 py-1.5 border transition-all',
							currentCategory === value
								? 'bg-[#3d2b1f] text-[#ffffff] border-stone-900'
								: 'bg-[#ffffff] text-[#7a6050] border-[#ddd0be] hover:border-[#c8956c]',
						)}
					>
						<Icon icon={icon} className='w-4 h-4 shrink-0' />
						{label}
					</button>
				))}
			</div>
		</div>
	)
}
