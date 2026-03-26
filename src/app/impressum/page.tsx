import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Impressum',
	description: 'Impressum und Kontaktdaten für OMA-NETZ Kassel',
}

export default function ImpressumPage() {
	return (
		<div className='min-h-screen bg-[#f5ede0] py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-3xl mx-auto'>
				{/* Header */}
				<div className='text-center mb-12'>
					<h1 className='text-4xl font-playfair font-bold text-[#3d2b1f] mb-4'>
						Impressum
					</h1>
					<p className='text-emerald-800'>Angaben gemäß § 5 TMG</p>
				</div>

				{/* Content Card */}
				<div className='bg-white rounded-2xl shadow-xl p-8 mb-8'>
					{/* Projektverantwortliche */}
					<section className='mb-8'>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							Projektverantwortliche
						</h2>
						<div className='space-y-2 text-gray-700'>
							<p>
								<strong>Valeriia Kovalenko &amp; Yevhenii Riabokon</strong>
							</p>
							<p>Studentenprojekt im Rahmen der Full-Stack-Entwicklung (DCI)</p>
							<p>Standort: Kassel, Deutschland</p>
						</div>
					</section>

					{/* Kontakt */}
					<section className='mb-8'>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							Kontakt
						</h2>
						<div className='space-y-2 text-gray-700'>
							<p>
								E-Mail:{' '}
								<a
									href='mailto:kontakt@oma-netz-kassel.de'
									className='text-[#8b5e3c] hover:text-[#6b4226] underline'
								>
									kontakt@oma-netz-kassel.de
								</a>
							</p>
							<p className='text-sm text-gray-500 italic'>
								Hinweis: Dies ist ein Studentenprojekt. Für Anfragen nutzen Sie
								bitte ausschließlich die E-Mail-Adresse.
							</p>
						</div>
					</section>

					{/* Projektbeschreibung */}
					<section className='mb-8'>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							Projektbeschreibung
						</h2>
						<p className='text-gray-700'>
							OMA-NETZ Kassel ist ein Studentenprojekt zur digitalen
							Unterstützung von Nachbarschaftshilfe für ältere Menschen in
							Kassel. Die Plattform verbindet freiwillige Helfer mit Senioren,
							die Unterstützung im Alltag benötigen.
						</p>
					</section>

					{/* Haftungsausschluss */}
					<section className='mb-8'>
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							Haftungsausschluss
						</h2>
						<div className='space-y-4 text-gray-700'>
							<div>
								<h3 className='font-semibold text-gray-800 mb-2'>
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
								<h3 className='font-semibold text-gray-800 mb-2'>
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
						<h2 className='text-2xl font-playfair font-semibold text-[#3d2b1f] mb-4 pb-2 border-b-2 border-emerald-600'>
							Urheberrecht
						</h2>
						<p className='text-gray-700 text-sm'>
							Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
							diesen Seiten unterliegen dem deutschen Urheberrecht. Die
							Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
							Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
							schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
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
