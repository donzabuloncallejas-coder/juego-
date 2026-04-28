type PuzzleWrapperProps = {
	title: string;
	subtitle: string;
	progress: number;
	lawHint: string;
	theme?: 'cyberbullying' | 'fakenews' | 'suplantacion' | 'grooming';
	children: React.ReactNode;
};

export default function PuzzleWrapper({ title, subtitle, progress, lawHint, theme, children }: PuzzleWrapperProps) {
	return (
		<section className={`glass-card slide-in puzzle-wrapper${theme ? ` theme-${theme}` : ''}`}>
			<header>
				<h2 style={{ margin: 0 }}>{title}</h2>
				<p style={{ marginTop: '0.4rem', marginBottom: '0.55rem' }}>{subtitle}</p>

				<div
					aria-label="progreso"
					style={{
						width: '100%',
						height: 14,
						borderRadius: 999,
						background: '#dcfce7',
						overflow: 'hidden'
					}}
				>
					<div
						style={{
							width: `${Math.max(0, Math.min(100, progress))}%`,
							height: '100%',
							background: 'linear-gradient(130deg, #facc15, #22c55e)',
							transition: 'width 0.25s ease'
						}}
					/>
				</div>
			</header>

			<p style={{ margin: 0, fontSize: '0.95rem', color: '#3f6212' }}>
				Marco de proteccion: <strong>{lawHint}</strong>
			</p>

			<div>{children}</div>
		</section>
	);
}
