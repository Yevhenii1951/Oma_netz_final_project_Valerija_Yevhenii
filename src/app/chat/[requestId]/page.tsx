import { auth } from '@/auth'
import {
	Avatar,
	CategoryBadge,
	EmptyState,
	PageShell,
} from '@/components/shell'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ChatListPage() {
	const session = await auth()
	if (!session) redirect('/login')

	const chats = await prisma.chat.findMany({
		where: {
			OR: [
				{ request: { seniorId: session.user.id } },
				{
					request: {
						offers: { some: { helperId: session.user.id, status: 'ACCEPTED' } },
					},
				},
			],
		},
		include: {
			request: {
				select: {
					id: true,
					title: true,
					category: true,
					status: true,
					senior: { select: { id: true, name: true, image: true } },
				},
			},
			messages: {
				orderBy: { createdAt: 'desc' },
				take: 1,
				include: { sender: { select: { name: true } } },
			},
		},
		orderBy: { createdAt: 'desc' },
	})

	return (
		<PageShell title='Nachrichten'>
			{chats.length === 0 ? (
				<EmptyState
					icon={<MessageCircle className='w-10 h-10 text-[#b09880]' />}
					title='Noch keine Chats'
					description='Wenn eine Hilfsanfrage angenommen wird, erscheint hier der Chat.'
				/>
			) : (
				<div className='space-y-2 max-w-2xl mx-auto'>
					{chats.map(chat => {
						const lastMsg = chat.messages[0]
						return (
							<Link
								key={chat.id}
								href={`/chat/${chat.request.id}`}
								className='card p-4 flex items-center gap-3 hover:shadow-md transition-shadow'
							>
								<Avatar name={chat.request.senior.name || ''} size='md' />
								<div className='flex-1 min-w-0'>
									<div className='flex items-center justify-between gap-2 mb-0.5'>
										<p className='font-medium text-[#3d2b1f] truncate text-sm'>
											{chat.request.title}
										</p>
										{lastMsg && (
											<span className='text-xs text-[#b09880] shrink-0'>
												{formatRelativeTime(lastMsg.createdAt)}
											</span>
										)}
									</div>
									<div className='flex items-center gap-2'>
										<CategoryBadge
											category={chat.request.category as string}
											size='xs'
										/>
										{lastMsg ? (
											<p className='text-xs text-[#7a6050] truncate'>
												{lastMsg.sender.name}: {lastMsg.content}
											</p>
										) : (
											<p className='text-xs text-[#b09880] italic'>
												Noch keine Nachrichten
											</p>
										)}
									</div>
								</div>
							</Link>
						)
					})}
				</div>
			)}
		</PageShell>
	)
}
