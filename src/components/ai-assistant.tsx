'use client'

import { AiChatPanel } from '@/components/ai-chat-panel'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function AiAssistantButton() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const openFromQuery = searchParams.get('openAi') === '1'
	const [open, setOpen] = useState(openFromQuery)

	useEffect(() => {
		setOpen(openFromQuery)
	}, [openFromQuery])

	function closeAndCleanQuery() {
		setOpen(false)
		if (!openFromQuery) return
		const params = new URLSearchParams(searchParams.toString())
		params.delete('openAi')
		params.delete('voice')
		const next = params.toString()
		router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
	}

	return (
		<>
			<motion.button
				onClick={() => setOpen(true)}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				className={cn(
					'fixed bottom-24 right-4 lg:bottom-8 lg:right-6 z-50',
					'w-14 h-14 rounded-full bg-[#8b5e3c] text-[#ffffff] shadow-xl shadow-[#e8d5be]',
					'flex items-center justify-center',
					open && 'hidden',
				)}
				title='KI-Assistent öffnen'
			>
				<Sparkles size={22} />
				<span className='absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#ffffff]' />
			</motion.button>

			<AnimatePresence>
				{open && <AiChatPanel onClose={closeAndCleanQuery} />}
			</AnimatePresence>
		</>
	)
}
