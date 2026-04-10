'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import CelebrationOverlay from './CelebrationOverlay';
import RoomCompleteModal from './RoomCompleteModal';
import CyberbullyingRoom from './rooms/CyberbullyingRoom';
import FakeNewsRoom from './rooms/FakeNewsRoom';
import GroomingRoom from './rooms/GroomingRoom';
import SuplantacionRoom from './rooms/SuplantacionRoom';

const ROOM_STORAGE_KEY = 'internet-escape-completed';
const SCORE_STORAGE_KEY = 'internet-escape-advanced-score';

const roomCatalog = [
	{ key: 'cyberbullying', label: 'Ciberacoso', law: 'Ley 1620 de 2013', icon: '💬' },
	{ key: 'fakenews', label: 'Fake News', law: 'Convivencia y pensamiento critico', icon: '📰' },
	{ key: 'suplantacion', label: 'Suplantacion de identidad', law: 'Ley 1581 de 2012', icon: '🛡️' },
	{ key: 'grooming', label: 'Grooming', law: 'Ley 1098 de 2006', icon: '🚨' }
];

function resolveRank(points: number): 'Bronce' | 'Plata' | 'Oro' | 'Diamante' | 'Heroico' {
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

function persistCompletion(room: string): void {
	if (typeof window === 'undefined') {
		return;
	}

	const raw = window.localStorage.getItem(ROOM_STORAGE_KEY);
	const parsed = raw ? (JSON.parse(raw) as string[]) : [];
	if (!parsed.includes(room)) {
		window.localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify([...parsed, room]));
	}
}

export default function EscapeRoomContainer() {
	const searchParams = useSearchParams();
	const requested = searchParams.get('room') ?? 'cyberbullying';
	const roomKey = roomCatalog.some((r) => r.key === requested) ? requested : 'cyberbullying';
	const [isComplete, setIsComplete] = useState(false);
	const [isFailed, setIsFailed] = useState(false);
	const [retrySeed, setRetrySeed] = useState(0);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [combo, setCombo] = useState(1);
	const [energy, setEnergy] = useState(100);
	const [score, setScore] = useState(0);

	useEffect(() => {
		setIsComplete(false);
		setIsFailed(false);
		setElapsedSeconds(0);
		setEnergy(100);
		setRetrySeed((prev) => prev + 1);
	}, [roomKey]);

	useEffect(() => {
		if (isComplete || isFailed) {
			return;
		}

		const interval = window.setInterval(() => {
			setElapsedSeconds((prev) => prev + 1);
			setEnergy((prev) => Math.max(0, prev - 0.8));
		}, 1000);

		return () => window.clearInterval(interval);
	}, [isComplete, isFailed]);

	useEffect(() => {
		if (!isComplete && !isFailed && energy <= 0) {
			setIsFailed(true);
		}
	}, [energy, isComplete, isFailed]);

	useEffect(() => {
		const raw = window.localStorage.getItem(SCORE_STORAGE_KEY);
		if (!raw) {
			return;
		}

		const parsed = Number(raw);
		if (!Number.isNaN(parsed)) {
			setScore(parsed);
		}
	}, []);

	const roomMeta = useMemo(() => {
		return roomCatalog.find((room) => room.key === roomKey) ?? roomCatalog[0];
	}, [roomKey]);

	const rank = useMemo(() => resolveRank(score), [score]);

	const nextRoom = useMemo(() => {
		const currentIndex = roomCatalog.findIndex((room) => room.key === roomKey);
		if (currentIndex === -1 || currentIndex === roomCatalog.length - 1) {
			return null;
		}

		return roomCatalog[currentIndex + 1].key;
	}, [roomKey]);

	function handleComplete() {
		if (isFailed || isComplete) {
			return;
		}

		persistCompletion(roomKey);
		setEnergy((prev) => Math.min(100, prev + 15));
		setCombo((prev) => prev + 1);
		setScore((prev) => {
			const newScore = prev + 120 * combo;
			window.localStorage.setItem(SCORE_STORAGE_KEY, String(newScore));
			return newScore;
		});
		setIsComplete(true);
	}

	function retryRoom() {
		setIsFailed(false);
		setIsComplete(false);
		setElapsedSeconds(0);
		setEnergy(100);
		setRetrySeed((prev) => prev + 1);
	}

	const clock = useMemo(() => {
		const minutes = Math.floor(elapsedSeconds / 60)
			.toString()
			.padStart(2, '0');
		const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
		return `${minutes}:${seconds}`;
	}, [elapsedSeconds]);

	return (
		<main className={`game-shell escape-shell theme-${roomKey}`}>
			<header
				className="glass-card escape-header"
			>
				<AppLogo compact />
				<div className="escape-top-pills">
					<span className="badge">Modo 8-14 Fullscreen</span>
					<span className="badge">{roomMeta.icon} Sala: {roomMeta.label}</span>
					<span className="badge">Marco: {roomMeta.law}</span>
					<Link className="game-button secondary" href="/room-selection-map">
						Mapa
					</Link>
				</div>
			</header>

			<section className="glass-card escape-hud-card">
				<div className="hud-strip">
					<div className="hud-pill">⏱️ Tiempo: {clock}</div>
					<div className="hud-pill">🏆 Puntos: {score}</div>
					<div className="hud-pill">🎖️ Rango actual: {rank}</div>
					<div className="hud-pill">🔥 Racha: x{combo}</div>
					<div className="hud-pill">
						⚡ Energia:
						<div className="energy-track">
							<div className="energy-fill" style={{ width: `${energy}%` }} />
						</div>
					</div>
				</div>
			</section>

			{roomKey === 'cyberbullying' ? <CyberbullyingRoom key={`cyber-${retrySeed}`} onComplete={handleComplete} /> : null}
			{roomKey === 'fakenews' ? <FakeNewsRoom key={`fake-${retrySeed}`} onComplete={handleComplete} /> : null}
			{roomKey === 'suplantacion' ? <SuplantacionRoom key={`sup-${retrySeed}`} onComplete={handleComplete} /> : null}
			{roomKey === 'grooming' ? <GroomingRoom key={`gro-${retrySeed}`} onComplete={handleComplete} /> : null}

			{isComplete ? <CelebrationOverlay /> : null}
			{isComplete ? <RoomCompleteModal roomName={roomMeta.label} nextRoom={nextRoom} score={score} rank={rank} /> : null}
			{isFailed ? (
				<div className="modal-overlay">
					<div className="glass-card room-complete-modal">
						<h3 className="lose-title">Energia agotada</h3>
						<p>Perdiste esta sala por quedarte sin energia. Puedes retomarla ahora mismo.</p>
						<div className="modal-actions-center">
							<button type="button" className="game-button primary" onClick={retryRoom}>
								Retomar sala
							</button>
							<Link className="game-button secondary" href="/room-selection-map">
								Volver al mapa
							</Link>
						</div>
					</div>
				</div>
			) : null}
		</main>
	);
}
