'use client';

import { useEffect, useMemo, useState } from 'react';
import PuzzleWrapper from '../PuzzleWrapper';
import TruthChallenge from '../TruthChallenge';

type SuplantacionRoomProps = {
	onComplete: () => void;
};

type Rune = {
	id: string;
	label: string;
	icon: string;
	safe: boolean;
};

type ChallengeOption = {
	id: string;
	text: string;
	isCorrect: boolean;
	reason: string;
};

function shuffleItems<T>(items: T[]): T[] {
	const cloned = [...items];
	for (let index = cloned.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		const temp = cloned[index];
		cloned[index] = cloned[randomIndex];
		cloned[randomIndex] = temp;
	}
	return cloned;
}

function shuffleThree<T>(items: [T, T, T]): [T, T, T] {
	const shuffled = shuffleItems(items);
	return [shuffled[0], shuffled[1], shuffled[2]];
}

const runes: Rune[] = [
	{ id: 'confirmar', label: 'Confirmar identidad por canal alterno', icon: '✅', safe: true },
	{ id: 'contrasena', label: 'Nunca compartir contrasena ni codigos', icon: '🔑', safe: true },
	{ id: 'privacidad', label: 'Revisar privacidad del perfil', icon: '🔒', safe: true },
	{ id: 'reportar', label: 'Reportar perfiles sospechosos', icon: '🚩', safe: true },
	{ id: 'reenviar-codigo', label: 'Compartir codigo temporal despues de validar por llamada', icon: '📩', safe: false },
	{ id: 'publicar-datos', label: 'Enviar una parte del documento para comprobar identidad', icon: '📢', safe: false }
];

const baseChallengeOptions: [ChallengeOption, ChallengeOption, ChallengeOption] = [
	{
		id: 'clave',
		text: 'Valido por llamada y, si coincide, comparto un codigo temporal de un uso',
		isCorrect: false,
		reason: 'Los codigos y credenciales nunca se comparten, aun si parece real.'
	},
	{
		id: 'validar-canal',
		text: 'Valido por un canal conocido y nunca comparto credenciales',
		isCorrect: true,
		reason: 'Correcto. Confirmar por canal alterno reduce suplantaciones.'
	},
	{
		id: 'publicar',
		text: 'Pido video y comparto solo datos minimos para confirmar rapido',
		isCorrect: false,
		reason: 'Compartir datos personales sigue siendo riesgoso aunque pidas prueba.'
	}
];

export default function SuplantacionRoom({ onComplete }: SuplantacionRoomProps) {
	const [installed, setInstalled] = useState<string[]>([]);
	const [mistakes, setMistakes] = useState(0);
	const [challengeSelection, setChallengeSelection] = useState<boolean | null>(null);
	const [verified, setVerified] = useState(false);
	const [challengePassed, setChallengePassed] = useState(false);
	const [completed, setCompleted] = useState(false);

	const safeRunes = useMemo(() => runes.filter((rune) => rune.safe), []);
	const runeDeck = useMemo(() => shuffleItems(runes), []);
	const challengeOptions = useMemo(() => shuffleThree(baseChallengeOptions), []);

	const progress = useMemo(() => {
		const done = installed.length + (challengePassed ? 1 : 0);
		return (done / (safeRunes.length + 1)) * 100;
	}, [challengePassed, installed.length, safeRunes.length]);

	const canVerify = installed.length === safeRunes.length && challengeSelection !== null;

	useEffect(() => {
		if (!completed && installed.length === safeRunes.length && challengePassed) {
			setCompleted(true);
			onComplete();
		}
	}, [challengePassed, completed, installed.length, onComplete, safeRunes.length]);

	function installRune(rune: Rune) {
		if (rune.safe) {
			if (!installed.includes(rune.id)) {
				setInstalled((prev) => [...prev, rune.id]);
			}
			return;
		}

		setMistakes((prev) => prev + 1);
		setInstalled((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
	}

	function verifyRoom() {
		setVerified(true);
		if (challengeSelection) {
			setChallengePassed(true);
		}
	}

	return (
		<PuzzleWrapper
			title="Sala 3: Muralla de Identidad"
			subtitle="Activa solo las runas seguras para bloquear la suplantacion de identidad."
			progress={progress}
			lawHint="Ley 1581 de 2012 sobre proteccion de datos personales"
			theme="suplantacion"
		>
			<section style={{ display: 'grid', gap: '0.85rem' }}>
				<div className="hud-pill">⚠️ Intentos inseguros: {mistakes}</div>

				<div
					className="glass-card"
					style={{
						minHeight: 220,
						padding: '1rem',
						display: 'grid',
						placeItems: 'center',
						background: 'radial-gradient(circle at 50% 35%, #fef9c3, #dcfce7)'
					}}
				>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: '4.2rem' }} className="float-soft">
							🧒
						</div>
						<p style={{ margin: 0, fontWeight: 700 }}>Escudo del perfil seguro</p>
						<div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
							{safeRunes.map((rune) => (
								<span key={rune.id} className="badge" style={{ opacity: installed.includes(rune.id) ? 1 : 0.45 }}>
									{rune.icon} {installed.includes(rune.id) ? 'Activa' : 'Pendiente'}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className="room-grid">
					{runeDeck.map((rune) => {
						const active = installed.includes(rune.id);
						return (
							<button
								key={rune.id}
								onClick={() => installRune(rune)}
								className={active ? 'game-button secondary' : 'game-button primary'}
								style={{ textAlign: 'left' }}
							>
								<strong>
									{rune.icon} {rune.label}
								</strong>
								<br />
								<small>
									{active ? 'Defensa activa' : 'Evalua y decide si activar'}
								</small>
							</button>
						);
					})}
				</div>

				<TruthChallenge
					title="Chequeo de identidad"
					prompt="Un perfil parecido al de tu amigo te escribe por urgencia y pide acceso. ¿Que haces?"
					onSelectionChange={(value) => {
						setChallengeSelection(value);
						setVerified(false);
						setChallengePassed(false);
					}}
					revealResult={verified}
					options={challengeOptions}
				/>

				<div className="room-verify-actions">
					<button type="button" className="game-button primary" onClick={verifyRoom} disabled={!canVerify || completed}>
						Verificar y terminar sala
					</button>
					{verified && !challengePassed ? (
						<p className="feedback-bad" style={{ margin: 0 }}>
							Esa no es la decision segura. Cambia tu eleccion y verifica de nuevo.
						</p>
					) : null}
				</div>
			</section>
		</PuzzleWrapper>
	);
}
