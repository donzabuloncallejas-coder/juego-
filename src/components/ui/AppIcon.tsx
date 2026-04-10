type AppIconProps = {
	size?: number;
};

export default function AppIcon({ size = 30 }: AppIconProps) {
	return (
		<span
			aria-hidden
			style={{
				display: 'inline-grid',
				placeItems: 'center',
				width: size,
				height: size,
				borderRadius: '50%',
				background: 'linear-gradient(130deg, #facc15, #22c55e)',
				fontSize: size * 0.48,
				boxShadow: '0 6px 14px rgba(20, 51, 34, 0.25)'
			}}
		>
			🛡️
		</span>
	);
}
