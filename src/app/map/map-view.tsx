'use client'

import L from 'leaflet'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

// Fix default Leaflet icon issue with webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
	._getIconUrl
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Category emoji/color map
const CATEGORY_MAP: Record<string, { emoji: string; color: string }> = {
	EINKAUF: { emoji: '🛒', color: '#10b981' },
	ARZT: { emoji: '🏥', color: '#ef4444' },
	SPAZIERGANG: { emoji: '🌳', color: '#84cc16' },
	TECHNIK: { emoji: '💻', color: '#6366f1' },
	TRANSPORT: { emoji: '🚗', color: '#f59e0b' },
	HAUSHALT: { emoji: '🏠', color: '#ec4899' },
	ANDERES: { emoji: '💛', color: '#8b5e3c' },
}

function categoryIcon(category: string) {
	const { emoji, color } = CATEGORY_MAP[category] ?? {
		emoji: '📌',
		color: '#8b5e3c',
	}
	return L.divIcon({
		className: '',
		html: `<div style="
			width:36px;height:36px;border-radius:50%;
			background:${color};border:3px solid #fff;
			box-shadow:0 2px 8px rgba(0,0,0,0.25);
			display:flex;align-items:center;justify-content:center;
			font-size:16px;line-height:1;
		">${emoji}</div>`,
		iconSize: [36, 36],
		iconAnchor: [18, 18],
		popupAnchor: [0, -20],
	})
}

// Pulsing blue dot icon for user location
const userIcon = L.divIcon({
	className: '',
	html: `<div style="
		width:18px;height:18px;border-radius:50%;
		background:#3b82f6;border:3px solid #fff;
		box-shadow:0 0 0 4px rgba(59,130,246,0.35);
	"></div>`,
	iconSize: [18, 18],
	iconAnchor: [9, 9],
})

const KASSEL_CENTER: [number, number] = [51.3127, 9.4797]

interface MapRequest {
	id: string
	title: string
	category: string
	lat: number
	lng: number
	address?: string
	senior: { name: string | null }
}

interface UserPos {
	lat: number
	lng: number
}

// Inner component: fly-to button
function FlyToUser({ pos }: { pos: UserPos | null }) {
	const map = useMap()
	if (!pos) return null
	return (
		<button
			onClick={() => map.flyTo([pos.lat, pos.lng], 15, { duration: 1.2 })}
			className='absolute bottom-4 right-4 z-999 bg-white rounded-xl shadow-md px-3 py-2 text-sm font-medium text-[#3d2b1f] flex items-center gap-2 hover:bg-[#f5ede0] transition-colors border border-[#ddd0be]'
		>
			📍 Mein Standort
		</button>
	)
}

export default function MapView() {
	const [requests, setRequests] = useState<MapRequest[]>([])
	const [loading, setLoading] = useState(true)
	const [userPos, setUserPos] = useState<UserPos | null>(null)
	const [locError, setLocError] = useState<string>(() =>
		typeof navigator !== 'undefined' && !navigator.geolocation
			? 'Geolocation nicht unterstützt'
			: '',
	)
	const mapRef = useRef<L.Map | null>(null)

	// Load requests
	useEffect(() => {
		fetch('/api/map')
			.then(r => r.json())
			.then(json => {
				const items = Array.isArray(json) ? json : (json.data ?? [])
				setRequests(
					items.filter((r: MapRequest) => r.lat != null && r.lng != null),
				)
			})
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [])

	// Request user geolocation
	useEffect(() => {
		if (!navigator.geolocation) return
		navigator.geolocation.getCurrentPosition(
			pos => {
				const { latitude, longitude } = pos.coords
				setUserPos({ lat: latitude, lng: longitude })
				// Fly to user position on load
				mapRef.current?.flyTo([latitude, longitude], 14, { duration: 1.5 })
			},
			() => setLocError('Standort nicht verfügbar'),
			{ timeout: 8000 },
		)
	}, [])

	// Load leaflet CSS from CDN
	useEffect(() => {
		if (document.querySelector('link[href*="leaflet"]')) return
		const link = document.createElement('link')
		link.rel = 'stylesheet'
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
		document.head.appendChild(link)
	}, [])

	return (
		<div className='space-y-2'>
			<div className='flex items-center gap-4 px-1 text-xs text-[#7a6050]'>
				<span className='flex items-center gap-1.5 font-medium'>
					📍 <span className='text-[#3d2b1f] font-bold'>{requests.length}</span>{' '}
					offene Anfragen
				</span>
				<span className='flex items-center gap-2 flex-wrap'>
					{Object.entries(CATEGORY_MAP).map(([cat, { emoji, color }]) => {
						const cnt = requests.filter(r => r.category === cat).length
						if (cnt === 0) return null
						return (
							<span key={cat} className='flex items-center gap-0.5'>
								<span
									className='inline-flex w-4 h-4 rounded-full border-2 border-white items-center justify-center text-[9px]'
									style={{ background: color }}
								>
									{emoji}
								</span>
								<span>{cnt}</span>
							</span>
						)
					})}
				</span>
				{userPos && (
					<span className='flex items-center gap-1.5'>
						<span className='w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow' />
						Mein Standort
					</span>
				)}
				{locError && <span className='text-amber-600'>⚠ {locError}</span>}
			</div>

			<div
				className='relative rounded-3xl overflow-hidden shadow-md'
				style={{ height: '65vh' }}
			>
				{loading && (
					<div className='absolute inset-0 bg-[#ede3d4] flex items-center justify-center z-10 text-[#b09880] text-sm'>
						Lade Anfragen…
					</div>
				)}
				<MapContainer
					center={KASSEL_CENTER}
					zoom={13}
					className='w-full h-full z-0'
					style={{ height: '100%' }}
					ref={mapRef}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
						url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					/>

					{/* Request markers */}
					{requests.map(req => (
						<Marker
							key={req.id}
							position={[req.lat, req.lng]}
							icon={categoryIcon(req.category)}
						>
							<Popup>
								<div className='text-sm min-w-47.5 space-y-1.5'>
									<p className='font-bold text-[#3d2b1f] leading-tight'>
										{CATEGORY_MAP[req.category]?.emoji ?? '📌'} {req.title}
									</p>
									{req.address && (
										<p className='text-[#7a6050] text-xs flex items-center gap-1'>
											📍 {req.address}
										</p>
									)}
									<p className='text-[#b09880] text-xs'>👤 {req.senior.name}</p>
									<Link
										href={`/requests/${req.id}`}
										className='inline-block mt-1 bg-[#8b5e3c] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#6b4226] transition-colors'
									>
										Anfrage ansehen →
									</Link>
								</div>
							</Popup>
						</Marker>
					))}

					{/* User location marker */}
					{userPos && (
						<Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
							<Popup>
								<p className='text-sm font-semibold text-blue-600'>
									📍 Mein Standort
								</p>
							</Popup>
						</Marker>
					)}

					{/* Fly-to button inside map */}
					<FlyToUser pos={userPos} />
				</MapContainer>
			</div>
		</div>
	)
}
