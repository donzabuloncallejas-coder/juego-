'use client';

import { useMemo, useState } from 'react';

type TruthOption = {
	id: string;
	text: string;
	isCorrect: boolean;
	reason: string;
};

type TruthChallengeProps = {
	title: string;
	prompt: string;
	options: [TruthOption, TruthOption, TruthOption];
	onSelectionChange: (resolved: boolean | null) => void;
	revealResult?: boolean;
};

export default function TruthChallenge({
	title,
	prompt,
	options,
	onSelectionChange,
	revealResult = false
}: TruthChallengeProps) {
	const [selectedId, setSelectedId] = useState<string>('');

	const selected = useMemo(() => options.find((option) => option.id === selectedId), [options, selectedId]);
	const isCorrect = Boolean(selected?.isCorrect);

	function selectOption(optionId: string) {
		setSelectedId(optionId);
		const picked = options.find((option) => option.id === optionId);
		onSelectionChange(picked ? Boolean(picked.isCorrect) : null);
	}

	return (
		<div className="truth-question pulse-card">
			<h3 style={{ marginTop: 0, marginBottom: '0.45rem' }}>{title}</h3>
			<p style={{ marginTop: 0 }}>{prompt}</p>
			<div className="truth-options">
				{options.map((option) => {
					const isSelected = selectedId === option.id;
					let stateClass = isSelected ? 'selected' : '';
					if (revealResult && isSelected) {
						stateClass = option.isCorrect ? 'correct' : 'incorrect';
					}
					return (
						<button
							key={option.id}
							type="button"
							onClick={() => selectOption(option.id)}
							className={`option-button ${stateClass}`}
						>
							{option.text}
						</button>
					);
				})}
			</div>
			{selected && revealResult ? (
				<p className={isCorrect ? 'feedback-ok' : 'feedback-bad'} style={{ marginBottom: 0 }}>
					{selected.reason}
				</p>
			) : null}
		</div>
	);
}
