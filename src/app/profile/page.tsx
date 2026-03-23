import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
	const session = await auth()
	if (!session) redirect('/login')

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			bio: true,
			address: true,
			plz: true,
			image: true,
			role: true,
			points: true,
			helpCount: true,
			ratingAvg: true,
		},
	})

	if (!user) redirect('/login')

	return <ProfileClient user={JSON.parse(JSON.stringify(user))} />
}
