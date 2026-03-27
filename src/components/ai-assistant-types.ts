import type { ParsedRequest } from '@/components/ai-assistant-utils'

export interface ChatMessage {
	id: string
	role: 'user' | 'assistant'
	content: string
}

export interface ParsedAssistantMessage {
	display: string
	request: ParsedRequest | null
}
