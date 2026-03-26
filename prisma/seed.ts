import { PrismaClient, RequestCategory } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const adminEmail = 'admin@oma-netz.de'
const seedPassword = '123123nfnf'

const SENIOR_USERS = [
	{
		name: 'Hildegard Müller',
		email: 'hildegard@example.com',
		plz: '34117',
		address: 'Königsplatz 2',
		city: 'Kassel',
		phone: '+49 561 12345',
		lat: 51.3118,
		lng: 9.4956,
		ratingAvg: 4.8,
		helpCount: 12,
		points: 150,
	},
	{
		name: 'Wilhelm Bauer',
		email: 'wilhelm@example.com',
		plz: '34121',
		address: 'Holländischer Platz 5',
		city: 'Kassel',
		phone: '+49 561 23456',
		lat: 51.31,
		lng: 9.501,
		ratingAvg: 4.5,
		helpCount: 8,
		points: 95,
	},
	{
		name: 'Erna Schmidt',
		email: 'erna@example.com',
		plz: '34125',
		address: 'Frankfurter Str 14',
		city: 'Kassel',
		phone: '+49 561 34567',
		lat: 51.309,
		lng: 9.505,
		ratingAvg: 4.6,
		helpCount: 10,
		points: 120,
	},
	{
		name: 'Rudolf Fischer',
		email: 'rudolf@example.com',
		plz: '34119',
		address: 'Friedrich-Ebert-Str 3',
		city: 'Kassel',
		phone: '+49 561 45678',
		lat: 51.314,
		lng: 9.498,
		ratingAvg: 4.7,
		helpCount: 15,
		points: 180,
	},
	{
		name: 'Gertrud Weber',
		email: 'gertrud@example.com',
		plz: '34127',
		address: 'Tischbeinstr 8',
		city: 'Kassel',
		phone: '+49 561 56789',
		lat: 51.312,
		lng: 9.502,
		ratingAvg: 4.9,
		helpCount: 18,
		points: 220,
	},
]

