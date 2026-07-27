export interface Comparison {
	ml: number;
	singular: string;
	plural: string;
	emoji: string;
}

export const COMPARISONS: Comparison[] = [
	{ ml: 5, singular: 'teaspoon of water', plural: 'teaspoons of water', emoji: '🥄' },
	{ ml: 15, singular: 'tablespoon of water', plural: 'tablespoons of water', emoji: '🥄' },
	{ ml: 75, singular: 'shot of espresso', plural: 'shots of espresso', emoji: '☕' },
	{ ml: 240, singular: 'cup of coffee', plural: 'cups of coffee', emoji: '☕' },
	{ ml: 350, singular: 'can of soda', plural: 'cans of soda', emoji: '🥤' },
	{ ml: 500, singular: 'water bottle', plural: 'water bottles', emoji: '🍶' },
	{ ml: 1000, singular: 'large water bottle (1L)', plural: 'large water bottles (1L)', emoji: '🫗' },
	{ ml: 3000, singular: 'bucket of water', plural: 'buckets of water', emoji: '🪣' },
	{ ml: 6000, singular: 'toilet flush', plural: 'toilet flushes', emoji: '🚽' },
	{ ml: 8000, singular: 'garden watering can', plural: 'garden watering cans', emoji: '🌿' },
	{ ml: 15000, singular: 'dishwasher cycle', plural: 'dishwasher cycles', emoji: '🍽️' },
	{ ml: 30000, singular: '10-minute shower', plural: '10-minute showers', emoji: '🚿' },
	{ ml: 50000, singular: 'washing machine load', plural: 'washing machine loads', emoji: '👕' },
	{ ml: 65000, singular: '8-minute shower', plural: '8-minute showers', emoji: '🚿' },
	{ ml: 100000, singular: 'daily water use (1 person)', plural: 'daily water use (1 person)', emoji: '🧑' },
	{ ml: 150000, singular: 'bathtub', plural: 'bathtubs', emoji: '🛁' },
	{ ml: 300000, singular: 'kiddie pool', plural: 'kiddie pools', emoji: '🏊' },
	{ ml: 1000000, singular: 'hot tub', plural: 'hot tubs', emoji: '♨️' },
	{ ml: 5000000, singular: 'small backyard pool', plural: 'small backyard pools', emoji: '🏊' },
	{ ml: 20000000, singular: 'backyard pool', plural: 'backyard pools', emoji: '🏊' },
	{ ml: 100000000, singular: 'water tanker truck load', plural: 'water tanker truck loads', emoji: '🚛' },
	{ ml: 2500000000, singular: 'Olympic swimming pool', plural: 'Olympic swimming pools', emoji: '🏅' }
];

export function pickComparisons(ml: number): string {
	let lowerIdx = -1;
	for (let i = 0; i < COMPARISONS.length; i++) {
		if (COMPARISONS[i].ml <= ml) lowerIdx = i;
	}

	if (lowerIdx === -1) {
		const smallest = COMPARISONS[0];
		const frac = (ml / smallest.ml) * 100;
		return `💧 ≈ ${frac.toFixed(1)}% of a ${smallest.singular} ${smallest.emoji}`;
	}

	const lower = COMPARISONS[lowerIdx];
	const lowerCount = ml / lower.ml;
	const lowerText = `💧 ≈ ${lowerCount.toFixed(lowerCount < 10 ? 2 : 0)} ${lowerCount === 1 ? lower.singular : lower.plural} ${lower.emoji}`;

	const upper = COMPARISONS[lowerIdx + 1];
	if (!upper) return lowerText;

	const upperPct = (ml / upper.ml) * 100;
	const upperText = `≈ ${upperPct < 0.01 ? '<0.01' : upperPct.toFixed(2)}% of a ${upper.singular} ${upper.emoji}`;

	return `${lowerText} · ${upperText}`;
}
