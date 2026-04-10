'use client';

import { useEffect, useMemo, useState } from 'react';
import PuzzleWrapper from '../PuzzleWrapper';
import TruthChallenge from '../TruthChallenge';

type CyberbullyingRoomProps = {
	onComplete: () => void;
};

const attackBubbles = [
	{ label: 'Mensaje hiriente', isDanger: true },
	{ label: 'Mensaje de apoyo real', isDanger: false },
	{ label: 'Rumor falso', isDanger: true },
	{ label: 'Meme humillante', isDanger: true },
	{ label: 'Invitacion amable del curso', isDanger: false },
	{ label: 'Insulto en chat', isDanger: true },
	{ label: 'Suplantacion', isDanger: true },
	{ label: 'Exclusion en grupo', isDanger: true },
	{ label: 'Foto compartida sin permiso', isDanger: true },
	{ label: 'Amenaza por DM', isDanger: true }
];

const protocolActions = [
	{ label: 'No responder en caliente', safe: true },
	{ label: 'Publicar capturas para humillar', safe: false },
	{ label: 'Guardar pruebas', safe: true },
	{ label: 'Crear cuenta falsa para vengarse', safe: false },
	{ label: 'Pedir ayuda a un adulto', safe: true },
];

export default function CyberbullyingRoom({ onComplete }: CyberbullyingRoomProps) {
	const [cleared, setCleared] = useState<string[]>([]);
	const [actionsDone, setActionsDone] = useState<string[]>([]);
	const [challengeSelection, setChallengeSelection] = useState<boolean | null>(null);
	const [verified, setVerified] = useState(false);
	const [challengePassed, setChallengePassed] = useState(false);
	const [mistakes, setMistakes] = useState(0);
	const [completed, setCompleted] = useState(false);

	const targetBubbles = attackBubbles.filter((item) => item.isDanger).length;
	const targetActions = protocolActions.filter((item) => item.safe).length;

	const progress = useMemo(() => {
		const total = targetBubbles + targetActions + 1;
		const done = cleared.length + actionsDone.length + (challengePassed ? 1 : 0);
		return (done / total) * 100;
	}, [actionsDone.length, challengePassed, cleared.length, targetActions, targetBubbles]);

	const canVerify =
		cleared.length === targetBubbles &&
		actionsDone.length === targetActions &&
		challengeSelection !== null;

	useEffect(() => {
		if (
			!completed &&
			cleared.length === targetBubbles &&
			actionsDone.length === targetActions &&
			challengePassed
		) {
			setCompleted(true);
			onComplete();
		}
	}, [actionsDone.length, challengePassed, cleared.length, completed, onComplete, targetActions, targetBubbles]);

	function clearBubble(bubble: (typeof attackBubbles)[number]) {
		if (bubble.isDanger) {
			if (!cleared.includes(bubble.label)) {
				setCleared((prev) => [...prev, bubble.label]);
			}
			return;
		}

		setMistakes((prev) => prev + 1);
		setCleared((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
	}

	function applyAction(action: (typeof protocolActions)[number]) {
		if (action.safe) {
			if (!actionsDone.includes(action.label)) {
				setActionsDone((prev) => [...prev, action.label]);
			}
			return;
		}

		setMistakes((prev) => prev + 1);
		setActionsDone((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
	}

	function verifyRoom() {
		setVerified(true);
		if (challengeSelection) {
			setChallengePassed(true);
		}
	}

	return (
		<PuzzleWrapper
			title="Sala 1: Escudo Anti-Ciberacoso"
			subtitle="Toca las burbujas de acoso para transformarlas y activa el protocolo de proteccion."
			progress={progress}
			lawHint="Ley 1620 de 2013 y Decreto 1965"
		>
			<section style={{ display: 'grid', gap: '0.9rem' }}>
				<div className="hud-pill">⚠️ Errores en sala: {mistakes}</div>
				<div
					className="glass-card"
					style={{
						minHeight: 220,
						padding: '0.7rem',
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
						gap: '0.55rem'
					}}
				>
					{attackBubbles.map((bubble, index) => {
						const isDone = cleared.includes(bubble.label);
						return (
							<button
								key={bubble.label}
								onClick={() => clearBubble(bubble)}
								className={isDone ? 'game-button secondary' : 'game-button primary'}
								style={{
									fontSize: '0.94rem',
									transform: `translateY(${(index % 3) * 4}px)`,
									textDecoration: isDone ? 'line-through' : 'none'
								}}
							>
								{isDone ? 'Transformado en mensaje amable' : bubble.label}
							</button>
						);
					})}
				</div>

				<div className="glass-card" style={{ padding: '0.8rem' }}>
					<h3 style={{ marginTop: 0, marginBottom: '0.55rem' }}>Protocolo de ayuda</h3>
					<div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
						{protocolActions.map((action) => {
							const done = action.safe && actionsDone.includes(action.label);
							return (
								<button
									key={action.label}
									onClick={() => applyAction(action)}
									className={done ? 'game-button secondary' : 'game-button primary'}
								>
									{done ? `OK: ${action.label}` : action.label}
								</button>
							);
						})}
					</div>
				</div>

				<TruthChallenge
					title="Reto rapido"
					prompt="Si recibes mensajes ofensivos repetidos, ¿que combo de accion es el mas seguro?"
					onSelectionChange={(value) => {
						setChallengeSelection(value);
						setVerified(false);
						setChallengePassed(false);
					}}
					revealResult={verified}
					options={[
						{
							id: 'bloquear-solo',
							text: 'Bloquear inmediatamente y esperar a ver si para',
							isCorrect: false,
							reason: 'Bloquear es buena parte del plan, pero falta reportar y pedir apoyo.'
						},
						{
							id: 'guardar-pedir',
							text: 'Guardar evidencia, bloquear y contarlo a un adulto de confianza',
							isCorrect: true,
							reason: 'Correcto. Combina evidencia, bloqueo y apoyo para protegerte mejor.'
						},
						{
							id: 'responder',
							text: 'Responder con firmeza para marcar limites sin pedir ayuda',
							isCorrect: false,
							reason: 'Poner limites ayuda, pero sin apoyo adulto puede escalar el riesgo.'
						}
					]}
				/>

				<div className="room-verify-actions">
					<button type="button" className="game-button primary" onClick={verifyRoom} disabled={!canVerify || completed}>
						Verificar y terminar sala
					</button>
					{verified && !challengePassed ? (
						<p className="feedback-bad" style={{ margin: 0 }}>
							Revisa tu respuesta final y vuelve a verificar.
						</p>
					) : null}
				</div>
			</section>
		</PuzzleWrapper>
	);
}
