import AppIcon from './AppIcon';

type AppLogoProps = {
	compact?: boolean;
};

export default function AppLogo({ compact = false }: AppLogoProps) {
	const logoSize = compact ? 54 : 80;

	return (
		<div className="app-logo-wrap" data-compact={compact || undefined}>
			<div className="app-logo-institutional">
				<img
					src="/assets/images/logo_policia.png"
					alt="Gobernacion de Risaralda"
					width={logoSize}
					height={logoSize}
					style={{ objectFit: 'contain' }}
				/>
			</div>
			<div className="app-logo-divider" />
			<AppIcon size={compact ? 30 : 38} />
			<div className="app-logo-text">
				<p style={{ margin: 0, fontWeight: 900, lineHeight: 1.1 }}>Cuidemonos en Internet</p>
				{!compact ? (
					<small className="app-logo-subtitle">Escape Room Seguro</small>
				) : null}
			</div>
		</div>
	);
}
