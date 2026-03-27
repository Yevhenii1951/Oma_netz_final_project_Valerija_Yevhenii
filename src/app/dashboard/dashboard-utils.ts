import {
	Car,
	Cross,
	Footprints,
	Heart,
	House,
	Laptop,
	ShoppingCart,
	type LucideIcon,
} from 'lucide-react'

export function getGreeting(): string {
	const h = new Date().getHours()
	if (h < 12) return 'Guten Morgen,'
	if (h < 17) return 'Guten Tag,'
	return 'Guten Abend,'
}

export function getCategoryIcon(category: string): LucideIcon {
	const icons: Record<string, LucideIcon> = {
		EINKAUF: ShoppingCart,
		ARZT: Cross,
		SPAZIERGANG: Footprints,
		TECHNIK: Laptop,
		TRANSPORT: Car,
		HAUSHALT: House,
		ANDERES: Heart,
	}
	return icons[category] ?? Heart
}
