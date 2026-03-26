'use client'

import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function LoginForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPw, setShowPw] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError('')

		const result = await signIn('credentials', {
			email,
			password,
			redirect: false,
		})

		setLoading(false)

		if (result?.error) {
			setError('E-Mail oder Passwort ist falsch.')
		} else {
			router.push(callbackUrl)
			router.refresh()
		}
	}

	return (
		<div className='min-h-screen bg-[#f5ede0] flex items-center justify-center p-4'>
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: 'easeOut' }}
				className='w-full max-w-sm'
			>
				{/* Logo */}
				<div className='text-center mb-8'>
					<Link
						href='/'
						className='inline-flex items-center gap-2 justify-center mb-2'
					>
						<div className='w-11 h-11 rounded-2xl bg-[#8b5e3c] flex items-center justify-center shadow-md shadow-[#e8d5be]'>
							<span className='text-[#ffffff] font-bold text-xl'>O</span>
						</div>
					</Link>
					<h1 className='text-2xl font-bold text-[#3d2b1f] mt-3'>
						Willkommen zurück
					</h1>
					<p className='text-[#7a6050] text-sm mt-1'>
						Melde dich bei OMA-NETZ an
					</p>
				</div>

				{/* Card */}
				<div className='card p-6'>
					<form onSubmit={handleSubmit} className='space-y-4'>
						{/* Error message */}
						{error && (
							<div className='bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm'>
								{error}
							</div>
						)}

						{/* Email */}
						<div>
							<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
								E-Mail-Adresse
							</label>
							<input
								type='email'
								value={email}
								onChange={e => setEmail(e.target.value)}
								className='input-field'
								placeholder='max@example.de'
								required
								autoComplete='email'
							/>
						</div>

						{/* Password */}
						<div>
							<div className='flex items-center justify-between mb-1.5'>
								<label className='block text-sm font-semibold text-[#3d2b1f]'>
									Passwort
								</label>
								<Link
									href='/login'
									className='text-xs text-[#8b5e3c] hover:text-[#6b4226] font-medium'
									tabIndex={-1}
								>
									Passwort vergessen?
								</Link>
							</div>
							<div className='relative'>
								<input
									type={showPw ? 'text' : 'password'}
									value={password}
									onChange={e => setPassword(e.target.value)}
									className='input-field pr-12'
									placeholder='••••••••'
									required
									autoComplete='current-password'
								/>
								<button
									type='button'
									onClick={() => setShowPw(!showPw)}
									aria-label={
										showPw ? 'Passwort verbergen' : 'Passwort anzeigen'
									}
									className='absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#7a6652] hover:text-[#3d2b1f] rounded-lg transition-colors'
								>
									{showPw ? <EyeOff size={17} /> : <Eye size={17} />}
								</button>
							</div>
						</div>

						{/* Submit */}
						<button
							type='submit'
							disabled={loading}
							className='btn-primary w-full justify-center py-3 mt-2 disabled:opacity-70 disabled:cursor-not-allowed'
						>
							{loading ? (
								<>
									<Loader2 size={17} className='animate-spin' />
									Anmelden...
								</>
							) : (
								'Anmelden'
							)}
						</button>
					</form>

					<div className='mt-6 pt-5 border-t border-[#ddd0be] text-center'>
						<p className='text-sm text-[#7a6050]'>
							Noch kein Konto?{' '}
							<Link
								href='/register'
								className='text-[#8b5e3c] font-semibold hover:text-[#6b4226]'
							>
								Jetzt registrieren
							</Link>
						</p>
					</div>
				</div>

				<p className='text-center text-xs text-[#b09880] mt-6'>
					<Link href='/' className='hover:text-[#7a6050]'>
						← Zurück zur Startseite
					</Link>
				</p>
			</motion.div>
		</div>
	)
}

export default function LoginPage() {
	return (
		<Suspense>
			<LoginForm />
		</Suspense>
	)
}
