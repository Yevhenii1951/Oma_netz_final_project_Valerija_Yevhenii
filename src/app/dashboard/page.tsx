import { auth } from '@/auth'

export default async function DashboardPage() {
	const session = await auth()

	return (
		<main className='p-10'>
			<h1 className='text-3xl font-bold'>Dashboard</h1>
			<p className='mt-4'>Welcome {session?.user?.name ?? 'user'}</p>
			<a
				href='/map'
				className='mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
			>
				MAP
			</a>
		</main>
	)
}
