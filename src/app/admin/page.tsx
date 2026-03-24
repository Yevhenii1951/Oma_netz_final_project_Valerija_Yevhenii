import { redirect } from 'next/navigation'

export const metadata = { title: 'Admin' }

export default async function AdminPage() {
	redirect('/dashboard')
}
