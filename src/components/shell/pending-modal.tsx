'use client'

import { Lock } from 'lucide-react'

interface PendingModalProps {
	onClose: () => void
}

/**
 * Modal shown when a helper tries to access a route
 * that requires admin approval first.
 */
export function PendingModal({ onClose }: PendingModalProps) {
	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'
			onClick={onClose}
		>
			<div
				className='bg-[#ffffff] rounded-2xl shadow-xl p-6 max-w-xs mx-4 text-center'
				onClick={e => e.stopPropagation()}
			>
				<div className='w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3'>
					<Lock size={22} className='text-amber-600' />
				</div>
				<h3 className='font-bold text-[#3d2b1f] text-base mb-2'>
					Warte auf Freischaltung
				</h3>
				<p className='text-sm text-[#7a6050]'>
					Dein Helfer-Profil wird noch vom Admin geprüft. Diese Funktion steht
					dir zur Verfügung, sobald du freigegeben wirst.
				</p>
				<button
					onClick={onClose}
					className='mt-4 w-full bg-[#8b5e3c] text-[#ffffff] rounded-xl py-2 text-sm font-medium hover:bg-[#6b4226] transition-colors'
				>
					Verstanden
				</button>
			</div>
		</div>
	)
}
