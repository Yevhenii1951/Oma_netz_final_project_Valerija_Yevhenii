'use client'

import { Avatar } from '@/components/shell'
import { useToast } from '@/components/ui/toaster'
import { getPusherClient } from '@/lib/pusher-client'
import { cn, formatRelativeTime } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Message {
	id: string
	content: string
	senderId: string
	createdAt: string
	sender: { id: string; name: string | null; image: string | null }
}

interface Chat {
	requestId: string
	messages: Message[]
	request: {
		title: string
		senior: { name: string | null }
	}
}

interface Props {
	chat: Chat
	currentUserId: string
	currentUserName: string
}

export default function ChatRoomClient({
	chat,
	currentUserId,
	currentUserName,
}: Props) {
	const router = useRouter()
	const { toast } = useToast()
	const [messages, setMessages] = useState<Message[]>(chat.messages)
	const [input, setInput] = useState('')
	const [isSending, setIsSending] = useState(false)
	const bottomRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	// Auto-scroll
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// Pusher subscription + polling fallback
	useEffect(() => {
		const client = getPusherClient()
		if (client) {
			const channel = client.subscribe(`chat-${chat.requestId}`)
			channel.bind('new-message', (data: Message) => {
				if (data.senderId !== currentUserId) {
					setMessages(prev => [...prev, data])
				}
			})
			return () => {
				client.unsubscribe(`chat-${chat.requestId}`)
			}
		}

		// Fallback: poll for new messages every 3 seconds
		const interval = setInterval(async () => {
			try {
				const res = await fetch(`/api/chat/${chat.requestId}/messages`)
				if (res.ok) {
					const json = await res.json()
					const freshMessages: Message[] = json.data?.messages ?? []
					if (freshMessages.length > 0) {
						setMessages(freshMessages)
					}
				}
			} catch {}
		}, 3000)
		return () => clearInterval(interval)
	}, [chat.requestId, currentUserId])

	async function sendMessage() {
		if (!input.trim()) return
		const content = input.trim()
		setInput('')
		setIsSending(true)

		const optimistic: Message = {
			id: `opt-${Date.now()}`,
			content,
			senderId: currentUserId,
			createdAt: new Date().toISOString(),
			sender: { id: currentUserId, name: currentUserName, image: null },
		}
		setMessages(prev => [...prev, optimistic])

		try {
			const res = await fetch(`/api/chat/${chat.requestId}/messages`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content }),
			})
			const json = await res.json()
			if (res.ok) {
				const saved: Message = json.data
				setMessages(prev => prev.map(m => (m.id === optimistic.id ? saved : m)))
			}
		} catch {
			setMessages(prev => prev.filter(m => m.id !== optimistic.id))
			toast({
				title: 'Nachricht nicht gesendet',
				description: 'Bitte erneut versuchen.',
				variant: 'error',
			})
		} finally {
			setIsSending(false)
			inputRef.current?.focus()
		}
	}

	function handleKey(e: React.KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			sendMessage()
		}
	}

	return (
		<div className='flex flex-col h-screen bg-[#ede3d4]'>
			{/* Header */}
			<div className='bg-[#ffffff] border-b border-[#ddd0be] px-4 py-3 flex items-center gap-3 sticky top-0 z-10'>
				<button
					onClick={() => router.back()}
					className='p-1.5 rounded-full hover:bg-[#ede3d4] transition'
				>
					<ArrowLeft className='w-5 h-5 text-[#7a6050]' />
				</button>
				<Avatar name={chat.request.senior.name || ''} size='sm' />
				<div className='flex-1 min-w-0'>
					<p className='font-semibold text-[#3d2b1f] text-sm truncate'>
						{chat.request.title}
					</p>
					<p className='text-xs text-[#b09880]'>{chat.request.senior.name}</p>
				</div>
			</div>

			{/* Messages */}
			<div className='flex-1 overflow-y-auto px-4 py-4 space-y-2'>
				{messages.length === 0 && (
					<p className='text-center text-[#b09880] text-sm mt-8'>
						Schreiben Sie die erste Nachricht! 👋
					</p>
				)}
				{messages.map(msg => {
					const isMine = msg.senderId === currentUserId
					return (
						<motion.div
							key={msg.id}
							initial={{ opacity: 0, y: 8, scale: 0.97 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							className={cn(
								'flex items-end gap-2',
								isMine ? 'flex-row-reverse' : 'flex-row',
							)}
						>
							{!isMine && <Avatar name={msg.sender?.name || ''} size='xs' />}
							<div
								className={cn(
									'max-w-[75%] space-y-0.5',
									isMine ? 'items-end' : 'items-start',
									'flex flex-col',
								)}
							>
								<div className={isMine ? 'bubble-mine' : 'bubble-theirs'}>
									{msg.content}
								</div>
								<span className='text-[10px] text-[#b09880] px-1'>
									{formatRelativeTime(msg.createdAt)}
								</span>
							</div>
						</motion.div>
					)
				})}
				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<div className='bg-[#ffffff] border-t border-[#ddd0be] px-4 py-3 flex items-center gap-2 sticky bottom-0'>
				<input
					ref={inputRef}
					type='text'
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={handleKey}
					placeholder='Nachricht schreiben…'
					className='flex-1 bg-[#ede3d4] rounded-2xl px-4 py-2.5 text-sm text-[#3d2b1f] outline-none focus:ring-2 ring-[#c8956c] transition'
				/>
				<button
					onClick={sendMessage}
					disabled={!input.trim() || isSending}
					className='w-10 h-10 bg-[#8b5e3c] text-[#ffffff] rounded-full flex items-center justify-center hover:bg-[#6b4226] transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0'
				>
					{isSending ? (
						<Loader2 className='w-4 h-4 animate-spin' />
					) : (
						<Send className='w-4 h-4' />
					)}
				</button>
			</div>
		</div>
	)
}
