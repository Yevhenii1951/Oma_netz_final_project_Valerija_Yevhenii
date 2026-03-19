/**
 * TypeScript interfaces mirroring Prisma models + utility types
 * OMA-NETZ Kassel
 */

import {
	Car,
	Cross,
	type LucideIcon,
	Footprints,
	Heart,
	House,
	Laptop,
	ShoppingCart,
} from 'lucide-react'

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export type Role = 'SENIOR' | 'HELPER' | 'RELATIVE' | 'ADMIN'

export type RequestCategory =
	| 'EINKAUF'
	| 'ARZT'
	| 'SPAZIERGANG'
	| 'TECHNIK'
	| 'TRANSPORT'
	| 'HAUSHALT'
	| 'ANDERES'

export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

// ─── CATEGORY METADATA ───────────────────────────────────────────────────────

export interface CategoryMeta {
	value: RequestCategory
	label: string
	icon: LucideIcon
	color: string
	bg: string
}

export const CATEGORIES: CategoryMeta[] = [
	{
		value: 'EINKAUF',
		label: 'Einkaufen',
		icon: ShoppingCart,
		color: 'text-emerald-700',
		bg: 'bg-emerald-50',
	},
	{
		value: 'ARZT',
		label: 'Arzttermin',
		icon: Cross,
		color: 'text-rose-700',
		bg: 'bg-rose-50',
	},
	{
		value: 'SPAZIERGANG',
		label: 'Spaziergang',
		icon: Footprints,
		color: 'text-sky-700',
		bg: 'bg-sky-50',
	},
	{
		value: 'TECHNIK',
		label: 'Technik',
		icon: Laptop,
		color: 'text-violet-700',
		bg: 'bg-violet-50',
	},
	{
		value: 'TRANSPORT',
		label: 'Transport',
		icon: Car,
		color: 'text-amber-700',
		bg: 'bg-amber-50',
	},
	{
		value: 'HAUSHALT',
		label: 'Haushalt',
		icon: House,
		color: 'text-[#6b4226]',
		bg: 'bg-[#e8d5be]',
	},
	{
		value: 'ANDERES',
		label: 'Anderes',
		icon: Heart,
		color: 'text-slate-700',
		bg: 'bg-slate-50',
	},
]

export const ROLE_LABELS: Record<Role, string> = {
	SENIOR: 'Hilfesuchend',
	HELPER: 'Freiwilliger Helfer',
	RELATIVE: 'Angehöriger',
	ADMIN: 'Administrator',
}

// ─── USER ────────────────────────────────────────────────────────────────────

export interface User {
	id: string
	name: string | null
	email: string | null
	image: string | null
	role: Role
	phone: string | null
	bio: string | null
	address: string | null
	city: string | null
	plz: string | null
	lat: number | null
	lng: number | null
	ratingAvg: number
	helpCount: number
	points: number
	isBanned: boolean
	createdAt: Date
}

// ─── REQUEST ─────────────────────────────────────────────────────────────────

export interface Request {
	id: string
	title: string
	description: string
	category: RequestCategory
	status: RequestStatus
	address: string
	city: string
	plz: string | null
	lat: number | null
	lng: number | null
	desiredTime: Date | null
	createdAt: Date
	seniorId: string
	senior?: User
	offers?: Offer[]
	_count?: { offers: number }
}

// ─── OFFER ───────────────────────────────────────────────────────────────────

export interface Offer {
	id: string
	message: string | null
	status: OfferStatus
	createdAt: Date
	requestId: string
	helperId: string
	helper?: User
}

// ─── CHAT / MESSAGES ─────────────────────────────────────────────────────────

export interface Chat {
	id: string
	requestId: string
	createdAt: Date
	request?: Request
	messages?: Message[]
}

export interface Message {
	id: string
	content: string
	imageUrl: string | null
	createdAt: Date
	chatId: string
	senderId: string
	sender?: User
}

// ─── REWARD ──────────────────────────────────────────────────────────────────

export interface Reward {
	id: string
	title: string
	description: string
	pointsCost: number
	emoji: string
	category: string
	isActive: boolean
	stock: number | null
	imageUrl: string | null
}

// ─── NOTIFICATION ────────────────────────────────────────────────────────────

export interface Notification {
	id: string
	title: string
	body: string
	link: string | null
	read: boolean
	createdAt: Date
	userId: string
}
