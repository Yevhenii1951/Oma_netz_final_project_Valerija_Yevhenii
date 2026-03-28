import {
	COMMON_LANGUAGES,
	employmentOptions,
	Role,
	roleOptions,
} from '@/app/register/register-options'
import { motion } from 'framer-motion'
import { CheckCircle, Eye, EyeOff, Loader2, Search, X } from 'lucide-react'
import Link from 'next/link'
import type { RefObject } from 'react'

interface RegisterCardProps {
	steps: number
	step: 1 | 2 | 3
	children: React.ReactNode
}

export function RegisterCard({ steps, step, children }: RegisterCardProps) {
	return (
		<>
			<div className='flex items-center gap-2 mb-6'>
				{Array.from({ length: steps }).map((_, i) => (
					<div
						key={i}
						className={`flex-1 h-1.5 rounded-full transition-colors ${step > i ? 'bg-[#8b5e3c]' : 'bg-[#ddd0be]'}`}
					/>
				))}
			</div>

			<div className='card p-6'>{children}</div>

			<p className='text-center text-sm text-[#7a6050] mt-5'>
				Bereits registriert?{' '}
				<Link
					href='/login'
					className='text-[#8b5e3c] font-semibold hover:text-[#6b4226]'
				>
					Anmelden
				</Link>
			</p>
		</>
	)
}

interface RoleStepProps {
	role: Role
	seniorRoleRef: RefObject<HTMLButtonElement | null>
	helperRoleRef: RefObject<HTMLButtonElement | null>
	relativeRoleRef: RefObject<HTMLButtonElement | null>
	onRoleChange: (role: Role) => void
	onNext: () => void
}

