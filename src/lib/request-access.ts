/**
 * Who may see which part of a help request.
 *
 * A Request carries the home address, postcode and exact coordinates of an
 * elderly resident, plus the phone number of that person. That is the most
 * sensitive data the app holds, so it is not treated as "any logged-in user".
 * The rule applied throughout:
 *
 *   full     → the request owner (seniorId), any admin, and the helper whose
 *              offer was accepted. These are the people who need to know
 *              where the errand is actually done, and the address is on screen
 *              for the dashboard and the chat between them.
 *   summary  → an admin-approved helper browsing an open request. They see the
 *              job, its author and the district, but not the street, the
 *              coordinates or the phone number. Once the senior accepts their
 *              offer the view upgrades to `full`, which is the point at which
 *              they need the address.
 *
 * Anything else is refused. Owner's own requests always win over the status of
 * the request, so a senior can still read their finished or cancelled ones.
 *
 * The district (`plz`) is deliberately kept in the summary: a helper cannot
 * decide whether to drive across Kassel for a job without it, and the map
 * already places pins on a ~1.1 km grid. The vetting of helper profiles by an
 * admin, not the postal code, is what keeps the list behind the approved
 * helpers in the first place.
 */

import type { Role } from '@/types'

export type Viewer = {
	id: string
	role: Role
	helperStatus?: string | null
}

export type RequestVisibility = 'full' | 'summary'

/** The viewer may only browse jobs if the admin has approved them as a helper. */
export function isApprovedHelper(viewer: Viewer): boolean {
	return viewer.role === 'HELPER' && viewer.helperStatus === 'APPROVED'
}

/**
 * 403 body for the browse endpoints. Seniors and relatives are not helpers
 * waiting for a review, so telling them their helper profile is being checked
 * would be plainly wrong.
 */
export function browseForbidden(viewer: Viewer): string {
	return viewer.role === 'HELPER'
		? 'Dein Helfer-Profil wird noch geprüft.'
		: 'Nur freigegebene Helfer können offene Anfragen sehen.'
}

/** Fields stripped from a `summary` response. */
export type RequestPublicShape = {
	address?: string | null
	plz?: string | null
	lat?: number | null
	lng?: number | null
}

/**
 * Decide what a viewer may see of a request.
 *
 * @param acceptedHelperId helper whose offer the senior accepted, if any
 */
export function requestVisibility(
	viewer: Viewer,
	request: { seniorId: string; status: string },
	acceptedHelperId?: string | null,
): RequestVisibility | null {
	if (viewer.role === 'ADMIN') return 'full'
	if (request.seniorId === viewer.id) return 'full'
	if (acceptedHelperId && acceptedHelperId === viewer.id) return 'full'
	// A finished or cancelled request is private to the people involved.
	if (request.status !== 'OPEN') return null
	if (isApprovedHelper(viewer)) return 'summary'
	return null
}

/**
 * Remove the street, the coordinates and the resident's phone number from a
 * response when the viewer only gets a summary. `plz` stays on purpose, see
 * the note at the top of this file. Returns the same shape as the input so
 * callers do not branch on which keys are present.
 */
export function redactRequest<T extends RequestPublicShape>(request: T): T {
	return {
		...request,
		address: null,
		lat: null,
		lng: null,
	}
}

/**
 * Round coordinates to ~1.1 km (2 decimals) for map pins shown to browsing
 * helpers. A pin that lands exactly on a front door turns "there is a job in
 * this district" into "this is where they live", and the map popup still
 * shows the district after the accepted helper opens the request.
 */
export function coarsenCoordinates(lat: number, lng: number) {
	return {
		lat: Math.round(lat * 100) / 100,
		lng: Math.round(lng * 100) / 100,
	}
}