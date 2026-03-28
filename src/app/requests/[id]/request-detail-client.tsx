'use client'

import type {
	OfferWithHelper,
	RequestDetailClientProps,
	RequestDetails,
} from '@/app/requests/[id]/request-detail-types'
import { PageShell } from '@/components/shell'
import { useToast } from '@/components/ui/toaster'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
	OwnerChatPreviewSection,
	OwnerInProgressActions,
	OwnerOffersSection,
	OwnerRatingSection,
} from './request-detail-owner-sections'
import {
	OfferModal,
	RequestErrorBanner,
	RequestParticipationSection,
	RequestSummarySection,
} from './request-detail-shared-sections'

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
	const handleOpenChat = () => router.push(`/chat/${localRequest.id}`)

	return (
		<PageShell title='Anfrage'>
			<div className='max-w-2xl mx-auto space-y-4'>
				<RequestSummarySection request={localRequest} />
				<RequestErrorBanner error={error} />
				<RequestParticipationSection
					isOwner={isOwner}
					isSameRole={isSameRole}
					myOffer={myOffer}
					request={localRequest}
					isSeniorOrRelative={isSeniorOrRelative}
					userRole={userRole}
					onOpenOfferModal={() => setShowOfferModal(true)}
					onOpenChat={handleOpenChat}
				/>
				<OwnerInProgressActions
					isOwner={isOwner}
					request={localRequest}
					acceptedOffer={acceptedOffer}
					isHelperOwner={isHelperOwner}
					isLoading={isLoading}
					onOpenChat={handleOpenChat}
					onCompleteRequest={completeRequest}
				/>
				<OwnerChatPreviewSection
					isOwner={isOwner}
					acceptedOffer={acceptedOffer}
					request={localRequest}
					hasChatPreview={hasChatPreview}
					chatPreviewMessages={chatPreviewMessages}
					currentUserId={currentUserId}
					onOpenChat={handleOpenChat}
				/>
				<OwnerRatingSection
					isOwner={isOwner}
					request={localRequest}
					acceptedOffer={acceptedOffer}
					ratedDone={ratedDone}
					ratingStars={ratingStars}
					ratingComment={ratingComment}
					isRating={isRating}
					onSetRatingStars={setRatingStars}
					onSetRatingComment={setRatingComment}
					onSubmitRating={submitRating}
				/>
				<OwnerOffersSection
					isOwner={isOwner}
					request={localRequest}
					isLoading={isLoading}
					onAcceptOffer={acceptOffer}
				/>
			</div>
			<OfferModal
				show={showOfferModal}
				isLoading={isLoading}
				error={error}
				offerMessage={offerMessage}
				isSeniorOrRelative={isSeniorOrRelative}
				onClose={() => setShowOfferModal(false)}
				onChangeMessage={setOfferMessage}
				onSend={sendOffer}
			/>
		</PageShell>
	)
}
