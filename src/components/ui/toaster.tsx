'use client'

import { cn } from '@/lib/utils'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import * as React from 'react'

export const ToastProvider = ToastPrimitives.Provider
export const ToastViewport = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Viewport>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(
			'fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:max-w-sm',
			className,
		)}
		{...props}
	/>
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

interface ToastProps extends React.ComponentPropsWithoutRef<
	typeof ToastPrimitives.Root
> {
	variant?: 'default' | 'success' | 'error'
}

export const Toast = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Root>,
	ToastProps
>(({ className, variant = 'default', ...props }, ref) => {
	const variantClasses = {
		default: 'border bg-[#ffffff] text-[#3d2b1f]',
		success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
		error: 'border-red-200 bg-red-50 text-red-900',
	}
	return (
		<ToastPrimitives.Root
			ref={ref}
			className={cn(
				'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border p-4 shadow-lg',
				'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)',
				'data-[state=open]:animate-slide-up data-[state=closed]:opacity-0',
				variantClasses[variant],
				className,
			)}
			{...props}
		/>
	)
})
Toast.displayName = ToastPrimitives.Root.displayName

export const ToastAction = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Action>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(
			'shrink-0 rounded-xl border px-3 py-1.5 text-sm font-medium',
			className,
		)}
		{...props}
	/>
))
ToastAction.displayName = ToastPrimitives.Action.displayName

export const ToastClose = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Close>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		className={cn('rounded-full p-1 opacity-50 hover:opacity-100', className)}
		{...props}
	>
		<X size={14} />
	</ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

export const ToastTitle = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Title>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Title
		ref={ref}
		className={cn('text-sm font-semibold', className)}
		{...props}
	/>
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

export const ToastDescription = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Description>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Description
		ref={ref}
		className={cn('text-sm opacity-90', className)}
		{...props}
	/>
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// ─── HOOK + CONTEXT ──────────────────────────────────────────────────────────

interface ToastItem {
	id: string
	title?: string
	description?: string
	variant?: 'default' | 'success' | 'error'
	duration?: number
}

const ToastContext = React.createContext<{
	toast: (opts: Omit<ToastItem, 'id'>) => void
}>({ toast: () => {} })

export function Toaster({ children }: { children?: React.ReactNode }) {
	const [toasts, setToasts] = React.useState<ToastItem[]>([])

	const addToast = React.useCallback((opts: Omit<ToastItem, 'id'>) => {
		setToasts(prev => [
			...prev,
			{ ...opts, id: Math.random().toString(36).slice(2) },
		])
	}, [])

	return (
		<ToastContext.Provider value={{ toast: addToast }}>
			{children}
			<ToastProvider>
				{toasts.map(({ id, title, description, variant, duration = 4000 }) => (
					<Toast
						key={id}
						variant={variant}
						duration={duration}
						onOpenChange={open =>
							!open && setToasts(p => p.filter(t => t.id !== id))
						}
					>
						<div className='flex flex-col gap-0.5'>
							{title && <ToastTitle>{title}</ToastTitle>}
							{description && (
								<ToastDescription>{description}</ToastDescription>
							)}
						</div>
						<ToastClose />
					</Toast>
				))}
				<ToastViewport />
			</ToastProvider>
		</ToastContext.Provider>
	)
}

export function useToast() {
	return React.useContext(ToastContext)
}
