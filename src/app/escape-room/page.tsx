import { Suspense } from 'react';
import EscapeRoomContainer from './components/EscapeRoomContainer';

export default function EscapeRoomPage() {
	return (
		<Suspense
			fallback={
				<main className="game-shell" style={{ display: 'grid', placeItems: 'center' }}>
					<section className="glass-card" style={{ padding: '1rem' }}>
						Cargando sala...
					</section>
				</main>
			}
		>
			<EscapeRoomContainer />
		</Suspense>
	);
}
