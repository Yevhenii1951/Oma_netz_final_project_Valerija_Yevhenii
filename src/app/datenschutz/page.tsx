import type { Metadata } from 'next'
import { SERVER_LOG_ITEMS, USER_RIGHTS } from './constants'

export const metadata: Metadata = {
	title: 'Datenschutzerklärung',
	description: 'Datenschutzerklärung gemäß DSGVO für OMA-NETZ Kassel',
}

export default function DatenschutzPage() {
	return (
		<div className='min-h-screen bg-[#f5ede0] py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-4xl mx-auto'>
				{/* Header */}
				<div className='text-center mb-12'>
					<h1 className='text-4xl font-playfair font-bold text-[#3d2b1f] mb-4'>
						Datenschutzerklärung
					</h1>
					<p className='text-emerald-800'>
						Informationspflicht gemäß Datenschutz-Grundverordnung (DSGVO)
					</p>
				</div>

				{/* Content Card */}
				<div className='bg-white rounded-2xl shadow-xl p-8 mb-8'>
					{/* 1. Überblick */}
					<section className='mb-10'>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							1. Datenschutz auf einen Blick
						</h2>
						<div className='space-y-4 text-gray-700'>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
									Allgemeine Hinweise
								</h3>
								<p className='text-sm'>
									Die folgenden Hinweise geben einen einfachen Überblick
									darüber, was mit Ihren personenbezogenen Daten passiert, wenn
									Sie diese Website besuchen. Personenbezogene Daten sind alle
									Daten, mit denen Sie persönlich identifiziert werden können.
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
									Datenerfassung auf dieser Website
								</h3>
								<p className='text-sm'>
									Die Datenverarbeitung auf dieser Website erfolgt durch den
									Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt
									&quot;Impressum&quot; dieser Website entnehmen.
								</p>
							</div>
						</div>
					</section>

					{/* 2. Hosting */}
					<section className='mb-10'>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							2. Hosting
						</h2>
						<div className='space-y-4 text-gray-700'>
							<p className='text-sm'>
								Wir hosten unsere Website bei einem externen Dienstleister
								(Hoster). Die personenbezogenen Daten, die auf dieser Website
								erfasst werden, werden auf den Servern des Hosters gespeichert.
							</p>
							<div className='bg-[#f2ece3] rounded-lg p-4'>
								<p className='font-semibold text-[#423329] mb-2'>
									Unser Hoster:
								</p>
								<p className='text-sm'>
									<strong>Vercel Inc.</strong>
									<br />
									340 S Lemon Ave #4133
									<br />
									Walnut, CA 91789
									<br />
									USA
								</p>
								<p className='text-sm mt-3'>
									Der Hoster erhebt Daten in Logfiles (IP-Adresse, Referrer-URL,
									Browser, Betriebssystem, etc.). Die Verarbeitung erfolgt auf
									Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
									Interesse an stabiler Darstellung).
								</p>
							</div>
						</div>
					</section>

					{/* 3. Allgemeine Hinweise */}
					<section className='mb-10'>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							3. Allgemeine Hinweise und Pflichtinformationen
						</h2>
						<div className='space-y-4 text-gray-700'>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
									Datenschutz
								</h3>
								<p className='text-sm'>
									Die Betreiber dieser Seiten nehmen den Schutz Ihrer
									persönlichen Daten sehr ernst. Wir behandeln Ihre
									personenbezogenen Daten vertraulich und entsprechend der
									gesetzlichen Datenschutzvorschriften.
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
									Hinweis zur Datenübertragung in die USA
								</h3>
								<p className='text-sm'>
									Unter anderem sind auf unserer Website Tools von Unternehmen
									mit Sitz in den USA integriert. Wenn diese Tools aktiv sind,
									können Ihre personenbezogene Daten in die USA übertragen
									werden. Wir weisen darauf hin, dass in den USA kein
									europäisches Datenschutzniveau besteht.
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
									Widerruf Ihrer Einwilligung
								</h3>
								<p className='text-sm'>
									Viele Datenverarbeitungsvorgänge sind nur mit Ihrer
									ausdrücklichen Einwilligung möglich. Sie können eine bereits
									erteilte Einwilligung jederzeit widerrufen.
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
									Beschwerderecht bei der zuständigen Aufsichtsbehörde
								</h3>
								<p className='text-sm'>
									Im Falle datenschutzrechtlicher Verstöße steht Ihnen ein
									Beschwerderecht bei einer Aufsichtsbehörde zu. In Deutschland
									ist der Hessische Beauftragte für Datenschutz und
									Freiheitsinformation zuständig:
								</p>
								<p className='text-sm mt-2 bg-[#f2ece3] rounded p-3'>
									Hessischer Beauftragter für Datenschutz und
									Freiheitsinformation
									<br />
									Gustav-Stresemann-Ring 1
									<br />
									65189 Wiesbaden
									<br />
									E-Mail: poststelle@datenschutz.hessen.de
								</p>
							</div>
						</div>
					</section>

					{/* 4. Datenerfassung */}
					<section className='mb-10'>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							4. Datenerfassung auf dieser Website
						</h2>
						<div className='space-y-4 text-gray-700'>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>Cookies</h3>
								<p className='text-sm'>
									Unsere Website verwendet so genannte &quot;Cookies&quot;.
									Cookies sind kleine Textdateien und richten auf Ihrem Endgerät
									keinen Schaden an. Sie dienen dazu, unser Angebot
									nutzerfreundlicher, effektiver und sicherer zu machen.
								</p>
								<p className='text-sm mt-2'>
									Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
									Interesse an technisch einwandfreier Bereitstellung).
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
									Server-Log-Dateien
								</h3>
								<p className='text-sm'>
									Der Provider der Seiten erhebt und speichert automatisch
									Informationen in so genannten Server-Log-Dateien:
								</p>
								<ul className='text-sm list-disc list-inside mt-2 space-y-1'>
									{SERVER_LOG_ITEMS.map(item => (
										<li key={item}>{item}</li>
									))}
								</ul>
								<p className='text-sm mt-2'>
									Diese Daten werden nicht mit anderen Datenquellen
									zusammengeführt. Die Erfassung erfolgt auf Grundlage von Art.
									6 Abs. 1 lit. f DSGVO.
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
									Kontaktanfrage (E-Mail, Telefon, Fax)
								</h3>
								<p className='text-sm'>
									Wenn Sie uns per E-Mail kontaktieren, werden Ihre mitgeteilten
									Daten (inkl. Kontaktdaten) zwecks Bearbeitung der Anfrage
									gespeichert. Diese Daten geben wir nicht ohne Ihre
									Einwilligung weiter.
								</p>
								<p className='text-sm mt-2'>
									Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO
									(Vertragserfüllung) oder lit. f DSGVO (berechtigtes
									Interesse).
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
									Registrierung
								</h3>
								<p className='text-sm'>
									Sie haben die Möglichkeit, sich auf unserer Website zu
									registrieren. Die im Rahmen der Registrierung eingegebenen
									Daten werden für die Zwecke der Nutzung der Website
									gespeichert.
								</p>
								<p className='text-sm mt-2'>
									Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) und
									lit. b DSGVO (Vertragserfüllung).
								</p>
							</div>
						</div>
					</section>

					{/* 5. Analyse-Tools */}
					<section className='mb-10'>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							5. Analyse-Tools und Tools von Drittanbietern
						</h2>
						<div className='space-y-4 text-gray-700'>
							<div className='bg-amber-50 rounded-lg p-4 border-l-4 border-amber-400'>
								<p className='text-sm text-amber-800'>
									<strong>Hinweis:</strong> Dieses Studentenprojekt verwendet
									derzeit keine externen Analyse-Tools wie Google Analytics.
									Sollten solche Tools in Zukunft eingesetzt werden, wird diese
									Datenschutzerklärung entsprechend aktualisiert.
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
									Google Fonts (lokal)
								</h3>
								<p className='text-sm'>
									Diese Seite nutzt zur einheitlichen Darstellung von
									Schriftarten so genannte Google Fonts, die von Google
									bereitgestellt werden. Beim Aufruf einer Seite lädt Ihr
									Browser die benötigten Fonts in seinen Browsercache. Zu diesem
									Zweck muss der von Ihnen verwendete Browser Verbindung zu den
									Servern von Google aufnehmen. Hierbei erlangt Google keine
									Kenntnis über Ihre personenbezogenen Daten.
								</p>
								<p className='text-sm mt-2'>
									Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
									Interesse an einheitlicher Darstellung).
								</p>
							</div>
						</div>
					</section>

					{/* 6. Ihre Rechte */}
					<section className='mb-10'>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							6. Ihre Rechte
						</h2>
						<div className='space-y-3 text-gray-700'>
							<p className='text-sm'>Sie haben jederzeit das Recht auf:</p>
							<ul className='text-sm list-disc list-inside space-y-1'>
								{USER_RIGHTS.map(item => (
									<li key={item}>{item}</li>
								))}
							</ul>
							<p className='text-sm mt-3'>
								Wenn Sie eine Anfrage zur Ausübung Ihrer Rechte haben, wenden
								Sie sich bitte an:{' '}
								<a
									href='mailto:kontakt@oma-netz-kassel.de'
									className='text-emerald-600 hover:text-emerald-700 underline'
								>
									kontakt@oma-netz-kassel.de
								</a>
							</p>
						</div>
					</section>

					{/* 7. Speicherdauer */}
					<section>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							7. Speicherdauer
						</h2>
						<p className='text-gray-700 text-sm'>
							Soweit innerhalb dieser Datenschutzerklärung keine speziellere
							Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen
							Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt
							oder Sie eine Löschung erwirken. Gesetzliche Aufbewahrungsfristen
							bleiben unberührt.
						</p>
					</section>
				</div>

				{/* Footer Note */}
				<div className='text-center text-sm text-[#8b5e3c]'>
					<p>
						Stand:{' '}
						{new Date().toLocaleDateString('de-DE', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
					</p>
					<p className='mt-2'>
						Dies ist ein nicht-kommerzielles Studentenprojekt.
					</p>
				</div>
			</div>
		</div>
	)
}
