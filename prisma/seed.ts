import { PrismaClient, RequestCategory } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const SENIOR_USERS = [
	{
		name: 'Hildegard Müller',
		email: 'hildegard@example.com',
		plz: '34117',
		address: 'Königsplatz 2',
	},
	{
		name: 'Wilhelm Bauer',
		email: 'wilhelm@example.com',
		plz: '34121',
		address: 'Holländischer Platz 5',
	},
	{
		name: 'Erna Schmidt',
		email: 'erna@example.com',
		plz: '34125',
		address: 'Frankfurter Str 14',
	},
	{
		name: 'Rudolf Fischer',
		email: 'rudolf@example.com',
		plz: '34119',
		address: 'Friedrich-Ebert-Str 3',
	},
	{
		name: 'Gertrud Weber',
		email: 'gertrud@example.com',
		plz: '34127',
		address: 'Tischbeinstr 8',
	},
]

const HELPER_USERS = [
	{
		name: 'Lena Koch',
		email: 'lena@example.com',
		plz: '34117',
		bio: 'Student an der Uni Kassel, helfe gerne!',
	},
	{
		name: 'Maximilian Braun',
		email: 'max@example.com',
		plz: '34119',
		bio: 'Rentner, viel Zeit und Energie.',
	},
	{
		name: 'Sophie Wagner',
		email: 'sophie@example.com',
		plz: '34121',
		bio: 'Krankenpflegerin, medizinische Erfahrung.',
	},
	{
		name: 'Jonas Meyer',
		email: 'jonas@example.com',
		plz: '34125',
		bio: 'IT-Student, helfe bei Technikfragen.',
	},
	{
		name: 'Laura Hoffmann',
		email: 'laura@example.com',
		plz: '34127',
		bio: 'Fahre gerne Senioren zu Terminen.',
	},
	{
		name: 'Tobias Schulz',
		email: 'tobias@example.com',
		plz: '34117',
		bio: 'Koch, kaufe gerne ein.',
	},
	{
		name: 'Anna König',
		email: 'anna@example.com',
		plz: '34119',
		bio: 'Gärtnerin, helfe im Haushalt.',
	},
]

const SAMPLE_REQUESTS = [
	{
		title: 'Begleitung zum Hausarzt',
		category: 'ARZT',
		description: 'Ich brauche jemanden der mich zum Arzt begleitet und abholt.',
		desiredTime: 'Diese Woche',
		plz: '34117',
		address: 'Königsplatz 2',
	},
	{
		title: 'Einkauf bei REWE',
		category: 'EINKAUF',
		description: 'Bitte Einkaufen für die Woche. Liste schreibe ich.',
		desiredTime: 'Morgen früh',
		plz: '34121',
		address: 'Holländischer Platz 5',
	},
	{
		title: 'Smartphone Hilfe',
		category: 'TECHNIK',
		description: 'WhatsApp anmelden. Ich komme nicht weiter.',
		desiredTime: 'Heute Nachmittag',
		plz: '34125',
		address: 'Frankfurter Str 14',
	},
	{
		title: 'Spaziergang im Bergpark',
		category: 'SPAZIERGANG',
		description: 'Schöner Spaziergang, gerne mit Unterhaltung.',
		desiredTime: 'Flexibel (jederzeit)',
		plz: '34119',
		address: 'Friedrich-Ebert-Str 3',
	},
	{
		title: 'Transport zum Krankenhaus',
		category: 'TRANSPORT',
		description: 'Kontrolle. Kann nicht selbst fahren.',
		desiredTime: 'Nächste Woche',
		plz: '34127',
		address: 'Tischbeinstr 8',
	},
	{
		title: 'Haushaltshilfe',
		category: 'HAUSHALT',
		description: 'Saugen, wischen, Küche reinigen.',
		desiredTime: 'Diese Woche',
		plz: '34117',
		address: 'Kölnische Str 44',
	},
	{
		title: 'Briefe zur Post bringen',
		category: 'ANDERES',
		description: 'Einige Briefe einwerfen und Paket abholen.',
		desiredTime: 'Heute Nachmittag',
		plz: '34121',
		address: 'Holländischer Platz 12',
	},
	{
		title: 'Medikamente aus Apotheke',
		category: 'EINKAUF',
		description: 'Rezept liegt bereit, Abholung aus Adler-Apotheke.',
		desiredTime: 'Morgen früh',
		plz: '34119',
		address: 'Wilhelmshöher Allee 5',
	},
]

const REWARDS = [
	{
		title: 'KVG Tageskarte',
		description: 'Kostenlose Fahrt durch Kassel für einen Tag',
		pointsCost: 50,
	},
	{
		title: 'Kinoticket (Bali-Kinos)',
		description: 'Ein Ticket für das Bali-Kino Kassel',
		pointsCost: 80,
	},
	{
		title: 'Ehrenamtsurkunde',
		description: 'Offizielle Anerkennung durch die Stadt Kassel',
		pointsCost: 100,
	},
	{
		title: 'Baum-Patenschaft',
		description: 'Ein Baum wird in Kassel in Ihrem Namen gepflanzt',
		pointsCost: 150,
	},
	{
		title: 'Stadtmuseum Freikarte',
		description: 'Kostenloser Eintritt in das Stadtmuseum Kassel',
		pointsCost: 30,
	},
]

async function main() {
	console.log('🌱 Seeding database…')

	const password = await hash('password123', 12)

	// Admin
	const admin = await prisma.user.upsert({
		where: { email: 'admin@oma-netz.de' },
		update: {},
		create: {
			email: 'admin@oma-netz.de',
			name: 'Admin',
			password: password,
			role: 'ADMIN',

			points: 0,
		},
	})
	console.log(`✓ Admin: ${admin.email}`)

	// Seniors
	const seniors = await Promise.all(
		SENIOR_USERS.map(s =>
			prisma.user.upsert({
				where: { email: s.email },
				update: {},
				create: {
					...s,
					password: password,
					role: 'SENIOR',
				},
			}),
		),
	)
	console.log(`✓ ${seniors.length} Senioren erstellt`)

	// Helpers
	const helpers = await Promise.all(
		HELPER_USERS.map(h =>
			prisma.user.upsert({
				where: { email: h.email },
				update: { helperStatus: 'APPROVED' },
				create: {
					...h,
					password: password,
					role: 'HELPER',
					helperStatus: 'APPROVED',
					helpCount: Math.floor(Math.random() * 20),
					points: Math.floor(Math.random() * 200),
					ratingAvg: 4 + Math.random(),
				},
			}),
		),
	)
	console.log(`✓ ${helpers.length} Helfer erstellt`)

	// Requests
	const requests = await Promise.all(
		SAMPLE_REQUESTS.map((r, i) =>
			prisma.request.create({
				data: {
					...r,
					category: r.category as RequestCategory,
					seniorId: seniors[i % seniors.length].id,
					status: 'OPEN',
				},
			}),
		),
	)
	console.log(`✓ ${requests.length} Anfragen erstellt`)

	// Rewards
	await prisma.reward.deleteMany()
	for (const rwd of REWARDS) {
		await prisma.reward.create({
			data: { ...rwd, isActive: true },
		})
	}
	console.log(`✓ ${REWARDS.length} Belohnungen erstellt`)

	console.log('\n✅ Seed abgeschlossen!')
	console.log('\n📋 Login-Daten (alle Passwörter: password123)')
	console.log('  Admin:  admin@oma-netz.de')
	console.log('  Senior: hildegard@example.com')
	console.log('  Helfer: lena@example.com')
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
