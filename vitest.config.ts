import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		// Each integration file talks to one database and creates its own
		// fixtures, so the files run one after another rather than at once.
		fileParallelism: false,
		testTimeout: 30_000,
		hookTimeout: 30_000,
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
})