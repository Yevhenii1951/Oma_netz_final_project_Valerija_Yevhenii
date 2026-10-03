/**
 * Outbound mail.
 *
 * The project has no SMTP account and no mail provider wired up, so instead of
 * pulling in a dependency that cannot work here, sending is a seam: one
 * interface, one implementation, one place to change.
 *
 * The default implementation writes the mail to the server log. That is enough
 * to develop and to demo the flow end to end — on Vercel the link shows up in
 * the deployment logs — but it does NOT deliver anything, and nothing here
 * pretends otherwise.
 *
 * To make it real: implement `MailSender`, register it in `setSender()` from
 * your deployment entry point, and read the SMTP/provider credentials from the
 * environment there.
 */

export interface Mail {
	to: string
	subject: string
	text: string
}

export interface MailSender {
	readonly name: string
	send(mail: Mail): Promise<void>
}

class LogMailSender implements MailSender {
	readonly name = 'log'

	async send(mail: Mail): Promise<void> {
		// console.info rather than console.log: deployment log filters show info
		// and above, and a "quiet" build silences log/debug but not info.
		console.info(
			`[mail:${this.name}] to=${mail.to} subject=${JSON.stringify(mail.subject)}\n${mail.text}`,
		)
	}
}

let sender: MailSender = new LogMailSender()

export function getSender(): MailSender {
	return sender
}

/** Swap in a real sender (or a stub) without touching the environment. */
export function setSender(next: MailSender): void {
	sender = next
}

export async function sendMail(mail: Mail): Promise<void> {
	await sender.send(mail)
}