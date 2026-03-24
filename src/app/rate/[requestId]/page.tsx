'use client'

import { PageShell } from '@/components/shell'
import { useToast } from '@/components/ui/toaster'
import { motion } from 'framer-motion'
import { Loader2, Star } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RatePage() {
	const router = useRouter()
	const { requestId } = useParams<{ requestId: string }>()
	const { toast } = useToast()
	const [stars, setStars] = useState(0)
	const [hover, setHover] = useState(0)
	const [comment, setComment] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')

	async function submit() {
		if (stars === 0) {
			setError('Bitte wählen Sie eine Bewertung.')
			return
		}
		setIsLoading(true)
		setError('')
		try {
			const res = await fetch('/api/ratings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ requestId, score: stars, comment }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Fehler')
			toast({ title: '⭐ Bewertung abgeschickt! Danke!', variant: 'success' })
			router.push('/dashboard?rated=1')
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err))
			setIsLoading(false)
		}
	}

	return (
		<PageShell title='Bewertung'>
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				className='max-w-md mx-auto text-center'
			>
				<div className='text-6xl mb-4'>🌟</div>
				<h2 className='text-2xl font-bold text-[#3d2b1f] mb-2'>
					Wie war die Hilfe?
				</h2>
				<p className='text-[#7a6050] text-sm mb-8'>
					Ihre Bewertung hilft anderen, die richtigen Freiwilligen zu finden.
				</p>

				{/* Stars */}
				<div className='flex justify-center gap-3 mb-8'>
					{[1, 2, 3, 4, 5].map(s => (
						<button
							key={s}
							onClick={() => setStars(s)}
							onMouseEnter={() => setHover(s)}
							onMouseLeave={() => setHover(0)}
							className='transition-transform hover:scale-110 active:scale-95'
						>
							<Star
								className={`w-12 h-12 transition-colors ${
									s <= (hover || stars)
										? 'text-amber-500 fill-amber-500'
										: 'text-[#ddd0be] fill-[#ddd0be]'
								}`}
							/>
						</button>
					))}
				</div>

				<div className='mb-2'>
					<p className='text-sm font-semibold text-[#7a6050] mb-1.5 text-left'>
						Kommentar{' '}
						<span className='font-normal text-[#b09880]'>(optional)</span>
					</p>
					<textarea
						className='input-field resize-none text-left'
						rows={3}
						placeholder='Erzählen Sie, wie die Hilfe war…'
						value={comment}
						onChange={e => setComment(e.target.value)}
					/>
				</div>

				{error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

				<button
					onClick={submit}
					disabled={isLoading || stars === 0}
					className='btn-primary w-full py-3 mt-2'
				>
					{isLoading ? (
						<Loader2 className='inline w-4 h-4 mr-2 animate-spin' />
					) : null}
					Bewertung abschicken
				</button>

				<button
					onClick={() => router.push('/dashboard')}
					className='mt-3 text-sm text-[#b09880] hover:text-[#7a6050] transition'
				>
					Überspringen
				</button>
			</motion.div>
		</PageShell>
	)
}
