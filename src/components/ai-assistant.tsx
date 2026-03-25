'use client'

import { Avatar } from '@/components/shell'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Bot,
	CheckCircle,
	Loader2,
	Mic,
	MicOff,
	Send,
	Sparkles,
	X,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ChatMessage {
	id: string
	role: 'user' | 'assistant'
	content: string
}

interface ParsedRequest {
	title: string
	description: string
	category: string
	address: string
	desiredTime?: string
}

function extractCreateRequest(text: string): {
	display: string
	request: ParsedRequest | null
} {
	const match = text.match(/<CREATE_REQUEST>([\s\S]*?)<\/CREATE_REQUEST>/)
	if (!match) return { display: text, request: null }
	try {
		const request = JSON.parse(match[1]) as ParsedRequest
		const display = text.replace(match[0], '').trim()
		return { display, request }
	} catch {
		return { display: text, request: null }
	}
}

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
			{/* Floating button */}
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

			{/* Chat panel */}
			<AnimatePresence>
				{open && <AiChatPanel onClose={closeAndCleanQuery} />}
			</AnimatePresence>
		</>
	)
}

function AiChatPanel({ onClose }: { onClose: () => void }) {
	const { data: session } = useSession()
	const router = useRouter()
	const searchParams = useSearchParams()
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
	const autoVoiceStartedRef = useRef(false)
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isListening, setIsListening] = useState(false)
	const [voiceSupported, setVoiceSupported] = useState(false)
	const [creatingRequest, setCreatingRequest] = useState(false)
	const [createdId, setCreatedId] = useState<string | null>(null)
	const [messages, setMessages] = useState<ChatMessage[]>(() => [
		{
			id: 'welcome',
			role: 'assistant',
			content: `Hallo${session?.user?.name ? ` ${session.user.name.split(' ')[0]}` : ''}! 👋 Ich bin dein OMA-NETZ Assistent. Ich helfe dir, Anfragen zu erstellen oder beantworte Fragen zur Plattform. Womit kann ich dir helfen?`,
		},
	])

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	useEffect(() => {
		const SpeechRecognition =
			window.SpeechRecognition ?? window.webkitSpeechRecognition
		setVoiceSupported(!!SpeechRecognition)
	}, [])

	const shouldAutoVoice = searchParams.get('voice') === '1'

	const sendMessage = useCallback(
		async (text: string) => {
			if (!text.trim() || isLoading) return

			const userMsg: ChatMessage = {
				id: Date.now().toString(),
				role: 'user',
				content: text,
			}
			const history = [...messages, userMsg]
			setMessages(history)
			setInput('')
			setIsLoading(true)

			// Placeholder for streaming assistant reply
			const assistantId = (Date.now() + 1).toString()
			setMessages(prev => [
				...prev,
				{ id: assistantId, role: 'assistant', content: '' },
			])

			try {
				const res = await fetch('/api/ai/chat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						messages: history.map(({ role, content }) => ({ role, content })),
					}),
				})

				if (!res.ok || !res.body) throw new Error('Fehler')

				const reader = res.body.getReader()
				const decoder = new TextDecoder()
				let accumulated = ''

				while (true) {
					const { done, value } = await reader.read()
					if (done) break
					accumulated += decoder.decode(value, { stream: true })
					setMessages(prev =>
						prev.map(m =>
							m.id === assistantId ? { ...m, content: accumulated } : m,
						),
					)
				}
			} catch {
				setMessages(prev =>
					prev.map(m =>
						m.id === assistantId
							? {
									...m,
									content:
										'Es tut mir leid, ich bin gerade nicht erreichbar. Bitte versuchen Sie es später.',
								}
							: m,
					),
				)
			} finally {
				setIsLoading(false)
			}
		},
		[messages, isLoading],
	)

	const startVoice = useCallback(() => {
		if (isListening) return
		const SpeechRecognition =
			window.SpeechRecognition ?? window.webkitSpeechRecognition
		if (!SpeechRecognition) return

		const recognition: SpeechRecognitionInstance = new SpeechRecognition()
		recognition.lang = 'de-DE'
		recognition.interimResults = true
		recognition.continuous = false
		recognitionRef.current = recognition

		let finalTranscript = ''
		recognition.onresult = (e: SpeechRecognitionEvent) => {
			let interim = ''
			for (let i = e.resultIndex; i < e.results.length; i++) {
				const t = e.results[i][0].transcript
				if (e.results[i].isFinal) finalTranscript += t
				else interim = t
			}
			setInput(finalTranscript || interim)
		}
		recognition.onerror = () => setIsListening(false)
		recognition.onend = () => {
			setIsListening(false)
			if (finalTranscript.trim()) {
				sendMessage(finalTranscript.trim())
				setInput('')
			}
		}
		recognition.start()
		setIsListening(true)
	}, [isListening, sendMessage])

	useEffect(() => {
		if (!shouldAutoVoice || !voiceSupported || autoVoiceStartedRef.current)
			return
		autoVoiceStartedRef.current = true
		startVoice()
	}, [shouldAutoVoice, voiceSupported, startVoice])

	function toggleVoice() {
		if (isListening) {
			recognitionRef.current?.stop()
			setIsListening(false)
			return
		}
		startVoice()
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		sendMessage(input)
	}

	async function handleCreateRequest(request: ParsedRequest) {
		setCreatingRequest(true)
		try {
			const res = await fetch('/api/requests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(request),
			})
			if (!res.ok) {
				const err = await res.json().catch(() => ({}))
				throw new Error(err?.error ?? 'Fehler beim Erstellen')
			}
			const json = await res.json()
			const id: string = json?.data?.id ?? json?.id
			setCreatedId(id)
			setMessages(prev => [
				...prev,
				{
					id: Date.now().toString(),
					role: 'assistant',
					content: `✅ Deine Anfrage wurde erfolgreich erstellt! Helfer können sie jetzt sehen und sich melden.`,
				},
			])
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
			setMessages(prev => [
				...prev,
				{
					id: Date.now().toString(),
					role: 'assistant',
					content: `❌ Die Anfrage konnte nicht erstellt werden: ${msg}. Bitte versuche es über die Seite "Neue Anfrage".`,
				},
			])
		} finally {
			setCreatingRequest(false)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 20, scale: 0.95 }}
			transition={{ duration: 0.25, ease: 'easeOut' }}
			className='fixed bottom-24 right-4 lg:bottom-8 lg:right-6 z-50 w-85 max-w-[calc(100vw-2rem)] flex flex-col bg-[#ffffff] rounded-3xl shadow-2xl border border-[#ddd0be] overflow-hidden'
			style={{ height: '500px', maxHeight: 'calc(100vh - 8rem)' }}
		>
			{/* Header */}
			<div className='flex items-center gap-3 px-4 py-3.5 bg-[#8b5e3c] text-[#ffffff] shrink-0'>
				<div className='w-8 h-8 rounded-full bg-[#ffffff]/20 flex items-center justify-center'>
					<Bot size={17} />
				</div>
				<div className='flex-1'>
					<p className='font-semibold text-sm leading-none'>
						OMA-NETZ Assistent
					</p>
					<p className='text-xs text-[#e8d5be] mt-0.5'>
						KI-Unterstützt · Immer verfügbar
					</p>
				</div>
				<button
					onClick={onClose}
					className='p-1.5 rounded-xl bg-[#ffffff]/10 hover:bg-[#ffffff]/20 transition-colors'
				>
					<X size={16} />
				</button>
			</div>

			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-4 space-y-3 bg-[#f5ede0]'>
				{messages.map(msg => {
					const { display, request } =
						msg.role === 'assistant'
							? extractCreateRequest(msg.content)
							: { display: msg.content, request: null }
					return (
						<div
							key={msg.id}
							className={cn(
								'flex gap-2 items-end',
								msg.role === 'user' && 'flex-row-reverse',
							)}
						>
							{msg.role === 'assistant' && (
								<div className='w-7 h-7 rounded-full bg-[#8b5e3c] flex items-center justify-center shrink-0 mb-0.5'>
									<Bot size={13} className='text-[#ffffff]' />
								</div>
							)}
							{msg.role === 'user' && (
								<Avatar
									name={session?.user?.name}
									image={session?.user?.image}
									size='xs'
									className='mb-0.5'
								/>
							)}
							<div className={cn('max-w-[80%] flex flex-col gap-2')}>
								<div
									className={cn(
										'px-3.5 py-2.5 text-sm leading-relaxed',
										msg.role === 'user' ? 'bubble-mine' : 'bubble-theirs',
									)}
								>
									{display || (
										<div className='flex gap-1 items-center'>
											<div className='w-2 h-2 bg-[#b09880] rounded-full animate-bounce [animation-delay:0ms]' />
											<div className='w-2 h-2 bg-[#b09880] rounded-full animate-bounce [animation-delay:150ms]' />
											<div className='w-2 h-2 bg-[#b09880] rounded-full animate-bounce [animation-delay:300ms]' />
										</div>
									)}
								</div>
								{request && !createdId && (
									<button
										onClick={() => handleCreateRequest(request)}
										disabled={creatingRequest}
										className='flex items-center gap-2 px-4 py-2 rounded-full bg-[#8b5e3c] text-white text-sm font-semibold hover:bg-[#6b4226] transition-colors disabled:opacity-60 self-start'
									>
										{creatingRequest ? (
											<Loader2 size={14} className='animate-spin' />
										) : (
											<CheckCircle size={14} />
										)}
										{creatingRequest
											? 'Wird erstellt…'
											: 'Anfrage jetzt erstellen'}
									</button>
								)}
								{request && createdId && (
									<button
										onClick={() => {
											onClose()
											router.push(`/requests/${createdId}`)
										}}
										className='flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors self-start'
									>
										<CheckCircle size={14} />
										Anfrage anzeigen
									</button>
								)}
							</div>
						</div>
					)
				})}
				<div ref={messagesEndRef} />
			</div>

			{/* Quick suggestions */}
			{messages.length <= 1 && (
				<div className='px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none shrink-0'>
					{[
						'Anfrage erstellen',
						'Wie funktioniert OMA-NETZ?',
						'Punkte erklären',
					].map(suggestion => (
						<button
							key={suggestion}
							onClick={() => sendMessage(suggestion)}
							className='shrink-0 text-xs bg-[#f5ede0] text-[#6b4226] rounded-full px-3 py-1.5 border border-[#e8d5be] hover:bg-[#ede3d4] transition-colors font-medium'
						>
							{suggestion}
						</button>
					))}
				</div>
			)}

			{/* Input */}
			<form
				onSubmit={handleSubmit}
				className='flex items-center gap-2 px-3 py-3 border-t border-[#ddd0be] bg-[#ffffff] shrink-0'
			>
				{voiceSupported && (
					<button
						type='button'
						onClick={toggleVoice}
						disabled={isLoading}
						title={isListening ? 'Aufnahme stoppen' : 'Sprachnachricht'}
						className={cn(
							'w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0',
							isListening
								? 'bg-red-500 text-white animate-pulse'
								: 'bg-[#ede3d4] text-[#8b5e3c] hover:bg-[#ddd0be]',
						)}
					>
						{isListening ? <MicOff size={15} /> : <Mic size={15} />}
					</button>
				)}
				<input
					value={input}
					onChange={e => setInput(e.target.value)}
					placeholder={
						isListening ? '🎙 Ich höre zu…' : 'Nachricht eingeben...'
					}
					className={cn(
						'flex-1 text-sm border rounded-full px-4 py-2.5 outline-none transition-colors',
						isListening
							? 'bg-red-50 border-red-300 focus:border-red-400'
							: 'bg-[#ede3d4] border-[#ddd0be] focus:border-[#8b5e3c] focus:bg-[#ffffff]',
					)}
					disabled={isLoading}
				/>
				<button
					type='submit'
					disabled={isLoading || !input.trim()}
					className='w-9 h-9 rounded-full bg-[#8b5e3c] text-[#ffffff] flex items-center justify-center hover:bg-[#6b4226] transition-colors disabled:opacity-50 shrink-0'
				>
					{isLoading ? (
						<Loader2 size={15} className='animate-spin' />
					) : (
						<Send size={15} />
					)}
				</button>
			</form>
		</motion.div>
	)
}
