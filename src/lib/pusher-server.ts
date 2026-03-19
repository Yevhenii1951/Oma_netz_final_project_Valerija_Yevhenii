import Pusher from 'pusher'

// Server-side Pusher instance — lazy-init to avoid crashes with placeholder keys
let _pusherServer: Pusher | null = null

const PLACEHOLDER = [
	'your-pusher-key',
	'your-pusher-secret',
	'your-pusher-app-id',
	'',
	undefined,
]

export function getPusherServer(): Pusher | null {
	const key = process.env.NEXT_PUBLIC_PUSHER_KEY
	const secret = process.env.PUSHER_SECRET
	const appId = process.env.PUSHER_APP_ID
	if (
		PLACEHOLDER.includes(key) ||
		PLACEHOLDER.includes(secret) ||
		PLACEHOLDER.includes(appId)
	) {
		console.warn(
			'[Pusher Server] Missing real Pusher credentials — real-time disabled',
		)
		return null
	}
	if (!_pusherServer) {
		_pusherServer = new Pusher({
			appId: appId!,
			key: key!,
			secret: secret!,
			cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu',
			useTLS: true,
		})
	}
	return _pusherServer
}
