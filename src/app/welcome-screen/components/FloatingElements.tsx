const emojis = ['🔐', '🧠', '🌟', '🛡️', '📱', '💬', '✨', '🌿'];

export default function FloatingElements() {
	return (
		<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
			{emojis.map((emoji, index) => (
				<span
					key={emoji + index}
					aria-hidden
					style={{
						position: 'absolute',
						left: `${8 + ((index * 12) % 80)}%`,
						top: `${10 + ((index * 17) % 75)}%`,
						fontSize: index % 2 === 0 ? '1.45rem' : '1.2rem',
						opacity: 0.25,
						animation: `floatSoft ${2.7 + (index % 3)}s ease-in-out ${(index % 5) * 0.24}s infinite`
					}}
				>
					{emoji}
				</span>
			))}
		</div>
	);
}
