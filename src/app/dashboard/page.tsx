import { auth } from '@/auth'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">
        Welcome {session?.user?.name ?? 'user'}
      </p>
    </main>
  )
}