/**
 * Shared Prisma client for the integration tests.
 *
 * It is built from the guarded test URL rather than the app's `src/lib/prisma`,
 * so importing a test can never reach the development database.
 */

import { PrismaClient } from '@prisma/client'

import { requireTestDatabaseUrl } from '../test-database'

export const prisma = new PrismaClient({
	datasourceUrl: requireTestDatabaseUrl(),
	log: [],
})