import type { Role } from '@/types'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			role: Role
			isBanned: boolean
			helperStatus?: string | null
		} & DefaultSession['user']
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id?: string
		role?: Role
		isBanned?: boolean
		helperStatus?: string | null
	}
}
