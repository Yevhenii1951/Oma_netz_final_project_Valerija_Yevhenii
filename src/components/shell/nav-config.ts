import {
	Gift,
	Home,
	Map,
	MessageCircle,
	PlusCircle,
	Search,
} from 'lucide-react'

// Routes blocked for helpers awaiting approval
export const HELPER_LOCKED_ROUTES = ['/requests', '/chat', '/map']

// Desktop sidebar navigation items
export const navItems = [
	{ href: '/dashboard', icon: Home, label: 'Übersicht' },
	{ href: '/requests', icon: Search, label: 'Anfragen' },
	{
		href: '/requests/new',
		icon: PlusCircle,
		label: 'Erstellen',
		primary: true,
	},
	{ href: '/chat', icon: MessageCircle, label: 'Nachrichten' },
	{ href: '/rewards', icon: Gift, label: 'Belohnungen' },
	{ href: '/map', icon: Map, label: 'Karte' },
]

// Mobile bottom navigation items
export const mobileItems = [
	{ href: '/dashboard', icon: Home, label: 'Home' },
	{ href: '/requests', icon: Search, label: 'Anfragen' },
	{ href: '/requests/new', icon: PlusCircle, label: 'Neu', primary: true },
	{ href: '/chat', icon: MessageCircle, label: 'Chat' },
	{ href: '/map', icon: Map, label: 'Karte' },
	{ href: '/rewards', icon: Gift, label: 'Punkte' },
]
