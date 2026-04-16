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

const runes: Rune[] = [
	{ id: 'confirmar', label: 'Verificar identidad por videollamada o canal alterno conocido', icon: '✅', safe: true },
	{ id: 'contrasena', label: 'Nunca compartir contrasenas ni codigos de acceso con nadie', icon: '🔑', safe: true },
	{ id: 'privacidad', label: 'Configurar la privacidad del perfil al maximo nivel posible', icon: '🔒', safe: true },
	{ id: 'reportar', label: 'Reportar perfiles sospechosos a la plataforma y a un adulto', icon: '🚩', safe: true },
	{ id: 'misma-clave', label: 'Usar la misma contrasena compleja en todas mis cuentas para memorizarla mejor', icon: '🧠', safe: false },
	{ id: 'prestar-cuenta', label: 'Prestar temporalmente mi cuenta a un amigo cercano que la necesita', icon: '🤝', safe: false },
	{ id: 'verificar-doc', label: 'Responder correos de soporte tecnico pidiendo verificar mis datos de acceso', icon: '📧', safe: false },
	{ id: 'conocidos', label: 'Aceptar solicitudes de conocidos de mis amigos para ampliar mi red segura', icon: '👥', safe: false },
	{ id: 'guardar-clave', label: 'Guardar mis contrasenas en un documento en el celular para no olvidarlas', icon: '📱', safe: false }
];

export default function SuplantacionRoom({ onComplete }: SuplantacionRoomProps) {
	const [installed, setInstalled] = useState<string[]>([]);
	const [mistakes, setMistakes] = useState(0);
	const [challengeSelection, setChallengeSelection] = useState<boolean | null>(null);
	const [verified, setVerified] = useState(false);
	const [challengePassed, setChallengePassed] = useState(false);
	const [completed, setCompleted] = useState(false);

	const safeRunes = useMemo(() => runes.filter((rune) => rune.safe), []);

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
		>
			<section style={{ display: 'grid', gap: '0.85rem' }}>
				<div className="hud-pill">⚠️ Intentos inseguros: {mistakes}</div>

				<div
					className="glass-card identity-shield-card"
					style={{
						minHeight: 220,
						padding: '1rem',
						display: 'grid',
						placeItems: 'center'
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
					{runes.map((rune) => {
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
									{active
										? 'Proteccion instalada'
										: 'Toca para activar esta defensa'}
								</small>
							</button>
						);
					})}
				</div>

				<TruthChallenge
					title="Chequeo de identidad"
					prompt="Tu mejor amigo te escribe desde una cuenta nueva. Dice que perdio acceso a la anterior y necesita que le reenvies un codigo que te llegara por SMS. Su forma de escribir parece autentica y menciona recuerdos reales. ¿Que haces?"
					onSelectionChange={(value) => {
						setChallengeSelection(value);
						setVerified(false);
						setChallengePassed(false);
					}}
					revealResult={verified}
					options={[
						{
							id: 'verificar-dato',
							text: 'Le pido que me diga algo que solo el sabria para confirmar antes de enviar el codigo',
							isCorrect: false,
							reason: 'Un suplantador puede haber obtenido informacion personal de redes. Verificar con preguntas no es suficiente.'
						},
						{
							id: 'no-reenviar',
							text: 'No reenvio ningun codigo bajo ninguna circunstancia, lo contacto por un medio que ya tenia guardado y le cuento a un adulto',
							isCorrect: true,
							reason: 'Correcto. Los codigos SMS nunca se reenvian. Contactar por un canal previo confirma la identidad real.'
						},
						{
							id: 'foto-prueba',
							text: 'Le pido que me envie una foto actual sosteniendo un papel con mi nombre para comprobar que es el',
							isCorrect: false,
							reason: 'Las fotos pueden ser editadas o generadas con IA. No es un metodo seguro de verificacion.'
						}
					]}
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
