'use client';

import { useState } from 'react';

type AppImageProps = {
	src: string;
	alt: string;
	width: number;
	height: number;
	className?: string;
};

export default function AppImage({ src, alt, width, height, className }: AppImageProps) {
	const [fallback, setFallback] = useState(false);

	return (
		<img
			src={fallback ? '/assets/images/no_image.png' : src}
			alt={alt}
			width={width}
			height={height}
			className={className}
			onError={() => setFallback(true)}
			loading="lazy"
		/>
	);
}
