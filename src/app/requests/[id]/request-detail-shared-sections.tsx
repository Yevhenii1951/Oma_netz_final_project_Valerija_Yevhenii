import type {
	OfferWithHelper,
	RequestDetails,
} from '@/app/requests/[id]/request-detail-types'
import {
	Avatar,
	CategoryBadge,
	StarRating,
	StatusBadge,
} from '@/components/shell'
import { formatRelativeTime } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
	CheckCircle2,
	Clock,
	Loader2,
	MapPin,
	MessageCircle,
	Send,
	Users,
	XCircle,
} from 'lucide-react'

interface RequestSummarySectionProps {
	request: RequestDetails
}

export function RequestSummarySection({ request }: RequestSummarySectionProps) {
	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				className='card p-5'
			>
				<div className='flex items-start justify-between gap-3 mb-3'>
					<div className='flex-1'>
						<div className='flex flex-wrap gap-2 mb-2'>
							<CategoryBadge category={request.category as string} />
							<StatusBadge status={request.status} />
						</div>
						<h1 className='text-xl font-semibold text-[#3d2b1f]'>
							{request.title}
						</h1>
					</div>
				</div>

				{request.description && (
					<p className='text-[#7a6050] text-sm mb-4 leading-relaxed'>
						{request.description}
					</p>
				)}

				<div className='flex flex-col gap-2 text-sm text-[#7a6050]'>
					{(request.address || request.plz) && (
						<span className='flex items-center gap-1.5'>
							<MapPin className='w-4 h-4' />
							{[request.address, request.plz, 'Kassel']
								.filter(Boolean)
								.join(', ')}
						</span>
					)}
					{request.desiredTime && (
						<span className='flex items-center gap-1.5'>
							<Clock className='w-4 h-4' />
							{request.desiredTime}
						</span>
					)}
					<span className='flex items-center gap-1.5'>
						<Users className='w-4 h-4' />
						{request._count.offers} Angebot
						{request._count.offers !== 1 ? 'e' : ''} ·{' '}
						{formatRelativeTime(request.createdAt)}
					</span>
				</div>
			</motion.div>

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
					<Avatar name={request.senior.name || ''} size='md' />
					<div>
						<p className='font-medium text-[#3d2b1f]'>{request.senior.name}</p>
						{request.senior.ratingAvg > 0 && (
							<StarRating value={Math.round(request.senior.ratingAvg)} />
						)}
					</div>
				</div>
			</motion.div>
		</>
	)
}

interface RequestErrorBannerProps {
	error: string
}

export function RequestErrorBanner({ error }: RequestErrorBannerProps) {
	if (!error) {
		return null
	}

	return (
		<div className='bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-100'>
			{error}
		</div>
	)
}

interface RequestParticipationSectionProps {
	isOwner: boolean
	isSameRole: boolean
	myOffer: OfferWithHelper | null
	request: RequestDetails
	isSeniorOrRelative: boolean
	userRole: string
	onOpenOfferModal: () => void
	onOpenChat: () => void
}

export function RequestParticipationSection({
	isOwner,
	isSameRole,
	myOffer,
	request,
	isSeniorOrRelative,
	userRole,
	onOpenOfferModal,
	onOpenChat,
}: RequestParticipationSectionProps) {
	if (!isOwner && !isSameRole) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className='space-y-2'
			>
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
								onClick={onOpenChat}
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

				{!myOffer && request.status === 'OPEN' && (
					<button
						onClick={onOpenOfferModal}
						className='btn-primary w-full py-3 text-base'
					>
						{userRole === 'SENIOR' || userRole === 'RELATIVE'
							? 'Ich bin dabei! 🤝'
							: 'Ich helfe gerne! 🙋'}
					</button>
				)}

				{!myOffer && request.status === 'IN_PROGRESS' && (
					<div className='card p-4 text-center text-[#7a6050] text-sm bg-[#f5ede0]'>
						🔒 Diese Anfrage ist bereits in Bearbeitung.
					</div>
				)}
			</motion.div>
		)
	}

	if (!isOwner && isSameRole) {
		return (
			<div className='card p-4 text-center text-[#7a6050] text-sm bg-amber-50 border border-amber-200'>
				ℹ️ Du kannst diese Anfrage nicht annehmen, da sie von einem Nutzer mit
				derselben Rolle erstellt wurde.
			</div>
		)
	}

	return null
}

interface OfferModalProps {
	show: boolean
	isLoading: boolean
	error: string
	offerMessage: string
	isSeniorOrRelative: boolean
	onClose: () => void
	onChangeMessage: (value: string) => void
	onSend: () => void
}

export function OfferModal({
	show,
	isLoading,
	error,
	offerMessage,
	isSeniorOrRelative,
	onClose,
	onChangeMessage,
	onSend,
}: OfferModalProps) {
	return (
		<AnimatePresence>
			{show && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4'
					onClick={e => e.target === e.currentTarget && onClose()}
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
							onChange={e => onChangeMessage(e.target.value)}
						/>
						{error && <p className='text-red-500 text-sm mb-3'>{error}</p>}
						<div className='flex gap-2'>
							<button onClick={onClose} className='btn-secondary flex-1'>
								Abbrechen
							</button>
							<button
								onClick={onSend}
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
	)
}
