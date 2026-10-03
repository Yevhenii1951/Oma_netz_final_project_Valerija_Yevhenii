import type { Metadata } from 'next'

/**
 * The form itself is a client component and cannot export metadata, so it is
 * declared here.
 *
 * Neither /login nor /register is a search target — nobody looks for a login
 * form — but they still need a title, otherwise both render with the bare
 * default and a browser tab, a bookmark or a shared link give nothing away.
 */
export const metadata: Metadata = {
	title: 'Anmelden',
	description: 'Anmeldung für OMA-NETZ Kassel – ehrenamtliche Nachbarschaftshilfe.',
	robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
	return children
}