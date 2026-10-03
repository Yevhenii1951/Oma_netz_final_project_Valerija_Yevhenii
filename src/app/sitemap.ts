import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/**
 * Only the pages a stranger is meant to find. Everything behind the login is
 * deliberately absent: /dashboard, /requests, /chat, /profile, /notifications,
 * /rewards and /admin answer an anonymous visitor with a redirect to /login, so
 * listing them would advertise URLs that lead nowhere. The map needs a session
 * too, and /rate/[requestId] needs a request id, which is not a search result
 * anybody types.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date()

	return [
		{ url: `${baseUrl}/landing`, lastModified, changeFrequency: 'weekly', priority: 1 },
		{ url: `${baseUrl}/impressum`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
		{ url: `${baseUrl}/datenschutz`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
	]
}
