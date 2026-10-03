import { redirect } from 'next/navigation'

/**
 * The marketing page is served at `/`. This path only exists so links that
 * already point at /landing keep working — remove it once nothing references it
 * any more.
 */
export default function LandingRedirectPage() {
	redirect('/')
}