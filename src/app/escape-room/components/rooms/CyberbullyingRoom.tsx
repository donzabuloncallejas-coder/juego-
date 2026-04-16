'use client';

import { useEffect, useMemo, useState } from 'react';
import PuzzleWrapper from '../PuzzleWrapper';
import TruthChallenge from '../TruthChallenge';

type CyberbullyingRoomProps = {
	onComplete: () => void;
};

const attackBubbles = [
	{ label: 'Mensaje hiriente repetido en el chat grupal del curso', isDanger: true },
	{ label: 'Decirle a un companero en privado que su comentario te ofendio', isDanger: false },
	{ label: 'Compartir el resultado del examen de otro companero como broma', isDanger: true },
	{ label: 'Difusion de un rumor personal sobre alguien del salon', isDanger: true },
	{ label: 'Publicar en el grupo escolar un articulo sobre como detectar ciberacoso', isDanger: false },
	{ label: 'Etiquetar a un companero en un meme popular para que todos se rian', isDanger: true },
	{ label: 'Captura de pantalla de un chat privado reenviada a otros', isDanger: true },
	{ label: 'Crear un grupo aparte para comentar el comportamiento de un companero', isDanger: true },
	{ label: 'Critica constructiva hecha en privado sobre un trabajo escolar', isDanger: false },
	{ label: 'Exclusion intencional de alguien del grupo de clase sin explicacion', isDanger: true },
	{ label: 'Reenviar un sticker que un companero creo de si mismo y compartio publicamente', isDanger: false },
	{ label: 'Foto vergonzosa de alguien publicada sin su consentimiento', isDanger: true },
	{ label: 'Amenaza anonima enviada por mensaje directo a un companero', isDanger: true },
	{ label: 'Creacion de un perfil falso imitando a alguien del curso', isDanger: true }
];

const protocolActions = [
	{ label: 'Esperar a estar tranquilo antes de tomar cualquier decision', safe: true },
	{ label: 'Confrontar al agresor cara a cara con un testigo para que no lo pueda negar', safe: false },
	{ label: 'Guardar capturas de pantalla con fecha y hora como evidencia', safe: true },
	{ label: 'Hablar con los amigos cercanos del agresor para que lo convenzan de parar', safe: false },
	{ label: 'Hablar con un adulto de confianza sobre la situacion completa', safe: true },
	{ label: 'Crear una publicacion contra el acoso sin nombres para generar conciencia del caso', safe: false },
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
					prompt="Un companero te insulta en un grupo escolar y otros reaccionan con risas. Bloqueaste al agresor, pero el acoso continua desde cuentas nuevas. ¿Cual estrategia es la mas completa?"
					onSelectionChange={(value) => {
						setChallengeSelection(value);
						setVerified(false);
						setChallengePassed(false);
					}}
					revealResult={verified}
					options={[
						{
							id: 'ignorar',
							text: 'Bloquear cada cuenta nueva, salir del grupo y eliminar la app para proteger tu salud mental',
							isCorrect: false,
							reason: 'Bloquear y cuidarte esta bien, pero sin guardar pruebas ni activar la ruta escolar el agresor puede seguir con otros.'
						},
						{
							id: 'documentar-reportar',
							text: 'Guardar capturas de cada mensaje con fecha, reportar las cuentas en la plataforma y pedir a un adulto que active la ruta de convivencia',
							isCorrect: true,
							reason: 'Correcto. Documentar, reportar en la plataforma y activar la ruta escolar cubre todas las vias de proteccion.'
						},
						{
							id: 'responder-una-vez',
							text: 'Enviar un unico mensaje al grupo pidiendo respeto, guardar captura de la respuesta y reportar si no funciona',
							isCorrect: false,
							reason: 'Responder en el mismo grupo puede alimentar al agresor. Es mejor actuar por vias formales sin interactuar.'
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
