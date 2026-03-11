import { prisma } from '@/lib/prisma'
import type { Role } from '@/types'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const registerSchema = z.object({
	name: z.string().min(2, 'Name ist zu kurz'),
	email: z.string().email('Ungültige E-Mail-Adresse'),
	password: z.string().min(8, 'Passwort mindestens 8 Zeichen'),
	role: z.enum(['SENIOR', 'HELPER', 'RELATIVE']),
	phone: z.string().optional(),
	plz: z.string().optional(),
	employmentType: z.string().optional(),
	institution: z.string().optional(),
	languages: z.array(z.string()).optional(),
	documentNumber: z.string().optional(),
	registrationAddress: z.string().optional(),
})

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const data = registerSchema.parse(body)

		// Check if email already exists
		const existing = await prisma.user.findUnique({
			where: { email: data.email },
		})
		if (existing) {
			return NextResponse.json(
				{ error: 'E-Mail-Adresse bereits registriert.' },
				{ status: 409 },
			)
		}

		const hashedPassword = await bcrypt.hash(data.password, 12)

		const user = await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				password: hashedPassword,
				role: data.role as Role,
				phone: data.phone,
				plz: data.plz,
				city: 'Kassel',
				employmentType: data.employmentType,
				institution: data.institution,
				languages: data.languages ?? [],
				documentNumber: data.documentNumber,
				registrationAddress: data.registrationAddress,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				helperStatus: true,
			},
		})

		const admins = await prisma.user.findMany({
			where: { role: 'ADMIN' },
			select: { id: true },
		})
		if (admins.length > 0) {
			const roleLabel =
				user.role === 'HELPER'
					? 'Helfer'
					: user.role === 'SENIOR'
						? 'Senior'
						: 'Angehöriger'
			await prisma.notification.createMany({
				data: admins.map(admin => ({
					userId: admin.id,
					title: `👤 Neue Registrierung: ${user.name}`,
					body: `${user.name} hat sich als ${roleLabel} registriert.`,
					link: '/admin',
					read: false,
				})),
			})
		}

		return NextResponse.json(
			{ data: user, message: 'Registrierung erfolgreich!' },
			{ status: 201 },
		)
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		console.error('[Register]', err)
		return NextResponse.json(
			{ error: 'Interner Serverfehler.' },
			{ status: 500 },
		)
	}
}
