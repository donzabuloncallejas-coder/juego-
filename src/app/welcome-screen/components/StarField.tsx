export default function StarField() {
	const stars = Array.from({ length: 24 }, (_, index) => {
		const left = `${(index * 37) % 100}%`;
		const top = `${(index * 19) % 100}%`;
		const delay = `${(index % 7) * 0.28}s`;

		return (
			<span
				key={index}
				style={{
					position: 'absolute',
					left,
					top,
					width: index % 3 === 0 ? 8 : 5,
					height: index % 3 === 0 ? 8 : 5,
					borderRadius: '50%',
					background: index % 2 === 0 ? '#facc15' : '#86efac',
					opacity: 0.68,
					animation: `floatSoft 2.8s ease-in-out ${delay} infinite`
				}}
			/>
		);
	});

	return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>{stars}</div>;
}
