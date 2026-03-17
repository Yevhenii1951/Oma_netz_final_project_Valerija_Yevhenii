'use client'

import { SessionProvider } from 'next-auth/react'

/**
 * Client-side providers wrapper.
 * Add any future providers (React Query, Theme, etc.) here.
 */
export function Providers({ children }: { children: React.ReactNode }) {
	return <SessionProvider>{children}</SessionProvider>
}
