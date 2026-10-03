/**
 * The request lifecycle, in one place.
 *
 * The status was previously assigned straight from the request body, so the
 * API accepted transitions the UI never offers: a cancelled request could be
 * completed, a completed one could be cancelled, and an open request with no
 * accepted offer could be completed. Every DONE awards POINTS_PER_HELP, so an
 * open-to-done shortcut is also a way to pay points for a request nobody
 * worked on.
 *
 * Kept free of Prisma and Next imports so the rules can be tested directly.
 */

export type RequestStatusValue = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

/** Single source for the status names, used by the badge and by the error messages. */
export const REQUEST_STATUS_LABELS: Record<RequestStatusValue, string> = {
	OPEN: 'Offen',
	IN_PROGRESS: 'In Bearbeitung',
	DONE: 'Abgeschlossen',
	CANCELLED: 'Abgebrochen',
}

export const REQUEST_TRANSITIONS: Record<
	RequestStatusValue,
	readonly RequestStatusValue[]
> = {
	// Accepting an offer is what moves a request to IN_PROGRESS, cancelling is
	// what leaves it again.
	OPEN: ['IN_PROGRESS', 'CANCELLED'],
	IN_PROGRESS: ['DONE', 'CANCELLED'],
	DONE: [],
	CANCELLED: [],
}

export function canTransition(
	from: RequestStatusValue,
	to: RequestStatusValue,
): boolean {
	return REQUEST_TRANSITIONS[from].includes(to)
}

export function isTerminal(status: RequestStatusValue): boolean {
	return REQUEST_TRANSITIONS[status].length === 0
}

/** The message to show when a transition is refused, or undefined if it is allowed. */
export function transitionError(
	from: RequestStatusValue,
	to: RequestStatusValue,
): string | undefined {
	if (canTransition(from, to)) return undefined

	const allowed = REQUEST_TRANSITIONS[from]
	if (allowed.length === 0) {
		return `Diese Anfrage ist bereits ${REQUEST_STATUS_LABELS[from].toLowerCase()} und kann nicht mehr auf "${REQUEST_STATUS_LABELS[to]}" gesetzt werden.`
	}
	const allowedLabels = allowed.map(s => REQUEST_STATUS_LABELS[s]).join(', ')
	return `Der Status kann nicht von "${REQUEST_STATUS_LABELS[from]}" auf "${REQUEST_STATUS_LABELS[to]}" geändert werden. Erlaubt ist: ${allowedLabels}.`
}