'use client'

import {
	BaseInfoStep,
	HelperProfileStep,
	RegisterCard,
	RoleStep,
} from '@/app/register/register-form-sections'
import { Role } from '@/app/register/register-options'
import { AnimatePresence, motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

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
				<RegisterCard steps={steps} step={step}>
					<AnimatePresence mode='wait'>
						{step === 1 && (
							<RoleStep
								role={role}
								seniorRoleRef={seniorRoleRef}
								helperRoleRef={helperRoleRef}
								relativeRoleRef={relativeRoleRef}
								onRoleChange={setRole}
								onNext={() => setStep(2)}
							/>
						)}

						{step === 2 && (
							<BaseInfoStep
								error={error}
								role={role}
								name={name}
								email={email}
								password={password}
								phone={phone}
								plz={plz}
								showPw={showPw}
								loading={loading}
								onNameChange={setName}
								onEmailChange={setEmail}
								onPasswordChange={setPassword}
								onPhoneChange={setPhone}
								onPlzChange={setPlz}
								onShowPwToggle={() => setShowPw(!showPw)}
								onBack={() => setStep(1)}
								onSubmit={
									role === 'HELPER'
										? e => {
												e.preventDefault()
												setStep(3)
											}
										: handleSubmit
								}
							/>
						)}

						{step === 3 && role === 'HELPER' && (
							<HelperProfileStep
								error={error}
								employmentType={employmentType}
								institution={institution}
								languages={languages}
								customLang={customLang}
								documentNumber={documentNumber}
								registrationAddress={registrationAddress}
								loading={loading}
								onEmploymentTypeChange={setEmploymentType}
								onInstitutionChange={setInstitution}
								onToggleLanguage={toggleLanguage}
								onCustomLangChange={setCustomLang}
								onCustomLangAdd={addCustomLang}
								onDocumentNumberChange={setDocumentNumber}
								onRegistrationAddressChange={setRegistrationAddress}
								onBack={() => setStep(2)}
								onSubmit={handleSubmit}
							/>
						)}
					</AnimatePresence>
				</RegisterCard>
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