const HELPER_USERS = [
	{
		name: 'Lena Koch',
		email: 'lena@example.com',
		plz: '34117',
		bio: 'Student an der Uni Kassel, helfe gerne!',
		city: 'Kassel',
		phone: '+49 561 61234',
		lat: 51.3118,
		lng: 9.4956,
		employmentType: 'Student',
		institution: 'Universität Kassel',
		languages: ['Deutsch', 'Englisch'],
	},
	{
		name: 'Maximilian Braun',
		email: 'max@example.com',
		plz: '34119',
		bio: 'Rentner, viel Zeit und Energie.',
		city: 'Kassel',
		phone: '+49 561 62345',
		lat: 51.314,
		lng: 9.498,
		employmentType: 'Rentner',
		institution: null,
		languages: ['Deutsch'],
	},
	{
		name: 'Sophie Wagner',
		email: 'sophie@example.com',
		plz: '34121',
		bio: 'Krankenpflegerin, medizinische Erfahrung.',
		city: 'Kassel',
		phone: '+49 561 63456',
		lat: 51.31,
		lng: 9.501,
		employmentType: 'Angestellt',
		institution: 'Kliniken des Landkreises Kassel',
		languages: ['Deutsch', 'Englisch', 'Französisch'],
	},
	{
		name: 'Jonas Meyer',
		email: 'jonas@example.com',
		plz: '34125',
		bio: 'IT-Student, helfe bei Technikfragen.',
		city: 'Kassel',
		phone: '+49 561 64567',
		lat: 51.309,
		lng: 9.505,
		employmentType: 'Student',
		institution: 'Universität Kassel',
		languages: ['Deutsch', 'Englisch'],
	},
	{
		name: 'Laura Hoffmann',
		email: 'laura@example.com',
		plz: '34127',
		bio: 'Fahre gerne Senioren zu Terminen.',
		city: 'Kassel',
		phone: '+49 561 65678',
		lat: 51.312,
		lng: 9.502,
		employmentType: 'Selbstständig',
		institution: null,
		languages: ['Deutsch', 'Italienisch'],
	},
	{
		name: 'Tobias Schulz',
		email: 'tobias@example.com',
		plz: '34117',
		bio: 'Koch, kaufe gerne ein.',
		city: 'Kassel',
		phone: '+49 561 66789',
		lat: 51.3118,
		lng: 9.4956,
		employmentType: 'Angestellt',
		institution: 'Restaurant zur Post',
		languages: ['Deutsch', 'Englisch', 'Spanisch'],
	},
	{
		name: 'Anna König',
		email: 'anna@example.com',
		plz: '34119',
		bio: 'Gärtnerin, helfe im Haushalt.',
		city: 'Kassel',
		phone: '+49 561 67890',
		lat: 51.314,
		lng: 9.498,
		employmentType: 'Selbstständig',
		institution: null,
		languages: ['Deutsch'],
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
		city: 'Kassel',
		lat: 51.3118,
		lng: 9.4956,
	},
	{
		title: 'Einkauf bei REWE',
		category: 'EINKAUF',
		description: 'Bitte Einkaufen für die Woche. Liste schreibe ich.',
		desiredTime: 'Morgen früh',
		plz: '34121',
		address: 'Holländischer Platz 5',
		city: 'Kassel',
		lat: 51.31,
		lng: 9.501,
	},
	{
		title: 'Smartphone Hilfe',
		category: 'TECHNIK',
		description: 'WhatsApp anmelden. Ich komme nicht weiter.',
		desiredTime: 'Heute Nachmittag',
		plz: '34125',
		address: 'Frankfurter Str 14',
		city: 'Kassel',
		lat: 51.309,
		lng: 9.505,
	},
	{
		title: 'Spaziergang im Bergpark',
		category: 'SPAZIERGANG',
		description: 'Schöner Spaziergang, gerne mit Unterhaltung.',
		desiredTime: 'Flexibel (jederzeit)',
		plz: '34119',
		address: 'Friedrich-Ebert-Str 3',
		city: 'Kassel',
		lat: 51.314,
		lng: 9.498,
	},
	{
		title: 'Transport zum Krankenhaus',
		category: 'TRANSPORT',
		description: 'Kontrolle. Kann nicht selbst fahren.',
		desiredTime: 'Nächste Woche',
		plz: '34127',
		address: 'Tischbeinstr 8',
		city: 'Kassel',
		lat: 51.312,
		lng: 9.502,
	},
	{
		title: 'Haushaltshilfe',
		category: 'HAUSHALT',
		description: 'Saugen, wischen, Küche reinigen.',
		desiredTime: 'Diese Woche',
		plz: '34117',
		address: 'Kölnische Str 44',
		city: 'Kassel',
		lat: 51.313,
		lng: 9.497,
	},
	{
		title: 'Briefe zur Post bringen',
		category: 'ANDERES',
		description: 'Einige Briefe einwerfen und Paket abholen.',
		desiredTime: 'Heute Nachmittag',
		plz: '34121',
		address: 'Holländischer Platz 12',
		city: 'Kassel',
		lat: 51.311,
		lng: 9.502,
	},
	{
		title: 'Medikamente aus Apotheke',
		category: 'EINKAUF',
		description: 'Rezept liegt bereit, Abholung aus Adler-Apotheke.',
		desiredTime: 'Morgen früh',
		plz: '34119',
		address: 'Wilhelmshöher Allee 5',
		city: 'Kassel',
		lat: 51.315,
		lng: 9.499,
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

	const password = await hash(seedPassword, 12)

	// Admin
	const admin = await prisma.user.upsert({
		where: { email: adminEmail },
		update: {
			name: 'Admin',
			role: 'ADMIN',
			isBanned: false,
			password,
		},
		create: {
			email: adminEmail,
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
				update: {
					...s,
					role: 'SENIOR',
					isBanned: false,
				},
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
		HELPER_USERS.map((h, index) =>
			prisma.user.upsert({
				where: { email: h.email },
				update: {
					...h,
					role: 'HELPER',
					helperStatus: 'APPROVED',
					isBanned: false,
					helpCount: 8 + index,
					points: 40 + index * 10,
					ratingAvg: 4.2 + index * 0.1,
				},
				create: {
					...h,
					password: password,
					role: 'HELPER',
					helperStatus: 'APPROVED',
					helpCount: 8 + index,
					points: 40 + index * 10,
					ratingAvg: 4.2 + index * 0.1,
				},
			}),
		),
	)
	console.log(`✓ ${helpers.length} Helfer erstellt`)

	// Requests
	let createdRequests = 0
	for (let i = 0; i < SAMPLE_REQUESTS.length; i += 1) {
		const request = SAMPLE_REQUESTS[i]
		const seniorId = seniors[i % seniors.length].id

		const existing = await prisma.request.findFirst({
			where: {
				title: request.title,
				address: request.address,
				seniorId,
			},
			select: { id: true },
		})

		if (!existing) {
			await prisma.request.create({
				data: {
					...request,
					category: request.category as RequestCategory,
					seniorId,
					status: 'OPEN',
				},
			})
			createdRequests += 1
		}
	}
	console.log(`✓ ${createdRequests} neue Anfragen erstellt`)

	// Rewards
	let createdRewards = 0
	let updatedRewards = 0
	for (const rwd of REWARDS) {
		const existingReward = await prisma.reward.findFirst({
			where: { title: rwd.title },
			select: { id: true },
		})

		if (existingReward) {
			await prisma.reward.update({
				where: { id: existingReward.id },
				data: { ...rwd, isActive: true },
			})
			updatedRewards += 1
		} else {
			await prisma.reward.create({
				data: { ...rwd, isActive: true },
			})
			createdRewards += 1
		}
	}
	console.log(
		`✓ Belohnungen synchronisiert (neu: ${createdRewards}, aktualisiert: ${updatedRewards})`,
	)

	console.log('\n✅ Seed abgeschlossen!')
	console.log(`\n📋 Login-Daten (alle Passwörter: ${seedPassword})`)
	console.log(`  Admin:  ${adminEmail}`)
	console.log('  Senior: hildegard@example.com')
	console.log('  Helfer: lena@example.com')
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
