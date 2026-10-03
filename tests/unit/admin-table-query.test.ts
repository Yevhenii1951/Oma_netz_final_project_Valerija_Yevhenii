import { describe, expect, it } from 'vitest'
import {
	buildHelperQuery,
	buildPendingQuery,
	buildRedemptionQuery,
	buildRequestQuery,
	buildSeniorQuery,
	parseAdminTableParams,
	type AdminTableParams,
} from '@/app/admin/admin-table-query'

function params(overrides: Partial<AdminTableParams> = {}): AdminTableParams {
	return {
		tab: 'helpers',
		q: '',
		status: 'ALL',
		sort: 'createdAt',
		dir: 'desc',
		page: 1,
		pageSize: 8,
		...overrides,
	}
}

describe('parseAdminTableParams', () => {
	it('keeps a known tab and falls back for an unknown one', () => {
		expect(parseAdminTableParams({ tab: 'requests' }, 'stats').tab).toBe(
			'requests',
		)
		expect(parseAdminTableParams({ tab: 'stats' }, 'pending').tab).toBe('stats')
		expect(parseAdminTableParams({ tab: '../etc' }, 'pending').tab).toBe('pending')
		expect(parseAdminTableParams({}, 'stats').tab).toBe('stats')
	})

	it('reads the first value of a repeated param', () => {
		expect(parseAdminTableParams({ tab: ['helpers', 'requests'] }, 'stats').tab).toBe(
			'helpers',
		)
	})

	it('replaces a page that is not a positive integer', () => {
		for (const page of ['0', '-3', 'abc', '', '1e9']) {
			expect(parseAdminTableParams({ page }, 'stats').page).toBe(1)
		}
		expect(parseAdminTableParams({ page: '7' }, 'stats').page).toBe(7)
	})

	it('clamps the page size instead of trusting the URL', () => {
		expect(parseAdminTableParams({ size: '0' }, 'stats').pageSize).toBe(8)
		expect(parseAdminTableParams({ size: '25' }, 'stats').pageSize).toBe(25)
		expect(parseAdminTableParams({ size: '100000' }, 'stats').pageSize).toBe(100)
	})

	it('accepts only asc as the sort direction', () => {
		expect(parseAdminTableParams({ dir: 'asc' }, 'stats').dir).toBe('asc')
		expect(parseAdminTableParams({ dir: 'ASC' }, 'stats').dir).toBe('desc')
		expect(parseAdminTableParams({ dir: 'sideways' }, 'stats').dir).toBe('desc')
	})

	it('trims and truncates the search term', () => {
		expect(parseAdminTableParams({ q: '  kassel  ' }, 'stats').q).toBe('kassel')
		expect(parseAdminTableParams({ q: 'x'.repeat(500) }, 'stats').q).toHaveLength(100)
	})
})

describe('buildHelperQuery', () => {
	it('always scopes to helpers', () => {
		expect(buildHelperQuery(params()).where).toMatchObject({ role: 'HELPER' })
	})

	it('applies a status filter only when one is chosen', () => {
		expect(buildHelperQuery(params()).where).not.toHaveProperty('helperStatus')
		expect(
			buildHelperQuery(params({ status: 'APPROVED' })).where.helperStatus,
		).toBe('APPROVED')
	})

	it('adds no search clause for an empty term', () => {
		expect(buildHelperQuery(params({ q: '  ' })).where).not.toHaveProperty('OR')
		expect(buildHelperQuery(params({ q: 'kassel' })).where.OR).toHaveLength(3)
	})

	it('falls back to createdAt for a sort field it does not own', () => {
		expect(buildHelperQuery(params({ sort: 'nonsense' })).orderBy[0]).toEqual({
			createdAt: 'desc',
		})
		expect(buildHelperQuery(params({ sort: 'points', dir: 'asc' })).orderBy[0]).toEqual(
			{ points: 'asc' },
		)
	})
})

describe('buildSeniorQuery', () => {
	it('maps the derived status onto isBanned', () => {
		expect(buildSeniorQuery(params({ status: 'ACTIVE' })).where.isBanned).toBe(false)
		expect(buildSeniorQuery(params({ status: 'BANNED' })).where.isBanned).toBe(true)
		expect(buildSeniorQuery(params({ status: 'ALL' })).where).not.toHaveProperty(
			'isBanned',
		)
	})

	it('counts requests through the relation', () => {
		expect(
			buildSeniorQuery(params({ sort: 'requests', dir: 'asc' })).orderBy[0],
		).toEqual({ sentRequests: { _count: 'asc' } })
	})
})

describe('buildRequestQuery', () => {
	it('filters by status and searches the senior name', () => {
		const { where } = buildRequestQuery(params({ status: 'OPEN', q: 'anna' }))
		expect(where.status).toBe('OPEN')
		expect(where.OR).toContainEqual({
			senior: { is: { name: { contains: 'anna', mode: 'insensitive' } } },
		})
	})

	it('matches the category enum only on a full value', () => {
		const exact = buildRequestQuery(params({ q: 'arzt' })).where.OR
		expect(exact).toContainEqual({ category: 'ARZT' })

		const partial = buildRequestQuery(params({ q: 'art' })).where.OR ?? []
		expect(partial).not.toContainEqual({ category: 'ART' })
		expect(partial.some(clause => 'category' in clause)).toBe(false)
	})

	it('sorts by offer count through the relation', () => {
		expect(buildRequestQuery(params({ sort: 'offers' })).orderBy[0]).toEqual({
			offers: { _count: 'desc' },
		})
	})
})

describe('buildRedemptionQuery', () => {
	it('sorts through the user and reward relations', () => {
		expect(buildRedemptionQuery(params({ sort: 'user' })).orderBy[0]).toEqual({
			user: { name: 'desc' },
		})
		expect(buildRedemptionQuery(params({ sort: 'points' })).orderBy[0]).toEqual({
			reward: { pointsCost: 'desc' },
		})
		expect(buildRedemptionQuery(params({ sort: 'reward' })).orderBy[0]).toEqual({
			reward: { title: 'desc' },
		})
	})

	it('keeps the plain status column', () => {
		expect(buildRedemptionQuery(params({ status: 'fulfilled' })).where.status).toBe(
			'fulfilled',
		)
	})
})

describe('buildPendingQuery', () => {
	it('is the approval queue, oldest first, regardless of direction', () => {
		const { where, orderBy } = buildPendingQuery(params({ dir: 'desc' }))
		expect(where.helperStatus).toBe('PENDING_REVIEW')
		expect(orderBy[0]).toEqual({ createdAt: 'asc' })
	})

	it('honours the direction when sorting by name', () => {
		expect(buildPendingQuery(params({ sort: 'name' })).orderBy[0]).toEqual({
			name: 'desc',
		})
	})
})

describe('stable pagination', () => {
	// Without a unique tiebreaker Postgres may order equal keys differently per
	// query, so a row can repeat on one page and vanish from the next.
	const cases = {
		pending: buildPendingQuery(params()),
		helpers: buildHelperQuery(params()),
		seniors: buildSeniorQuery(params()),
		requests: buildRequestQuery(params()),
		redemptions: buildRedemptionQuery(params()),
	}

	for (const [tab, query] of Object.entries(cases)) {
		it(`${tab} breaks ties on id`, () => {
			expect(query.orderBy[query.orderBy.length - 1]).toEqual({ id: 'asc' })
		})
	}
})