import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Oma Netz',
	description: 'Oma Netz - connecting helpers and those in need',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='de'>
			<body>{children}</body>
		</html>
	)
}
