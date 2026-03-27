'use client'

import type { ChatMessage } from '@/components/ai-assistant-types'
import { extractCreateRequest } from '@/components/ai-assistant-utils'
import {
	ChatHeader,
	ChatInput,
	MessagesList,
	QuickSuggestions,
} from '@/components/ai-chat-components'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

interface AiChatPanelProps {
	onClose: () => void
}

export function AiChatPanel({ onClose }: AiChatPanelProps) {
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

	async function handleCreateRequest(messageId: string) {
		const message = messages.find(m => m.id === messageId)
		if (!message || message.role !== 'assistant') {
			return
		}

		const { request } = extractCreateRequest(message.content)
		if (!request) {
			return
		}

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
					content:
						'✅ Deine Anfrage wurde erfolgreich erstellt! Helfer können sie jetzt sehen und sich melden.',
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
			<ChatHeader onClose={onClose} />
			<MessagesList
				messages={messages}
				session={session ?? null}
				createdId={createdId}
				creatingRequest={creatingRequest}
				onCreateRequest={handleCreateRequest}
				onOpenCreatedRequest={() => {
					onClose()
					if (createdId) {
						router.push(`/requests/${createdId}`)
					}
				}}
				messagesEndRef={messagesEndRef}
			/>
			<QuickSuggestions visible={messages.length <= 1} onSelect={sendMessage} />
			<ChatInput
				voiceSupported={voiceSupported}
				isListening={isListening}
				isLoading={isLoading}
				input={input}
				onInputChange={setInput}
				onSubmit={handleSubmit}
				onToggleVoice={toggleVoice}
			/>
		</motion.div>
	)
}
