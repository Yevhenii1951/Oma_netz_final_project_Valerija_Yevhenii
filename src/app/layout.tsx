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
	// Without this, every relative URL Next.js builds (sitemap entries, Open
	// Graph images, canonical) resolves against localhost. Same variable the
	// mails use, so the address in a mail and the one in a search result cannot
	// drift apart.
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
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
	appleWebApp: {
		capable: true,
		title: 'OMA-NETZ',
		statusBarStyle: 'default',
	},
	icons: {
		icon: [
			{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
		],
		apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
	},
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
			suppressHydrationWarning
		>
			<body className='antialiased' suppressHydrationWarning>
				<Providers>
					<Toaster>{children}</Toaster>
				</Providers>
			</body>
		</html>
	)
}
