'use client'

import { useToast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import type { Reward } from '@/types'
import { motion } from 'framer-motion'
import { CheckCircle2, Gift, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
	rewards: Reward[]
	userPoints: number
	redemptions: { rewardId: string }[]
}

export default function RewardsList({
	rewards,
	userPoints,
	redemptions,
}: Props) {
	const router = useRouter()
	const { toast } = useToast()
	const [loading, setLoading] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [error, setError] = useState('')

	async function redeem(rewardId: string) {
		setLoading(rewardId)
		setError('')
		try {
			const res = await fetch('/api/rewards', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rewardId }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Fehler beim Einlösen')
			setSuccess(rewardId)
			toast({ title: '🎁 Belohnung eingelöst!', variant: 'success' })
			router.refresh()
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err)
			setError(msg)
			toast({
				title: 'Fehler beim Einlösen',
				description: msg,
				variant: 'error',
			})
		} finally {
			setLoading(null)
		}
	}

	if (rewards.length === 0) {
		return (
			<div className='text-center py-10 text-[#b09880]'>
				<Gift className='w-10 h-10 mx-auto mb-3 opacity-40' />
				<p>Noch keine Belohnungen verfügbar</p>
			</div>
		)
	}

	return (
		<div>
			{error && (
				<div className='bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-100 mb-4'>
					{error}
				</div>
			)}
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
				{rewards.map((reward, i) => {
					const canAfford = userPoints >= reward.pointsCost
					const alreadyRedeemed = redemptions.some(
						(r: { rewardId: string }) => r.rewardId === reward.id,
					)
					const isSuccess = success === reward.id

					return (
						<motion.div
							key={reward.id}
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.05 }}
							className={cn(
								'card p-4 flex flex-col gap-3',
								!canAfford && 'opacity-60',
							)}
						>
							<div className='flex items-start justify-between gap-2'>
								<div className='flex-1'>
									<p className='font-semibold text-[#3d2b1f]'>{reward.title}</p>
									{reward.description && (
										<p className='text-xs text-[#7a6050] mt-0.5'>
											{reward.description}
										</p>
									)}
								</div>
								<span className='shrink-0 text-sm font-bold text-[#8b5e3c] bg-[#f5ede0] px-2.5 py-1 rounded-full'>
									{reward.pointsCost} Pkt.
								</span>
							</div>

							{isSuccess || alreadyRedeemed ? (
								<div className='flex items-center gap-2 text-emerald-600 text-sm font-medium'>
									<CheckCircle2 className='w-4 h-4' />
									{alreadyRedeemed
										? 'Bereits eingelöst'
										: 'Erfolgreich eingelöst!'}
								</div>
							) : (
								<button
									onClick={() => redeem(reward.id)}
									disabled={!canAfford || loading === reward.id}
									className={cn(
										'w-full py-2 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2',
										canAfford
											? 'bg-[#8b5e3c] text-[#ffffff] hover:bg-[#6b4226]'
											: 'bg-[#ede3d4] text-[#b09880] cursor-not-allowed',
									)}
								>
									{loading === reward.id ? (
										<Loader2 className='w-4 h-4 animate-spin' />
									) : (
										<Gift className='w-4 h-4' />
									)}
									{canAfford
										? 'Einlösen'
										: `Noch ${reward.pointsCost - userPoints} Punkte fehlen`}
								</button>
							)}
						</motion.div>
					)
				})}
			</div>
		</div>
	)
}
