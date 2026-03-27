import { extractCreateRequest, QUICK_SUGGESTIONS } from '@/components/ai-assistant-utils'
import type { ChatMessage } from '@/components/ai-assistant-types'
import { Avatar } from '@/components/shell'
import { cn } from '@/lib/utils'
import { Bot, CheckCircle, Loader2, Mic, MicOff, Send, X } from 'lucide-react'
import type { Session } from 'next-auth'

interface ChatHeaderProps {
	onClose: () => void
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
	return (
		<div className='flex items-center gap-3 px-4 py-3.5 bg-[#8b5e3c] text-[#ffffff] shrink-0'>
			<div className='w-8 h-8 rounded-full bg-[#ffffff]/20 flex items-center justify-center'>
				<Bot size={17} />
			</div>
			<div className='flex-1'>
				<p className='font-semibold text-sm leading-none'>OMA-NETZ Assistent</p>
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
	)
}

interface MessagesListProps {
	messages: ChatMessage[]
	session: Session | null
	createdId: string | null
	creatingRequest: boolean
	onCreateRequest: (messageId: string) => void
	onOpenCreatedRequest: () => void
	messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export function MessagesList({
	messages,
	session,
	createdId,
	creatingRequest,
	onCreateRequest,
	onOpenCreatedRequest,
	messagesEndRef,
}: MessagesListProps) {
	return (
		<div className='flex-1 overflow-y-auto p-4 space-y-3 bg-[#f5ede0]'>
			{messages.map(msg => (
				<MessageRow
					key={msg.id}
					message={msg}
					session={session}
					createdId={createdId}
					creatingRequest={creatingRequest}
					onCreateRequest={() => onCreateRequest(msg.id)}
					onOpenCreatedRequest={onOpenCreatedRequest}
				/>
			))}
			<div ref={messagesEndRef} />
		</div>
	)
}

interface MessageRowProps {
	message: ChatMessage
	session: Session | null
	createdId: string | null
	creatingRequest: boolean
	onCreateRequest: () => void
	onOpenCreatedRequest: () => void
}

function MessageRow({
	message,
	session,
	createdId,
	creatingRequest,
	onCreateRequest,
	onOpenCreatedRequest,
}: MessageRowProps) {
	const parsed =
		message.role === 'assistant'
			? parseAssistantMessage(message.content)
			: { display: message.content, request: null }

	return (
		<div
			className={cn(
				'flex gap-2 items-end',
				message.role === 'user' && 'flex-row-reverse',
			)}
		>
			{message.role === 'assistant' && (
				<div className='w-7 h-7 rounded-full bg-[#8b5e3c] flex items-center justify-center shrink-0 mb-0.5'>
					<Bot size={13} className='text-[#ffffff]' />
				</div>
			)}
			{message.role === 'user' && (
				<Avatar
					name={session?.user?.name}
					image={session?.user?.image}
					size='xs'
					className='mb-0.5'
				/>
			)}
			<div className='max-w-[80%] flex flex-col gap-2'>
				<div
					className={cn(
						'px-3.5 py-2.5 text-sm leading-relaxed',
						message.role === 'user' ? 'bubble-mine' : 'bubble-theirs',
					)}
				>
					{parsed.display || <TypingDots />}
				</div>
				{parsed.request && !createdId && (
					<button
						onClick={onCreateRequest}
						disabled={creatingRequest}
						className='flex items-center gap-2 px-4 py-2 rounded-full bg-[#8b5e3c] text-white text-sm font-semibold hover:bg-[#6b4226] transition-colors disabled:opacity-60 self-start'
					>
						{creatingRequest ? (
							<Loader2 size={14} className='animate-spin' />
						) : (
							<CheckCircle size={14} />
						)}
						{creatingRequest ? 'Wird erstellt…' : 'Anfrage jetzt erstellen'}
					</button>
				)}
				{parsed.request && createdId && (
					<button
						onClick={onOpenCreatedRequest}
						className='flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors self-start'
					>
						<CheckCircle size={14} />
						Anfrage anzeigen
					</button>
				)}
			</div>
		</div>
	)
}

function parseAssistantMessage(content: string) {
	return extractCreateRequest(content)
}

function TypingDots() {
	return (
		<div className='flex gap-1 items-center'>
			<div className='w-2 h-2 bg-[#b09880] rounded-full animate-bounce [animation-delay:0ms]' />
			<div className='w-2 h-2 bg-[#b09880] rounded-full animate-bounce [animation-delay:150ms]' />
			<div className='w-2 h-2 bg-[#b09880] rounded-full animate-bounce [animation-delay:300ms]' />
		</div>
	)
}

interface QuickSuggestionsProps {
	visible: boolean
	onSelect: (value: string) => void
}

export function QuickSuggestions({ visible, onSelect }: QuickSuggestionsProps) {
	if (!visible) {
		return null
	}

	return (
		<div className='px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none shrink-0'>
			{QUICK_SUGGESTIONS.map(suggestion => (
				<button
					key={suggestion}
					onClick={() => onSelect(suggestion)}
					className='shrink-0 text-xs bg-[#f5ede0] text-[#6b4226] rounded-full px-3 py-1.5 border border-[#e8d5be] hover:bg-[#ede3d4] transition-colors font-medium'
				>
					{suggestion}
				</button>
			))}
		</div>
	)
}

interface ChatInputProps {
	voiceSupported: boolean
	isListening: boolean
	isLoading: boolean
	input: string
	onInputChange: (value: string) => void
	onSubmit: (e: React.FormEvent) => void
	onToggleVoice: () => void
}

export function ChatInput({
	voiceSupported,
	isListening,
	isLoading,
	input,
	onInputChange,
	onSubmit,
	onToggleVoice,
}: ChatInputProps) {
	return (
		<form
			onSubmit={onSubmit}
			className='flex items-center gap-2 px-3 py-3 border-t border-[#ddd0be] bg-[#ffffff] shrink-0'
		>
			{voiceSupported && (
				<button
					type='button'
					onClick={onToggleVoice}
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
				onChange={e => onInputChange(e.target.value)}
				placeholder={isListening ? '🎙 Ich höre zu…' : 'Nachricht eingeben...'}
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
	)
}
