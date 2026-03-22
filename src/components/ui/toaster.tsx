'use client'

import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
	return <SonnerToaster richColors position='bottom-right' duration={4000} />
}

export function useToast() {
	return { toast: sonnerToast }
}
