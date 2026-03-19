import { requireAdmin, logAndError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/admin/stats — returns dashboard statistics

export async function GET() {
	try {
		const session = await requireAdmin()
		if (session instanceof NextResponse) return session

		const [
			totalUsers,
			totalHelpers,
			totalSeniors,
			totalRequests,
			openRequests,
			completedRequests,
			totalMessages,
			recentRequests,
			topHelpers,
		] = await Promise.all([
			prisma.user.count(),
			prisma.user.count({ where: { role: 'HELPER' } }),
			prisma.user.count({ where: { role: 'SENIOR' } }),
			prisma.request.count(),
			prisma.request.count({ where: { status: 'OPEN' } }),
			prisma.request.count({ where: { status: 'DONE' } }),
			prisma.message.count(),
			prisma.request.findMany({
				take: 10,
				orderBy: { createdAt: 'desc' },
				include: { senior: { select: { id: true, name: true } } },
			}),
			prisma.user.findMany({
				where: { role: 'HELPER', helpCount: { gt: 0 } },
				orderBy: [{ helpCount: 'desc' }, { ratingAvg: 'desc' }],
				take: 5,
				select: {
					id: true,
					name: true,
					image: true,
					helpCount: true,
					ratingAvg: true,
					points: true,
				},
			}),
		])

		return NextResponse.json({
			data: {
				totalUsers,
				totalHelpers,
				totalSeniors,
				totalRequests,
				openRequests,
				completedRequests,
				totalMessages,
				recentRequests,
				topHelpers,
			},
		})
	} catch (err) {
		return logAndError('[GET /api/admin/stats]', err)
	}
}
