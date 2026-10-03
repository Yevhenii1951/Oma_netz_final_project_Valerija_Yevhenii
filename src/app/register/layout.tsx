import type { Metadata } from 'next'

/**
 * The form is a client component and cannot export metadata, so it is declared
 * here. Registration is not a search target either, but the page needs its own
 * title — without one it inherits the bare default from the root layout.
 */
export const metadata: Metadata = {
	title: 'Registrieren',
	description:
		'Registrierung bei OMA-NETZ Kassel – als Seniorin oder Senior Hilfe annehmen, als Helferin oder Helfer helfen.',
	robots: { index: false, follow: false },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
	return children
}