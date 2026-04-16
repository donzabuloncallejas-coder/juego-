type PuzzleWrapperProps = {
	title: string;
	subtitle: string;
	progress: number;
	lawHint: string;
	children: React.ReactNode;
};

export default function PuzzleWrapper({ title, subtitle, progress, lawHint, children }: PuzzleWrapperProps) {
	return (
		<section className="glass-card slide-in" style={{ padding: '1rem', display: 'grid', gap: '0.8rem' }}>
			<header>
				<h2 style={{ margin: 0 }}>{title}</h2>
				<p style={{ marginTop: '0.4rem', marginBottom: '0.55rem' }}>{subtitle}</p>

				<div
					aria-label="progreso"
					className="progress-track"
				>
					<div
						className="progress-fill"
						style={{
							width: `${Math.max(0, Math.min(100, progress))}%`
						}}
					/>
				</div>
			</header>

			<p className="law-hint">
				Marco de proteccion: <strong>{lawHint}</strong>
			</p>

			<div>{children}</div>
		</section>
	);
}
