'use client';

import Link from 'next/link';

type RoomCompleteModalProps = {
	roomName: string;
	nextRoom: string | null;
	score: number;
	rank: 'Bronce' | 'Plata' | 'Oro' | 'Diamante' | 'Heroico';
};

export default function RoomCompleteModal({ roomName, nextRoom, score, rank }: RoomCompleteModalProps) {
	return (
		<div className="modal-overlay">
			<div className="glass-card room-complete-modal">
				<h3 style={{ marginTop: 0 }}>Sala superada: {roomName}</h3>
				<p>Excelente. Acabas de fortalecer una habilidad clave para cuidarte en internet.</p>

				{nextRoom ? null : (
					<section className="rank-summary">
						<h4 style={{ marginTop: 0, marginBottom: '0.4rem' }}>Resultado final del modulo 8-14</h4>
						<p style={{ marginTop: 0, marginBottom: '0.45rem' }}>
							Puntos finales: <strong>{score}</strong> | Rango: <strong>{rank}</strong>
						</p>
						<div className="rank-grid">
							<span className="badge">Bronce: 0 - 499</span>
							<span className="badge">Plata: 500 - 849</span>
							<span className="badge">Oro: 850 - 1199</span>
							<span className="badge">Diamante: 1200 - 1599</span>
							<span className="badge">Heroico: 1600+</span>
						</div>
					</section>
				)}

				<div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
					<Link className="game-button secondary" href="/room-selection-map">
						Volver al mapa
					</Link>
					{nextRoom ? (
						<Link className="game-button primary" href={`/escape-room?room=${nextRoom}`}>
							Siguiente sala
						</Link>
					) : (
						<Link className="game-button primary" href="/welcome-screen">
							Finalizar aventura
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
