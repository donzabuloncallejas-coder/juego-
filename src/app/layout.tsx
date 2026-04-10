import type { Metadata } from 'next';
import '@/styles/index.css';

export const metadata: Metadata = {
	title: 'Cuidemonos en Internet',
	description:
		'Escape room educativo de seguridad digital para ninas, ninos y adolescentes de Risaralda.'
};

type RootLayoutProps = {
	children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="es">
			<body>{children}</body>
		</html>
	);
}
