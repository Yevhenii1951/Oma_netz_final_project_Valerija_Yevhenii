import type { Metadata } from 'next'

import LandingClient from './landing/landing-client'

/**
 * The marketing page lives at the root URL, not at /landing.
 *
 * It used to sit in a /landing folder behind a redirect from `/`, which made
 * the public entry point look like an unfinished draft and pushed the canonical
 * address one hop away from the domain. The implementation still lives in
 * ./landing — only the address moved. The old path stays as a redirect in
 * app/landing/page.tsx so existing links and bookmarks keep working.
 *
 * This is the one page meant to be found by someone searching for help in
 * Kassel, so the locality is in the title rather than only in the default.
 */
export const metadata: Metadata = {
	title: 'Nachbarschaftshilfe in Kassel für Seniorinnen und Senioren',
	description:
		'OMA-NETZ Kassel vermittelt ehrenamtliche Hilfe in der Nachbarschaft: Einkäufe, Begleitung zu Arztterminen, Spaziergänge und Hilfe im Haushalt. Kostenlos für Seniorinnen und Senioren in Kassel.',
	alternates: { canonical: '/' },
	openGraph: {
		type: 'website',
		locale: 'de_DE',
		title: 'Nachbarschaftshilfe in Kassel für Seniorinnen und Senioren',
		description:
			'Ehrenamtliche Helferinnen und Helfer unterstützen ältere Menschen in Kassel — kostenlos und ehrenamtlich.',
		url: '/',
	},
}

export default function LandingPage() {
	return <LandingClient />
}