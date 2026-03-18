import type { Role } from '@/types'

export interface RoleUiTokens {
	cardAccent: string
	iconBg: string
	rolePill: string
	roleLabel: string
	descBorder: string
}

export function getRoleUiTokens(role: Role): RoleUiTokens {
	if (role === 'RELATIVE') {
		return {
			cardAccent: 'border-l-4 border-l-blue-300 hover:border-l-blue-400',
			iconBg: 'bg-blue-50 border border-blue-100',
			rolePill: 'bg-blue-50 text-blue-600 border border-blue-100',
			roleLabel: '💛 Angehöriger',
			descBorder: 'border-blue-200',
		}
	}

	if (role === 'HELPER') {
		return {
			cardAccent:
				'border-l-4 border-l-emerald-300 hover:border-l-emerald-500 !bg-[#f0faf4]',
			iconBg:
				'bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-50',
			rolePill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
			roleLabel: '🤝 Helfer',
			descBorder: 'border-emerald-200',
		}
	}

	return {
		cardAccent: 'border-l-4 border-l-[#c8956c] hover:border-l-[#8b5e3c]',
		iconBg:
			'bg-[#ede3d4] border border-[#ddd0be] group-hover:border-[#c8956c] group-hover:bg-[#f5ede0]',
		rolePill: 'bg-[#f5ede0] text-[#8b5e3c] border border-[#e8d5be]',
		roleLabel: '🧓 Senior',
		descBorder: 'border-[#ddd0be]',
	}
}
