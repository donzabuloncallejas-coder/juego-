'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';

type StationId = 'cyber' | 'fake' | 'identity' | 'grooming' | 'games';
type GameMode = 'map' | 'play';

type ChallengeQuestion = {
	prompt: string;
	options: Array<{ id: string; text: string; safe: boolean }>;
};

type Station = {
	id: StationId;
	title: string;
	emoji: string;
	description: string;
	guidance: string;
	challenges: ChallengeQuestion[];
};

type Position = {
	x: number;
	y: number;
};

type SubStation = {
	position: Position;
	label: string;
	emoji: string;
	challengeIndex: number;
};

type LevelConfig = {
	id: StationId;
	order: number;
	requiredStars: number;
	enemyCount: number;
	enemySpeed: number;
	mapPosition: Position;
	stationPosition: Position;
	playerStart: Position;
	subStations?: SubStation[];
	enemyEmojis?: string[];
	theme?: string;
	catchMessage?: string;
};

type Enemy = {
	id: string;
	emoji: string;
	position: Position;
};

type StoredProgress = {
	completed: StationId[];
	totalScore: number;
};

const MINI_LEVEL_STORAGE_KEY = 'mini-escape-4-8-progress';

const stations: Station[] = [
	{
		id: 'cyber',
		title: 'Nivel 1 - Ciberacoso',
		emoji: '🛡️',
		description: 'Aprendes a responder con calma y pedir ayuda.',
		guidance: 'Si lees algo feo, respira y busca un adulto de confianza.',
		challenges: [
			{
				prompt: 'Te llega un mensaje grosero. ¿Que haces?',
				options: [
					{ id: 'a', text: 'Guardo prueba y aviso a un adulto', safe: true },
					{ id: 'b', text: 'Insulto de regreso', safe: false },
					{ id: 'c', text: 'Lo publico para burlarme', safe: false }
				]
			},
			{
				prompt: 'Si un companero molesta en un chat del curso, ¿que es mejor?',
				options: [
					{ id: 'a', text: 'Reirme para encajar', safe: false },
					{ id: 'b', text: 'Compartir el mensaje en otros grupos', safe: false },
					{ id: 'c', text: 'Pedir respeto y avisar a un adulto', safe: true }
				]
			},
			{
				prompt: 'Si te sientes triste por mensajes en internet, ¿que haces?',
				options: [
					{ id: 'a', text: 'Me quedo callado siempre', safe: false },
					{ id: 'b', text: 'Hablo con alguien de confianza', safe: true },
					{ id: 'c', text: 'Respondo con mas insultos', safe: false }
				]
			}
		]
	},
	{
		id: 'fake',
		title: 'Nivel 2 - Fake News',
		emoji: '📰',
		description: 'Detectas noticias reales y evitas compartir rumores.',
		guidance: 'Busca fuente, autor y fecha antes de compartir.',
		challenges: [
			{
				prompt: 'Ves una noticia viral sin fuente. ¿Que haces?',
				options: [
					{ id: 'a', text: 'La comparto rapido', safe: false },
					{ id: 'b', text: 'Invento mas datos', safe: false },
					{ id: 'c', text: 'La reviso con un adulto y no la comparto aun', safe: true }
				]
			},
			{
				prompt: 'Un video dice algo increible. ¿Como comprobarlo?',
				options: [
					{ id: 'a', text: 'Buscar otra fuente confiable', safe: true },
					{ id: 'b', text: 'Creerlo solo por ser popular', safe: false },
					{ id: 'c', text: 'Mandarlo sin mirar', safe: false }
				]
			},
			{
				prompt: 'Si una noticia da miedo pero no tiene fecha, ¿que haces?',
				options: [
					{ id: 'a', text: 'La mando a todos', safe: false },
					{ id: 'b', text: 'La paro y pregunto a un adulto', safe: true },
					{ id: 'c', text: 'Le agrego mas cosas', safe: false }
				]
			}
		]
	},
	{
		id: 'identity',
		title: 'Nivel 3 - Mi Perfil Seguro',
		emoji: '🔐',
		description: 'Proteges tus datos y tus claves personales.',
		guidance: 'Tu contrasena es secreta. Nadie debe pedirla.',
		challenges: [
			{
				prompt: 'Un perfil nuevo pide tu clave. ¿Que haces?',
				options: [
					{ id: 'a', text: 'La publico en comentarios', safe: false },
					{ id: 'b', text: 'No la doy y aviso a mi familia', safe: true },
					{ id: 'c', text: 'Se la doy para ayudar', safe: false }
				]
			},
			{
				prompt: 'Para crear una clave segura, ¿que conviene?',
				options: [
					{ id: 'a', text: 'Combinar letras y numeros', safe: true },
					{ id: 'b', text: 'Usar 1234', safe: false },
					{ id: 'c', text: 'Usar mi nombre completo', safe: false }
				]
			},
			{
				prompt: 'Si un juego pide tu direccion real, ¿que haces?',
				options: [
					{ id: 'a', text: 'La doy para seguir', safe: false },
					{ id: 'b', text: 'Tambien doy el telefono', safe: false },
					{ id: 'c', text: 'No la doy y pido ayuda', safe: true }
				]
			}
		]
	},
	{
		id: 'grooming',
		title: 'Nivel 4 - Contacto Riesgoso',
		emoji: '🚨',
		description: 'Aprendes a alejarte de conversaciones peligrosas.',
		guidance: 'Si algo te incomoda, para y cuentalo enseguida.',
		challenges: [
			{
				prompt: 'Un adulto desconocido pide fotos privadas. ¿Que haces?',
				options: [
					{ id: 'a', text: 'Sigo hablando en secreto', safe: false },
					{ id: 'b', text: 'Bloqueo y cuento a un adulto de confianza', safe: true },
					{ id: 'c', text: 'Le envio lo que pide', safe: false }
				]
			},
			{
				prompt: 'Si alguien te pide guardar secreto en chat, ¿que haces?',
				options: [
					{ id: 'a', text: 'Guardo secreto siempre', safe: false },
					{ id: 'b', text: 'Acepto y sigo chateando', safe: false },
					{ id: 'c', text: 'Lo cuento a mi familia', safe: true }
				]
			},
			{
				prompt: 'Si algo te hace sentir incomodo en internet, ¿que haces?',
				options: [
					{ id: 'a', text: 'Cierro, bloqueo y aviso', safe: true },
					{ id: 'b', text: 'Sigo por curiosidad', safe: false },
					{ id: 'c', text: 'No digo nada a nadie', safe: false }
				]
			}
		]
	},
	{
		id: 'games',
		title: 'Nivel 5 - Gamer Seguro',
		emoji: '🎮',
		description: 'Juegas en linea sin compartir datos personales.',
		guidance: 'En los juegos usa apodos y no reveles direccion ni telefono.',
		challenges: [
			{
				prompt: 'Alguien en un juego te pide tu direccion. ¿Que haces?',
				options: [
					{ id: 'a', text: 'Le doy mi direccion para recibir un regalo', safe: false },
					{ id: 'b', text: 'Le comparto tambien mi telefono', safe: false },
					{ id: 'c', text: 'No la doy y aviso a mi familia', safe: true }
				]
			},
			{
				prompt: 'Para jugar seguro en linea, ¿que nombre usas?',
				options: [
					{ id: 'a', text: 'Un apodo sin datos personales', safe: true },
					{ id: 'b', text: 'Mi nombre y apellido real', safe: false },
					{ id: 'c', text: 'Mi direccion como nombre', safe: false }
				]
			},
			{
				prompt: 'Si alguien en el juego te invita a un chat privado raro, ¿que haces?',
				options: [
					{ id: 'a', text: 'Entro de una vez', safe: false },
					{ id: 'b', text: 'No entro y aviso a un adulto', safe: true },
					{ id: 'c', text: 'Le mando mis datos para confiar', safe: false }
				]
			}
		]
	}
];

