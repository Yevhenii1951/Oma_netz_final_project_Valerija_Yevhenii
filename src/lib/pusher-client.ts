import PusherJs from 'pusher-js'

// Client-side Pusher singleton
let pusherClient: PusherJs | null = null

const PLACEHOLDER_KEYS = ['your-pusher-key', '', undefined]

export function getPusherClient(): PusherJs | null {
	const key = process.env.NEXT_PUBLIC_PUSHER_KEY
	if (!key || PLACEHOLDER_KEYS.includes(key)) {
		console.warn(
			'[Pusher] No valid NEXT_PUBLIC_PUSHER_KEY configured — real-time disabled',
		)
		return null
	}
	if (!pusherClient) {
		pusherClient = new PusherJs(key, {
			cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu',
		})
	}
	return pusherClient
}
