import { describe, expect, it } from 'vitest'

import { resolveTestDatabaseUrl } from '../test-database'

const testUrl = 'postgresql://oma:oma@localhost:5432/oma_netz_test'

describe('resolveTestDatabaseUrl', () => {
	it('accepts TEST_DATABASE_URL from the environment', () => {
		expect(resolveTestDatabaseUrl({ testUrl })).toBe(testUrl)
	})

	it('reads TEST_DATABASE_URL out of .env.test.local', () => {
		expect(
			resolveTestDatabaseUrl({
				fileContents: `# comment\nOTHER=1\nTEST_DATABASE_URL="${testUrl}"\n`,
			}),
		).toBe(testUrl)
	})

	it('falls back to DATABASE_URL when that one is a test database', () => {
		expect(resolveTestDatabaseUrl({ databaseUrl: testUrl })).toBe(testUrl)
	})

	it('prefers the environment over the file', () => {
		expect(
			resolveTestDatabaseUrl({
				testUrl,
				fileContents: 'TEST_DATABASE_URL="postgresql://x:y@h:5432/from_file_test"',
			}),
		).toBe(testUrl)
	})

	it('prefers the file over DATABASE_URL', () => {
		expect(
			resolveTestDatabaseUrl({
				fileContents: `TEST_DATABASE_URL="${testUrl}"`,
				databaseUrl: 'postgresql://x:y@h:5432/from_env',
			}),
		).toBe(testUrl)
	})

	it('refuses the development database', () => {
		expect(() =>
			resolveTestDatabaseUrl({
				testUrl: 'postgresql://oma:oma@localhost:5432/oma_netz',
			}),
		).toThrow(/must end in "_test"/)
	})

	it('refuses a production database reached through the fallback', () => {
		expect(() =>
			resolveTestDatabaseUrl({
				databaseUrl: 'postgresql://user:pw@db.example.com:5432/oma_netz_prod',
			}),
		).toThrow(/oma_netz_prod/)
	})

	it('refuses a name that merely contains "test"', () => {
		expect(() =>
			resolveTestDatabaseUrl({
				testUrl: 'postgresql://oma:oma@localhost:5432/oma_contest',
			}),
		).toThrow(/must end in "_test"/)
	})

	it('refuses a url with no database name', () => {
		expect(() =>
			resolveTestDatabaseUrl({ testUrl: 'postgresql://oma:oma@localhost:5432' }),
		).toThrow(/no database name/)
	})

	it('explains itself when nothing is configured at all', () => {
		expect(() => resolveTestDatabaseUrl({})).toThrow(/TEST_DATABASE_URL/)
	})
})
