'use client'

import {
	ArrowRight,
	Bell,
	Frown,
	Mail,
	PartyPopper,
	type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Alert {
	id: string
	title: string
	body: string
	link: string | null
}

export function AlertBanners({ alerts }: { alerts: Alert[] }) {
	const router = useRouter()
	const [dismissed, setDismissed] = useState<Set<string>>(new Set())

	useEffect(() => {
		const approvalAlerts = alerts.filter(a =>
			a.title.toLowerCase().includes('profil freigegeben'),
		)
		for (const alert of approvalAlerts) {
			void fetch(`/api/notifications/${alert.id}`, { method: 'PATCH' }).catch(
				() => null,
			)
		}
	}, [alerts])

	async function handleClick(alert: Alert) {
		// Mark as read
		fetch(`/api/notifications/${alert.id}`, { method: 'PATCH' }).catch(
			() => null,
		)
		setDismissed(prev => new Set(prev).add(alert.id))
		router.push(alert.link ?? '/notifications')
	}

	const visible = alerts.filter(a => !dismissed.has(a.id))
	if (visible.length === 0) return null

	return (
		<div className='space-y-2 mb-6'>
			{visible.map(alert => {
				const isAccepted =
					alert.title.includes('✅') || alert.title.includes('🎉')
				const isDeclined = alert.title.includes('😔')
				const isNewOffer =
					alert.title.includes('🙋') || alert.title.includes('🤝')

				const bgColor = isAccepted
					? 'bg-emerald-50 border-emerald-200'
					: isDeclined
						? 'bg-red-50 border-red-100'
						: isNewOffer
							? 'bg-blue-50 border-blue-200'
							: 'bg-amber-50 border-amber-200'

				const notifIcon = isAccepted
					? PartyPopper
					: isDeclined
						? Frown
						: isNewOffer
							? Mail
							: Bell
				const NotificationIcon: LucideIcon = notifIcon

				return (
					<button
						key={alert.id}
						onClick={() => handleClick(alert)}
						className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border ${bgColor} transition-all hover:shadow-md hover:scale-[1.01] animate-[slideIn_0.4s_ease-out]`}
					>
						<NotificationIcon className='w-6 h-6 shrink-0 animate-bounce' />
						<div className='flex-1 min-w-0'>
							<p className='font-semibold text-sm text-[#3d2b1f]'>
								{alert.title}
							</p>
							<p className='text-xs text-[#7a6050] mt-0.5'>{alert.body}</p>
						</div>
						<ArrowRight size={16} className='shrink-0 text-[#b09880] mt-1' />
					</button>
				)
			})}
		</div>
	)
}
