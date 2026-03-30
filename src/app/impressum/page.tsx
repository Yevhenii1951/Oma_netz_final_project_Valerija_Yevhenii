import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Impressum',
	description: 'Impressum und Kontaktdaten für OMA-NETZ Kassel',
}

export default function ImpressumPage() {
	return (
		<div className='min-h-screen bg-[#f5ede0] py-12 px-4 sm:px-6 lg:px-8 font-body'>
			<div className='max-w-3xl mx-auto'>
				<div className='mb-6'>
					<Link
						href='/landing'
						aria-label='Zurück zur Landing Page'
						className='inline-flex items-center gap-1.5 text-xs font-semibold text-[#3d2b1f] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d2b1f] focus-visible:ring-offset-2 rounded'
					>
						<span
							aria-hidden='true'
							className='inline-flex items-center justify-center text-base leading-none'
						>
							⟵
						</span>
						<span>Zurück</span>
					</Link>
				</div>
				{/* Header */}
				<div className='text-center mb-12'>
					<h1 className='text-3xl sm:text-4xl font-bold text-[#3d2b1f] mb-4'>
						Impressum
					</h1>
					<p className='text-sm sm:text-base text-[#7a6050]'>
						Angaben gemäß § 5 TMG
					</p>
				</div>

				{/* Content Card */}
				<div className='bg-white rounded-2xl shadow-xl p-5 sm:p-8 mb-8 text-justify'>
					{/* Projektverantwortliche */}
					<section className='mb-8'>
						<h2 className='text-xl sm:text-2xl font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-[#8b5e3c]'>
							Projektverantwortliche
						</h2>
						<div className='space-y-2 text-[#3d2b1f]'>
							<p>
								<strong>Valeriia Kovalenko &amp; Yevhenii Riabokon</strong>
							</p>
							<p>Studentenprojekt im Rahmen der Full-Stack-Entwicklung (DCI)</p>
							<p>Standort: Kassel, Deutschland</p>
						</div>
					</section>

					{/* Kontakt */}
					<section className='mb-8'>
						<h2 className='text-xl sm:text-2xl font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-[#8b5e3c]'>
							Kontakt
						</h2>
						<div className='space-y-2 text-[#3d2b1f]'>
							<p>
								E-Mail:{' '}
								<a
									href='mailto:kontakt@oma-netz-kassel.de'
									className='text-[#8b5e3c] hover:text-[#6b4226] underline'
								>
									kontakt@oma-netz-kassel.de
								</a>
							</p>
							<p className='text-sm text-[#7a6050] italic'>
								Hinweis: Dies ist ein Studentenprojekt. Für Anfragen nutzen Sie
								bitte ausschließlich die E-Mail-Adresse.
							</p>
						</div>
					</section>

					{/* Projektbeschreibung */}
					<section className='mb-8'>
						<h2 className='text-xl sm:text-2xl font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-[#8b5e3c]'>
							Projektbeschreibung
						</h2>
						<p className='text-[#3d2b1f]'>
							OMA-NETZ Kassel ist ein Studentenprojekt zur digitalen
							Unterstützung von Nachbarschaftshilfe für ältere Menschen in
							Kassel. Die Plattform verbindet freiwillige Helfer mit Senioren,
							die Unterstützung im Alltag benötigen.
						</p>
					</section>

					{/* Haftungsausschluss */}
					<section className='mb-8'>
						<h2 className='text-xl sm:text-2xl font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-[#8b5e3c]'>
							Haftungsausschluss
						</h2>
						<div className='space-y-4 text-[#3d2b1f]'>
							<div>
								<h3 className='font-semibold text-[#3d2b1f] mb-2'>
									Haftung für Inhalte
								</h3>
								<p className='text-sm'>
									Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für die
									eigenen Inhalte auf diesen Seiten nach den allgemeinen
									Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
									Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
									gespeicherte fremde Informationen zu überwachen.
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-[#3d2b1f] mb-2'>
									Haftung für Links
								</h3>
								<p className='text-sm'>
									Unser Angebot enthält Links zu externen Websites Dritter, auf
									deren Inhalte wir keinen Einfluss haben. Für die Inhalte der
									verlinkten Seiten ist stets der jeweilige Anbieter oder
									Betreiber verantwortlich.
								</p>
							</div>
						</div>
					</section>

					{/* Urheberrecht */}
					<section>
						<h2 className='text-xl sm:text-2xl font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-[#8b5e3c]'>
							Urheberrecht
						</h2>
						<p className='text-[#3d2b1f] text-sm'>
							Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
							diesen Seiten unterliegen dem deutschen Urheberrecht. Die
							Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
							Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
							schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
						</p>
					</section>
				</div>

				{/* Footer Note */}
				<div className='text-center text-xs sm:text-sm text-[#8b5e3c]'>
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
