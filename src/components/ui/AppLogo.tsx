import AppIcon from './AppIcon';

type AppLogoProps = {
	compact?: boolean;
};

export default function AppLogo({ compact = false }: AppLogoProps) {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: compact ? '0.5rem' : '0.85rem'
			}}
		>
			<AppIcon size={compact ? 34 : 42} />
			<div>
				<p style={{ margin: 0, fontWeight: 900, lineHeight: 1.1 }}>Cuidemonos en Internet</p>
				{!compact ? (
					<small style={{ color: '#3f6212', fontWeight: 700 }}>Escape Room Seguro</small>
				) : null}
			</div>
		</div>
	);
}