export function RoleStep({
	role,
	seniorRoleRef,
	helperRoleRef,
	relativeRoleRef,
	onRoleChange,
	onNext,
}: RoleStepProps) {
	return (
		<motion.div
			key='step1'
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
		>
			<p className='text-sm font-semibold text-[#3d2b1f] mb-4'>Ich bin...</p>
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
						onClick={() => onRoleChange(value)}
						className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${role === value ? 'border-[#8b5e3c] bg-[#f5ede0]' : 'border-[#ddd0be] bg-[#ffffff] hover:border-[#c8956c]'}`}
					>
						<RoleIcon size={24} className='text-[#8b5e3c] shrink-0 mt-0.5' />
						<div className='flex-1'>
							<p className='font-semibold text-[#3d2b1f] text-sm'>{label}</p>
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
				onClick={onNext}
				className='btn-primary w-full justify-center py-3 mt-6'
			>
				Weiter
			</button>
		</motion.div>
	)
}

interface ErrorBannerProps {
	error: string
}

function ErrorBanner({ error }: ErrorBannerProps) {
	if (!error) {
		return null
	}

	return (
		<div className='bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4'>
			{error}
		</div>
	)
}

interface BaseInfoStepProps {
	error: string
	role: Role
	name: string
	email: string
	password: string
	phone: string
	plz: string
	showPw: boolean
	loading: boolean
	onNameChange: (value: string) => void
	onEmailChange: (value: string) => void
	onPasswordChange: (value: string) => void
	onPhoneChange: (value: string) => void
	onPlzChange: (value: string) => void
	onShowPwToggle: () => void
	onBack: () => void
	onSubmit: (e: React.FormEvent) => void
}

export function BaseInfoStep({
	error,
	role,
	name,
	email,
	password,
	phone,
	plz,
	showPw,
	loading,
	onNameChange,
	onEmailChange,
	onPasswordChange,
	onPhoneChange,
	onPlzChange,
	onShowPwToggle,
	onBack,
	onSubmit,
}: BaseInfoStepProps) {
	return (
		<motion.div
			key='step2'
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
		>
			<ErrorBanner error={error} />

			<form className='space-y-4' onSubmit={onSubmit}>
				<div>
					<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
						Vollständiger Name
					</label>
					<input
						type='text'
						value={name}
						onChange={e => onNameChange(e.target.value)}
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
						onChange={e => onEmailChange(e.target.value)}
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
							onChange={e => onPasswordChange(e.target.value)}
							className='input-field pr-12'
							placeholder='Mindestens 8 Zeichen'
							required
							minLength={8}
						/>
						<button
							type='button'
							onClick={onShowPwToggle}
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
							<span className='font-normal text-[#b09880]'>(optional)</span>
						</label>
						<input
							type='tel'
							value={phone}
							onChange={e => onPhoneChange(e.target.value)}
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
							onChange={e => onPlzChange(e.target.value)}
							className='input-field'
							placeholder='34117'
							maxLength={5}
						/>
					</div>
				</div>
				<div className='flex gap-2 mt-2'>
					<button
						type='button'
						onClick={onBack}
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
	)
}

interface HelperProfileStepProps {
	error: string
	employmentType: string
	institution: string
	languages: string[]
	customLang: string
	documentNumber: string
	registrationAddress: string
	loading: boolean
	onEmploymentTypeChange: (value: string) => void
	onInstitutionChange: (value: string) => void
	onToggleLanguage: (lang: string) => void
	onCustomLangChange: (value: string) => void
	onCustomLangAdd: () => void
	onDocumentNumberChange: (value: string) => void
	onRegistrationAddressChange: (value: string) => void
	onBack: () => void
	onSubmit: (e: React.FormEvent) => void
}

export function HelperProfileStep({
	error,
	employmentType,
	institution,
	languages,
	customLang,
	documentNumber,
	registrationAddress,
	loading,
	onEmploymentTypeChange,
	onInstitutionChange,
	onToggleLanguage,
	onCustomLangChange,
	onCustomLangAdd,
	onDocumentNumberChange,
	onRegistrationAddressChange,
	onBack,
	onSubmit,
}: HelperProfileStepProps) {
	return (
		<motion.div
			key='step3'
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
		>
			<ErrorBanner error={error} />

			<div className='mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800'>
				<Search size={12} className='inline mr-1' /> Diese Angaben werden vom
				Admin geprüft. Nach Freigabe kannst du Anfragen annehmen.
			</div>

			<form onSubmit={onSubmit} className='space-y-4'>
				<div>
					<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
						Status <span className='font-normal text-[#b09880]'>(Pflicht)</span>
					</label>
					<select
						value={employmentType}
						onChange={e => onEmploymentTypeChange(e.target.value)}
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

				<div>
					<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
						{employmentType === 'Student'
							? 'Uni / Hochschule'
							: employmentType === 'Jobcenter'
								? 'Jobcenter-Stelle'
								: 'Einrichtung'}{' '}
						<span className='font-normal text-[#b09880]'>(optional)</span>
					</label>
					<input
						type='text'
						value={institution}
						onChange={e => onInstitutionChange(e.target.value)}
						className='input-field'
						placeholder='z.B. Universität Kassel'
					/>
				</div>

				<div>
					<label className='block text-sm font-semibold text-[#3d2b1f] mb-2'>
						Sprachen
					</label>
					<div className='flex flex-wrap gap-2 mb-2'>
						{COMMON_LANGUAGES.map(lang => (
							<button
								key={lang}
								type='button'
								onClick={() => onToggleLanguage(lang)}
								className={`text-xs px-3 py-1 rounded-full border transition-all ${languages.includes(lang) ? 'bg-[#8b5e3c] text-white border-[#8b5e3c]' : 'bg-[#ffffff] text-[#7a6050] border-[#ddd0be] hover:border-[#c8956c]'}`}
							>
								{lang}
							</button>
						))}
					</div>
					<div className='flex gap-2'>
						<input
							type='text'
							value={customLang}
							onChange={e => onCustomLangChange(e.target.value)}
							onKeyDown={e =>
								e.key === 'Enter' && (e.preventDefault(), onCustomLangAdd())
							}
							className='input-field flex-1 text-sm py-1.5'
							placeholder='Andere Sprache...'
						/>
						<button
							type='button'
							onClick={onCustomLangAdd}
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
										onClick={() => onToggleLanguage(l)}
										className='hover:text-red-500'
									>
										<X size={11} />
									</button>
								</span>
							))}
						</div>
					)}
				</div>

				<div>
					<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
						Ausweis- / Studienausweisnummer{' '}
						<span className='font-normal text-[#b09880]'>(optional)</span>
					</label>
					<input
						type='text'
						value={documentNumber}
						onChange={e => onDocumentNumberChange(e.target.value)}
						className='input-field'
						placeholder='z.B. T220001293'
					/>
				</div>

				<div>
					<label className='block text-sm font-semibold text-[#3d2b1f] mb-1.5'>
						Anmeldeadresse (Wohnsitz){' '}
						<span className='font-normal text-[#b09880]'>(optional)</span>
					</label>
					<input
						type='text'
						value={registrationAddress}
						onChange={e => onRegistrationAddressChange(e.target.value)}
						className='input-field'
						placeholder='Musterstraße 1, 34117 Kassel'
					/>
				</div>

				<div className='flex gap-2 mt-2'>
					<button
						type='button'
						onClick={onBack}
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
	)
}
