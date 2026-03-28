export interface ParsedRequest {
	title: string
	description: string
	category: string
	address: string
	desiredTime?: string
}

export const QUICK_SUGGESTIONS = [
	'Anfrage erstellen',
	'Wie funktioniert OMA-NETZ?',
	'Punkte erklären',
] as const

export function extractCreateRequest(text: string): {
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
