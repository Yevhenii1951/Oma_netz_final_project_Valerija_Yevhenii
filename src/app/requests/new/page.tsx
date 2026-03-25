'use client'

import { PageShell } from '@/components/shell'
import { useToast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/types'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { AlignLeft, Clock, FileText, Loader2, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const TIME_OPTIONS = [
	'Flexibel (jederzeit)',
	'Morgen früh',
	'Heute Nachmittag',
	'Heute Abend',
	'Diese Woche',
	'Nächste Woche',
]

export default function NewRequestPage() {
	const router = useRouter()
	const { toast } = useToast()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [form, setForm] = useState({
		title: '',
		description: '',
		category: '',
		address: '',
		plz: '',
		desiredTime: 'Flexibel (jederzeit)',
	})

	function set(key: string, value: string) {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!form.category) {
			setError('Bitte wählen Sie eine Kategorie.')
			return
		}
		setIsSubmitting(true)
		setError('')

		try {
			const res = await fetch('/api/requests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form),
			})
			const json = await res.json()
			if (!res.ok) throw new Error(json.error || 'Fehler beim Erstellen')
			const created = json.data ?? json
			toast({ title: '📝 Anfrage erstellt!', variant: 'success' })
			router.push(`/requests/${created.id}`)
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten',
			)
			setIsSubmitting(false)
		}
	}

	return (
		<PageShell title='Hilfe anfragen'>
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				className='max-w-xl mx-auto'
			>
				<p className='text-[#7a6050] mb-6 text-sm'>
					Beschreiben Sie, wobei Sie Hilfe benötigen. Freiwillige in Ihrer Nähe
					werden benachrichtigt.
				</p>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label className='block text-sm font-semibold text-[#3d2b1f] mb-3'>
							Kategorie <span className='text-[#8b5e3c]'>*</span>
						</label>
						<div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
							{CATEGORIES.map(cat => (
								<button
									key={cat.value}
									type='button'
									onClick={() => set('category', cat.value)}
									className={cn(
										'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center',
										form.category === cat.value
											? 'border-[#8b5e3c] bg-[#f5ede0]'
											: 'border-[#ddd0be] bg-[#ffffff] hover:border-[#c8956c]',
									)}
								>
									<Icon icon={cat.icon} className='w-7 h-7' />
									<span className='text-xs font-medium text-[#3d2b1f] leading-tight'>
										{cat.label}
									</span>
								</button>
							))}
						</div>
					</div>

					<div>
						<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
							<FileText className='inline w-4 h-4 mr-1 text-[#b09880]' />
							Kurze Beschreibung <span className='text-[#8b5e3c]'>*</span>
						</label>
						<input
							type='text'
							className='input-field'
							placeholder='z.B. Begleitung zum Arzt am Dienstag'
							value={form.title}
							onChange={e => set('title', e.target.value)}
							required
							maxLength={120}
						/>
					</div>

					<div>
						<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
							<AlignLeft className='inline w-4 h-4 mr-1 text-[#b09880]' />
							Detaillierte Beschreibung
						</label>
						<textarea
							className='input-field resize-none'
							rows={3}
							placeholder='Weitere Details (optional)'
							value={form.description}
							onChange={e => set('description', e.target.value)}
							maxLength={500}
						/>
					</div>

					<div className='grid grid-cols-[1fr_auto] gap-3'>
						<div>
							<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
								<MapPin className='inline w-4 h-4 mr-1 text-[#b09880]' />
								Straße &amp; Hausnummer
							</label>
							<input
								type='text'
								className='input-field'
								placeholder='Königsplatz 1'
								value={form.address}
								onChange={e => set('address', e.target.value)}
							/>
						</div>
						<div>
							<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
								PLZ
							</label>
							<input
								type='text'
								className='input-field w-24'
								placeholder='34117'
								value={form.plz}
								onChange={e => set('plz', e.target.value)}
								maxLength={5}
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
							<Clock className='inline w-4 h-4 mr-1 text-[#b09880]' />
							Wunschzeit
						</label>
						<div className='flex flex-wrap gap-2'>
							{TIME_OPTIONS.map(t => (
								<button
									key={t}
									type='button'
									onClick={() => set('desiredTime', t)}
									className={cn(
										'text-sm rounded-full px-4 py-1.5 border transition-all',
										form.desiredTime === t
											? 'bg-[#8b5e3c] text-[#ffffff] border-[#8b5e3c]'
											: 'bg-[#ffffff] text-[#7a6050] border-[#ddd0be] hover:border-[#c8956c]',
									)}
								>
									{t}
								</button>
							))}
						</div>
					</div>

					{error && (
						<div className='bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-100'>
							{error}
						</div>
					)}

					<button
						type='submit'
						disabled={isSubmitting || !form.title}
						className='btn-primary w-full py-3 text-base'
					>
						{isSubmitting ? (
							<>
								<Loader2 className='inline w-4 h-4 mr-2 animate-spin' />
								Wird gesendet…
							</>
						) : (
							'Hilfe anfragen ✓'
						)}
					</button>
				</form>
			</motion.div>
		</PageShell>
	)
}
