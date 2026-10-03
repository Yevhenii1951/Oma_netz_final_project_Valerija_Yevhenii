import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import type { Role } from '@/types'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

/** Sign-in attempts allowed per email and per client IP. */
const SIGN_IN_ATTEMPTS_PER_15_MIN = 10

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: 'jwt',
		// 60-minute session window; expiry is extended on active authenticated requests
		maxAge: 60 * 60,
	},
	jwt: {
		maxAge: 60 * 60,
	},

	pages: {
		signIn: '/login',
		error: '/login',
	},

	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Passwort', type: 'password' },
			},
			async authorize(credentials, request) {
				if (!credentials?.email || !credentials?.password) return null

				// Two buckets: per account (blocks password guessing on one
				// account) and per IP (blocks spraying many accounts from one
				// host). Both are needed — either alone leaves a path open.
				const email = credentials.email as string
				const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0]
				const forEmail = rateLimit(
					`signin:email:${email.toLowerCase()}`,
					SIGN_IN_ATTEMPTS_PER_15_MIN,
					15 * 60 * 1000,
				)
				const forIp = ip
					? rateLimit(`signin:ip:${ip.trim()}`, SIGN_IN_ATTEMPTS_PER_15_MIN * 4, 15 * 60 * 1000)
					: { ok: true, retryAfterSeconds: 0 }
				if (!forEmail.ok || !forIp.ok) {
					console.warn('[auth] sign-in rate limit hit', { email, ip })
					return null
				}

				const user = await prisma.user.findUnique({
					where: { email },
				})

				if (!user || !user.password) return null
				if (user.isBanned) return null

				const isValid = await bcrypt.compare(
					credentials.password as string,
					user.password,
				)

				if (!isValid) return null

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
					role: user.role,
					isBanned: user.isBanned,
					helperStatus: user.helperStatus,
				}
			},
		}),
	],

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.role = (user as { role?: Role }).role
				token.isBanned = (user as { isBanned?: boolean }).isBanned
				token.helperStatus = (
					user as { helperStatus?: string | null }
				).helperStatus
			}
			// Refresh isBanned + helperStatus from DB so admin changes take effect on next request
			const fresh = await prisma.user.findUnique({
				where: { id: token.id as string },
				select: { isBanned: true, helperStatus: true },
			})
			if (!fresh) return null
			token.isBanned = fresh.isBanned
			if (token.role === 'HELPER' && token.helperStatus !== 'APPROVED') {
				token.helperStatus = fresh.helperStatus
			}
			return token
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string
				session.user.role = token.role as Role
				session.user.isBanned = Boolean(token.isBanned)
				session.user.helperStatus = token.helperStatus as
					| string
					| null
					| undefined
			}
			return session
		},
	},
})
