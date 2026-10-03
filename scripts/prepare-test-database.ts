/**
 * Creates the integration-test database if it is missing and brings it up to
 * the current schema.
 *
 * Developers run this once before `npm run test:integration`. The database
 * name is checked before anything is created, so pointing this script at the
 * development database cannot create or migrate anything there.
 *
 * Usage: npm run db:test:prepare
 */

import { execFileSync } from 'node:child_process'
import { Client } from 'pg'

import { requireTestDatabaseUrl } from '../tests/test-database'

async function main() {
	const url = requireTestDatabaseUrl()
	const target = new URL(url)
	const name = target.pathname.replace(/^\//, '')

	const admin = new Client({
		host: target.hostname,
		port: Number(target.port || 5432),
		user: decodeURIComponent(target.username),
		password: decodeURIComponent(target.password),
		database: 'postgres',
	})

	await admin.connect()
	try {
		const existing = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [
			name,
		])
		if (existing.rowCount === 0) {
			// Identifier cannot be parameterised, so it is quoted instead.
			await admin.query(`CREATE DATABASE "${name.replace(/"/g, '""')}"`)
			console.log(`created database ${name}`)
		} else {
			console.log(`database ${name} already exists`)
		}
	} finally {
		await admin.end()
	}

	execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
		stdio: 'inherit',
		env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
	})
}

main().catch((err: unknown) => {
	console.error(err instanceof Error ? err.message : err)
	process.exit(1)
})