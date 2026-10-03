import { describe, expect, it } from 'vitest'

import {
	canTransition,
	isTerminal,
	REQUEST_STATUS_LABELS,
	REQUEST_TRANSITIONS,
	transitionError,
} from '@/lib/request-status'

const ALL = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const

describe('canTransition', () => {
	it('allows cancelling an open request', () => {
		expect(canTransition('OPEN', 'CANCELLED')).toBe(true)
	})

	it('allows completing an in-progress request', () => {
		expect(canTransition('IN_PROGRESS', 'DONE')).toBe(true)
	})

	it('allows cancelling an in-progress request', () => {
		expect(canTransition('IN_PROGRESS', 'CANCELLED')).toBe(true)
	})

	it('refuses completing a request nobody picked up', () => {
		// The rating route and the points both need an accepted helper; a DONE
		// request with no accepted offer would credit nobody and still let the
		// resident rate nobody.
		expect(canTransition('OPEN', 'DONE')).toBe(false)
	})

	it('refuses reopening a cancelled request', () => {
		expect(canTransition('CANCELLED', 'OPEN')).toBe(false)
		expect(canTransition('CANCELLED', 'DONE')).toBe(false)
		expect(canTransition('CANCELLED', 'IN_PROGRESS')).toBe(false)
	})

	it('refuses undoing a completed request', () => {
		// Otherwise a completed request could be cancelled and completed again,
		// and each DONE pays the helper POINTS_PER_HELP.
		expect(canTransition('DONE', 'CANCELLED')).toBe(false)
		expect(canTransition('DONE', 'OPEN')).toBe(false)
	})

	it('refuses a transition to the same status', () => {
		for (const status of ALL) {
			expect(canTransition(status, status)).toBe(false)
		}
	})

	it('has no outgoing transition from a terminal status', () => {
		for (const status of ['DONE', 'CANCELLED'] as const) {
			expect(REQUEST_TRANSITIONS[status]).toEqual([])
		}
	})

	it('is never symmetric', () => {
		for (const from of ALL) {
			for (const to of ALL) {
				if (from === to) continue
				const forward = canTransition(from, to)
				const back = canTransition(to, from)
				expect(forward && back).toBe(false)
			}
		}
	})
})

describe('isTerminal', () => {
	it('treats DONE and CANCELLED as terminal', () => {
		expect(isTerminal('DONE')).toBe(true)
		expect(isTerminal('CANCELLED')).toBe(true)
	})

	it('treats OPEN and IN_PROGRESS as live', () => {
		expect(isTerminal('OPEN')).toBe(false)
		expect(isTerminal('IN_PROGRESS')).toBe(false)
	})
})

describe('transitionError', () => {
	it('names both statuses in German so the message is actionable', () => {
		const message = transitionError('CANCELLED', 'DONE')
		// Lowercased mid-sentence, so "Diese Anfrage ist bereits abgebrochen".
		expect(message).toContain('abgebrochen')
		expect(message).toContain('Abgeschlossen')
		// No raw enum values in a message a resident reads.
		expect(message).not.toContain('CANCELLED')
		expect(message).not.toContain('DONE')
	})

	it('lists the allowed next statuses', () => {
		expect(transitionError('OPEN', 'DONE')).toContain('In Bearbeitung')
		expect(transitionError('OPEN', 'DONE')).toContain('Abgebrochen')
	})

	it('returns nothing for a legal transition', () => {
		expect(transitionError('OPEN', 'CANCELLED')).toBeUndefined()
	})
})

describe('REQUEST_STATUS_LABELS', () => {
	it('labels every status exactly once', () => {
		expect(Object.keys(REQUEST_STATUS_LABELS).sort()).toEqual([
			'CANCELLED',
			'DONE',
			'IN_PROGRESS',
			'OPEN',
		])
	})
})