'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import PuzzleWrapper from '../PuzzleWrapper';
import TruthChallenge from '../TruthChallenge';

type GroomingRoomProps = {
	onComplete: () => void;
};

type Position = {
	x: number;
	y: number;
};

type Direction = 'up' | 'down' | 'left' | 'right';

type Enemy = {
	id: string;
	icon: string;
	position: Position;
	direction: Direction;
};

type GateOption = {
	id: string;
	text: string;
	isCorrect: boolean;
	reason: string;
};

type GateQuestion = {
	id: string;
	cell: string;
	prompt: string;
	options: [GateOption, GateOption];
};

const mazeLayout = [
	[0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
	[0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0],
	[0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
	[1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
	[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
	[0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
	[0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
	[1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
	[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
] as const;

const startPos: Position = { x: 0, y: 10 };
const exitPos: Position = { x: 10, y: 0 };
const keyCells = ['2-6', '4-4', '8-2'] as const;
const initialSecondsLeft = 100;

const gateQuestions: GateQuestion[] = [
	{
		id: 'gate-1',
		cell: '2-8',
		prompt: 'Alguien mayor que no conoces te pide continuar por chat privado. ¿Que haces?',
		options: [
			{
				id: 'g1-safe',
				text: 'Corto el chat, bloqueo y aviso a un adulto de confianza',
				isCorrect: true,
				reason: 'Correcto. Cortar, bloquear e informar reduce el riesgo.'
			},
			{
				id: 'g1-risk',
				text: 'Sigo hablando para entender mejor su intencion',
				isCorrect: false,
				reason: 'Mantener contacto aumenta el riesgo aunque parezca inofensivo.'
			}
		]
	},
	{
		id: 'gate-2',
		cell: '6-6',
		prompt: 'Te piden mantener secreto sobre una conversacion en internet. ¿Que opcion es segura?',
		options: [
			{
				id: 'g2-risk',
				text: 'Guardar el secreto mientras no me pidan nada mas',
				isCorrect: false,
				reason: 'Ese tipo de secreto es una alerta y debe informarse.'
			},
			{
				id: 'g2-safe',
				text: 'Contarlo de inmediato a un adulto y guardar evidencia',
				isCorrect: true,
				reason: 'Correcto. Reportar pronto protege y permite actuar a tiempo.'
			}
		]
	},
	{
		id: 'gate-3',
		cell: '8-4',
		prompt: 'Un contacto insiste en recibir foto personal para "confiar". ¿Que haces?',
		options: [
			{
				id: 'g3-safe',
				text: 'No envio nada, bloqueo y reporto la cuenta',
				isCorrect: true,
				reason: 'Correcto. No enviar contenido personal es la decision segura.'
			},
			{
				id: 'g3-risk',
				text: 'Envio solo una foto sin mostrar informacion',
				isCorrect: false,
				reason: 'Cualquier envio puede reutilizarse para presionarte.'
			}
		]
	}
];

const initialEnemies: Enemy[] = [
	{ id: 'enemy-a', icon: '👾', position: { x: 6, y: 6 }, direction: 'left' },
	{ id: 'enemy-b', icon: '👻', position: { x: 8, y: 8 }, direction: 'up' }
];

const enemyMoveIntervalMs = 1200;
const enemyChaseProbability = 0.55;

const directionVectors: Record<Direction, Position> = {
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 }
};

const reverseDirection: Record<Direction, Direction> = {
	up: 'down',
	down: 'up',
	left: 'right',
	right: 'left'
};

function keyOf(pos: Position): string {
	return `${pos.x}-${pos.y}`;
}

function getInitialEnemies(): Enemy[] {
	return initialEnemies.map((enemy) => ({
		...enemy,
		position: { ...enemy.position }
	}));
}

export default function GroomingRoom({ onComplete }: GroomingRoomProps) {
	const size = mazeLayout.length;
	const [player, setPlayer] = useState<Position>(startPos);
	const [enemies, setEnemies] = useState<Enemy[]>(() => getInitialEnemies());
	const [visited, setVisited] = useState<string[]>([keyOf(startPos)]);
	const [collectedKeys, setCollectedKeys] = useState<string[]>([]);
	const [passedGates, setPassedGates] = useState<string[]>([]);
	const [activeGateId, setActiveGateId] = useState<string | null>(null);
	const [selectedGateOption, setSelectedGateOption] = useState<string>('');
	const [gateVerified, setGateVerified] = useState(false);
	const [moves, setMoves] = useState(0);
	const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);
	const [mistakes, setMistakes] = useState(0);
	const [exitReached, setExitReached] = useState(false);
	const [mazeMessage, setMazeMessage] = useState('Recoge 3 llaves, responde checkpoints y llega a la salida.');
	const [challengeSelection, setChallengeSelection] = useState<boolean | null>(null);
	const [verified, setVerified] = useState(false);
	const [challengePassed, setChallengePassed] = useState(false);
	const [completed, setCompleted] = useState(false);

	const playerRef = useRef(player);
	useEffect(() => {
		playerRef.current = player;
	}, [player]);

	const totalWalkableCells = useMemo(
		() => mazeLayout.flatMap((row) => row).filter((cell) => cell === 0).length,
		[]
	);

	const gateByCell = useMemo(() => new Map(gateQuestions.map((gate) => [gate.cell, gate])), []);

	const gateOptionOrder = useMemo(() => {
		const order: Record<string, GateOption[]> = {};
		for (const gate of gateQuestions) {
			const shuffled = [...gate.options];
			if (Math.random() > 0.5) {
				shuffled.reverse();
			}
			order[gate.id] = shuffled;
		}
		return order;
	}, []);

	const activeGate = useMemo(
		() => gateQuestions.find((gate) => gate.id === activeGateId) ?? null,
		[activeGateId]
	);

	const keyTarget = keyCells.length;
	const gateTarget = gateQuestions.length;
	const hasAllKeys = collectedKeys.length === keyTarget;
	const hasAllGates = passedGates.length === gateTarget;
	const canVerify = exitReached && challengeSelection !== null;

	const progress = useMemo(() => {
		if (completed) {
			return 100;
		}

		const exploreFactor = Math.min(35, (visited.length / totalWalkableCells) * 35);
		const keysFactor = (collectedKeys.length / keyTarget) * 25;
		const gatesFactor = (passedGates.length / gateTarget) * 20;
		const exitFactor = exitReached ? 8 : 0;
		const challengeFactor = challengePassed ? 12 : 0;
		return exploreFactor + keysFactor + gatesFactor + exitFactor + challengeFactor;
	}, [challengePassed, collectedKeys.length, completed, exitReached, passedGates.length, totalWalkableCells]);

	function isInside(pos: Position): boolean {
		return pos.x >= 0 && pos.y >= 0 && pos.x < size && pos.y < size;
	}

	function isWall(pos: Position): boolean {
		return mazeLayout[pos.y][pos.x] === 1;
	}

	function isKeyCell(pos: Position): boolean {
		return keyCells.includes(keyOf(pos) as (typeof keyCells)[number]);
	}

	function resetRun(message: string) {
		setPlayer(startPos);
		setEnemies(getInitialEnemies());
		setVisited([keyOf(startPos)]);
		setCollectedKeys([]);
		setPassedGates([]);
		setActiveGateId(null);
		setSelectedGateOption('');
		setGateVerified(false);
		setMoves(0);
		setSecondsLeft(initialSecondsLeft);
		setMistakes(0);
		setExitReached(false);
		setChallengeSelection(null);
		setVerified(false);
		setChallengePassed(false);
		setCompleted(false);
		setMazeMessage(message);
	}

	function handleEnemyCollision() {
		resetRun('Un enemigo te toco. Perdiste y debes reiniciar el laberinto.');
	}

	function finishRoom() {
		onComplete();
	}

	function moveEnemy(enemy: Enemy, hunterTarget: Position): Enemy {
		const candidates = (Object.keys(directionVectors) as Direction[])
			.map((direction) => {
				const vector = directionVectors[direction];
				const candidate = {
					x: enemy.position.x + vector.x,
					y: enemy.position.y + vector.y
				};
				return { direction, candidate };
			})
			.filter(({ candidate }) => isInside(candidate) && !isWall(candidate));

		if (candidates.length === 0) {
			return enemy;
		}

		const reverse = reverseDirection[enemy.direction];
		const pool = candidates.length > 1 ? candidates.filter((item) => item.direction !== reverse) : candidates;
		const sortedByDistance = [...pool].sort((a, b) => {
			const da = Math.abs(a.candidate.x - hunterTarget.x) + Math.abs(a.candidate.y - hunterTarget.y);
			const db = Math.abs(b.candidate.x - hunterTarget.x) + Math.abs(b.candidate.y - hunterTarget.y);
			return da - db;
		});

		const shouldChase = Math.random() < enemyChaseProbability;
		let nextStep = sortedByDistance[0] ?? candidates[0];

		if (!shouldChase && sortedByDistance.length > 1) {
			const alternatives = sortedByDistance.slice(1);
			nextStep = alternatives[Math.floor(Math.random() * alternatives.length)] ?? nextStep;
		}

		return {
			...enemy,
			position: nextStep.candidate,
			direction: nextStep.direction
		};
	}

	useEffect(() => {
		if (completed || exitReached || activeGateId) {
			return;
		}

		const interval = window.setInterval(() => {
			const target = playerRef.current;
			setEnemies((prev) => prev.map((enemy) => moveEnemy(enemy, target)));
		}, enemyMoveIntervalMs);

		return () => window.clearInterval(interval);
	}, [activeGateId, completed, exitReached]);

	useEffect(() => {
		if (completed || exitReached || activeGateId) {
			return;
		}

		const collision = enemies.some((enemy) => enemy.position.x === player.x && enemy.position.y === player.y);
		if (collision) {
			handleEnemyCollision();
		}
	}, [activeGateId, completed, enemies, exitReached, player.x, player.y]);

	useEffect(() => {
		if (completed) {
			return;
		}

		const timer = window.setInterval(() => {
			setSecondsLeft((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => window.clearInterval(timer);
	}, [completed]);

	useEffect(() => {
		if (!completed && exitReached && challengePassed) {
			setCompleted(true);
			setMazeMessage('Ganaste el laberinto. Pulsa FINALIZAR para cerrar la sala.');
		}
	}, [challengePassed, completed, exitReached]);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
				event.preventDefault();
			}

			if (event.key === 'ArrowUp') {
				movePlayer(0, -1);
			}
			if (event.key === 'ArrowDown') {
				movePlayer(0, 1);
			}
			if (event.key === 'ArrowLeft') {
				movePlayer(-1, 0);
			}
			if (event.key === 'ArrowRight') {
				movePlayer(1, 0);
			}
		}

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});

	function movePlayer(dx: number, dy: number) {
		if (completed || exitReached || activeGateId) {
			return;
		}

		setPlayer((prev) => {
			const target = { x: prev.x + dx, y: prev.y + dy };
			if (!isInside(target)) {
				return prev;
			}

			if (isWall(target)) {
				setMistakes((current) => current + 1);
				setSecondsLeft((current) => Math.max(0, current - 2));
				setMazeMessage('Ese camino tiene un muro. Busca otra ruta.');
				return prev;
			}

			setMoves((current) => current + 1);

			const nextKey = keyOf(target);
			if (isKeyCell(target) && !collectedKeys.includes(nextKey)) {
				setCollectedKeys((current) => [...current, nextKey]);
				setMazeMessage(`Llave obtenida (${collectedKeys.length + 1}/${keyTarget}).`);
			}

			const gate = gateByCell.get(nextKey);
			if (gate && !passedGates.includes(gate.id)) {
				setActiveGateId(gate.id);
				setSelectedGateOption('');
				setGateVerified(false);
				setMazeMessage('Checkpoint: responde bien para seguir avanzando.');
			}

			if (target.x === exitPos.x && target.y === exitPos.y) {
				const projectedKeys = collectedKeys.length + (isKeyCell(target) && !collectedKeys.includes(nextKey) ? 1 : 0);
				if (projectedKeys < keyTarget || passedGates.length < gateTarget) {
					setMazeMessage('Salida cerrada. Necesitas 3 llaves y completar todos los checkpoints.');
				} else {
					setExitReached(true);
					setMazeMessage('Salida desbloqueada. Verifica la decision final para continuar.');
				}
			}

			setVisited((current) => (current.includes(nextKey) ? current : [...current, nextKey]));
			return target;
		});
	}

	function moveByCell(target: Position) {
		const dx = target.x - player.x;
		const dy = target.y - player.y;
		if (Math.abs(dx) + Math.abs(dy) !== 1) {
			return;
		}

		movePlayer(dx, dy);
	}

	function verifyGateQuestion() {
		if (!activeGate || !selectedGateOption) {
			return;
		}

		setGateVerified(true);
		const choice = activeGate.options.find((option) => option.id === selectedGateOption);
		if (choice?.isCorrect) {
			setPassedGates((current) => (current.includes(activeGate.id) ? current : [...current, activeGate.id]));
			setMazeMessage('Checkpoint superado. Puedes seguir avanzando.');
			setActiveGateId(null);
			setSelectedGateOption('');
			setGateVerified(false);
			return;
		}

		setMistakes((current) => current + 1);
		setSecondsLeft((current) => Math.max(0, current - 6));
		setMazeMessage('Respuesta incorrecta. Intenta de nuevo para continuar.');
	}

	function verifyRoom() {
		setVerified(true);
		if (challengeSelection) {
			setChallengePassed(true);
		}
	}

	const orderedGateOptions = useMemo(() => {
		if (!activeGate) {
			return [] as GateOption[];
		}

		return gateOptionOrder[activeGate.id] ?? [...activeGate.options];
	}, [activeGate, gateOptionOrder]);

	const cells = Array.from({ length: size * size }, (_, index) => {
		const x = index % size;
		const y = Math.floor(index / size);
		const current = { x, y };
		const cellKey = keyOf(current);
		const isPlayer = player.x === x && player.y === y;
		const isExit = exitPos.x === x && exitPos.y === y;
		const wall = isWall(current);
		const keyCell = isKeyCell(current);
		const keyCollected = collectedKeys.includes(cellKey);
		const enemy = enemies.find((item) => item.position.x === x && item.position.y === y);
		const gate = gateByCell.get(cellKey);
		const gatePassed = gate ? passedGates.includes(gate.id) : false;
		const canTap = !wall && Math.abs(player.x - x) + Math.abs(player.y - y) === 1;

		let content = '';
		if (keyCell && !keyCollected) {
			content = '🗝️';
		}
		if (gate && !gatePassed) {
			content = '❓';
		}
		if (gate && gatePassed) {
			content = '✅';
		}
		if (isExit) {
			content = hasAllKeys && hasAllGates ? '🚪' : '🔒';
		}
		if (enemy) {
			content = enemy.icon;
		}
		if (isPlayer) {
			content = '🧒';
		}
		if (wall) {
			content = '';
		}

		const className = [
			'grooming-cell',
			wall ? 'wall' : 'walkable',
			gate && !gatePassed ? 'question-gate' : '',
			gatePassed ? 'question-passed' : '',
			isExit ? (hasAllKeys && hasAllGates ? 'goal-open' : 'goal-locked') : '',
			enemy ? 'enemy' : '',
			canTap && !exitReached && !activeGateId ? 'reachable' : ''
		]
			.filter(Boolean)
			.join(' ');

		return (
			<div key={`${x}-${y}`} className={className} onClick={() => moveByCell(current)}>
				{content}
			</div>
		);
	});

	return (
		<PuzzleWrapper
			title="Sala 4: Laberinto de Escape Final"
			subtitle="Recoge 3 llaves, supera checkpoints con preguntas y evita enemigos para abrir la salida."
			progress={progress}
			lawHint="Ley 1098 de 2006: proteccion integral de ninos, ninas y adolescentes"
		>
			<section className="grooming-room-shell">
				<div className="grooming-status-row">
					<div className="hud-pill">🧩 Laberinto experto: 11x11</div>
					<div className="hud-pill">⏳ Tiempo: {secondsLeft}s</div>
					<div className="hud-pill">⚠️ Errores: {mistakes}</div>
					<div className="hud-pill">🗝️ Llaves: {collectedKeys.length}/{keyTarget}</div>
					<div className="hud-pill">❓ Checkpoints: {passedGates.length}/{gateTarget}</div>
					<div className="hud-pill">👾 Enemigos: {enemies.length}</div>
					<div className="hud-pill">🚪 Salida: {hasAllKeys && hasAllGates ? 'Desbloqueada' : 'Bloqueada'}</div>
					<div className="hud-pill">👣 Exploradas: {visited.length}/{totalWalkableCells}</div>
					<div className="hud-pill">🕹️ Movimientos: {moves}</div>
				</div>

				<div className="grooming-legend">
					<span className="badge">🧒 Tu personaje</span>
					<span className="badge">👾/👻 Enemigos</span>
					<span className="badge">🗝️ Llaves</span>
					<span className="badge">❓ Pregunta</span>
					<span className="badge">🚪 Salida</span>
					<span className="badge">🧱 Muros</span>
				</div>

				<div className="glass-card grooming-maze-stage">
					<p className="grooming-maze-banner">{mazeMessage}</p>
					<div className="grooming-maze-board">{cells}</div>
				</div>

				<div className="grooming-controls">
					<button className="game-button secondary" onClick={() => movePlayer(0, -1)} disabled={exitReached || Boolean(activeGateId)}>
						Arriba
					</button>
					<button className="game-button secondary" onClick={() => movePlayer(-1, 0)} disabled={exitReached || Boolean(activeGateId)}>
						Izquierda
					</button>
					<button className="game-button secondary" onClick={() => movePlayer(1, 0)} disabled={exitReached || Boolean(activeGateId)}>
						Derecha
					</button>
					<button className="game-button secondary" onClick={() => movePlayer(0, 1)} disabled={exitReached || Boolean(activeGateId)}>
						Abajo
					</button>
				</div>

				{activeGate && !completed ? (
					<div className="path-question-backdrop">
						<div className="path-question-card">
							<h3>Checkpoint del camino</h3>
							<p>{activeGate.prompt}</p>
							<div className="truth-options">
								{orderedGateOptions.map((option) => {
									const isSelected = selectedGateOption === option.id;
									let stateClass = isSelected ? 'selected' : '';
									if (gateVerified && isSelected) {
										stateClass = option.isCorrect ? 'correct' : 'incorrect';
									}
									return (
										<button
											key={option.id}
											type="button"
											onClick={() => {
												setSelectedGateOption(option.id);
												setGateVerified(false);
											}}
											className={`option-button ${stateClass}`}
										>
											{option.text}
										</button>
									);
								})}
							</div>
							{gateVerified && selectedGateOption ? (
								<p className={(activeGate.options.find((option) => option.id === selectedGateOption)?.isCorrect ? 'feedback-ok' : 'feedback-bad') + ' grooming-feedback-inline'}>
									{activeGate.options.find((option) => option.id === selectedGateOption)?.reason}
								</p>
							) : null}
							<div className="path-question-actions">
								<button type="button" className="game-button primary" onClick={verifyGateQuestion} disabled={!selectedGateOption}>
									Verificar respuesta
								</button>
							</div>
						</div>
					</div>
				) : null}

				{completed ? (
					<div className="glass-card grooming-finish-card">
						<h3>Ganaste el laberinto final</h3>
						<p>Muy bien. Pulsa FINALIZAR para cerrar esta sala y continuar.</p>
						<div className="grooming-intro-actions">
							<button type="button" className="game-button primary" onClick={finishRoom}>
								Finalizar
							</button>
						</div>
					</div>
				) : exitReached ? (
					<>
						<TruthChallenge
							title="Decision final"
							prompt="Si un adulto desconocido pide fotos privadas o secretos, ¿cual es la accion correcta?"
							onSelectionChange={(value) => {
								setChallengeSelection(value);
								setVerified(false);
								setChallengePassed(false);
							}}
							revealResult={verified}
							options={[
								{
									id: 'seguir',
									text: 'Mantener la conversacion mientras pido que me de tiempo',
									isCorrect: false,
									reason: 'Aunque suene prudente, mantener el contacto puede escalar el riesgo.'
								},
								{
									id: 'contar-adulto',
									text: 'Cortar contacto, bloquear y contarlo enseguida a un adulto de confianza',
									isCorrect: true,
									reason: 'Correcto. Cortar contacto y pedir ayuda inmediata es la accion segura.'
								},
								{
									id: 'guardar-secreto',
									text: 'No enviar nada, pero guardar silencio para evitar problemas',
									isCorrect: false,
									reason: 'Guardar silencio mantiene el riesgo. Debes informar a un adulto.'
								}
							]}
						/>

						<div className="room-verify-actions">
							<button type="button" className="game-button primary" onClick={verifyRoom} disabled={!canVerify || completed}>
								Verificar y terminar sala
							</button>
							{verified && !challengePassed ? (
								<p className="feedback-bad grooming-feedback-inline">
									Tu decision final no es segura. Ajustala y vuelve a verificar.
								</p>
							) : null}
						</div>
					</>
				) : (
					<p className="grooming-locked-note">Recolecta 3 llaves, supera checkpoints y llega a la salida para habilitar la pregunta final.</p>
				)}
			</section>
		</PuzzleWrapper>
	);
}
