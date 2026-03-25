'use client'

import { PageShell } from '@/components/shell'
import { useToast } from '@/components/ui/toaster'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Notification {
	id: string
	title: string
	body: string
	link: string | null
	read: boolean
	createdAt: string
}

export default function NotificationsPage() {
	const router = useRouter()
	const { toast } = useToast()
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [loading, setLoading] = useState(true)
	const [marking, setMarking] = useState(false)

	const fetchNotifications = useCallback(async () => {
		try {
			const res = await fetch('/api/notifications')
			const data = await res.json()
			if (res.ok) setNotifications(data.data ?? [])
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchNotifications()
	}, [fetchNotifications])

	async function markAllRead() {
		setMarking(true)
		try {
			const res = await fetch('/api/notifications', { method: 'PATCH' })
			if (res.ok) {
				setNotifications(prev => prev.map(n => ({ ...n, read: true })))
				toast({ title: '✅ Alle als gelesen markiert', variant: 'success' })
			}
		} catch {
			toast({
				title: 'Fehler',
				description: 'Bitte erneut versuchen.',
				variant: 'error',
			})
		} finally {
			setMarking(false)
		}
	}

	const unreadCount = notifications.filter(n => !n.read).length

	return (
		<PageShell title='Benachrichtigungen' hideSidebar>
			<div className='max-w-2xl mx-auto px-4 py-8'>
				{/* Header */}
				<div className='flex items-center justify-between mb-6'>
					<div>
						<h1 className='text-2xl font-bold text-[#3d2b1f]'>
							Benachrichtigungen
						</h1>
						{unreadCount > 0 && (
							<p className='text-sm text-[#7a6050] mt-0.5'>
								{unreadCount} ungelesen
							</p>
						)}
					</div>
					{unreadCount > 0 && (
						<button
							onClick={markAllRead}
							disabled={marking}
							className='flex items-center gap-1.5 text-sm font-medium text-[#8b5e3c] hover:text-[#6b4226] transition-colors disabled:opacity-50'
						>
							{marking ? (
								<Loader2 size={15} className='animate-spin' />
							) : (
								<CheckCheck size={15} />
							)}
							Alle gelesen
						</button>
					)}
				</div>

				{/* Loading */}
				{loading && (
					<div className='flex items-center justify-center py-16'>
						<Loader2 className='w-6 h-6 animate-spin text-[#8b5e3c]' />
					</div>
				)}

				{/* Empty state */}
				{!loading && notifications.length === 0 && (
					<div className='flex flex-col items-center py-20 text-center'>
						<Bell className='w-12 h-12 text-[#b09880] mb-4' />
						<h3 className='text-lg font-semibold text-[#3d2b1f] mb-1'>
							Keine Benachrichtigungen
						</h3>
						<p className='text-sm text-[#b09880]'>
							Neue Aktivitäten erscheinen hier.
						</p>
					</div>
				)}

				{/* List */}
				{!loading && notifications.length > 0 && (
					<div className='space-y-2'>
						{notifications.map(n => (
							<div
								key={n.id}
								onClick={() => n.link && router.push(n.link)}
								className={`card p-4 flex items-start gap-3 transition-all ${
									n.link ? 'cursor-pointer hover:shadow-md' : ''
								} ${!n.read ? 'border-l-4 border-l-[#8b5e3c] bg-[#ffffff]' : 'opacity-75'}`}
							>
								<div
									className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${
										!n.read ? 'bg-[#8b5e3c]' : 'bg-[#ddd0be]'
									}`}
								/>
								<div className='flex-1 min-w-0'>
									<p className='font-semibold text-[#3d2b1f] text-sm'>
										{n.title}
									</p>
									<p className='text-sm text-[#7a6050] mt-0.5'>{n.body}</p>
									<p className='text-xs text-[#b09880] mt-1'>
										{new Date(n.createdAt).toLocaleString('de-DE', {
											day: '2-digit',
											month: '2-digit',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</PageShell>
	)
}
