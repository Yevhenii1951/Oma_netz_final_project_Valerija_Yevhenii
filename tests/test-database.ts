/**
 * Connection used by the integration tests.
 *
 * The tests delete and write rows, so they must never be able to touch the
 * development or production database. `requireTestDatabaseUrl` refuses to
 * return anything unless the database name ends in `_test`, which makes a
 * misconfigured run fail loudly instead of quietly wiping real data.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const TEST_DATABASE_SUFFIX = '_test'
const ENV_FILE = '.env.test.local'

function databaseNameOf(url: string): string {
	const name = new URL(url).pathname.replace(/^\//, '')
	if (!name) {
		throw new Error('DATABASE_URL has no database name')
	}
	return name
}

export interface DatabaseEnv {
	/** TEST_DATABASE_URL from the environment, if set. */
	testUrl?: string | undefined
	/** DATABASE_URL from the environment, if set. */
	databaseUrl?: string | undefined
	/** Contents of .env.test.local, if the file exists. */
	fileContents?: string | undefined
}

function testUrlFromFile(fileContents: string | undefined): string | undefined {
	return fileContents?.match(/^TEST_DATABASE_URL="?([^"\n]+)"?/m)?.[1]
}

/**
 * The pure part of the guard, kept separate from the file reading so the
 * precedence and the refusal can both be tested.
 *
 * Precedence: TEST_DATABASE_URL, then .env.test.local, then DATABASE_URL. CI
 * only has the environment variables, a developer only has the file.
 */
export function resolveTestDatabaseUrl(env: DatabaseEnv): string {
	const url = env.testUrl ?? testUrlFromFile(env.fileContents) ?? env.databaseUrl

	if (!url) {
		throw new Error(
			`Integration tests need TEST_DATABASE_URL. Put it in ${ENV_FILE} or export it.`,
		)
	}

	const name = databaseNameOf(url)
	if (!name.endsWith(TEST_DATABASE_SUFFIX)) {
		throw new Error(
			`Refusing to run integration tests against database "${name}": the name must end in "${TEST_DATABASE_SUFFIX}". Point TEST_DATABASE_URL at a throwaway database.`,
		)
	}

	return url
}

/**
 * Reads TEST_DATABASE_URL, falling back to DATABASE_URL so the suite still
 * runs on CI where the service is provided as a plain environment variable.
 */
export function requireTestDatabaseUrl(): string {
	let fileContents: string | undefined
	try {
		fileContents = readFileSync(resolve(process.cwd(), ENV_FILE), 'utf8')
	} catch {
		// No local override file, the environment variables apply.
	}

	return resolveTestDatabaseUrl({
		testUrl: process.env.TEST_DATABASE_URL,
		databaseUrl: process.env.DATABASE_URL,
		fileContents,
	})
}