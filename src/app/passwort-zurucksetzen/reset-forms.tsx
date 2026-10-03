'use client'

import Link from 'next/link'
import { useState } from 'react'

/**
 * The two halves of the reset flow, both client components because both
 * submit over fetch. Which one shows is decided by the server component in
 * page.tsx — reading the query with useSearchParams() would need a Suspense
 * boundary, and that boundary makes the form flicker while it settles.
 */

export function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[#f5ede0] flex items-center justify-center p-4'>
			<div className='w-full max-w-sm'>
				<div className='text-center mb-8'>
					<h1 className='text-2xl font-bold text-[#3d2b1f]'>
						Passwort zurücksetzen
					</h1>
					<p className='text-[#7a6050] text-sm mt-1'>OMA-NETZ Kassel</p>
				</div>
				<div className='card p-6'>{children}</div>
			</div>
		</div>
	)
}

export function RequestLink() {
	const [email, setEmail] = useState('')
	const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
	const [message, setMessage] = useState('')

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setState('sending')
		setMessage('')
		try {
			const res = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			})
			const payload = (await res.json().catch(() => null)) as {
				message?: string
				error?: string
			} | null
			if (res.ok) {
				setState('sent')
			}
			// The same sentence for a registered and an unregistered address —
			// that is the point of the route, so it must not depend on res.ok.
			setMessage(payload?.message ?? 'Bitte später erneut versuchen.')
		} catch {
			setState('idle')
			setMessage('Bitte später erneut versuchen.')
		}
	}

	return (
		<Shell>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<p className='text-sm text-[#7a6050]'>
					Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du
					ein neues Passwort vergeben kannst.
				</p>

				{message && (
					<div
						role='status'
						className={
							state === 'sent'
								? 'bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm'
								: 'bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm'
						}
					>
						{message}
					</div>
				)}

				<div>
					<label
						htmlFor='email'
						className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'
					>
						E-Mail-Adresse
					</label>
					<input
						id='email'
						type='email'
						value={email}
						onChange={e => setEmail(e.target.value)}
						className='input-field'
						placeholder='max@example.de'
						required
						autoComplete='email'
					/>
				</div>

				<button
					type='submit'
					disabled={state === 'sending'}
					className='btn-primary w-full disabled:opacity-50'
				>
					{state === 'sending' ? 'Wird gesendet …' : 'Link anfordern'}
				</button>

				<Link
					href='/login'
					className='block text-center text-xs text-[#8b5e3c] hover:text-[#6b4226] font-medium'
				>
					Zurück zur Anmeldung
				</Link>
			</form>
		</Shell>
	)
}

export function SetPassword({ token }: { token: string }) {
	const [password, setPassword] = useState('')
	const [repeat, setRepeat] = useState('')
	const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
	const [message, setMessage] = useState('')
	const [mismatch, setMismatch] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (password !== repeat) {
			setMismatch(true)
			return
		}
		setMismatch(false)
		setState('sending')
		setMessage('')
		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, password }),
			})
			const payload = (await res.json().catch(() => null)) as {
				message?: string
				error?: string
			} | null
			if (res.ok) {
				setState('done')
				setMessage(payload?.message ?? 'Dein Passwort wurde geändert.')
			} else {
				setState('idle')
				setMessage(payload?.error ?? 'Bitte später erneut versuchen.')
			}
		} catch {
			setState('idle')
			setMessage('Bitte später erneut versuchen.')
		}
	}

	if (state === 'done') {
		return (
			<Shell>
				<div className='bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm'>
					{message}
				</div>
				<Link href='/login' className='btn-primary block text-center mt-4'>
					Zur Anmeldung
				</Link>
			</Shell>
		)
	}

	return (
		<Shell>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<p className='text-sm text-[#7a6050]'>Vergib ein neues Passwort.</p>

				{message && (
					<div
						role='alert'
						className='bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm'
					>
						{message}
					</div>
				)}

				<div>
					<label
						htmlFor='passwort'
						className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'
					>
						Neues Passwort
					</label>
					<input
						id='passwort'
						type='password'
						value={password}
						onChange={e => setPassword(e.target.value)}
						className='input-field'
						placeholder='••••••••'
						required
						minLength={8}
						autoComplete='new-password'
					/>
				</div>

				<div>
					<label
						htmlFor='passwort-wiederholen'
						className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'
					>
						Passwort wiederholen
					</label>
					<input
						id='passwort-wiederholen'
						type='password'
						value={repeat}
						onChange={e => setRepeat(e.target.value)}
						className='input-field'
						placeholder='••••••••'
						required
						minLength={8}
						autoComplete='new-password'
					/>
					{mismatch && (
						<p className='mt-1.5 text-sm text-red-700'>
							Die beiden Passwörter stimmen nicht überein.
						</p>
					)}
				</div>

				<button
					type='submit'
					disabled={state === 'sending'}
					className='btn-primary w-full disabled:opacity-50'
				>
					{state === 'sending' ? 'Wird gespeichert …' : 'Passwort speichern'}
				</button>
			</form>
		</Shell>
	)
}