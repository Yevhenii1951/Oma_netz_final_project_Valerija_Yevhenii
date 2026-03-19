import { signOut } from '@/auth'

export default function BannedPage() {
	const supportEmail = process.env.SUPPORT_EMAIL ?? 'admin@oma-netz.de'

	return (
		<div className='min-h-screen bg-[#f5ede0] flex items-center justify-center p-4'>
			<div className='w-full max-w-md card p-7 text-center'>
				<h1 className='text-2xl font-bold text-[#3d2b1f]'>
					Sie wurden vom Administrator gesperrt
				</h1>
				<p className='text-[#7a6050] mt-3'>
					Für die Klärung der Gründe wenden Sie sich bitte an den
					Website-Administrator.
				</p>
				<p className='text-[#7a6050] mt-2'>
					Kontakt:{' '}
					<a
						href={`mailto:${supportEmail}`}
						className='text-[#8b5e3c] font-semibold hover:text-[#6b4226]'
					>
						{supportEmail}
					</a>
				</p>
				<div className='mt-6'>
					<form
						action={async () => {
							'use server'
							await signOut({ redirectTo: '/' })
						}}
					>
						<button
							type='submit'
							className='btn-primary inline-flex justify-center'
						>
							Zur Startseite
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}
