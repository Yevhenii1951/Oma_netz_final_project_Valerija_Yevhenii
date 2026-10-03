import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminPaginationProps {
	total: number
	pageSize: number
	page: number
	totalPages: number
	onPrev: () => void
	onNext: () => void
}

export function AdminPagination({
	total,
	pageSize,
	page,
	totalPages,
	onPrev,
	onNext,
}: AdminPaginationProps) {
	return (
		<div className='p-4 border-t border-[#f0e8dc] flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between'>
			<p className='text-xs text-[#7a6050]'>
				Zeige {total === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
				{Math.min(page * pageSize, total)} von {total}
			</p>
			<div className='flex items-center gap-1.5'>
				<button
					onClick={onPrev}
					disabled={page <= 1}
					className='h-8 px-2.5 rounded-lg border border-[#ddd0be] text-[#7a6050] bg-white hover:bg-[#f5ede0] disabled:opacity-50 inline-flex items-center gap-1 text-xs'
				>
					<ChevronLeft className='w-3.5 h-3.5' /> Zurueck
				</button>
				<span className='text-xs px-2 text-[#7a6050]'>
					Seite {page} / {totalPages}
				</span>
				<button
					onClick={onNext}
					disabled={page >= totalPages}
					className='h-8 px-2.5 rounded-lg border border-[#ddd0be] text-[#7a6050] bg-white hover:bg-[#f5ede0] disabled:opacity-50 inline-flex items-center gap-1 text-xs'
				>
					Weiter <ChevronRight className='w-3.5 h-3.5' />
				</button>
			</div>
		</div>
	)
}
