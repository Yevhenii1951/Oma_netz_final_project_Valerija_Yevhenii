import type { LucideIcon } from 'lucide-react'
import {
	Award,
	Bus,
	Car,
	Handshake,
	Heart,
	Home,
	Laptop,
	MessageCircle,
	PersonStanding,
	ShoppingCart,
	Star,
	Stethoscope,
	Ticket,
	TreePine,
	User,
	UserPlus,
	Users,
} from 'lucide-react'

export const NAV_LINKS: { href: string; label: string }[] = [
	{ href: '#journey', label: 'So läuft es ab' },
	{ href: '#categories', label: 'Kategorien' },
	{ href: '#helpers', label: 'Helfer werden' },
	{ href: '#trust', label: 'Vertrauen' },
]

export const STATS = [
	{ value: 500, suffix: '+', label: 'Aktive Helfer' },
	{ value: 1200, suffix: '+', label: 'Erfüllte Anfragen' },
	{ value: 98, suffix: '%', label: 'Zufriedenheit' },
	{ value: 34, suffix: '', label: 'Stadtteile' },
]

export const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
	{
		icon: ShoppingCart,
		title: 'Einkaufen',
		desc: 'Hilfe beim Einkauf oder Besorgungen.',
	},
	{
		icon: Stethoscope,
		title: 'Arzttermine',
		desc: 'Begleitung oder Fahrdienst zum Arzt.',
	},
	{
		icon: PersonStanding,
		title: 'Spaziergänge',
		desc: 'Gemeinsam gegen Einsamkeit.',
	},
	{
		icon: Laptop,
		title: 'Technik-Hilfe',
		desc: 'Smartphone, Tablet oder PC.',
	},
	{
		icon: Car,
		title: 'Transport',
		desc: 'Fahrdienste für Einkäufe oder Termine.',
	},
	{
		icon: Home,
		title: 'Haushalt',
		desc: 'Kleine Erledigungen rund um den Alltag.',
	},
]

export const HELPER_REWARDS: { icon: LucideIcon; text: string }[] = [
	{ icon: Ticket, text: 'Kinogutscheine (Cineplex Kassel)' },
	{ icon: Bus, text: 'KVG Tagestickets' },
	{ icon: Award, text: 'Offizielle Ehrenamtsbescheinigung' },
	{ icon: TreePine, text: 'Baum pflanzen — soziales Engagement' },
]

export const POINT_BONUSES: {
	points: string
	desc: string
	icon: LucideIcon
}[] = [
	{ points: '+10', desc: 'Pro geleistete Hilfe', icon: Handshake },
	{ points: '+5', desc: 'Für 5-Sterne-Bewertung', icon: Star },
	{ points: '+20', desc: 'Ersten Chat abschließen', icon: MessageCircle },
]

export const TRUST_BADGES = [
	'✓ DSGVO-konform',
	'✓ Verifizierte Helfer',
	'✓ 24h Support',
	'✓ Kostenlos',
]

export const SOCIAL_ICONS: LucideIcon[] = [User, Users, Heart, UserPlus]
