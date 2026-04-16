'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import FloatingElements from './FloatingElements';
import StarField from './StarField';

export default function WelcomeClient() {
	const [showAgePanel, setShowAgePanel] = useState(false);
	const router = useRouter();

	const bgIcons = [
		{ icon: '🛡️', top: '11%', left: '5%', delay: '0s' },
		{ icon: '❤️', top: '12%', left: '17%', delay: '0.2s' },
		{ icon: '⭐', top: '18%', right: '9%', delay: '0.4s' },
		{ icon: '📱', top: '30%', right: '8%', delay: '0.5s' },
		{ icon: '🎮', top: '50%', right: '2%', delay: '0.1s' },
		{ icon: '🔒', top: '74%', left: '7%', delay: '0.6s' },
		{ icon: '🎯', top: '88%', left: '16%', delay: '0.2s' },
		{ icon: '🌈', top: '90%', right: '24%', delay: '0.7s' },
		{ icon: '💻', top: '74%', right: '6%', delay: '0.3s' },
		{ icon: '🦋', top: '39%', left: '2%', delay: '0.25s' }
	] as const;

	function goToExperience(ageGroup: '4-7' | '8-14') {
		window.localStorage.setItem('internet-escape-age-group', ageGroup);
		if (ageGroup === '4-7') {
			router.push('/mini-escape');
			return;
		}

		router.push('/room-selection-map');
	}

	return (
		<main className="game-shell cover-layout">
			<StarField />
			<FloatingElements />
			{bgIcons.map((item, index) => (
				<span
					key={`${item.icon}-${index}`}
					className="bg-spark"
					style={{
						top: item.top,
						left: 'left' in item ? item.left : undefined,
						right: 'right' in item ? item.right : undefined,
						animationDelay: item.delay
					}}
				>
					{item.icon}
				</span>
			))}

			<section className="glass-card slide-in cover-card">
				<header className="cover-header">
					<div className="cover-header-brand">
						<AppLogo />
					</div>
					<div className="flow-steps">
						<span className="step-pill">1. Mira la portada</span>
						<span className="step-pill">2. Elige tu edad</span>
						<span className="step-pill">3. Juega</span>
					</div>
				</header>

				<section className="cover-cta">
					<h1 className="cover-title text-readable">CuidaRed</h1>
					<p className="cover-subtitle text-readable-soft">¡Tu aventura de seguridad en internet!</p>

					<div className="hero-guide">
						<div className="speech-bubble">¡Hola! Soy Lua. ¡Vamos a aprender juntos!</div>
						<div className="hero-character bounce-fast">🧒</div>
					</div>

					<div className="topic-row stagger">
						<span className="topic-chip">🛡️ Ciberacoso</span>
						<span className="topic-chip">📰 Fake News</span>
						<span className="topic-chip">🕵️ Suplantacion</span>
						<span className="topic-chip">🚨 Grooming</span>
					</div>

					<button
						type="button"
						onClick={() => setShowAgePanel((prev) => !prev)}
						className="start-pill"
					>
						🚀 ¡Jugar Ahora!
					</button>
				</section>

				<section className={`age-panel ${showAgePanel ? 'open' : ''}`}>
					<h3 style={{ marginTop: 0, marginBottom: '0.45rem' }}>Elige tu edad antes de empezar</h3>
					<p style={{ marginTop: 0 }}>
						Toca tu modulo y entrara de inmediato a la experiencia indicada.
					</p>
					<div className="age-grid">
						<button
							type="button"
							onClick={() => goToExperience('4-7')}
							className="age-card"
						>
							<strong>4 a 7 anos</strong>
							<p style={{ marginBottom: 0 }}>Visual, tactil, 2D, con misiones cortas y colores vivos.</p>
						</button>
						<button
							type="button"
							onClick={() => goToExperience('8-14')}
							className="age-card"
						>
							<strong>8 a 14 anos</strong>
							<p style={{ marginBottom: 0 }}>Retos dinamicos, preguntas y tablero en tiempo real.</p>
						</button>
					</div>
				</section>

				<div style={{ textAlign: 'center' }}>
					<p className="cover-footer-text" style={{ marginBottom: '0.2rem', fontWeight: 800 }}>
						Secretaria de las TIC · Risaralda, Colombia · 4-16 anos
					</p>
					<p className="cover-footer-text" style={{ marginTop: 0, fontSize: '0.85rem' }}>
						Ley 1620/2013 · Ley 1098/2006 · Ley 1581/2012
					</p>
				</div>
			</section>
		</main>
	);
}
