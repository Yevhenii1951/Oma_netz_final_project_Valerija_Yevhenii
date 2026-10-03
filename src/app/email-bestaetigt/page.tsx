import Link from 'next/link'

/**
 * Landing page for the verification link. It only reports what happened; it
 * never reveals whether an address is registered.
 */

const COPY = {
	ok: {
		title: 'E-Mail-Adresse bestätigt',
		body: 'Deine Adresse ist bestätigt. Du kannst dich jetzt anmelden.',
		tone: 'text-green-700 bg-green-50 border-green-200',
	},
	invalid: {
		title: 'Link ungültig oder abgelaufen',
		body: 'Dieser Link wurde bereits verwendet oder ist abgelaufen. Fordere unter "Passwort vergessen" eine neue Bestätigung an.',
		tone: 'text-amber-800 bg-amber-50 border-amber-200',
	},
	deleted: {
		title: 'Konto deaktiviert',
		body: 'Dieses Konto wurde vom Admin deaktiviert. Melde dich bei uns, wenn du es wieder nutzen möchtest.',
		tone: 'text-amber-800 bg-amber-50 border-amber-200',
	},
	error: {
		title: 'Etwas ist schiefgelaufen',
		body: 'Die Bestätigung konnte nicht verarbeitet werden. Bitte versuche es erneut.',
		tone: 'text-red-700 bg-red-50 border-red-200',
	},
} as const

export default async function EmailBestaetigtPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string }>
}) {
	const { status } = await searchParams
	const key = (status && status in COPY ? status : 'invalid') as keyof typeof COPY
	const { title, body, tone } = COPY[key]

	return (
		<main className='min-h-screen flex items-center justify-center px-4 bg-slate-50'>
			<div className={`w-full max-w-md rounded-xl border p-8 text-center ${tone}`}>
				<h1 className='text-xl font-bold mb-3'>{title}</h1>
				<p className='text-sm mb-6'>{body}</p>
				<Link
					href='/login'
					className='inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700'
				>
					Zur Anmeldung
				</Link>
			</div>
		</main>
	)
}