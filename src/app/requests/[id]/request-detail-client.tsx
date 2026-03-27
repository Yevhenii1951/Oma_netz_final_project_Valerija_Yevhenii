'use client'

import type {
	OfferWithHelper,
	RequestDetailClientProps,
	RequestDetails,
} from '@/app/requests/[id]/request-detail-types'
import {
	Avatar,
	CategoryBadge,
	PageShell,
	StarRating,
	StatusBadge,
} from '@/components/shell'
import { useToast } from '@/components/ui/toaster'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
	CheckCircle2,
	Clock,
	Loader2,
	MapPin,
	MessageCircle,
	Send,
	Star,
	Users,
	XCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RequestDetailClient({
	request,
	isOwner,
	isSameRole,
	myOffer,
	currentUserId,
	userRole,
	hasRating,
	chatPreviewMessages,
}: RequestDetailClientProps) {
	const router = useRouter()
	const { toast } = useToast()
	const [showOfferModal, setShowOfferModal] = useState(false)
	const [offerMessage, setOfferMessage] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [localRequest, setLocalRequest] = useState(request)
	const [ratingStars, setRatingStars] = useState(0)
	const [ratingComment, setRatingComment] = useState('')
	const [isRating, setIsRating] = useState(false)
	const [ratedDone, setRatedDone] = useState(hasRating)

	const isSeniorOrRelative = userRole === 'SENIOR' || userRole === 'RELATIVE'
	const isHelperOwner = isOwner && userRole === 'HELPER'

	async function sendOffer() {
		setIsLoading(true)
		setError('')
		try {
			const res = await fetch('/api/offers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					requestId: localRequest.id,
					message: offerMessage,
				}),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Fehler')
			setShowOfferModal(false)
			setOfferMessage('')
			toast({
				title: isSeniorOrRelative
					? '🤝 Interesse gesendet!'
					: '🙋 Bewerbung gesendet!',
				description: isSeniorOrRelative
					? 'Warte auf Antwort des Helfers.'
					: 'Warte auf Antwort des Seniors.',
				variant: 'success',
			})
			router.refresh()
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err))
			toast({
				title: 'Fehler beim Senden',
				description: err instanceof Error ? err.message : String(err),
				variant: 'error',
			})
		} finally {
			setIsLoading(false)
		}
	}

	async function acceptOffer(offerId: string) {
		setIsLoading(true)
		try {
			const res = await fetch(`/api/offers/${offerId}/accept`, {
				method: 'POST',
			})
			if (!res.ok) {
				const errData = await res.json().catch(() => ({}))
				throw new Error(errData.error || 'Fehler beim Annehmen')
			}
			toast({
				title: isHelperOwner ? '✅ Angebot angenommen' : '✅ Helfer angenommen',
				description: 'Chat wurde geöffnet.',
				variant: 'success',
			})
			router.push(`/chat/${localRequest.id}`)
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err)
			setError(msg)
			toast({
				title: 'Fehler',
				description: msg,
				variant: 'error',
			})
			setIsLoading(false)
		}
	}

	async function completeRequest() {
		setIsLoading(true)
		try {
			const res = await fetch(`/api/requests/${localRequest.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'DONE' }),
			})
			if (!res.ok) throw new Error('Fehler')
			toast({ title: '✅ Anfrage abgeschlossen', variant: 'success' })
			setLocalRequest((prev: RequestDetails) => ({
				...prev,
				status: 'DONE' as const,
			}))
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err))
		} finally {
			setIsLoading(false)
		}
	}

	async function submitRating() {
		if (ratingStars === 0) {
			toast({ title: 'Bitte wähle eine Sternezahl', variant: 'error' })
			return
		}
		setIsRating(true)
		try {
			const res = await fetch('/api/ratings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					requestId: localRequest.id,
					score: ratingStars,
					comment: ratingComment,
				}),
			})
			if (!res.ok) {
				const d = await res.json().catch(() => ({}))
				throw new Error(d.error || 'Fehler beim Bewerten')
			}
			toast({ title: '⭐ Bewertung gespeichert!', variant: 'success' })
			setRatedDone(true)
		} catch (err: unknown) {
			toast({
				title: 'Fehler',
				description: err instanceof Error ? err.message : String(err),
				variant: 'error',
			})
		} finally {
			setIsRating(false)
		}
	}

	const acceptedOffer = localRequest.offers.find(
		(o: OfferWithHelper) => o.status === 'ACCEPTED',
	)
	const hasChatPreview = chatPreviewMessages.length > 0

	return (
		<PageShell title='Anfrage'>
			<div className='max-w-2xl mx-auto space-y-4'>
				{/* Main card */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					className='card p-5'
				>
					<div className='flex items-start justify-between gap-3 mb-3'>
						<div className='flex-1'>
							<div className='flex flex-wrap gap-2 mb-2'>
								<CategoryBadge category={localRequest.category as string} />
								<StatusBadge status={localRequest.status} />
							</div>
							<h1 className='text-xl font-semibold text-[#3d2b1f]'>
								{localRequest.title}
							</h1>
						</div>
					</div>

					{localRequest.description && (
						<p className='text-[#7a6050] text-sm mb-4 leading-relaxed'>
							{localRequest.description}
						</p>
					)}

					<div className='flex flex-col gap-2 text-sm text-[#7a6050]'>
						{(localRequest.address || localRequest.plz) && (
							<span className='flex items-center gap-1.5'>
								<MapPin className='w-4 h-4' />
								{[localRequest.address, localRequest.plz, 'Kassel']
									.filter(Boolean)
									.join(', ')}
							</span>
						)}
						{localRequest.desiredTime && (
							<span className='flex items-center gap-1.5'>
								<Clock className='w-4 h-4' />
								{localRequest.desiredTime}
							</span>
						)}
						<span className='flex items-center gap-1.5'>
							<Users className='w-4 h-4' />
							{localRequest._count.offers} Angebot
							{localRequest._count.offers !== 1 ? 'e' : ''} ·{' '}
							{formatRelativeTime(localRequest.createdAt)}
						</span>
					</div>
				</motion.div>

				{/* Senior info */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.05 }}
					className='card p-4'
				>
					<p className='text-xs font-semibold text-[#b09880] uppercase tracking-wide mb-3'>
						Anfragend
					</p>
					<div className='flex items-center gap-3'>
						<Avatar name={localRequest.senior.name || ''} size='md' />
						<div>
							<p className='font-medium text-[#3d2b1f]'>
								{localRequest.senior.name}
							</p>
							{localRequest.senior.ratingAvg > 0 && (
								<StarRating value={Math.round(localRequest.senior.ratingAvg)} />
							)}
						</div>
					</div>
				</motion.div>

				{/* Error */}
				{error && (
					<div className='bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-100'>
						{error}
					</div>
				)}

				{/* Actions for non-owners (Helpers applying or Seniors accepting) */}
				{!isOwner && !isSameRole && (
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className='space-y-2'
					>
						{/* Helper's own offer — always visible once sent */}
						{myOffer && (
							<div
								className={`card p-4 space-y-2 ${
									myOffer.status === 'ACCEPTED'
										? 'border-emerald-200 bg-emerald-50'
										: myOffer.status === 'DECLINED'
											? 'border-red-100 bg-red-50'
											: 'bg-[#f5ede0] border-[#e8d5be]'
								}`}
							>
								<div className='flex items-center gap-2'>
									{myOffer.status === 'ACCEPTED' && (
										<CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0' />
									)}
									{myOffer.status === 'DECLINED' && (
										<XCircle className='w-4 h-4 text-red-400 shrink-0' />
									)}
									{myOffer.status === 'PENDING' && (
										<Send className='w-4 h-4 text-[#8b5e3c] shrink-0' />
									)}
									<p
										className={`text-sm font-medium ${
											myOffer.status === 'ACCEPTED'
												? 'text-emerald-700'
												: myOffer.status === 'DECLINED'
													? 'text-red-600'
													: 'text-[#6b4226]'
										}`}
									>
										{myOffer.status === 'ACCEPTED' &&
											(isSeniorOrRelative
												? '🎉 Der Helfer hat zugestimmt!'
												: '🎉 Du wurdest ausgewählt!')}
										{myOffer.status === 'DECLINED' &&
											(isSeniorOrRelative
												? 'Leider wurde Ihr Interesse abgelehnt.'
												: 'Leider wurde ein anderer Helfer gewählt.')}
										{myOffer.status === 'PENDING' &&
											(isSeniorOrRelative
												? 'Interesse gesendet — Warte auf Antwort…'
												: 'Bewerbung gesendet — Warte auf Antwort…')}
									</p>
								</div>
								{myOffer.message && (
									<div className='text-xs text-[#7a6050] bg-white/60 rounded-lg p-2.5 border border-[#ddd0be]/50'>
										<span className='text-[#b09880]'>Deine Nachricht: </span>
										{myOffer.message}
									</div>
								)}
								{myOffer.status === 'ACCEPTED' && (
									<button
										onClick={() => router.push(`/chat/${localRequest.id}`)}
										className='btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2'
									>
										<MessageCircle className='w-4 h-4' />
										{isSeniorOrRelative
											? 'Zum Chat mit dem Helfer'
											: 'Zum Chat mit dem Senior'}
									</button>
								)}
							</div>
						)}

						{/* No offer yet — show apply button */}
						{!myOffer && localRequest.status === 'OPEN' && (
							<button
								onClick={() => setShowOfferModal(true)}
								className='btn-primary w-full py-3 text-base'
							>
								{userRole === 'SENIOR' || userRole === 'RELATIVE'
									? 'Ich bin dabei! 🤝'
									: 'Ich helfe gerne! 🙋'}
							</button>
						)}

						{/* Request already taken by someone else */}
						{!myOffer && localRequest.status === 'IN_PROGRESS' && (
							<div className='card p-4 text-center text-[#7a6050] text-sm bg-[#f5ede0]'>
								🔒 Diese Anfrage ist bereits in Bearbeitung.
							</div>
						)}
					</motion.div>
				)}

				{/* Same role info — can't take this request */}
				{!isOwner && isSameRole && (
					<div className='card p-4 text-center text-[#7a6050] text-sm bg-amber-50 border border-amber-200'>
						ℹ️ Du kannst diese Anfrage nicht annehmen, da sie von einem Nutzer
						mit derselben Rolle erstellt wurde.
					</div>
				)}

				{/* Owner: accepted helper card + actions when IN_PROGRESS */}
				{isOwner && localRequest.status === 'IN_PROGRESS' && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.1 }}
						className='space-y-2'
					>
						{acceptedOffer && (
							<div className='card p-4 bg-emerald-50 border border-emerald-200'>
								<p className='text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2'>
									{isHelperOwner ? '👤 Anfragender Senior' : '🙋 Dein Helfer'}
								</p>
								<div className='flex items-center gap-3'>
									<Avatar name={acceptedOffer.helper.name || ''} size='md' />
									<div>
										<p className='font-medium text-[#3d2b1f]'>
											{acceptedOffer.helper.name}
										</p>
										{acceptedOffer.helper.ratingAvg > 0 && (
											<StarRating
												value={Math.round(acceptedOffer.helper.ratingAvg)}
												size='sm'
											/>
										)}
										{acceptedOffer.helper.helpCount > 0 && (
											<p className='text-xs text-emerald-600'>
												{acceptedOffer.helper.helpCount}× geholfen
											</p>
										)}
									</div>
								</div>
							</div>
						)}
						<button
							onClick={() => router.push(`/chat/${localRequest.id}`)}
							className='btn-primary w-full py-3 flex items-center justify-center gap-2'
						>
							<MessageCircle className='w-4 h-4' />
							{isHelperOwner
								? 'Zum Chat mit dem Senior'
								: 'Zum Chat mit dem Helfer'}
						</button>
						<button
							onClick={completeRequest}
							disabled={isLoading}
							className='relative w-full py-3 rounded-2xl font-bold text-white overflow-hidden bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-md shadow-emerald-200 animate-pulse-once'
							style={{
								animation: 'pulseGreen 2s ease-in-out infinite',
							}}
						>
							<span
								className='absolute inset-0 rounded-2xl'
								style={{
									background:
										'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
									animation: 'shimmer 2.5s linear infinite',
									backgroundSize: '200% 100%',
								}}
							/>
							{isLoading ? (
								<Loader2 className='inline w-4 h-4 animate-spin mr-2' />
							) : (
								<span className='relative flex items-center justify-center gap-2'>
									<CheckCircle2 className='w-4 h-4' />
									Als erledigt markieren
								</span>
							)}
						</button>
					</motion.div>
				)}

				{/* Owner: compact chat access + preview */}
				{isOwner && acceptedOffer && localRequest.status !== 'OPEN' && (
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.12 }}
						className='card p-4 space-y-3'
					>
						<div className='flex items-center justify-between gap-2'>
							<p className='text-xs font-semibold text-[#b09880] uppercase tracking-wide'>
								💬 Verlauf mit dem Helfer
							</p>
							<button
								onClick={() => router.push(`/chat/${localRequest.id}`)}
								className='text-xs font-semibold text-[#8b5e3c] hover:text-[#6b4226] underline underline-offset-2'
							>
								Chat öffnen
							</button>
						</div>

						{hasChatPreview ? (
							<div className='space-y-2'>
								{chatPreviewMessages.map(msg => {
									const mine = msg.senderId === currentUserId
									return (
										<div
											key={msg.id}
											className={`rounded-xl p-2.5 text-xs border ${
												mine
													? 'bg-[#f5ede0] border-[#e8d5be]'
													: 'bg-[#ffffff] border-[#ddd0be]'
											}`}
										>
											<p className='font-medium text-[#6b4226]'>
												{mine ? 'Du' : (msg.sender.name ?? 'Partner')}
											</p>
											<p className='text-[#7a6050] mt-0.5'>{msg.content}</p>
										</div>
									)
								})}
							</div>
						) : (
							<p className='text-xs text-[#7a6050]'>
								Noch keine Nachrichten in diesem Chat.
							</p>
						)}
					</motion.div>
				)}

				{/* Owner: inline rating when DONE */}
				{isOwner && localRequest.status === 'DONE' && acceptedOffer && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.1 }}
						className='card p-5 space-y-3'
					>
						<p className='text-xs font-semibold text-[#b09880] uppercase tracking-wide'>
							⭐ Helfer bewerten
						</p>
						<div className='flex items-center gap-3'>
							<Avatar name={acceptedOffer.helper.name || ''} size='sm' />
							<p className='font-medium text-[#3d2b1f]'>
								{acceptedOffer.helper.name}
							</p>
						</div>
						{ratedDone ? (
							<div className='text-center py-3 text-emerald-600 font-medium'>
								✅ Du hast diesen Helfer bereits bewertet.
							</div>
						) : (
							<>
								<div className='flex gap-1'>
									{[1, 2, 3, 4, 5].map(s => (
										<button
											key={s}
											onClick={() => setRatingStars(s)}
											className='p-1 transition-transform hover:scale-110'
										>
											<Star
												className={`w-7 h-7 ${
													s <= ratingStars
														? 'fill-amber-400 text-amber-400'
														: 'text-[#ddd0be]'
												}`}
											/>
										</button>
									))}
								</div>
								<textarea
									className='input-field resize-none text-sm'
									rows={2}
									placeholder='Kommentar (optional)'
									value={ratingComment}
									onChange={e => setRatingComment(e.target.value)}
								/>
								<button
									onClick={submitRating}
									disabled={isRating || ratingStars === 0}
									className='btn-primary w-full py-2.5 flex items-center justify-center gap-2'
								>
									{isRating ? (
										<Loader2 className='w-4 h-4 animate-spin' />
									) : (
										<Star className='w-4 h-4' />
									)}
									Bewertung abschicken
								</button>
							</>
						)}
					</motion.div>
				)}

				{/* Offers list (only owner sees) */}
				{isOwner && localRequest.offers.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15 }}
						className='card p-4'
					>
						<p className='text-xs font-semibold text-[#b09880] uppercase tracking-wide mb-3'>
							Angebote ({localRequest.offers.length})
						</p>
						<div className='space-y-3'>
							{localRequest.offers.map((offer: OfferWithHelper) => (
								<div
									key={offer.id}
									className='flex items-start gap-3 p-3 rounded-xl bg-[#ede3d4]'
								>
									<Avatar name={offer.helper.name || ''} size='sm' />
									<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between gap-2'>
											<p className='font-medium text-[#3d2b1f] text-sm'>
												{offer.helper.name}
											</p>
											<span className='text-xs text-[#b09880]'>
												{formatDate(offer.createdAt)}
											</span>
										</div>
										{offer.helper.ratingAvg > 0 && (
											<StarRating
												value={Math.round(offer.helper.ratingAvg)}
												size='sm'
											/>
										)}
										{offer.message && (
											<p className='text-sm text-[#7a6050] mt-1 leading-snug'>
												{offer.message}
											</p>
										)}
									</div>
									{offer.status === 'PENDING' &&
										localRequest.status === 'OPEN' && (
											<div className='flex flex-col gap-1'>
												<button
													onClick={() => acceptOffer(offer.id)}
													disabled={isLoading}
													className='text-xs bg-[#8b5e3c] text-[#ffffff] rounded-lg px-3 py-1.5 font-medium hover:bg-[#6b4226] transition flex items-center gap-1'
												>
													<CheckCircle2 className='w-3.5 h-3.5' />
													Annehmen
												</button>
											</div>
										)}
									{offer.status === 'ACCEPTED' && (
										<span className='text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg'>
											Angenommen
										</span>
									)}
									{offer.status === 'DECLINED' && (
										<span className='text-xs text-[#b09880] font-medium'>
											Abgelehnt
										</span>
									)}
								</div>
							))}
						</div>
					</motion.div>
				)}
			</div>

			{/* Offer modal */}
			<AnimatePresence>
				{showOfferModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4'
						onClick={e =>
							e.target === e.currentTarget && setShowOfferModal(false)
						}
					>
						<motion.div
							initial={{ y: 40, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 40, opacity: 0 }}
							className='bg-[#ffffff] rounded-3xl p-6 w-full max-w-md shadow-2xl'
						>
							<h3 className='text-lg font-semibold text-[#3d2b1f] mb-1'>
								{isSeniorOrRelative ? 'Interesse bekunden' : 'Hilfe anbieten'}
							</h3>
							<p className='text-sm text-[#7a6050] mb-4'>
								Schreiben Sie eine kurze Nachricht (optional)
							</p>
							<textarea
								className='input-field resize-none mb-4'
								rows={3}
								placeholder={
									isSeniorOrRelative
										? 'z.B. Ich freue mich über Ihre Hilfe!'
										: 'z.B. Ich kann Dienstag oder Mittwoch kommen.'
								}
								value={offerMessage}
								onChange={e => setOfferMessage(e.target.value)}
							/>
							{error && <p className='text-red-500 text-sm mb-3'>{error}</p>}
							<div className='flex gap-2'>
								<button
									onClick={() => setShowOfferModal(false)}
									className='btn-secondary flex-1'
								>
									Abbrechen
								</button>
								<button
									onClick={sendOffer}
									disabled={isLoading}
									className='btn-primary flex-1 flex items-center justify-center gap-2'
								>
									{isLoading ? (
										<Loader2 className='w-4 h-4 animate-spin' />
									) : (
										<Send className='w-4 h-4' />
									)}
									Senden
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</PageShell>
	)
}
