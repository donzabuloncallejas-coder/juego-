'use client';

import { useEffect, useMemo, useState } from 'react';
import PuzzleWrapper from '../PuzzleWrapper';
import TruthChallenge from '../TruthChallenge';

type CyberbullyingRoomProps = {
	onComplete: () => void;
};

const attackBubbles = [
	{ label: 'Broma pesada repetida sobre un companero', isDanger: true },
	{ label: 'Comentario respetuoso aunque no este de acuerdo', isDanger: false },
	{ label: 'Cadena con rumor sin fuente', isDanger: true },
	{ label: 'Meme editado para ridiculizar', isDanger: true },
	{ label: 'Mensaje privado para ofrecer ayuda', isDanger: false },
	{ label: 'Insulto "suave" en chat publico', isDanger: true },
	{ label: 'Perfil falso que escribe por otro', isDanger: true },
	{ label: 'Sacar del grupo para castigar', isDanger: true },
	{ label: 'Foto subida sin permiso', isDanger: true },
	{ label: 'Mensaje por DM para asustar', isDanger: true }
];

const protocolActions = [
	{ label: 'Pausar y no responder en caliente', safe: true },
	{ label: 'Responder con sarcasmo para "defenderse"', safe: false },
	{ label: 'Guardar pruebas con fecha', safe: true },
	{ label: 'Publicar capturas para que lo juzguen', safe: false },
	{ label: 'Pedir apoyo a un adulto y reportar', safe: true }
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
			theme="cyberbullying"
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
							text: 'Bloquear y esperar unos dias antes de contarlo',
							isCorrect: false,
							reason: 'Bloquear ayuda, pero sin apoyo y reporte el riesgo puede continuar.'
						},
						{
							id: 'guardar-pedir',
							text: 'Guardar evidencia, bloquear/reportar y avisar a un adulto de confianza',
							isCorrect: true,
							reason: 'Correcto. Combina evidencia, bloqueo y apoyo para protegerte mejor.'
						},
						{
							id: 'responder',
							text: 'Responder firme y luego decidir si vale la pena reportar',
							isCorrect: false,
							reason: 'Sin apoyo adulto ni reporte, la situacion puede escalar.'
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
