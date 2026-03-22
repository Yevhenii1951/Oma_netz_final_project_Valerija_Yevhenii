import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
})

const playfair = Playfair_Display({
	subsets: ['latin'],
	variable: '--font-playfair',
	display: 'swap',
})

export const metadata: Metadata = {
	title: {
		default: 'OMA-NETZ Kassel',
		template: '%s | OMA-NETZ Kassel',
	},
	description:
		'Freiwillige Nachbarschaftshilfe für ältere Menschen in Kassel. Ehrenamtliche Helfer unterstützen bei Einkäufen, Arztterminen, Spaziergängen und mehr.',
	keywords: [
		'Ehrenamt',
		'Nachbarschaftshilfe',
		'Kassel',
		'Senioren',
		'Freiwillige',
		'Hilfe',
	],
	authors: [{ name: 'OMA-NETZ Kassel' }],
	creator: 'OMA-NETZ Kassel',
	manifest: '/manifest.json',
	openGraph: {
		type: 'website',
		locale: 'de_DE',
		title: 'OMA-NETZ Kassel',
		description:
			'Freiwillige Nachbarschaftshilfe für ältere Menschen in Kassel',
		siteName: 'OMA-NETZ Kassel',
	},
}

export const viewport: Viewport = {
	themeColor: '#7a9e7e',
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html
			lang='de'
			className={`${inter.variable} ${playfair.variable}`}
			data-scroll-behavior='smooth'
		>
			<body className='antialiased'>
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	)
}