const levels: LevelConfig[] = [
	{
		id: 'cyber',
		order: 0,
		requiredStars: 1,
		enemyCount: 3,
		enemySpeed: 0.55,
		mapPosition: { x: 8, y: 72 },
		stationPosition: { x: 18, y: 55 },
		playerStart: { x: 10, y: 86 },
		subStations: [
			{ position: { x: 10, y: 75 }, label: 'Escudo 1', emoji: '🛡️', challengeIndex: 0 },
			{ position: { x: 50, y: 20 }, label: 'Escudo 2', emoji: '💬', challengeIndex: 1 },
			{ position: { x: 88, y: 60 }, label: 'Escudo 3', emoji: '❤️', challengeIndex: 2 }
		],
		enemyEmojis: ['🧑‍💻', '👤', '👾'],
		theme: 'cyber',
		catchMessage: '¡Un acosador te alcanzo! Debes volver a empezar.'
	},
	{
		id: 'fake',
		order: 1,
		requiredStars: 2,
		enemyCount: 3,
		enemySpeed: 0.7,
		mapPosition: { x: 24, y: 58 },
		stationPosition: { x: 36, y: 52 },
		playerStart: { x: 10, y: 86 },
		subStations: [
			{ position: { x: 12, y: 30 }, label: 'Verificar 1', emoji: '🔍', challengeIndex: 0 },
			{ position: { x: 55, y: 70 }, label: 'Verificar 2', emoji: '📋', challengeIndex: 1 },
			{ position: { x: 85, y: 25 }, label: 'Verificar 3', emoji: '✅', challengeIndex: 2 }
		],
		enemyEmojis: ['📢', '🗞️', '🤥'],
		theme: 'fakenews',
		catchMessage: '¡Una noticia falsa te atrapo! Debes volver a empezar.'
	},
	{
		id: 'identity',
		order: 2,
		requiredStars: 2,
		enemyCount: 3,
		enemySpeed: 0.82,
		mapPosition: { x: 40, y: 48 },
		stationPosition: { x: 50, y: 40 },
		playerStart: { x: 12, y: 84 },
		subStations: [
			{ position: { x: 15, y: 20 }, label: 'Clave 1', emoji: '🔑', challengeIndex: 0 },
			{ position: { x: 50, y: 75 }, label: 'Clave 2', emoji: '🛡️', challengeIndex: 1 },
			{ position: { x: 85, y: 35 }, label: 'Clave 3', emoji: '🔐', challengeIndex: 2 }
		],
		enemyEmojis: ['🕵️', '👁️', '💀'],
		theme: 'identity',
		catchMessage: '¡Un suplantador robo tu identidad! Debes volver a empezar.'
	},
	{
		id: 'grooming',
		order: 3,
		requiredStars: 3,
		enemyCount: 3,
		enemySpeed: 0.95,
		mapPosition: { x: 58, y: 33 },
		stationPosition: { x: 66, y: 26 },
		playerStart: { x: 12, y: 84 },
		subStations: [
			{ position: { x: 10, y: 25 }, label: 'Alerta 1', emoji: '🚨', challengeIndex: 0 },
			{ position: { x: 48, y: 80 }, label: 'Alerta 2', emoji: '⚠️', challengeIndex: 1 },
			{ position: { x: 88, y: 15 }, label: 'Alerta 3', emoji: '🆘', challengeIndex: 2 }
		],
		enemyEmojis: ['🐺', '🎭', '🤡'],
		theme: 'grooming',
		catchMessage: '¡Un desconocido peligroso te alcanzo! Debes volver a empezar.'
	},
	{
		id: 'games',
		order: 4,
		requiredStars: 3,
		enemyCount: 3,
		enemySpeed: 1.08,
		mapPosition: { x: 76, y: 20 },
		stationPosition: { x: 84, y: 16 },
		playerStart: { x: 14, y: 82 },
		subStations: [
			{ position: { x: 12, y: 65 }, label: 'Escudo G1', emoji: '🎮', challengeIndex: 0 },
			{ position: { x: 50, y: 15 }, label: 'Escudo G2', emoji: '🕹️', challengeIndex: 1 },
			{ position: { x: 88, y: 55 }, label: 'Escudo G3', emoji: '🏆', challengeIndex: 2 }
		],
		enemyEmojis: ['👾', '🤖', '☠️'],
		theme: 'gamer',
		catchMessage: '¡Un jugador malicioso te atrapo! Debes volver a empezar.'
	}
];

const collectiblePool: Position[] = [
	{ x: 10, y: 46 },
	{ x: 18, y: 18 },
	{ x: 30, y: 78 },
	{ x: 42, y: 22 },
	{ x: 57, y: 37 },
	{ x: 64, y: 69 },
	{ x: 78, y: 52 },
	{ x: 88, y: 28 },
	{ x: 72, y: 10 },
	{ x: 24, y: 62 },
	{ x: 52, y: 84 },
	{ x: 90, y: 80 }
];

