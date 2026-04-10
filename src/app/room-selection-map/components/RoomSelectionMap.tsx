'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';

const ROOM_STORAGE_KEY = 'internet-escape-completed';
const SCORE_STORAGE_KEY = 'internet-escape-advanced-score';

const roomOrder = [
	{
		key: 'cyberbullying',
		title: 'Sala del Ciberacoso',
		hint: '¿Como detener el bullying online?',
		icon: '🛡️'
	},
	{
		key: 'fakenews',
		title: 'Sala de las Fake News',
		hint: '¿Verdad o mentira?',
		icon: '📰'
	},
	{
		key: 'suplantacion',
		title: 'Sala de la Suplantacion',
		hint: '¿Eres tu o no eres tu?',
		icon: '🎭'
	},
	{
		key: 'grooming',
		title: 'Sala de Grooming',
		hint: 'Escapa del contacto riesgoso',
		icon: '🚨'
	}
];

function resolveMapRank(points: number): 'Bronce' | 'Plata' | 'Oro' | 'Diamante' | 'Heroico' {
	if (points >= 1600) {
		return 'Heroico';
	}
	if (points >= 1200) {
		return 'Diamante';
	}
	if (points >= 850) {
		return 'Oro';
	}
	if (points >= 500) {
		return 'Plata';
	}
	return 'Bronce';
}

function renderStars(count: number) {
	return Array.from({ length: 3 }, (_, index) => (
		<span key={index} className={index < count ? 'filled' : ''}>
			★
		</span>
	));
}

export default function RoomSelectionMap() {
	const [completed, setCompleted] = useState<string[]>([]);
	const [cycleScore, setCycleScore] = useState<number | null>(null);

	useEffect(() => {
		try {
			const raw = window.localStorage.getItem(ROOM_STORAGE_KEY);
			setCompleted(raw ? (JSON.parse(raw) as string[]) : []);
		} catch {
			setCompleted([]);
		}
	}, []);

	const mapState = useMemo(() => {
		return roomOrder.map((room, index) => {
			const unlocked = index === 0 || completed.includes(roomOrder[index - 1].key);
			const done = completed.includes(room.key);
			const stars = done ? Math.min(3, index + 1) : 0;
			return { ...room, unlocked, done, stars, index };
		});
	}, [completed]);

	const completedCount = mapState.filter((room) => room.done).length;
	const progressPercent = Math.round((completedCount / roomOrder.length) * 100);
	const nextRoom = mapState.find((room) => room.unlocked && !room.done);
	const mapStars = Math.round((completedCount / roomOrder.length) * 3);
	const cycleRank = cycleScore === null ? null : resolveMapRank(cycleScore);

	useEffect(() => {
		if (completed.length !== roomOrder.length) {
			return;
		}

		const parsedScore = Number(window.localStorage.getItem(SCORE_STORAGE_KEY) ?? '0');
		const finalScore = Number.isFinite(parsedScore) ? parsedScore : 0;
		setCycleScore(finalScore);

		window.localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify([]));
		window.localStorage.setItem(SCORE_STORAGE_KEY, '0');
		setCompleted([]);
	}, [completed]);

	return (
		<main className="game-shell map-adventure-shell">
			<section className="map-adventure-frame slide-in">
				<header className="map-adventure-top">
					<div className="map-brand-wrap">
						<AppLogo compact />
					</div>
					<div className="map-top-actions">
						<Link href="/welcome-screen" className="map-home-btn">
							← Inicio
						</Link>
						<Link href="/mini-escape" className="map-switch-btn">
							4-7
						</Link>
						<div className="map-stars-pill">
							<div className="map-stars-line">{renderStars(mapStars)}</div>
							<strong>{completedCount}/4 salas</strong>
						</div>
					</div>
				</header>

				<section className="map-adventure-stage">
					<div className="map-title-wrap">
						<h1>🗺️ Mapa de Aventuras</h1>
						<p>CiudadRed - ¡Explora las 4 salas!</p>
					</div>

					<section className="map-cards-track">
						{mapState.map((room) => (
							<article
								key={room.key}
								className={`map-room-card ${room.done ? 'is-done' : ''} ${room.unlocked ? '' : 'is-locked'}`}
							>
								<div className="map-room-content">
									<div className="map-room-head">
										<span className="map-room-chip">SALA {room.index + 1}</span>
										<div className="map-card-stars">{renderStars(room.stars)}</div>
									</div>

									<div className="map-room-icon">{room.icon}</div>
									<h2>{room.title}</h2>
									<p>
										{room.unlocked
											? room.hint
											: 'Completa la sala anterior para desbloquear esta aventura.'}
									</p>

									{room.unlocked ? (
										<Link href={`/escape-room?room=${room.key}`} className={`map-room-action ${room.done ? 'replay' : 'enter'}`}>
											{room.done ? '🔁 Volver a jugar' : '▶ ¡Entrar!'}
										</Link>
									) : (
										<button className="map-room-action locked" disabled>
											🔒 Bloqueada
										</button>
									)}
								</div>

								{!room.unlocked ? (
									<div className="map-room-lock-overlay">
										<strong>Completa la sala anterior</strong>
										<span>Pasa el reto previo para desbloquear</span>
									</div>
								) : null}
							</article>
						))}
					</section>

					<div className="map-guide-row">
						<div className="map-guide-avatar">🧒</div>
						<div className="map-guide-bubble">
							<p>
								💬 ¡Bienvenido/a al mapa de aventuras!{' '}
								{nextRoom
									? `Elige ${nextRoom.title} para seguir avanzando.`
									: '¡Excelente! Ya completaste todas las salas de este modulo.'}
							</p>
						</div>
					</div>

					<div className="map-progress-wrap">
						<div className="map-progress-head">
							<span>Progreso total</span>
							<span>{progressPercent}%</span>
						</div>
						<progress className="map-progress-native" value={progressPercent} max={100} aria-label="Progreso total del modulo 8-14" />
					</div>
				</section>

				{cycleScore !== null ? (
					<div className="map-cycle-modal-backdrop">
						<div className="map-cycle-modal-card">
							<h3>Modulo completado</h3>
							<p>Superaste las 4 salas del mapa 8-14.</p>
							<div className="map-cycle-score">🏆 Puntaje final: {cycleScore}</div>
							<div className="map-cycle-rank">🎖️ Rango: {cycleRank}</div>
							<p className="map-cycle-note">
								El ciclo se reinicio: Sala 1 desbloqueada y las demas salas bloqueadas.
							</p>
							<div className="map-cycle-actions">
								<button type="button" className="game-button primary" onClick={() => setCycleScore(null)}>
									Aceptar
								</button>
							</div>
						</div>
					</div>
				) : null}
			</section>
		</main>
	);
}
