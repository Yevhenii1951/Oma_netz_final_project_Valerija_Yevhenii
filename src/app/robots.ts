import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/**
 * The authenticated sections are blocked rather than just left out of the
 * sitemap. Disallow is the wrong tool for de-indexing in general — a crawler
 * that cannot read a page cannot see a noindex on it — but here it costs
 * nothing: these routes redirect an anonymous request to /login anyway, so
 * there is no content to index behind the block.
 */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/api/',
					'/admin',
					'/dashboard',
					'/requests',
					'/chat',
					'/profile',
					'/notifications',
					'/rewards',
					'/map',
					'/banned',
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	}
}
