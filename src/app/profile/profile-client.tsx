'use client'

import { Avatar, PageShell, StarRating } from '@/components/shell'
import { useToast } from '@/components/ui/toaster'
import { ROLE_LABELS } from '@/types'
import { motion } from 'framer-motion'
import { FileText, Loader2, MapPin, Phone, Save, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
	user: {
		id: string
		name: string | null
		email: string
		phone: string | null
		bio: string | null
		address: string | null
		plz: string | null
		image: string | null
		role: string
		points: number
		helpCount: number
		ratingAvg: number
	}
}

export default function ProfileClient({ user }: Props) {
	const router = useRouter()
	const { toast } = useToast()
	const [form, setForm] = useState({
		name: user.name || '',
		phone: user.phone || '',
		bio: user.bio || '',
		address: user.address || '',
		plz: user.plz || '',
	})
	const [isSaving, setIsSaving] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState('')

	function set(key: string, value: string) {
		setForm(prev => ({ ...prev, [key]: value }))
		setSuccess(false)
	}

	async function save() {
		setIsSaving(true)
		setError('')
		try {
			const res = await fetch('/api/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Fehler beim Speichern')
			setSuccess(true)
			toast({ title: '✅ Profil gespeichert', variant: 'success' })
			router.refresh()
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Fehler beim Speichern'
			setError(msg)
			toast({ title: 'Fehler', description: msg, variant: 'error' })
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<PageShell title='Mein Profil'>
			<div className='max-w-xl mx-auto space-y-6'>
				{/* Avatar + stats */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					className='card p-5 flex items-center gap-4'
				>
					<Avatar name={form.name} size='lg' />
					<div>
						<p className='font-semibold text-[#3d2b1f] text-lg'>
							{form.name || user.email}
						</p>
						<p className='text-sm text-[#7a6050]'>
							{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
						</p>
						<div className='flex items-center gap-3 mt-1 text-sm'>
							{user.ratingAvg > 0 && (
								<StarRating value={Math.round(user.ratingAvg)} size='sm' />
							)}
							<span className='text-[#b09880]'>{user.helpCount}× geholfen</span>
							<span className='text-[#8b5e3c] font-medium'>
								{user.points} Pkt.
							</span>
						</div>
					</div>
				</motion.div>

				{/* Form */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.05 }}
					className='card p-5 space-y-4'
				>
					<div>
						<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
							<User className='inline w-4 h-4 mr-1 text-[#b09880]' />
							Name
						</label>
						<input
							type='text'
							className='input-field'
							value={form.name}
							onChange={e => set('name', e.target.value)}
						/>
					</div>

					<div>
						<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
							<Phone className='inline w-4 h-4 mr-1 text-[#b09880]' />
							Telefon
						</label>
						<input
							type='tel'
							className='input-field'
							placeholder='+49 561 …'
							value={form.phone}
							onChange={e => set('phone', e.target.value)}
						/>
					</div>

					<div>
						<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
							<FileText className='inline w-4 h-4 mr-1 text-[#b09880]' />
							Über mich
						</label>
						<textarea
							className='input-field resize-none'
							rows={3}
							placeholder='Kurze Vorstellung…'
							value={form.bio}
							onChange={e => set('bio', e.target.value)}
						/>
					</div>

					<div className='grid grid-cols-[1fr_auto] gap-3'>
						<div>
							<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
								<MapPin className='inline w-4 h-4 mr-1 text-[#b09880]' />
								Adresse
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
								maxLength={5}
								value={form.plz}
								onChange={e => set('plz', e.target.value)}
							/>
						</div>
					</div>
				</motion.div>

				{error && (
					<div className='bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-100'>
						{error}
					</div>
				)}
				{success && (
					<div className='bg-emerald-50 text-emerald-600 text-sm rounded-xl p-3 border border-emerald-100'>
						Profil gespeichert ✓
					</div>
				)}

				<button
					onClick={save}
					disabled={isSaving}
					className='btn-primary w-full py-3 flex items-center justify-center gap-2'
				>
					{isSaving ? (
						<Loader2 className='w-4 h-4 animate-spin' />
					) : (
						<Save className='w-4 h-4' />
					)}
					Speichern
				</button>
			</div>
		</PageShell>
	)
}
