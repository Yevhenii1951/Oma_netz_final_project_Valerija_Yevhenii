import type {
	ChatPreviewMessage,
	OfferWithHelper,
	RequestDetails,
} from '@/app/requests/[id]/request-detail-types'
import { Avatar, StarRating } from '@/components/shell'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, MessageCircle, Star } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

interface OwnerInProgressActionsProps {
	isOwner: boolean
	request: RequestDetails
	acceptedOffer: OfferWithHelper | undefined
	isHelperOwner: boolean
	isLoading: boolean
	onOpenChat: () => void
	onCompleteRequest: () => void
}

export function OwnerInProgressActions({
	isOwner,
	request,
	acceptedOffer,
	isHelperOwner,
	isLoading,
	onOpenChat,
	onCompleteRequest,
}: OwnerInProgressActionsProps) {
	if (!isOwner || request.status !== 'IN_PROGRESS') {
		return null
	}

	return (
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
				onClick={onOpenChat}
				className='btn-primary w-full py-3 flex items-center justify-center gap-2'
			>
				<MessageCircle className='w-4 h-4' />
				{isHelperOwner ? 'Zum Chat mit dem Senior' : 'Zum Chat mit dem Helfer'}
			</button>
			<button
				onClick={onCompleteRequest}
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
	)
}

interface OwnerChatPreviewSectionProps {
	isOwner: boolean
	acceptedOffer: OfferWithHelper | undefined
	request: RequestDetails
	hasChatPreview: boolean
	chatPreviewMessages: ChatPreviewMessage[]
	currentUserId: string
	onOpenChat: () => void
}

export function OwnerChatPreviewSection({
	isOwner,
	acceptedOffer,
	request,
	hasChatPreview,
	chatPreviewMessages,
	currentUserId,
	onOpenChat,
}: OwnerChatPreviewSectionProps) {
	if (!isOwner || !acceptedOffer || request.status === 'OPEN') {
		return null
	}

	return (
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
					onClick={onOpenChat}
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
	)
}

interface OwnerRatingSectionProps {
	isOwner: boolean
	request: RequestDetails
	acceptedOffer: OfferWithHelper | undefined
	ratedDone: boolean
	ratingStars: number
	ratingComment: string
	isRating: boolean
	onSetRatingStars: Dispatch<SetStateAction<number>>
	onSetRatingComment: Dispatch<SetStateAction<string>>
	onSubmitRating: () => void
}

export function OwnerRatingSection({
	isOwner,
	request,
	acceptedOffer,
	ratedDone,
	ratingStars,
	ratingComment,
	isRating,
	onSetRatingStars,
	onSetRatingComment,
	onSubmitRating,
}: OwnerRatingSectionProps) {
	if (!isOwner || request.status !== 'DONE' || !acceptedOffer) {
		return null
	}

	return (
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
								onClick={() => onSetRatingStars(s)}
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
						onChange={e => onSetRatingComment(e.target.value)}
					/>
					<button
						onClick={onSubmitRating}
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
	)
}

interface OwnerOffersSectionProps {
	isOwner: boolean
	request: RequestDetails
	isLoading: boolean
	onAcceptOffer: (offerId: string) => void
}

export function OwnerOffersSection({
	isOwner,
	request,
	isLoading,
	onAcceptOffer,
}: OwnerOffersSectionProps) {
	if (!isOwner || request.offers.length === 0) {
		return null
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.15 }}
			className='card p-4'
		>
			<p className='text-xs font-semibold text-[#b09880] uppercase tracking-wide mb-3'>
				Angebote ({request.offers.length})
			</p>
			<div className='space-y-3'>
				{request.offers.map(offer => (
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
						{offer.status === 'PENDING' && request.status === 'OPEN' && (
							<div className='flex flex-col gap-1'>
								<button
									onClick={() => onAcceptOffer(offer.id)}
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
	)
}
