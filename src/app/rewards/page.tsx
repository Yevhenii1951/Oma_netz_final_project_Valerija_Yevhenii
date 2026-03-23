import { auth } from '@/auth'
import { PageShell, StatCard } from '@/components/shell'
import { prisma } from '@/lib/prisma'
import { Award, Star } from 'lucide-react'
import { redirect } from 'next/navigation'
import RewardsList from './rewards-list'

export default async function RewardsPage() {
	const session = await auth()
	if (!session) redirect('/login')

	const [user, rewards] = await Promise.all([
		prisma.user.findUnique({
			where: { id: session.user.id },
			select: { points: true, helpCount: true },
		}),
		prisma.reward.findMany({
			where: { isActive: true },
			orderBy: { pointsCost: 'asc' },
		}),
	])

	const myRedemptions = await prisma.redemption.findMany({
		where: { userId: session.user.id },
		include: { reward: true },
		orderBy: { createdAt: 'desc' },
		take: 5,
	})

	return (
		<PageShell title='Belohnungen'>
			<div className='max-w-2xl mx-auto space-y-6'>
				{/* Stats row */}
				<div className='grid grid-cols-2 gap-3'>
					<StatCard
						label='Meine Punkte'
						value={String(user?.points ?? 0)}
						icon={<Star className='w-5 h-5 text-[#8b5e3c]' />}
						highlight
					/>
					<StatCard
						label='Geholfen'
						value={String(user?.helpCount ?? 0)}
						icon={<Award className='w-5 h-5 text-emerald-500' />}
					/>
				</div>

				<p className='text-[#7a6050] text-sm'>
					Für jede geleistete Hilfe erhalten Sie{' '}
					<strong className='text-[#8b5e3c]'>10 Punkte</strong>. Lösen Sie
					diese gegen echte Belohnungen ein!
				</p>

				{/* Rewards grid */}
				<RewardsList
					rewards={JSON.parse(JSON.stringify(rewards))}
					userPoints={user?.points ?? 0}
					redemptions={JSON.parse(JSON.stringify(myRedemptions))}
				/>
			</div>
		</PageShell>
	)
}