const enemySpawnPool: Position[] = [
	{ x: 80, y: 78 },
	{ x: 70, y: 18 },
	{ x: 30, y: 20 },
	{ x: 44, y: 72 },
	{ x: 90, y: 42 },
	{ x: 58, y: 56 }
];

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function distance(from: Position, to: Position): number {
	const dx = from.x - to.x;
	const dy = from.y - to.y;
	return Math.sqrt(dx * dx + dy * dy);
}

function getStoredProgress(): StoredProgress {
	if (typeof window === 'undefined') {
		return { completed: [], totalScore: 0 };
	}

	try {
		const raw = window.localStorage.getItem(MINI_LEVEL_STORAGE_KEY);
		if (!raw) {
			return { completed: [], totalScore: 0 };
		}

		const parsed = JSON.parse(raw) as Partial<StoredProgress>;
		const validIds = new Set(levels.map((level) => level.id));
		const completed = Array.isArray(parsed.completed)
			? parsed.completed.filter((id): id is StationId => typeof id === 'string' && validIds.has(id as StationId))
			: [];
		const totalScore = typeof parsed.totalScore === 'number' && Number.isFinite(parsed.totalScore) ? parsed.totalScore : 0;
		return { completed, totalScore };
	} catch {
		return { completed: [], totalScore: 0 };
	}
}

function persistProgress(completed: StationId[], totalScore: number): void {
	if (typeof window === 'undefined') {
		return;
	}

	window.localStorage.setItem(
		MINI_LEVEL_STORAGE_KEY,
		JSON.stringify({
			completed,
			totalScore
		})
	);
}

function buildCollectiblesForLevel(level: LevelConfig): Array<Position & { id: string }> {
	const count = level.requiredStars + 2;
	const start = (level.order * 2) % collectiblePool.length;
	const result: Array<Position & { id: string }> = [];

	for (let index = 0; index < count; index += 1) {
		const source = collectiblePool[(start + index) % collectiblePool.length];
		result.push({ id: `${level.id}-star-${index}`, x: source.x, y: source.y });
	}

	return result;
}

function buildEnemiesForLevel(level: LevelConfig): Enemy[] {
	const defaultIcons = ['👾', '🐲', '👻'];
	const icons = level.enemyEmojis ?? defaultIcons;
	const start = (level.order * 2) % enemySpawnPool.length;
	const list: Enemy[] = [];

	for (let index = 0; index < level.enemyCount; index += 1) {
		const source = enemySpawnPool[(start + index) % enemySpawnPool.length];
		list.push({
			id: `${level.id}-enemy-${index}`,
			emoji: icons[index % icons.length],
			position: { x: source.x, y: source.y }
		});
	}

	return list;
}

