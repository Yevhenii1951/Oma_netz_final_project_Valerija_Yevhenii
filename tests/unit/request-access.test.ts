import { describe, expect, it } from 'vitest'

import {
	browseForbidden,
	coarsenCoordinates,
	isApprovedHelper,
	redactRequest,
	requestVisibility,
	type Viewer,
} from '@/lib/request-access'

const OWNER = 'senior-owner'
const CHOSEN_HELPER = 'helper-chosen'
const OTHER_HELPER = 'helper-other'
const PENDING_HELPER = 'helper-pending'
const OTHER_SENIOR = 'senior-other'
const ADMIN = 'admin'

const owner: Viewer = { id: OWNER, role: 'SENIOR' }
const chosenHelper: Viewer = {
	id: CHOSEN_HELPER,
	role: 'HELPER',
	helperStatus: 'APPROVED',
}
const otherHelper: Viewer = {
	id: OTHER_HELPER,
	role: 'HELPER',
	helperStatus: 'APPROVED',
}
const pendingHelper: Viewer = {
	id: PENDING_HELPER,
	role: 'HELPER',
	helperStatus: 'PENDING_REVIEW',
}
const otherSenior: Viewer = { id: OTHER_SENIOR, role: 'SENIOR' }
const relative: Viewer = { id: OTHER_SENIOR, role: 'RELATIVE' }
const admin: Viewer = { id: ADMIN, role: 'ADMIN' }

const open = { seniorId: OWNER, status: 'OPEN' }
const inProgress = { seniorId: OWNER, status: 'IN_PROGRESS' }
const done = { seniorId: OWNER, status: 'DONE' }
const cancelled = { seniorId: OWNER, status: 'CANCELLED' }

describe('requestVisibility', () => {
	it('gives the owner the full record whatever the status is', () => {
		for (const status of [open, inProgress, done, cancelled]) {
			expect(requestVisibility(owner, status, null)).toBe('full')
		}
	})

	it('gives an admin the full record without being a participant', () => {
		expect(requestVisibility(admin, done, null)).toBe('full')
		expect(requestVisibility(admin, cancelled, CHOSEN_HELPER)).toBe('full')
	})

	it('gives the accepted helper the full record', () => {
		expect(requestVisibility(chosenHelper, open, CHOSEN_HELPER)).toBe('full')
		expect(requestVisibility(chosenHelper, done, CHOSEN_HELPER)).toBe('full')
	})

	it('lets an approved helper browse an open request as a summary', () => {
		expect(requestVisibility(otherHelper, open, CHOSEN_HELPER)).toBe('summary')
	})

	it('hides a finished or cancelled request from other helpers', () => {
		expect(requestVisibility(otherHelper, done, CHOSEN_HELPER)).toBeNull()
		expect(requestVisibility(otherHelper, cancelled, CHOSEN_HELPER)).toBeNull()
	})

	it('refuses a helper who is not approved', () => {
		expect(requestVisibility(pendingHelper, open, null)).toBeNull()
	})

	it('refuses a helper who was rejected', () => {
		const rejected: Viewer = {
			id: OTHER_HELPER,
			role: 'HELPER',
			helperStatus: 'REJECTED',
		}
		expect(requestVisibility(rejected, open, null)).toBeNull()
	})

	it('refuses a senior reading someone else, in every status', () => {
		for (const status of [open, inProgress, done, cancelled]) {
			expect(requestVisibility(otherSenior, status, null)).toBeNull()
			expect(requestVisibility(relative, status, null)).toBeNull()
		}
	})

	it('never gives full to a helper who is not the accepted one', () => {
		// Two helpers applied. Only the one the senior picked may see the
		// address, so the other must stay on the summary view even while the
		// request is still open.
		expect(requestVisibility(chosenHelper, open, OTHER_HELPER)).toBe('summary')
		expect(requestVisibility(otherHelper, open, CHOSEN_HELPER)).toBe('summary')
	})
})

describe('isApprovedHelper', () => {
	it('only accepts a helper with APPROVED status', () => {
		expect(isApprovedHelper(chosenHelper)).toBe(true)
		expect(isApprovedHelper(pendingHelper)).toBe(false)
	})

	it('rejects every other role, even with a missing status', () => {
		expect(isApprovedHelper(owner)).toBe(false)
		expect(isApprovedHelper(relative)).toBe(false)
		expect(isApprovedHelper(admin)).toBe(false)
	})
})

describe('browseForbidden', () => {
	it('tells an unvetted helper their profile is in review', () => {
		expect(browseForbidden(pendingHelper)).toBe(
			'Dein Helfer-Profil wird noch geprüft.',
		)
	})

	it('does not blame a senior for a profile they do not have', () => {
		expect(browseForbidden(owner)).toBe(
			'Nur freigegebene Helfer können offene Anfragen sehen.',
		)
		expect(browseForbidden(relative)).toBe(
			'Nur freigegebene Helfer können offene Anfragen sehen.',
		)
	})
})

describe('redactRequest', () => {
	it('drops the street and the coordinates but keeps the district', () => {
		expect(
			redactRequest({
				address: 'Kölnische Str 44',
				plz: '34117',
				lat: 51.313,
				lng: 9.497,
			}),
		).toEqual({ address: null, plz: '34117', lat: null, lng: null })
	})

	it('leaves the rest of the record untouched', () => {
		expect(
			redactRequest({
				address: 'Kölnische Str 44',
				plz: '34117',
				lat: 51.313,
				lng: 9.497,
				title: 'Begleitung zum Hausarzt',
				status: 'OPEN',
			}),
		).toMatchObject({ title: 'Begleitung zum Hausarzt', status: 'OPEN' })
	})
})

describe('coarsenCoordinates', () => {
	it('moves a pin off the front door', () => {
		expect(coarsenCoordinates(51.31267, 9.48721)).toEqual({
			lat: 51.31,
			lng: 9.49,
		})
	})

	it('is stable, so the same job does not jitter between requests', () => {
		expect(coarsenCoordinates(51.31267, 9.48721)).toEqual(
			coarsenCoordinates(51.31271, 9.48799),
		)
	})

	it('keeps the grid within roughly 1.1 km', () => {
		const { lat } = coarsenCoordinates(51.3199, 9.4999)
		// 0.01 degrees of latitude is about 1.11 km.
		expect(Math.abs(lat - 51.32)).toBeLessThanOrEqual(0.01)
	})
})