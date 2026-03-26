'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
	CheckCircle,
	Eye,
	EyeOff,
	Handshake,
	Heart,
	Loader2,
	Search,
	User,
	X,
} from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

type Role = 'SENIOR' | 'HELPER' | 'RELATIVE'

const roleOptions: {
	value: Role
	label: string
	icon: LucideIcon
	desc: string
}[] = [
	{
		value: 'SENIOR',
		icon: User,
		label: 'Hilfesuchend',
		desc: 'Ich bin Senior und suche Unterstützung im Alltag',
	},
	{
		value: 'HELPER',
		icon: Handshake,
		label: 'Freiwilliger Helfer',
		desc: 'Ich möchte älteren Menschen helfen und Punkte sammeln',
	},
	{
		value: 'RELATIVE',
		icon: Heart,
		label: 'Angehöriger',
		desc: 'Ich organisiere Hilfe für einen älteren Angehörigen',
	},
]

const employmentOptions = [
	{ value: 'Student', label: 'Student/in' },
	{ value: 'Arbeitslos', label: 'Arbeitslos' },
	{ value: 'Jobcenter', label: 'Jobcenter-Maßnahme' },
	{ value: 'Angestellt', label: 'Angestellt' },
	{ value: 'FSJ', label: 'FSJ / BFD' },
	{ value: 'Sonstiges', label: 'Sonstiges' },
]

const COMMON_LANGUAGES = [
	'Deutsch',
	'Englisch',
	'Russisch',
	'Türkisch',
	'Arabisch',
	'Polnisch',
	'Ukrainisch',
	'Französisch',
]

function RegisterForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const roleParam = searchParams.get('role')
	const defaultRole: Role =
		roleParam === 'SENIOR' || roleParam === 'HELPER' || roleParam === 'RELATIVE'
			? roleParam
			: 'HELPER'

	const totalSteps = (role: Role) => (role === 'HELPER' ? 3 : 2)

	const [step, setStep] = useState<1 | 2 | 3>(1)
	const [role, setRole] = useState<Role>(defaultRole)
	const seniorRoleRef = useRef<HTMLButtonElement | null>(null)
	const helperRoleRef = useRef<HTMLButtonElement | null>(null)
	const relativeRoleRef = useRef<HTMLButtonElement | null>(null)
	// Step 2 fields
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [phone, setPhone] = useState('')
	const [plz, setPlz] = useState('')
	const [showPw, setShowPw] = useState(false)
	// Step 3 fields (Helper only)
	const [employmentType, setEmploymentType] = useState('')
	const [institution, setInstitution] = useState('')
	const [languages, setLanguages] = useState<string[]>([])
	const [customLang, setCustomLang] = useState('')
	const [documentNumber, setDocumentNumber] = useState('')
	const [registrationAddress, setRegistrationAddress] = useState('')

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		setRole(defaultRole)
	}, [defaultRole])

	useEffect(() => {
		if (step !== 1) return
		if (role === 'SENIOR') seniorRoleRef.current?.focus()
		if (role === 'HELPER') helperRoleRef.current?.focus()
		if (role === 'RELATIVE') relativeRoleRef.current?.focus()
	}, [role, step])

	function toggleLanguage(lang: string) {
		setLanguages(prev =>
			prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang],
		)
	}
	function addCustomLang() {
		const l = customLang.trim()
		if (l && !languages.includes(l)) setLanguages(prev => [...prev, l])
		setCustomLang('')
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError('')
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					email,
					password,
					role,
					phone,
					plz,
					...(role === 'HELPER'
						? {
								employmentType,
								institution,
								languages,
								documentNumber,
								registrationAddress,
							}
						: {}),
				}),
			})
			const json = await res.json()
			if (!res.ok) {
				setError(json.error ?? 'Fehler bei der Registrierung.')
				setLoading(false)
				return
			}
			await signIn('credentials', { email, password, redirect: false })
			router.push('/dashboard')
			router.refresh()
		} catch {
			setError('Netzwerkfehler. Bitte versuche es erneut.')
			setLoading(false)
		}
	}

	const steps = totalSteps(role)

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
						className='inline-flex items-center gap-2 justify-center'
					>
						<div className='w-11 h-11 rounded-2xl bg-[#8b5e3c] flex items-center justify-center shadow-md shadow-[#e8d5be]'>
							<span className='text-[#ffffff] font-bold text-xl'>O</span>
						</div>
					</Link>
					<h1 className='text-2xl font-bold text-[#3d2b1f] mt-3'>
						Konto erstellen
					</h1>
					<p className='text-[#7a6050] text-sm mt-1'>
						Kostenlos und in weniger als 2 Minuten
					</p>
				</div>

				{/* Progress bar */}
				<div className='flex items-center gap-2 mb-6'>
					{Array.from({ length: steps }).map((_, i) => (
						<div
							key={i}
							className={`flex-1 h-1.5 rounded-full transition-colors ${step > i ? 'bg-[#8b5e3c]' : 'bg-[#ddd0be]'}`}
						/>
					))}
				</div>

				<div className='card p-6'>
					<AnimatePresence mode='wait'>
						{/* ── Step 1: Rolle wählen ── */}
						{step === 1 && (
							<motion.div
								key='step1'
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
							>
								<p className='text-sm font-semibold text-[#3d2b1f] mb-4'>
									Ich bin...
								</p>
								<div className='space-y-3'>
									{roleOptions.map(({ value, icon: RoleIcon, label, desc }) => (
										<button
											key={value}
											ref={
												value === 'SENIOR'
													? seniorRoleRef
													: value === 'HELPER'
														? helperRoleRef
														: relativeRoleRef
											}
											type='button'
											onClick={() => setRole(value)}
											className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${role === value ? 'border-[#8b5e3c] bg-[#f5ede0]' : 'border-[#ddd0be] bg-[#ffffff] hover:border-[#c8956c]'}`}
										>
											<RoleIcon
												size={24}
												className='text-[#8b5e3c] shrink-0 mt-0.5'
											/>
											<div className='flex-1'>
												<p className='font-semibold text-[#3d2b1f] text-sm'>
													{label}
												</p>
												<p className='text-xs text-[#7a6050] mt-0.5'>{desc}</p>
											</div>
											{role === value && (
												<CheckCircle
													size={18}
													className='text-[#8b5e3c] shrink-0 mt-0.5'
												/>
											)}
										</button>
									))}
								</div>
								<button
									type='button'
									onClick={() => setStep(2)}
									className='btn-primary w-full justify-center py-3 mt-6'
								>
									Weiter
								</button>
							</motion.div>
						)}

						{/* ── Step 2: Basisdaten ── */}
						{step === 2 && (
							<motion.div
								key='step2'
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
							>
								{error && (
									<div className='bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4'>
										{error}
									</div>
								)}

								<form
									className='space-y-4'
									onSubmit={
										role === 'HELPER'
											? e => {
													e.preventDefault()
													setStep(3)
												}
											: handleSubmit
									}
								>
									<div>
										<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
											Vollständiger Name
										</label>
										<input
											type='text'
											value={name}
											onChange={e => setName(e.target.value)}
											className='input-field'
											placeholder='Max Mustermann'
											required
											minLength={2}
										/>
									</div>
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
										/>
									</div>
									<div>
										<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
											Passwort
										</label>
										<div className='relative'>
											<input
												type={showPw ? 'text' : 'password'}
												value={password}
												onChange={e => setPassword(e.target.value)}
												className='input-field pr-12'
												placeholder='Mindestens 8 Zeichen'
												required
												minLength={8}
											/>
											<button
												type='button'
												onClick={() => setShowPw(!showPw)}
												className='absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#b09880] hover:text-[#7a6050]'
											>
												{showPw ? <EyeOff size={17} /> : <Eye size={17} />}
											</button>
										</div>
									</div>
									<div className='grid grid-cols-2 gap-3'>
										<div>
											<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
												Telefon{' '}
												<span className='font-normal text-[#b09880]'>
													(optional)
												</span>
											</label>
											<input
												type='tel'
												value={phone}
												onChange={e => setPhone(e.target.value)}
												className='input-field'
												placeholder='+49 561...'
											/>
										</div>
										<div>
											<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
												PLZ
											</label>
											<input
												type='text'
												value={plz}
												onChange={e => setPlz(e.target.value)}
												className='input-field'
												placeholder='34117'
												maxLength={5}
											/>
										</div>
									</div>
									<div className='flex gap-2 mt-2'>
										<button
											type='button'
											onClick={() => setStep(1)}
											className='btn-secondary flex-1 justify-center py-3'
										>
											Zurück
										</button>
										<button
											type='submit'
											disabled={loading}
											className='btn-primary flex-2 justify-center py-3 disabled:opacity-70'
										>
											{loading ? (
												<>
													<Loader2 size={17} className='animate-spin' />
													Registrieren...
												</>
											) : role === 'HELPER' ? (
												'Weiter'
											) : (
												'Konto erstellen'
											)}
										</button>
									</div>
								</form>
							</motion.div>
						)}

						{/* ── Step 3: Helfer-Profil (nur für HELPER) ── */}
						{step === 3 && role === 'HELPER' && (
							<motion.div
								key='step3'
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
							>
								{error && (
									<div className='bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4'>
										{error}
									</div>
								)}

								<div className='mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800'>
									<Search size={12} className='inline mr-1' /> Diese Angaben
									werden vom Admin geprüft. Nach Freigabe kannst du Anfragen
									annehmen.
								</div>

								<form onSubmit={handleSubmit} className='space-y-4'>
									{/* Employment status */}
									<div>
										<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
											Status{' '}
											<span className='font-normal text-[#b09880]'>
												(Pflicht)
											</span>
										</label>
										<select
											value={employmentType}
											onChange={e => setEmploymentType(e.target.value)}
											className='input-field'
											required
										>
											<option value=''>Status wählen...</option>
											{employmentOptions.map(o => (
												<option key={o.value} value={o.value}>
													{o.label}
												</option>
											))}
										</select>
									</div>

									{/* Institution */}
									<div>
										<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
											{employmentType === 'Student'
												? 'Uni / Hochschule'
												: employmentType === 'Jobcenter'
													? 'Jobcenter-Stelle'
													: 'Einrichtung'}{' '}
											<span className='font-normal text-[#b09880]'>
												(optional)
											</span>
										</label>
										<input
											type='text'
											value={institution}
											onChange={e => setInstitution(e.target.value)}
											className='input-field'
											placeholder='z.B. Universität Kassel'
										/>
									</div>

									{/* Languages */}
									<div>
										<label className='block text-sm font-semibold text-[#3d2b1f] mb-2'>
											Sprachen
										</label>
										<div className='flex flex-wrap gap-2 mb-2'>
											{COMMON_LANGUAGES.map(lang => (
												<button
													key={lang}
													type='button'
													onClick={() => toggleLanguage(lang)}
													className={`text-xs px-3 py-1 rounded-full border transition-all ${languages.includes(lang) ? 'bg-[#8b5e3c] text-white border-[#8b5e3c]' : 'bg-[#ffffff] text-[#7a6050] border-[#ddd0be] hover:border-[#c8956c]'}`}
												>
													{lang}
												</button>
											))}
										</div>
										{/* Custom language */}
										<div className='flex gap-2'>
											<input
												type='text'
												value={customLang}
												onChange={e => setCustomLang(e.target.value)}
												onKeyDown={e =>
													e.key === 'Enter' &&
													(e.preventDefault(), addCustomLang())
												}
												className='input-field flex-1 text-sm py-1.5'
												placeholder='Andere Sprache...'
											/>
											<button
												type='button'
												onClick={addCustomLang}
												className='btn-secondary text-xs px-3 py-1.5'
											>
												+
											</button>
										</div>
										{languages.length > 0 && (
											<div className='flex flex-wrap gap-1.5 mt-2'>
												{languages.map(l => (
													<span
														key={l}
														className='flex items-center gap-1 text-xs bg-[#f5ede0] text-[#3d2b1f] px-2 py-0.5 rounded-full border border-[#ddd0be]'
													>
														{l}
														<button
															type='button'
															onClick={() => toggleLanguage(l)}
															className='hover:text-red-500'
														>
															<X size={11} />
														</button>
													</span>
												))}
											</div>
										)}
									</div>

									{/* Document number */}
									<div>
										<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
											Ausweis- / Studienausweisnummer{' '}
											<span className='font-normal text-[#b09880]'>
												(optional)
											</span>
										</label>
										<input
											type='text'
											value={documentNumber}
											onChange={e => setDocumentNumber(e.target.value)}
											className='input-field'
											placeholder='z.B. T220001293'
										/>
									</div>

									{/* Registration address (Anmeldung) */}
									<div>
										<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
											Anmeldeadresse (Wohnsitz){' '}
											<span className='font-normal text-[#b09880]'>
												(optional)
											</span>
										</label>
										<input
											type='text'
											value={registrationAddress}
											onChange={e => setRegistrationAddress(e.target.value)}
											className='input-field'
											placeholder='Musterstraße 1, 34117 Kassel'
										/>
									</div>

									<div className='flex gap-2 mt-2'>
										<button
											type='button'
											onClick={() => setStep(2)}
											className='btn-secondary flex-1 justify-center py-3'
										>
											Zurück
										</button>
										<button
											type='submit'
											disabled={loading}
											className='btn-primary flex-2 justify-center py-3 disabled:opacity-70'
										>
											{loading ? (
												<>
													<Loader2 size={17} className='animate-spin' />
													Senden...
												</>
											) : (
												'Konto erstellen'
											)}
										</button>
									</div>
								</form>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<p className='text-center text-sm text-[#7a6050] mt-5'>
					Bereits registriert?{' '}
					<Link
						href='/login'
						className='text-[#8b5e3c] font-semibold hover:text-[#6b4226]'
					>
						Anmelden
					</Link>
				</p>
			</motion.div>
		</div>
	)
}

export default function RegisterPage() {
	return (
		<Suspense>
			<RegisterForm />
		</Suspense>
	)
}
