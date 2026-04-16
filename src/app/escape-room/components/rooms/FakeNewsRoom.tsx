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
	isTrap: boolean;
};

type Slot = {
	id: string;
	correctPieceId: string;
	question: string;
};

const allPieces: Piece[] = [
	{ id: 'fuente', label: 'Portal con dominio institucional o medio reconocido', emoji: '🔎', isTrap: false },
	{ id: 'likes', label: 'Miles de likes y veces compartido en redes', emoji: '👍', isTrap: true },
	{ id: 'fecha', label: 'Fecha de publicacion original verificable', emoji: '📅', isTrap: false },
	{ id: 'testimonio', label: 'Comentarios de personas que dicen haberlo vivido', emoji: '💬', isTrap: true },
	{ id: 'autor', label: 'Periodista o investigador con nombre y trayectoria', emoji: '🧑‍💻', isTrap: false },
	{ id: 'influencer', label: 'Avalado por un influencer con muchos seguidores', emoji: '⭐', isTrap: true },
	{ id: 'evidencia', label: 'Datos o estudios citados que se pueden comprobar', emoji: '🧾', isTrap: false },
	{ id: 'titular', label: 'Titular impactante que genera emociones fuertes', emoji: '🔥', isTrap: true }
];

const correctPieces = allPieces.filter((p) => !p.isTrap);

const slots: Slot[] = [
	{ id: 'slot-origen', correctPieceId: 'fuente', question: '¿De donde viene la informacion?' },
	{ id: 'slot-tiempo', correctPieceId: 'fecha', question: '¿Cuando fue publicado originalmente?' },
	{ id: 'slot-responsable', correctPieceId: 'autor', question: '¿Quien es responsable del contenido?' },
	{ id: 'slot-pruebas', correctPieceId: 'evidencia', question: '¿Que datos comprueban lo que dice?' }
];

