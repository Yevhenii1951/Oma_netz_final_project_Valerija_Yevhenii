import { prisma } from '@/lib/prisma'
import type { Role } from '@/types'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	session: { strategy: 'jwt' },

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
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null

				const user = await prisma.user.findUnique({
					where: { email: credentials.email as string },
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
				token.helperStatus = (
					user as { helperStatus?: string | null }
				).helperStatus
			}
			// Refresh helperStatus from DB when not yet approved (so admin changes take effect instantly)
			if (token.role === 'HELPER' && token.helperStatus !== 'APPROVED') {
				const fresh = await prisma.user.findUnique({
					where: { id: token.id as string },
					select: { helperStatus: true },
				})
				if (fresh) token.helperStatus = fresh.helperStatus
			}
			return token
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string
				session.user.role = token.role as Role
				session.user.helperStatus = token.helperStatus as
					| string
					| null
					| undefined
			}
			return session
		},
	},
})
