import { RequestLink, SetPassword } from './reset-forms'

/**
 * Two states in one page, because the reset link brings the user back here:
 * without a token it asks for an address, with one it asks for a new password.
 *
 * The token is read here, on the server, instead of with useSearchParams() in a
 * client component: that would require a Suspense boundary, and the boundary
 * makes the form visibly flicker while it settles.
 */
export default async function PasswortZuruecksetzenPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>
}) {
	const { token } = await searchParams
	return token ? <SetPassword token={token} /> : <RequestLink />
}