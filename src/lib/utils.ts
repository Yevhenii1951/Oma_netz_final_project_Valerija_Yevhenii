import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merges Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/** Format a date to German locale */
export function formatDate(
	date: Date | string | null | undefined,
	opts?: Intl.DateTimeFormatOptions,
): string {
	if (!date) return '—'
	const d = new Date(date)
	if (isNaN(d.getTime())) return '—'
	return new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		...opts,
	}).format(d)
}

/** Format relative time (e.g. "vor 2 Stunden") */
export function formatRelativeTime(date: Date | string): string {
	const now = new Date()
	const d = new Date(date)
	const diffMs = now.getTime() - d.getTime()
	const diffSecs = Math.floor(diffMs / 1000)
	const diffMins = Math.floor(diffSecs / 60)
	const diffHours = Math.floor(diffMins / 60)
	const diffDays = Math.floor(diffHours / 24)

	if (diffSecs < 60) return 'gerade eben'
	if (diffMins < 60) return `vor ${diffMins} Min.`
	if (diffHours < 24) return `vor ${diffHours} Std.`
	if (diffDays < 7) return `vor ${diffDays} Tagen`
	return formatDate(d)
}

/** Get initials from a name */
export function getInitials(name: string | null | undefined): string {
	if (!name) return '?'
	return name
		.split(' ')
		.map(n => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

/** Geocode an address using Nominatim (OpenStreetMap) */
export async function geocodeAddress(
	address: string,
	city: string = 'Kassel',
): Promise<{ lat: number; lng: number } | null> {
	const query = encodeURIComponent(`${address}, ${city}, Deutschland`)
	try {
		const res = await fetch(
			`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
			{ headers: { 'User-Agent': 'OMA-NETZ-Kassel/1.0' } },
		)
		const data = await res.json()
		if (data && data[0]) {
			return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
		}
	} catch {
		// silently fail — coordinates are optional
	}
	return null
}

/** Truncate text to N characters */
export function truncate(text: string, maxLen: number): string {
	if (text.length <= maxLen) return text
	return text.slice(0, maxLen - 3) + '...'
}

/** Generate a random 6-character alphanumeric Telegram link code */
export function generateTelegramCode(): string {
	return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/** Points earned per completed help */
export const POINTS_PER_HELP = 10
