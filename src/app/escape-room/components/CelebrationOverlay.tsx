export default function CelebrationOverlay() {
	const pieces = Array.from({ length: 30 }, (_, index) => {
		const left = `${(index * 11) % 100}%`;
		const delay = `${(index % 9) * 0.08}s`;
		return (
			<span
				key={index}
				style={{
					position: 'absolute',
					left,
					top: '-10px',
					width: index % 2 === 0 ? 10 : 6,
					height: index % 2 === 0 ? 10 : 6,
					borderRadius: '50%',
					background: index % 3 === 0 ? '#facc15' : '#22c55e',
					opacity: 0.8,
					animation: `fall 1.3s linear ${delay} forwards`
				}}
			/>
		);
	});

	return (
		<div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 80 }}>
			<style>
				{`@keyframes fall {from {transform: translateY(0);} to {transform: translateY(100vh) rotate(720deg);}}`}
			</style>
			{pieces}
		</div>
	);
}
