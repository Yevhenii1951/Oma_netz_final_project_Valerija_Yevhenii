import { useToast } from '@/components/ui/toaster'

interface UseAdminClientActionsInput {
	router: { refresh: () => void }
	setLoadingId: (id: string | null) => void
	setBanLoadingId: (id: string | null) => void
	setDeleteLoadingId: (id: string | null) => void
}

export function useAdminClientActions({
	router,
	setLoadingId,
	setBanLoadingId,
	setDeleteLoadingId,
}: UseAdminClientActionsInput) {
	const { toast } = useToast()

	async function handleHelperAction(id: string, action: 'APPROVE' | 'REJECT') {
		setLoadingId(id)
		try {
			const res = await fetch(`/api/admin/helpers/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action }),
			})
			if (res.ok) {
				toast({
					title:
						action === 'APPROVE' ? 'Helfer freigegeben' : 'Helfer abgelehnt',
					variant: action === 'APPROVE' ? 'success' : 'default',
				})
			} else {
				toast({ title: 'Fehler beim Verarbeiten', variant: 'error' })
			}
			router.refresh()
		} catch {
			toast({ title: 'Netzwerkfehler', variant: 'error' })
		} finally {
			setLoadingId(null)
		}
	}

	async function handleBanToggle(
		id: string,
		isCurrentlyBanned: boolean,
		userLabel: string,
	) {
		setBanLoadingId(id)
		try {
			const res = await fetch(`/api/admin/users/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: isCurrentlyBanned ? 'UNBAN' : 'BAN' }),
			})
			if (res.ok) {
				toast({
					title: isCurrentlyBanned
						? `${userLabel} entsperrt`
						: `${userLabel} gesperrt`,
					variant: isCurrentlyBanned ? 'success' : 'default',
				})
				router.refresh()
			} else {
				const json = await res.json().catch(() => null)
				toast({
					title: json?.error ?? 'Fehler beim Sperren/Entsperren',
					variant: 'error',
				})
			}
		} catch {
			toast({ title: 'Netzwerkfehler', variant: 'error' })
		} finally {
			setBanLoadingId(null)
		}
	}

	async function handleDeleteUser(id: string, userLabel: string) {
		const confirmed = window.confirm(
			`Nutzer "${userLabel}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
		)
		if (!confirmed) return

		setDeleteLoadingId(id)
		try {
			const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
			const json = await res.json().catch(() => null)

			if (res.ok) {
				toast({
					title: json?.message ?? 'Nutzer wurde gelöscht.',
					variant: 'success',
				})
				router.refresh()
			} else {
				toast({
					title: json?.error ?? 'Fehler beim Löschen',
					variant: 'error',
				})
			}
		} catch {
			toast({ title: 'Netzwerkfehler', variant: 'error' })
		} finally {
			setDeleteLoadingId(null)
		}
	}

	return {
		handleHelperAction,
		handleBanToggle,
		handleDeleteUser,
	}
}
