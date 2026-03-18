/**
 * Minimal type declarations for the Web Speech API (SpeechRecognition).
 * This API lacks official TypeScript definitions, so we declare the minimum
 * interface needed to avoid `any` casts in ai-assistant.tsx.
 *
 * Spec: https://wicg.github.io/speech-api/
 */

interface SpeechRecognitionEvent extends Event {
	readonly resultIndex: number
	readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
	readonly length: number
	item(index: number): SpeechRecognitionResult
	[index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
	readonly length: number
	readonly isFinal: boolean
	item(index: number): SpeechRecognitionAlternative
	[index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
	readonly transcript: string
	readonly confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
	readonly error: string
	readonly message: string
}

interface SpeechRecognitionInstance extends EventTarget {
	continuous: boolean
	interimResults: boolean
	lang: string
	onresult: ((event: SpeechRecognitionEvent) => void) | null
	onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
	onend: (() => void) | null
	start(): void
	stop(): void
	abort(): void
}

interface SpeechRecognitionConstructor {
	new (): SpeechRecognitionInstance
}

interface Window {
	SpeechRecognition?: SpeechRecognitionConstructor
	webkitSpeechRecognition?: SpeechRecognitionConstructor
}
