import type { LucideIcon } from 'lucide-react'
import { Handshake, Heart, User } from 'lucide-react'

export type Role = 'SENIOR' | 'HELPER' | 'RELATIVE'

export const roleOptions: {
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

export const employmentOptions = [
	{ value: 'Student', label: 'Student/in' },
	{ value: 'Arbeitslos', label: 'Arbeitslos' },
	{ value: 'Jobcenter', label: 'Jobcenter-Maßnahme' },
	{ value: 'Angestellt', label: 'Angestellt' },
	{ value: 'FSJ', label: 'FSJ / BFD' },
	{ value: 'Sonstiges', label: 'Sonstiges' },
]

export const COMMON_LANGUAGES = [
	'Deutsch',
	'Englisch',
	'Russisch',
	'Türkisch',
	'Arabisch',
	'Polnisch',
	'Ukrainisch',
	'Französisch',
]
