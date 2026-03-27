export interface OfferHelper {
	name: string | null
	ratingAvg: number
	helpCount: number
}

export interface OfferWithHelper {
	id: string
	message: string | null
	status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
	createdAt: string
	helper: OfferHelper
}

export interface RequestDetails {
	id: string
	title: string
	description: string
	category: string
	status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
	address: string | null
	plz: string | null
	desiredTime: string | null
	createdAt: string
	_count: { offers: number }
	senior: { name: string | null; ratingAvg: number }
	offers: OfferWithHelper[]
}

export interface ChatPreviewMessage {
	id: string
	content: string
	createdAt: string
	senderId: string
	sender: { id: string; name: string | null }
}

export interface RequestDetailClientProps {
	request: RequestDetails
	isOwner: boolean
	isHelper: boolean
	isSameRole: boolean
	myOffer: OfferWithHelper | null
	currentUserId: string
	userRole: string
	hasRating: boolean
	chatPreviewMessages: ChatPreviewMessage[]
}
