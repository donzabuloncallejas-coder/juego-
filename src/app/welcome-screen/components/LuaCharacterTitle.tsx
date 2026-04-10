export default function LuaCharacterTitle() {
	return (
		<div className="slide-in" style={{ display: 'grid', gap: '0.8rem', alignItems: 'center' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
				<div
					className="float-soft"
					style={{
						width: 66,
						height: 66,
						borderRadius: '50%',
						background: 'linear-gradient(140deg, #facc15, #86efac)',
						display: 'grid',
						placeItems: 'center',
						fontSize: '2rem',
						boxShadow: '0 10px 22px rgba(20, 51, 34, 0.2)'
					}}
				>
					🧒
				</div>
				<div>
					<p style={{ margin: 0, fontWeight: 800, color: '#3f6212' }}>Guia Heroe</p>
					<h2 style={{ margin: 0, fontSize: '1.55rem' }}>Lua te acompana en cada sala</h2>
				</div>
			</div>

			<p style={{ margin: 0, fontSize: '1rem' }}>
				Usa tu ingenio, protege tus datos y convierte internet en un lugar seguro para todos.
			</p>
		</div>
	);
}
