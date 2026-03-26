import Link from 'next/link'

export function Footer() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className='bg-emerald-900 text-white py-12 px-4'>
			<div className='max-w-6xl mx-auto'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
					{/* Projekt Info */}
					<div>
						<h3 className='font-playfair text-xl font-bold mb-4'>
							OMA-NETZ Kassel
						</h3>
						<p className='text-emerald-200 text-sm leading-relaxed'>
							Freiwillige Nachbarschaftshilfe für ältere Menschen in Kassel.
							Ehrenamtliche Helfer unterstützen bei Einkäufen, Arztterminen,
							Spaziergängen und mehr.
						</p>
					</div>

					{/* Quick Links */}
					<div>
						<h4 className='font-semibold mb-4 text-emerald-100'>
							Schnellzugriff
						</h4>
						<ul className='space-y-2 text-sm'>
							<li>
								<Link
									href='/landing'
									className='text-emerald-200 hover:text-white transition-colors'
								>
									Startseite
								</Link>
							</li>
							<li>
								<Link
									href='/login'
									className='text-emerald-200 hover:text-white transition-colors'
								>
									Anmelden
								</Link>
							</li>
							<li>
								<Link
									href='/register'
									className='text-emerald-200 hover:text-white transition-colors'
								>
									Registrieren
								</Link>
							</li>
						</ul>
					</div>

					{/* Rechtliches */}
					<div>
						<h4 className='font-semibold mb-4 text-emerald-100'>
							Rechtliches
						</h4>
						<ul className='space-y-2 text-sm'>
							<li>
								<Link
									href='/impressum'
									className='text-emerald-200 hover:text-white transition-colors'
								>
									Impressum
								</Link>
							</li>
							<li>
								<Link
									href='/datenschutz'
									className='text-emerald-200 hover:text-white transition-colors'
								>
									Datenschutzerklärung
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='border-t border-emerald-800 pt-6 text-center text-sm text-emerald-300'>
					<p>
						&copy; {currentYear} OMA-NETZ Kassel. Ein nicht-kommerzielles
						Studentenprojekt.
					</p>
					<p className='mt-2 text-xs text-emerald-400'>
						Gefördert im Rahmen des Programms &quot;Digitale Nachbarschaft&quot;.
					</p>
				</div>
			</div>
		</footer>
	)
}
