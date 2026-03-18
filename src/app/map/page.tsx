import { auth } from '@/auth'
import { PageShell } from '@/components/shell/page-shell'
import { redirect } from 'next/navigation'
import MapClient from './map-client'

export default async function MapPage() {
	const session = await auth()
	if (!session) redirect('/login')
	return (
		<PageShell title='Karte'>
			<p className='text-[#7a6050] text-sm mb-4'>
				Offene Hilfsanfragen in Kassel
			</p>
			<MapClient />
		</PageShell>
	)
}
