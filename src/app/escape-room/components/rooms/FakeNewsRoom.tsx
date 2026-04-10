'use client';

import { useEffect, useMemo, useState } from 'react';
import PuzzleWrapper from '../PuzzleWrapper';
import TruthChallenge from '../TruthChallenge';

type FakeNewsRoomProps = {
	onComplete: () => void;
};

type Piece = {
	id: string;
	label: string;
	emoji: string;
};

const pieces: Piece[] = [
	{ id: 'fuente', label: 'Fuente confiable', emoji: '🔎' },
	{ id: 'fecha', label: 'Fecha verificable', emoji: '📅' },
	{ id: 'autor', label: 'Autor identificado', emoji: '🧑‍💻' },
	{ id: 'evidencia', label: 'Evidencia real', emoji: '🧾' }
];

export default function FakeNewsRoom({ onComplete }: FakeNewsRoomProps) {
	const [placed, setPlaced] = useState<string[]>([]);
	const [secondsLeft, setSecondsLeft] = useState(45);
	const [mistakes, setMistakes] = useState(0);
	const [challengeSelection, setChallengeSelection] = useState<boolean | null>(null);
	const [verified, setVerified] = useState(false);
	const [challengePassed, setChallengePassed] = useState(false);
	const [completed, setCompleted] = useState(false);

	useEffect(() => {
		if (completed) {
			return;
		}

		const interval = window.setInterval(() => {
			setSecondsLeft((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => window.clearInterval(interval);
	}, [completed]);

	useEffect(() => {
		if (!completed && secondsLeft === 0) {
			setPlaced([]);
			setSecondsLeft(45);
			setMistakes((prev) => prev + 1);
		}
	}, [completed, secondsLeft]);

	useEffect(() => {
		if (!completed && placed.length === pieces.length && challengePassed) {
			setCompleted(true);
			onComplete();
		}
	}, [challengePassed, completed, onComplete, placed.length]);

	const progress = useMemo(() => {
		const done = placed.length + (challengePassed ? 1 : 0);
		return (done / (pieces.length + 1)) * 100;
	}, [challengePassed, placed.length]);

	const canVerify = placed.length === pieces.length && challengeSelection !== null;

	function onDragStart(event: React.DragEvent<HTMLButtonElement>, pieceId: string) {
		event.dataTransfer.setData('pieceId', pieceId);
	}

	function onDrop(event: React.DragEvent<HTMLDivElement>, slotId: string) {
		event.preventDefault();
		const pieceId = event.dataTransfer.getData('pieceId');
		if (pieceId === slotId && !placed.includes(slotId)) {
			setPlaced((prev) => [...prev, slotId]);
			return;
		}

		setMistakes((prev) => prev + 1);
		setSecondsLeft((prev) => Math.max(0, prev - 6));
		setPlaced((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
	}

	function verifyRoom() {
		setVerified(true);
		if (challengeSelection) {
			setChallengePassed(true);
		}
	}

	return (
		<PuzzleWrapper
			title="Sala 2: Fabrica Anti-Fake News"
			subtitle="Arrastra cada pieza al modulo correcto para encender el detector de noticias falsas."
			progress={progress}
			lawHint="Piensa antes de compartir y valida cada contenido"
		>
			<section style={{ display: 'grid', gap: '0.85rem' }}>
				<div className="hud-pill">⏳ Verificacion en tiempo real: {secondsLeft}s</div>
				<div className="hud-pill">⚠️ Fallos en sala: {mistakes}</div>

				<div className="glass-card" style={{ padding: '0.8rem' }}>
					<h3 style={{ marginTop: 0 }}>Piezas de verificacion</h3>
					<div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
						{pieces.map((piece) => {
							const used = placed.includes(piece.id);
							return (
								<button
									key={piece.id}
									draggable={!used}
									onDragStart={(event) => onDragStart(event, piece.id)}
									className={used ? 'game-button secondary' : 'game-button primary'}
									style={{ opacity: used ? 0.5 : 1, cursor: used ? 'default' : 'grab' }}
								>
									{piece.emoji} {piece.label}
								</button>
							);
						})}
					</div>
				</div>

				<div className="room-grid">
					{pieces.map((slot) => {
						const isSet = placed.includes(slot.id);
						return (
							<div
								key={slot.id}
								onDragOver={(event) => event.preventDefault()}
								onDrop={(event) => onDrop(event, slot.id)}
								className="glass-card"
								style={{
									minHeight: 120,
									padding: '0.8rem',
									display: 'grid',
									placeItems: 'center',
									textAlign: 'center',
									borderStyle: 'dashed',
									borderColor: isSet ? '#ca8a04' : 'rgba(34, 197, 94, 0.42)'
								}}
							>
								{isSet ? (
									<strong>
										{slot.emoji} {slot.label}
									</strong>
								) : (
									<span>Coloca aqui: {slot.label}</span>
								)}
							</div>
						);
					})}
				</div>

				<TruthChallenge
					title="Pregunta clave"
					prompt="¿Que revisas primero para saber si un portal puede ser confiable?"
					onSelectionChange={(value) => {
						setChallengeSelection(value);
						setVerified(false);
						setChallengePassed(false);
					}}
					revealResult={verified}
					options={[
						{
							id: 'titulo',
							text: 'Reviso si coincide con otros posts virales',
							isCorrect: false,
							reason: 'La viralidad no confirma autenticidad ni origen confiable.'
						},
						{
							id: 'dominio',
							text: 'Verifico dominio, autor identificable y fecha comprobable',
							isCorrect: true,
							reason: 'Correcto. Es la triada mas solida para filtrar desinformacion.'
						},
						{
							id: 'likes',
							text: 'Me fijo en likes y en que lo comparten conocidos',
							isCorrect: false,
							reason: 'Que lo compartan conocidos no reemplaza la verificacion de fuente.'
						}
					]}
				/>

				<div className="room-verify-actions">
					<button type="button" className="game-button primary" onClick={verifyRoom} disabled={!canVerify || completed}>
						Verificar y terminar sala
					</button>
					{verified && !challengePassed ? (
						<p className="feedback-bad" style={{ margin: 0 }}>
							La respuesta final no es correcta. Corrigela y verifica de nuevo.
						</p>
					) : null}
				</div>
			</section>
		</PuzzleWrapper>
	);
}
