//import { auth } from '@/auth'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import LandingClient from './landing-client'

/**
 * The one page that has to be found by people searching for help in Kassel, so
 * it carries the locality in the title rather than only inheriting the default.
 */
export const metadata: Metadata = {
	title: 'Nachbarschaftshilfe in Kassel für Seniorinnen und Senioren',
	description:
		'OMA-NETZ Kassel vermittelt ehrenamtliche Hilfe in der Nachbarschaft: Einkäufe, Begleitung zu Arztterminen, Spaziergänge und Hilfe im Haushalt. Kostenlos für Seniorinnen und Senioren in Kassel.',
	alternates: { canonical: '/landing' },
	openGraph: {
		type: 'website',
		locale: 'de_DE',
		title: 'Nachbarschaftshilfe in Kassel für Seniorinnen und Senioren',
		description:
			'Ehrenamtliche Helferinnen und Helfer unterstützen ältere Menschen in Kassel — kostenlos und ehrenamtlich.',
		url: '/landing',
	},
}

export default async function LandingPage() {
	//const session = await auth()
	//if (session) redirect('/dashboard')
	return <LandingClient />
}
