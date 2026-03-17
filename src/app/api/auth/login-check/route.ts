import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const loginCheckSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
})

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { email, password } = loginCheckSchema.parse(body)

		const user = await prisma.user.findUnique({
			where: { email },
			select: { password: true, isBanned: true },
		})

		if (!user?.password) {
			return NextResponse.json({ ok: true })
		}

		const isValid = await bcrypt.compare(password, user.password)
		if (!isValid) {
			return NextResponse.json({ ok: true })
		}

		if (user.isBanned) {
			return NextResponse.json(
				{
					error:
						'Ihr Konto wurde vom Administrator gesperrt. Bitte kontaktieren Sie den Support.',
				},
				{ status: 403 },
			)
		}

		return NextResponse.json({ ok: true })
	} catch (err) {
		if (err instanceof z.ZodError) {
			return NextResponse.json(
				{ error: err.issues[0].message },
				{ status: 400 },
			)
		}
		return NextResponse.json(
			{ error: 'Interner Serverfehler.' },
			{ status: 500 },
		)
	}
}
