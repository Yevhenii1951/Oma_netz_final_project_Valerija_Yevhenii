/**
 * The two mails the auth flows need, in the project's German copy.
 *
 * Kept apart from the routes so the wording can be reviewed without reading
 * request handling, and apart from `email-sender` so the transport stays
 * interchangeable.
 */

import type { Mail } from './email-sender'

const APP = 'OMA-NETZ Kassel'

export function verificationMail(to: string, name: string | null, link: string): Mail {
	const greeting = name ? `Hallo ${name},` : 'Hallo,'
	return {
		to,
		subject: `${APP}: Bitte bestätige deine E-Mail-Adresse`,
		text: [
			greeting,
			'',
			'bitte bestätige deine E-Mail-Adresse, damit du dich anmelden kannst.',
			'',
			link,
			'',
			'Der Link ist 24 Stunden gültig. Falls du dich nicht registriert hast,',
			'kannst du diese Nachricht ignorieren.',
		].join('\n'),
	}
}

export function passwordResetMail(to: string, name: string | null, link: string): Mail {
	const greeting = name ? `Hallo ${name},` : 'Hallo,'
	return {
		to,
		subject: `${APP}: Passwort zurücksetzen`,
		text: [
			greeting,
			'',
			'für dein Konto wurde ein Link zum Zurücksetzen des Passworts angefordert.',
			'',
			link,
			'',
			'Der Link ist 1 Stunde gültig und kann nur einmal verwendet werden.',
			'Hast du das nicht angefordert, dann ignoriere diese Nachricht —',
			'dein Passwort bleibt unverändert.',
		].join('\n'),
	}
}