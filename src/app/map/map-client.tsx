'use client'

import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('./map-view'), {
	ssr: false,
	loading: () => (
		<div className='h-[60vh] rounded-3xl bg-[#ede3d4] flex items-center justify-center text-[#b09880] text-sm animate-pulse'>
			Karte wird geladen…
		</div>
	),
})

export default function MapClient() {
	return <MapView />
}