export default function FakeNewsRoom({ onComplete }: FakeNewsRoomProps) {
	const [placedMap, setPlacedMap] = useState<Record<string, string>>({});
	const [discardedTraps, setDiscardedTraps] = useState<string[]>([]);
	const [secondsLeft, setSecondsLeft] = useState(60);
	const [mistakes, setMistakes] = useState(0);
	const [trapMessage, setTrapMessage] = useState<string | null>(null);
	const [challengeSelection, setChallengeSelection] = useState<boolean | null>(null);
	const [verified, setVerified] = useState(false);
	const [challengePassed, setChallengePassed] = useState(false);
	const [completed, setCompleted] = useState(false);

	const placedPieceIds = Object.values(placedMap);
	const correctlyPlaced = slots.filter((s) => placedMap[s.id] === s.correctPieceId).length;

	useEffect(() => {
		if (completed) return;
		const interval = window.setInterval(() => {
			setSecondsLeft((prev) => Math.max(0, prev - 1));
		}, 1000);
		return () => window.clearInterval(interval);
	}, [completed]);

	useEffect(() => {
		if (!completed && secondsLeft === 0) {
			setPlacedMap({});
			setDiscardedTraps([]);
			setSecondsLeft(60);
			setMistakes((prev) => prev + 1);
			setTrapMessage(null);
		}
	}, [completed, secondsLeft]);

	useEffect(() => {
		if (!completed && correctlyPlaced === slots.length && challengePassed) {
			setCompleted(true);
			onComplete();
		}
	}, [challengePassed, completed, correctlyPlaced, onComplete]);

	const progress = useMemo(() => {
		const done = correctlyPlaced + (challengePassed ? 1 : 0);
		return (done / (slots.length + 1)) * 100;
	}, [challengePassed, correctlyPlaced]);

	const canVerify = correctlyPlaced === slots.length && challengeSelection !== null;

	function onDragStart(event: React.DragEvent<HTMLButtonElement>, pieceId: string) {
		event.dataTransfer.setData('pieceId', pieceId);
		setTrapMessage(null);
	}

	function onDrop(event: React.DragEvent<HTMLDivElement>, slotId: string) {
		event.preventDefault();
		const pieceId = event.dataTransfer.getData('pieceId');
		const slot = slots.find((s) => s.id === slotId);
		if (!slot) return;

		const piece = allPieces.find((p) => p.id === pieceId);
		if (!piece) return;

		if (piece.isTrap) {
			setMistakes((prev) => prev + 1);
			setSecondsLeft((prev) => Math.max(0, prev - 5));
			setTrapMessage(`"${piece.label}" no es un criterio valido de verificacion. Piensa mejor.`);
			return;
		}

		if (pieceId === slot.correctPieceId && !placedMap[slotId]) {
			setPlacedMap((prev) => ({ ...prev, [slotId]: pieceId }));
			setTrapMessage(null);
			return;
		}

		if (pieceId !== slot.correctPieceId) {
			setMistakes((prev) => prev + 1);
			setSecondsLeft((prev) => Math.max(0, prev - 4));
			setTrapMessage(`Esa pieza es valida, pero no responde a "${slot.question}". Intentalo en otro modulo.`);

			const lastSlotId = Object.keys(placedMap).at(-1);
			if (lastSlotId) {
				setPlacedMap((prev) => {
					const next = { ...prev };
					delete next[lastSlotId];
					return next;
				});
			}
		}
	}

	function handleDiscardTrap(pieceId: string) {
		const piece = allPieces.find((p) => p.id === pieceId);
		if (!piece) return;

		if (piece.isTrap) {
			if (!discardedTraps.includes(pieceId)) {
				setDiscardedTraps((prev) => [...prev, pieceId]);
				setTrapMessage(null);
			}
		} else {
			setMistakes((prev) => prev + 1);
			setSecondsLeft((prev) => Math.max(0, prev - 4));
			setTrapMessage(`Cuidado: "${piece.label}" SI es un criterio valido. No lo descartes.`);
		}
	}

	function verifyRoom() {
		setVerified(true);
		if (challengeSelection) {
			setChallengePassed(true);
		}
	}

	const isPieceUsed = (pieceId: string) => placedPieceIds.includes(pieceId) || discardedTraps.includes(pieceId);

	return (
		<PuzzleWrapper
			title="Sala 2: Fabrica Anti-Fake News"
			subtitle="Arrastra las piezas VALIDAS al modulo correcto. Descarta las que NO sirven para verificar informacion."
			progress={progress}
			lawHint="Piensa antes de compartir y valida cada contenido"
		>
			<section style={{ display: 'grid', gap: '0.85rem' }}>
				<div className="hud-pill">⏳ Verificacion en tiempo real: {secondsLeft}s</div>
				<div className="hud-pill">⚠️ Fallos en sala: {mistakes}</div>

				{trapMessage ? (
					<div className="hud-pill" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', fontWeight: 600 }}>
						🚫 {trapMessage}
					</div>
				) : null}

				<div className="glass-card" style={{ padding: '0.8rem' }}>
					<h3 style={{ marginTop: 0, marginBottom: '0.3rem' }}>Piezas disponibles</h3>
					<p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', opacity: 0.8 }}>
						Arrastra al modulo correcto o haz doble clic para descartar si crees que NO es un criterio valido.
					</p>
					<div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
						{allPieces.map((piece) => {
							const used = isPieceUsed(piece.id);
							const discarded = discardedTraps.includes(piece.id);
							return (
								<button
									key={piece.id}
									draggable={!used}
									onDragStart={(event) => onDragStart(event, piece.id)}
									onDoubleClick={() => !used && handleDiscardTrap(piece.id)}
									className={used ? 'game-button secondary' : 'game-button primary'}
									style={{
										opacity: used ? 0.4 : 1,
										cursor: used ? 'default' : 'grab',
										textDecoration: discarded ? 'line-through' : 'none'
									}}
								>
									{piece.emoji} {piece.label}
								</button>
							);
						})}
					</div>
				</div>

				<div className="room-grid">
					{slots.map((slot) => {
						const placedPieceId = placedMap[slot.id];
						const placedPiece = placedPieceId ? allPieces.find((p) => p.id === placedPieceId) : null;
						const isSet = Boolean(placedPiece);
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
								{isSet && placedPiece ? (
									<strong>
										{placedPiece.emoji} {placedPiece.label}
									</strong>
								) : (
									<span style={{ fontSize: '0.95rem' }}>{slot.question}</span>
								)}
							</div>
						);
					})}
				</div>

				<TruthChallenge
					title="Pregunta clave"
					prompt="Un articulo viral afirma que un alimento comun causa una enfermedad grave. Incluye un video de un medico explicandolo y miles de comentarios de personas que dicen haberlo vivido. ¿Como determinas si es confiable?"
					onSelectionChange={(value) => {
						setChallengeSelection(value);
						setVerified(false);
						setChallengePassed(false);
					}}
					revealResult={verified}
					options={[
						{
							id: 'medico',
							text: 'Confirmar que el medico del video esta registrado en el colegio medico oficial y tiene publicaciones reconocidas en el tema',
							isCorrect: false,
							reason: 'Verificar al medico es un buen paso, pero no basta. La informacion necesita respaldo de estudios revisados, no solo de una persona.'
						},
						{
							id: 'revista',
							text: 'Buscar si existe un estudio cientifico revisado por pares que sustente la afirmacion y si medios de verificacion independientes lo confirman',
							isCorrect: true,
							reason: 'Correcto. Solo la evidencia cientifica revisada por pares y confirmada por verificadores independientes es confiable ante afirmaciones de salud.'
						},
						{
							id: 'tendencias',
							text: 'Comparar la informacion con lo que dicen las organizaciones de salud oficiales de tu pais y verificar la fecha de publicacion del articulo',
							isCorrect: false,
							reason: 'Consultar fuentes oficiales es importante, pero sin verificar el estudio original la afirmacion puede estar distorsionada o sacada de contexto.'
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
