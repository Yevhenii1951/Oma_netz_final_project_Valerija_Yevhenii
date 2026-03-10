'use client'

import * as Toast from '@radix-ui/react-toast'

export function Toaster({ children }: { children: React.ReactNode }) {
	return (
		<Toast.Provider swipeDirection="right">
			{children}
			<Toast.Viewport className="fixed bottom-0 right-0 z-[100] flex max-w-[420px] flex-col gap-2 p-6" />
		</Toast.Provider>
	)
}