export default function MiniEscapeClient() {
	const [mode, setMode] = useState<GameMode>('map');
	const [completedLevels, setCompletedLevels] = useState<StationId[]>([]);
	const [totalScore, setTotalScore] = useState(0);
	const [cycleScore, setCycleScore] = useState<number | null>(null);

	const [activeLevelId, setActiveLevelId] = useState<StationId | null>(null);
	const [player, setPlayer] = useState<Position>({ x: 10, y: 86 });
	const [stars, setStars] = useState(0);
	const [collectedItems, setCollectedItems] = useState<string[]>([]);
	const [enemies, setEnemies] = useState<Enemy[]>([]);
	const [enemyHits, setEnemyHits] = useState(0);
	const [activeStation, setActiveStation] = useState<StationId | null>(null);
	const [activeSubIndex, setActiveSubIndex] = useState<number>(-1);
	const [completedSubStations, setCompletedSubStations] = useState<number[]>([]);
	const [questionIndex, setQuestionIndex] = useState(0);
	const [selectedChoice, setSelectedChoice] = useState('');
	const [verifiedAnswer, setVerifiedAnswer] = useState(false);
	const [challengeDone, setChallengeDone] = useState(false);
	const [levelCleared, setLevelCleared] = useState(false);
	const [hackerAlert, setHackerAlert] = useState(false);
	const [correctAnswers, setCorrectAnswers] = useState(0);
	const [wrongAnswers, setWrongAnswers] = useState(0);
	const [voiceEnabled, setVoiceEnabled] = useState(true);
	const [levelMessage, setLevelMessage] = useState('Elige un nivel en el mapa para empezar.');

	const playerRef = useRef(player);
	const stationContactRef = useRef(false);
	useEffect(() => {
		playerRef.current = player;
	}, [player]);

	const stationById = useMemo(() => {
		return Object.fromEntries(stations.map((station) => [station.id, station])) as Record<StationId, Station>;
	}, []);

	const activeLevel = useMemo(() => {
		return levels.find((level) => level.id === activeLevelId) ?? null;
	}, [activeLevelId]);

	const activeStationData = activeLevel ? stationById[activeLevel.id] : null;

	const hasSubStations = Boolean(activeLevel?.subStations && activeLevel.subStations.length > 0);

	const activeQuestion = useMemo(() => {
		if (!activeStationData) {
			return null;
		}

		if (hasSubStations && activeSubIndex >= 0 && activeLevel?.subStations) {
			const sub = activeLevel.subStations[activeSubIndex];
			return activeStationData.challenges[sub.challengeIndex] ?? null;
		}

		return activeStationData.challenges[questionIndex] ?? null;
	}, [activeStationData, activeLevel, activeSubIndex, hasSubStations, questionIndex]);
	const questionPaletteClass = `question-palette-${(questionIndex % 3) + 1}`;
	const selectedOption = activeQuestion?.options.find((option) => option.id === selectedChoice) ?? null;

	const levelState = useMemo(() => {
		return levels.map((level, index) => {
			const done = completedLevels.includes(level.id);
			const unlocked = index === 0 || completedLevels.includes(levels[index - 1].id);
			return { ...level, done, unlocked };
		});
	}, [completedLevels]);

	const activeCollectibles = useMemo(() => {
		if (!activeLevel) {
			return [] as Array<Position & { id: string }>;
		}

		return buildCollectiblesForLevel(activeLevel);
	}, [activeLevel]);

	const requiredStars = activeLevel?.requiredStars ?? 0;
	const allSubsDone = hasSubStations && activeLevel?.subStations
		? completedSubStations.length >= activeLevel.subStations.length
		: challengeDone;
	const canClearLevel = allSubsDone && stars >= requiredStars;
	const completedCount = completedLevels.length;
	const progressPercent = Math.round((completedCount / levels.length) * 100);

	const critters = useMemo(
		() => [
			{ emoji: '🦋', x: 12, y: 20, delay: '0.1s' },
			{ emoji: '🐞', x: 42, y: 27, delay: '0.5s' },
			{ emoji: '🐢', x: 67, y: 80, delay: '0.2s' },
			{ emoji: '🐤', x: 86, y: 16, delay: '0.65s' },
			{ emoji: '✨', x: 24, y: 83, delay: '0.35s' },
			{ emoji: '🌈', x: 73, y: 51, delay: '0.4s' },
			{ emoji: '🪁', x: 53, y: 7, delay: '0.7s' },
			{ emoji: '🎈', x: 7, y: 66, delay: '0.8s' }
		],
		[]
	);

	const worldScenery = useMemo(
		() => [
			{ id: 'tree-1', icon: '🌳', x: 6, y: 32 },
			{ id: 'tree-2', icon: '🌴', x: 93, y: 76 },
			{ id: 'house', icon: '🏡', x: 87, y: 31 },
			{ id: 'fountain', icon: '⛲', x: 47, y: 55 },
			{ id: 'park', icon: '🎠', x: 30, y: 88 },
			{ id: 'arcade', icon: '🕹️', x: 53, y: 5 }
		],
		[]
	);

	const clouds = useMemo(
		() =>
			Array.from({ length: 12 }, (_, cloudIndex) => (
				<span
					key={cloudIndex}
					className="mini-cloud"
					style={{ left: `${cloudIndex * 10}%`, top: `${5 + ((cloudIndex * 7) % 26)}%` }}
				>
					☁️
				</span>
			)),
		[]
	);

	function speakText(text: string) {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
			return;
		}

		window.speechSynthesis.cancel();
		const utterance = new window.SpeechSynthesisUtterance(text);
		utterance.lang = 'es-CO';
		utterance.rate = 0.93;
		window.speechSynthesis.speak(utterance);
	}

	function stopVoice() {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
			return;
		}

		window.speechSynthesis.cancel();
	}

	function resetPlayState(level: LevelConfig) {
		setPlayer(level.playerStart);
		setStars(0);
		setCollectedItems([]);
		setEnemies(buildEnemiesForLevel(level));
		setEnemyHits(0);
		stationContactRef.current = false;
		setActiveStation(null);
		setActiveSubIndex(-1);
		setCompletedSubStations([]);
		setHackerAlert(false);
		setCorrectAnswers(0);
		setWrongAnswers(0);
		setQuestionIndex(0);
		setSelectedChoice('');
		setVerifiedAnswer(false);
		setChallengeDone(false);
		setLevelCleared(false);
		const subCount = level.subStations?.length ?? 0;
		const stationLabel = subCount > 0
			? `visita ${subCount} tarjetas y responde sus preguntas`
			: `responde todas las preguntas`;
		setLevelMessage(`Nivel ${level.order + 1}: ${stationLabel} y recoge ${level.requiredStars} estrellas.`);
	}

	function startLevel(levelId: StationId) {
		const state = levelState.find((level) => level.id === levelId);
		if (!state || !state.unlocked) {
			return;
		}

		setMode('play');
		setActiveLevelId(levelId);
		resetPlayState(state);
	}

	function closeStation() {
		stopVoice();
		setActiveStation(null);
		setActiveSubIndex(-1);
		stationContactRef.current = true;
		setQuestionIndex(0);
		setSelectedChoice('');
		setVerifiedAnswer(false);
	}

	function openStation(subIndex?: number) {
		if (!activeLevel) {
			return;
		}

		if (subIndex !== undefined) {
			if (completedSubStations.includes(subIndex)) {
				return;
			}
		} else if (challengeDone) {
			return;
		}

		stationContactRef.current = true;
		setActiveStation(activeLevel.id);
		setActiveSubIndex(subIndex ?? -1);
		setSelectedChoice('');
		setVerifiedAnswer(false);
	}

	function validateCurrentQuestion() {
		if (!activeLevel || !activeStationData || !selectedOption) {
			return;
		}

		setVerifiedAnswer(true);

		if (!selectedOption.safe) {
			setWrongAnswers((prev) => prev + 1);
			if (hasSubStations) {
				setTimeout(() => {
					setActiveStation(null);
					setActiveSubIndex(-1);
					setSelectedChoice('');
					setVerifiedAnswer(false);
					setPlayer(activeLevel.playerStart);
					setLevelMessage('Respuesta incorrecta. El acosador te devolvio al inicio. ¡Intentalo de nuevo!');
				}, 1200);
			}
			return;
		}

		setCorrectAnswers((prev) => prev + 1);

		if (hasSubStations && activeSubIndex >= 0) {
			if (!completedSubStations.includes(activeSubIndex)) {
				setCompletedSubStations((prev) => [...prev, activeSubIndex]);
			}
			const remaining = (activeLevel.subStations?.length ?? 0) - completedSubStations.length - 1;
			setActiveStation(null);
			setActiveSubIndex(-1);
			setSelectedChoice('');
			setVerifiedAnswer(false);
			if (remaining > 0) {
				setLevelMessage(`¡Correcto! Faltan ${remaining} tarjeta${remaining > 1 ? 's' : ''} por responder.`);
			} else {
				setLevelMessage(`¡Excelente! Respondiste todas las tarjetas. Recoge ${requiredStars} estrellas para superar el nivel.`);
			}
			return;
		}

		const lastQuestionIndex = activeStationData.challenges.length - 1;
		if (questionIndex < lastQuestionIndex) {
			setQuestionIndex((prev) => prev + 1);
			setSelectedChoice('');
			setVerifiedAnswer(false);
			setLevelMessage(`Muy bien. Continua con la pregunta ${questionIndex + 2} de ${activeStationData.challenges.length}.`);
			return;
		}

		setChallengeDone(true);
		setActiveStation(null);
		setQuestionIndex(0);
		setSelectedChoice('');
		setVerifiedAnswer(false);
		setLevelMessage(`Muy bien. Respondiste todas las preguntas. Ahora recoge ${requiredStars} estrellas para superar el nivel.`);
	}

	function finishLevel() {
		if (!activeLevel || !levelCleared) {
			return;
		}

		const earned = Math.max(50, 100 + activeLevel.order * 30 + correctAnswers * 25 + stars * 10 - wrongAnswers * 15 - enemyHits * 20);
		const nextCompleted = completedLevels.includes(activeLevel.id)
			? completedLevels
			: [...completedLevels, activeLevel.id];
		const nextTotalScore = totalScore + earned;

		if (nextCompleted.length === levels.length) {
			setMode('map');
			setActiveLevelId(null);
			stationContactRef.current = false;
			setActiveStation(null);
			setQuestionIndex(0);
			setSelectedChoice('');
			setVerifiedAnswer(false);
			setChallengeDone(false);
			setLevelCleared(false);
			setLevelMessage(`Sumaste ${earned} puntos en este nivel.`);
			setCycleScore(nextTotalScore);
			setCompletedLevels([]);
			setTotalScore(0);
			persistProgress([], 0);
			return;
		}

		const nextLevel = levels.find((level) => level.order === activeLevel.order + 1) ?? null;

		setCompletedLevels(nextCompleted);
		setTotalScore(nextTotalScore);
		persistProgress(nextCompleted, nextTotalScore);

		if (!nextLevel) {
			setMode('map');
			setActiveLevelId(null);
			stationContactRef.current = false;
			setActiveStation(null);
			setQuestionIndex(0);
			setSelectedChoice('');
			setVerifiedAnswer(false);
			setChallengeDone(false);
			setLevelCleared(false);
			setLevelMessage(`Sumaste ${earned} puntos en este nivel.`);
			return;
		}

		setActiveLevelId(nextLevel.id);
		setMode('play');
		resetPlayState(nextLevel);
		setLevelMessage(
			`Nivel ${nextLevel.order + 1}: sigue con ${stationById[nextLevel.id].title}. Responde todas las preguntas y recoge ${nextLevel.requiredStars} estrellas.`
		);
	}

	function resetCycleSummary() {
		setCycleScore(null);
	}

	function movePlayer(dx: number, dy: number) {
		if (mode !== 'play' || levelCleared || hackerAlert) {
			return;
		}

		setPlayer((prev) => ({
			x: clamp(prev.x + dx, 5, 95),
			y: clamp(prev.y + dy, 8, 92)
		}));
	}

	function moveEnemy(enemy: Enemy, target: Position, speed: number, order: number): Enemy {
		const dx = target.x - enemy.position.x;
		const dy = target.y - enemy.position.y;
		const dist = Math.sqrt(dx * dx + dy * dy) || 1;
		const baseChaseStep = speed + order * 0.05;
		const swayX = Math.sin((enemy.position.y + order * 13) / 9) * 0.14;
		const swayY = Math.cos((enemy.position.x + order * 11) / 10) * 0.14;

		const nextX = enemy.position.x + (dx / dist) * baseChaseStep + swayX;
		const nextY = enemy.position.y + (dy / dist) * baseChaseStep + swayY;

		return {
			...enemy,
			position: {
				x: clamp(nextX, 6, 94),
				y: clamp(nextY, 10, 90)
			}
		};
	}

	useEffect(() => {
		const stored = getStoredProgress();
		setCompletedLevels(stored.completed);
		setTotalScore(stored.totalScore);
	}, []);

	useEffect(() => {
		if (!voiceEnabled || !activeStationData || !activeStation || !activeQuestion) {
			return;
		}

		speakText(`${activeStationData.title}. ${activeStationData.guidance}. ${activeQuestion.prompt}`);
	}, [activeQuestion, activeStation, activeStationData, voiceEnabled]);

	useEffect(() => {
		return () => {
			stopVoice();
		};
	}, []);

	useEffect(() => {
		if (mode !== 'play' || !activeLevel || levelCleared || activeStation || hackerAlert) {
			return;
		}

		const interval = window.setInterval(() => {
			const target = playerRef.current;
			setEnemies((prev) => prev.map((enemy) => moveEnemy(enemy, target, activeLevel.enemySpeed, activeLevel.order)));
		}, 220);

		return () => window.clearInterval(interval);
	}, [activeLevel, activeStation, hackerAlert, levelCleared, mode]);

	useEffect(() => {
		if (mode !== 'play' || !activeLevel || activeStation) {
			return;
		}

		if (activeLevel.subStations && activeLevel.subStations.length > 0) {
			for (let i = 0; i < activeLevel.subStations.length; i += 1) {
				if (completedSubStations.includes(i)) {
					continue;
				}
				const sub = activeLevel.subStations[i];
				const dist = distance(player, sub.position);
				if (dist <= 6.6) {
					if (!stationContactRef.current) {
						openStation(i);
					}
					return;
				}
			}
			if (activeLevel.subStations.every((sub) => distance(player, sub.position) >= 9)) {
				stationContactRef.current = false;
			}
			return;
		}

		if (challengeDone) {
			return;
		}

		const stationDistance = distance(player, activeLevel.stationPosition);
		if (stationDistance <= 6.6) {
			if (!stationContactRef.current) {
				openStation();
			}
			return;
		}

		if (stationDistance >= 9) {
			stationContactRef.current = false;
		}
	}, [activeLevel, activeStation, challengeDone, completedSubStations, mode, player]);

	useEffect(() => {
		if (mode !== 'play' || !activeLevel || levelCleared || hackerAlert) {
			return;
		}

		const touched = enemies.some((enemy) => distance(enemy.position, player) <= 4.4);
		if (!touched) {
			return;
		}

		setEnemyHits((prev) => prev + 1);

		if (activeLevel.catchMessage) {
			setHackerAlert(true);
			setStars(0);
			setCollectedItems([]);
			setCompletedSubStations([]);
			setEnemies(buildEnemiesForLevel(activeLevel));
			setPlayer(activeLevel.playerStart);
			setLevelMessage(activeLevel.catchMessage);
		} else {
			setStars((prev) => Math.max(0, prev - 1));
			setPlayer(activeLevel.playerStart);
			setLevelMessage('Un enemigo te persiguio. Regresas al inicio del nivel y pierdes 1 estrella.');
		}
	}, [activeLevel, enemies, levelCleared, mode, player]);

	useEffect(() => {
		if (mode !== 'play' || !activeLevel || levelCleared) {
			return;
		}

		for (const item of activeCollectibles) {
			if (collectedItems.includes(item.id)) {
				continue;
			}

			if (distance(item, player) <= 6) {
				setCollectedItems((prev) => [...prev, item.id]);
				setStars((prev) => prev + 1);
			}
		}
	}, [activeCollectibles, activeLevel, collectedItems, levelCleared, mode, player]);

	useEffect(() => {
		if (mode !== 'play' || !activeLevel || levelCleared) {
			return;
		}

		if (canClearLevel) {
			setLevelCleared(true);
			setLevelMessage('Nivel superado. Pulsa continuar para ir al siguiente tema.');
		}
	}, [activeLevel, canClearLevel, levelCleared, mode]);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (mode !== 'play') {
				return;
			}

			const key = event.key.toLowerCase();
			if (key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
				event.preventDefault();
			}

			const step = 3.4;
			if (key === 'arrowup' || key === 'w') {
				movePlayer(0, -step);
			}
			if (key === 'arrowdown' || key === 's') {
				movePlayer(0, step);
			}
			if (key === 'arrowleft' || key === 'a') {
				movePlayer(-step, 0);
			}
			if (key === 'arrowright' || key === 'd') {
				movePlayer(step, 0);
			}
		}

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [mode]);

	return (
		<main className="mini-world-shell">
			<section className="mini-world-topbar">
				<AppLogo compact />
				<div className="mini-world-badges">
					<span className="badge">Interfaz 4-8</span>
					<span className="badge">⭐ Nivel: {stars}</span>
					<span className="badge">Niveles {completedCount}/{levels.length}</span>
					<span className="badge">🏆 Puntaje: {totalScore}</span>
					<button
						type="button"
						onClick={() => {
							setVoiceEnabled((prev) => !prev);
							if (voiceEnabled) {
								stopVoice();
							}
						}}
						className="game-button secondary"
					>
						{voiceEnabled ? '🔊 Voz ON' : '🔈 Voz OFF'}
					</button>
					<Link href="/welcome-screen" className="game-button secondary">
						Volver
					</Link>
				</div>
			</section>

			{mode === 'map' ? (
				<section className="mini-level-map-stage">
					<div className="mini-level-map-title">
						<h2>🗺️ Ruta de Aventuras</h2>
						<p>¡Completa cada nivel para desbloquear el siguiente!</p>
					</div>
					<div className="mini-level-map-board">
						<span className="map-deco" style={{ left: '2%', top: '18%', fontSize: '2.2rem', animationDelay: '0s' }}>🌳</span>
						<span className="map-deco" style={{ left: '92%', top: '75%', fontSize: '2rem', animationDelay: '0.5s' }}>🌴</span>
						<span className="map-deco" style={{ left: '50%', top: '72%', fontSize: '1.5rem', animationDelay: '0.2s' }}>🌻</span>
						<span className="map-deco" style={{ left: '88%', top: '6%', fontSize: '2.4rem', animationDelay: '0.7s' }}>🏔️</span>
						<span className="map-deco" style={{ left: '16%', top: '90%', fontSize: '1.5rem', animationDelay: '0.3s' }}>🌸</span>
						<span className="map-deco" style={{ left: '70%', top: '60%', fontSize: '1.4rem', animationDelay: '0.6s' }}>🍄</span>
						<span className="map-deco" style={{ left: '30%', top: '5%', fontSize: '1.8rem', animationDelay: '0.8s' }}>☁️</span>
						<span className="map-deco" style={{ left: '60%', top: '3%', fontSize: '1.6rem', animationDelay: '1s' }}>⛅</span>
						<span className="map-deco" style={{ left: '8%', top: '3%', fontSize: '1.7rem', animationDelay: '0.4s' }}>☁️</span>
						<span className="map-deco" style={{ left: '78%', top: '45%', fontSize: '1.3rem', animationDelay: '0.9s' }}>🦋</span>
						<span className="map-deco" style={{ left: '38%', top: '82%', fontSize: '1.3rem', animationDelay: '0.15s' }}>🌿</span>
						<svg className="mini-level-svg-path" viewBox="0 0 100 100" preserveAspectRatio="none">
							<path
								d="M 8 72 C 14 68, 20 63, 24 58 C 28 53, 34 50, 40 48 C 46 44, 52 38, 58 33 C 64 28, 70 24, 76 20"
								stroke="rgba(255,255,255,0.5)"
								strokeWidth="1.6"
								strokeDasharray="3 2.5"
								fill="none"
								strokeLinecap="round"
							/>
						</svg>
						<div className="mini-level-map-path" />
						{levelState.map((level) => {
							const station = stationById[level.id];
							return (
								<button
									key={level.id}
									type="button"
									onClick={() => startLevel(level.id)}
									disabled={!level.unlocked}
									className={`mini-level-node ${level.unlocked ? 'unlocked' : 'locked'} ${level.done ? 'done' : ''}`}
									style={{ left: `${level.mapPosition.x}%`, top: `${level.mapPosition.y}%` }}
								>
									<span className="mini-level-node-ring" />
									<span className="mini-level-node-number">{level.order + 1}</span>
									<span className="mini-level-node-icon">{station.emoji}</span>
									<span className="mini-level-node-label">{station.title}</span>
								</button>
							);
						})}
					</div>
					<div className="mini-level-map-guide">
						<div className="mini-map-guide-avatar bounce-fast">🧒</div>
						<div className="mini-map-guide-bubble">
							<p>💬 {levelMessage}</p>
						</div>
					</div>
					<div className="mini-level-map-info">
						<div className="mini-level-progress">
							<div className="mini-progress-header">
								<span>⭐ Progreso</span>
								<strong>{progressPercent}%</strong>
							</div>
							<progress value={progressPercent} max={100} aria-label="Progreso del modulo 4-8" />
						</div>
					</div>
				</section>
			) : (
				<section className={`mini-world-scene${activeLevel?.theme ? ` theme-${activeLevel.theme}` : ''}`} aria-label="Juego del nivel 4 a 8 anos">
					{!activeLevel?.theme && clouds}
					{activeLevel?.theme === 'cyber' ? (
						<>
							<span className="theme-deco" style={{ left: '5%', top: '10%', fontSize: '1.8rem', animationDelay: '0s' }}>💻</span>
							<span className="theme-deco" style={{ left: '85%', top: '15%', fontSize: '1.5rem', animationDelay: '0.3s' }}>📡</span>
							<span className="theme-deco" style={{ left: '15%', top: '75%', fontSize: '1.6rem', animationDelay: '0.6s' }}>🔒</span>
							<span className="theme-deco" style={{ left: '90%', top: '70%', fontSize: '1.4rem', animationDelay: '0.9s' }}>⚡</span>
							<span className="theme-deco" style={{ left: '50%', top: '5%', fontSize: '2rem', animationDelay: '0.4s' }}>🛡️</span>
							<span className="theme-deco" style={{ left: '70%', top: '85%', fontSize: '1.3rem', animationDelay: '0.7s' }}>🔐</span>
						</>
					) : activeLevel?.theme === 'fakenews' ? (
						<>
							<span className="theme-deco" style={{ left: '8%', top: '12%', fontSize: '1.8rem', animationDelay: '0s' }}>📰</span>
							<span className="theme-deco" style={{ left: '82%', top: '18%', fontSize: '1.6rem', animationDelay: '0.4s' }}>🔎</span>
							<span className="theme-deco" style={{ left: '20%', top: '80%', fontSize: '1.5rem', animationDelay: '0.7s' }}>📺</span>
							<span className="theme-deco" style={{ left: '88%', top: '72%', fontSize: '1.4rem', animationDelay: '0.2s' }}>📱</span>
							<span className="theme-deco" style={{ left: '45%', top: '6%', fontSize: '2rem', animationDelay: '0.5s' }}>❓</span>
							<span className="theme-deco" style={{ left: '65%', top: '88%', fontSize: '1.3rem', animationDelay: '0.9s' }}>✍️</span>
						</>
					) : activeLevel?.theme === 'identity' ? (
						<>
							<span className="theme-deco" style={{ left: '6%', top: '15%', fontSize: '1.8rem', animationDelay: '0s' }}>🔑</span>
							<span className="theme-deco" style={{ left: '88%', top: '10%', fontSize: '1.6rem', animationDelay: '0.3s' }}>🔒</span>
							<span className="theme-deco" style={{ left: '18%', top: '82%', fontSize: '1.5rem', animationDelay: '0.6s' }}>🪪</span>
							<span className="theme-deco" style={{ left: '85%', top: '75%', fontSize: '1.4rem', animationDelay: '0.8s' }}>🛡️</span>
							<span className="theme-deco" style={{ left: '50%', top: '4%', fontSize: '2rem', animationDelay: '0.4s' }}>🔐</span>
							<span className="theme-deco" style={{ left: '72%', top: '85%', fontSize: '1.3rem', animationDelay: '1s' }}>🧩</span>
						</>
					) : activeLevel?.theme === 'grooming' ? (
						<>
							<span className="theme-deco" style={{ left: '7%', top: '10%', fontSize: '1.8rem', animationDelay: '0s' }}>🚨</span>
							<span className="theme-deco" style={{ left: '86%', top: '12%', fontSize: '1.6rem', animationDelay: '0.3s' }}>⚠️</span>
							<span className="theme-deco" style={{ left: '15%', top: '78%', fontSize: '1.5rem', animationDelay: '0.6s' }}>🚫</span>
							<span className="theme-deco" style={{ left: '90%', top: '68%', fontSize: '1.4rem', animationDelay: '0.9s' }}>🆘</span>
							<span className="theme-deco" style={{ left: '48%', top: '5%', fontSize: '2rem', animationDelay: '0.4s' }}>👁️</span>
							<span className="theme-deco" style={{ left: '68%', top: '82%', fontSize: '1.3rem', animationDelay: '0.7s' }}>🔔</span>
						</>
					) : activeLevel?.theme === 'gamer' ? (
						<>
							<span className="theme-deco" style={{ left: '5%', top: '14%', fontSize: '1.8rem', animationDelay: '0s' }}>🎮</span>
							<span className="theme-deco" style={{ left: '84%', top: '10%', fontSize: '1.6rem', animationDelay: '0.3s' }}>🕹️</span>
							<span className="theme-deco" style={{ left: '12%', top: '80%', fontSize: '1.5rem', animationDelay: '0.6s' }}>🏆</span>
							<span className="theme-deco" style={{ left: '88%', top: '76%', fontSize: '1.4rem', animationDelay: '0.9s' }}>⭐</span>
							<span className="theme-deco" style={{ left: '52%', top: '3%', fontSize: '2rem', animationDelay: '0.4s' }}>🎯</span>
							<span className="theme-deco" style={{ left: '70%', top: '88%', fontSize: '1.3rem', animationDelay: '0.7s' }}>💎</span>
						</>
					) : (
						<>
							{worldScenery.map((item) => (
								<span key={item.id} className="mini-world-scenery" style={{ left: `${item.x}%`, top: `${item.y}%` }}>
									{item.icon}
								</span>
							))}
							{critters.map((critter, index) => (
								<span
									key={`${critter.emoji}-${index}`}
									className="mini-world-critter"
									style={{ left: `${critter.x}%`, top: `${critter.y}%`, animationDelay: critter.delay }}
								>
									{critter.emoji}
								</span>
							))}
						</>
					)}

					{activeCollectibles
						.filter((item) => !collectedItems.includes(item.id))
						.map((item) => (
							<span key={item.id} className="mini-world-collectible" style={{ left: `${item.x}%`, top: `${item.y}%` }}>
								⭐
							</span>
						))}

					{enemies.map((enemy) => (
						<span key={enemy.id} className={`mini-world-enemy${activeLevel?.theme ? ' themed-enemy' : ''}`} style={{ left: `${enemy.position.x}%`, top: `${enemy.position.y}%` }}>
							{enemy.emoji}
						</span>
					))}

					{activeLevel && activeStationData && activeLevel.subStations && activeLevel.subStations.length > 0 ? (
						activeLevel.subStations.map((sub, index) => {
							const isDone = completedSubStations.includes(index);
							return (
								<button
									key={`sub-${index}`}
									type="button"
									onClick={() => openStation(index)}
									disabled={isDone}
									className={`mini-world-station sub-station ${isDone ? 'done' : ''}`}
									style={{ left: `${sub.position.x}%`, top: `${sub.position.y}%` }}
								>
									<span className="station-emoji">{isDone ? '✅' : sub.emoji}</span>
									<span className="station-title">{sub.label}</span>
								</button>
							);
						})
					) : activeLevel && activeStationData ? (
						<button
							type="button"
							onClick={() => openStation()}
							disabled={challengeDone}
							className={`mini-world-station ${challengeDone ? 'done' : ''}`}
							style={{ left: `${activeLevel.stationPosition.x}%`, top: `${activeLevel.stationPosition.y}%` }}
						>
							<span className="station-emoji">{activeStationData.emoji}</span>
							<span className="station-title">{activeStationData.title}</span>
						</button>
					) : null}

					<div className="mini-world-player float-soft" style={{ left: `${player.x}%`, top: `${player.y}%` }}>
						🧒
					</div>

					{levelCleared ? (
						<div className="mini-world-complete slide-in">
							<h2>¡Nivel superado!</h2>
							<div className="level-score-summary">
								<p>✅ Respuestas correctas: <strong>{correctAnswers}</strong></p>
								<p>❌ Respuestas incorrectas: <strong>{wrongAnswers}</strong></p>
								<p>💀 Veces atrapado: <strong>{enemyHits}</strong></p>
								<p>⭐ Estrellas: <strong>{stars}</strong></p>
							</div>
							<p className="level-score-total">
								Puntuacion: <strong>{Math.max(50, 100 + (activeLevel?.order ?? 0) * 30 + correctAnswers * 25 + stars * 10 - wrongAnswers * 15 - enemyHits * 20)}</strong> puntos
							</p>
							<div className="mini-complete-actions">
								<button className="game-button primary" onClick={finishLevel}>
									Continuar al siguiente nivel
								</button>
							</div>
						</div>
					) : null}

					{hackerAlert ? (
						<div className="mini-world-complete slide-in hacker-alert-overlay">
							<div className="hacker-alert-icon">🧑‍💻</div>
							<h2>¡Te atrapó un acosador!</h2>
							<p>Un hacker te alcanzó y debes volver a empezar el nivel. ¡Ten más cuidado!</p>
							<div className="mini-complete-actions">
								<button className="game-button primary" onClick={() => setHackerAlert(false)}>
									Volver a intentar
								</button>
							</div>
						</div>
					) : null}
				</section>
			)}

			<section className="mini-world-controls">
				{mode === 'play' ? (
					<>
						<p className="mini-world-help">
							Mueve a Lua con flechas o botones. Al tocar la tarjeta con Lua, la pregunta se abre automaticamente.
						</p>
						<p className="mini-world-tip">
							{activeLevel
								? `Nivel ${activeLevel.order + 1}: junta ${requiredStars} estrellas y responde ${activeStationData?.challenges.length ?? 0} preguntas. Enemigos: ${activeLevel.enemyCount}.`
								: 'Selecciona un nivel desde el mapa.'}
						</p>
						<div className="mini-pad">
							<button className="game-button secondary" onClick={() => movePlayer(0, -4)}>
								⬆️
							</button>
							<button className="game-button secondary" onClick={() => movePlayer(-4, 0)}>
								⬅️
							</button>
							<button className="game-button secondary" onClick={() => movePlayer(4, 0)}>
								➡️
							</button>
							<button className="game-button secondary" onClick={() => movePlayer(0, 4)}>
								⬇️
							</button>
							<button className="game-button secondary" onClick={() => setMode('map')}>
								🗺️ Volver al mapa
							</button>
						</div>
					</>
				) : (
					<>
						<p className="mini-world-help">Toca un nivel desbloqueado para empezar. Cada nivel sube un poco la dificultad.</p>
						<p className="mini-world-tip">Al completar los 5 niveles veras tu puntaje final y el ciclo se reinicia.</p>
					</>
				)}
			</section>

			{activeStationData && activeStation && activeQuestion ? (
				<div className="mini-world-dialog-backdrop" onClick={closeStation}>
					<div
						key={`${activeStationData.id}-${hasSubStations ? activeSubIndex : questionIndex}`}
						className={`mini-world-dialog slide-in ${hasSubStations ? '' : questionPaletteClass}`}
						onClick={(event) => event.stopPropagation()}
					>
						<div className="mini-dialog-head">
							<h3>
								{activeStationData.emoji} {hasSubStations && activeSubIndex >= 0 && activeLevel?.subStations
									? activeLevel.subStations[activeSubIndex].label
									: activeStationData.title}
							</h3>
							<div>
								<button
									type="button"
									onClick={() => speakText(`${activeStationData.description}. ${activeStationData.guidance}. ${activeQuestion.prompt}`)}
									className="game-button secondary"
								>
									🔊 Escuchar texto
								</button>
							</div>
						</div>
						<p>{activeStationData.description}</p>
						<p className="mini-hint">{activeStationData.guidance}</p>

						{hasSubStations ? (
							<p className="mini-hint">
								Tarjeta {activeSubIndex + 1} de {activeLevel?.subStations?.length ?? 0} — Respondidas: {completedSubStations.length}
							</p>
						) : (
							<>
								<p className="mini-hint">Pregunta {questionIndex + 1} de {activeStationData.challenges.length}</p>
								<div className="mini-question-palette-track" aria-label="Paletas de preguntas">
									{activeStationData.challenges.map((_, index) => {
										const paletteClass = `palette-${(index % 3) + 1}`;
										const stateClass = index === questionIndex ? 'active' : index < questionIndex ? 'done' : 'pending';
										return (
											<span key={`${activeStationData.id}-palette-${index}`} className={`mini-question-palette ${paletteClass} ${stateClass}`}>
												Paleta {index + 1}
											</span>
										);
									})}
								</div>
							</>
						)}

						<div className="truth-options">
							<p className="mini-question">{activeQuestion.prompt}</p>
							{activeQuestion.options.map((option) => {
								const isSelected = selectedChoice === option.id;
								let stateClass = isSelected ? 'selected' : '';
								if (verifiedAnswer && isSelected) {
									stateClass = option.safe ? 'correct' : 'incorrect';
								}
								return (
									<button
										key={option.id}
										type="button"
										onClick={() => {
											setSelectedChoice(option.id);
											setVerifiedAnswer(false);
										}}
										className={`option-button ${stateClass}`}
									>
										{option.text}
									</button>
								);
							})}
						</div>

						{verifiedAnswer && selectedOption ? (
							<p className={selectedOption.safe ? 'feedback-ok' : 'feedback-bad'}>
								{selectedOption.safe
									? 'Muy bien. Esa es una accion segura.'
									: hasSubStations
										? '¡Incorrecto! El acosador te devuelve al inicio...'
										: 'Ups. Esa accion no es segura. Intenta de nuevo.'}
							</p>
						) : null}

						<div className="mini-dialog-actions">
							<button type="button" className="game-button secondary" onClick={closeStation}>
								Cerrar
							</button>
							<button
								type="button"
								className="game-button primary"
								onClick={validateCurrentQuestion}
								disabled={!selectedChoice}
							>
								Validar y continuar
							</button>
						</div>
					</div>
				</div>
			) : null}

			{cycleScore !== null ? (
				<div className="mini-world-dialog-backdrop">
					<div className="mini-world-dialog slide-in">
						<h3>🏆 ¡Completaste todos los niveles!</h3>
						<p>Tu puntaje final fue: {cycleScore}</p>
						<p className="mini-hint">La aventura se reinicio. Solo el Nivel 1 queda desbloqueado otra vez.</p>
						<div className="mini-dialog-actions">
							<button type="button" className="game-button primary" onClick={resetCycleSummary}>
								Aceptar
							</button>
						</div>
					</div>
				</div>
			) : null}
		</main>
	);
}
