import Link from 'next/link';

export default function NotFound() {
	return (
		<main className="game-shell" style={{ display: 'grid', placeItems: 'center' }}>
			<section className="glass-card" style={{ maxWidth: 560, padding: '1.4rem', textAlign: 'center' }}>
				<h1 style={{ marginTop: 0 }}>Esta sala no existe</h1>
				<p>Parece que este portal digital se perdio en el ciberespacio.</p>
				<Link className="game-button primary" href="/welcome-screen">
					Volver al inicio
				</Link>
			</section>
		</main>
	);
}
