export interface WaterBody {
	name: string;
	emoji: string;
	volumeL: number;
	description: string;
}

export const WATER_BODIES: WaterBody[] = [
	{ name: 'Olympic Pool', emoji: '🏊', volumeL: 2_500_000, description: 'the standard competition pool' },
	{ name: 'Bathtub', emoji: '🛁', volumeL: 300, description: 'a standard full bath' },
	{ name: 'Lake Victoria', emoji: '🌍', volumeL: 2.42e15, description: "Africa's largest lake" },
	{ name: 'Lake Superior', emoji: '🏔️', volumeL: 12.1e15, description: 'largest freshwater lake by area' },
	{ name: 'Lake Baikal', emoji: '🐻', volumeL: 23.6e15, description: 'deepest lake on Earth' },
	{ name: 'Mediterranean Sea', emoji: '🌊', volumeL: 4.39e18, description: 'the inland sea' },
	{ name: 'Pacific Ocean', emoji: '🌏', volumeL: 660e18, description: 'the big one' },
	{ name: 'All Oceans', emoji: '🌍', volumeL: 1.338e21, description: "Earth's total saltwater" }
];

export function pickEarthComparisons(ml: number): WaterBody[] {
	const sorted = [...WATER_BODIES].sort((a, b) => a.volumeL - b.volumeL);

	const results: WaterBody[] = [];
	for (const body of sorted) {
		if (body.volumeL > ml * 2) {
			results.push(body);
		}
		if (results.length >= 3) break;
	}

	if (results.length < 3) {
		for (const body of sorted) {
			if (!results.includes(body)) {
				results.push(body);
			}
			if (results.length >= 3) break;
		}
	}

	return results;
}

export function sessionsToFill(ml: number, bodyVolumeL: number): number {
	return bodyVolumeL / ml;
}

export function fractionOf(ml: number, bodyVolumeL: number): number {
	return ml / bodyVolumeL;
}

export function formatScientific(n: number): string {
	if (n === 0) return '0';
	if (n >= 1e15) return (n / 1e15).toFixed(2) + ' quadrillion';
	if (n >= 1e12) return (n / 1e12).toFixed(2) + ' trillion';
	if (n >= 1e9) return (n / 1e9).toFixed(2) + ' billion';
	if (n >= 1e6) return (n / 1e6).toFixed(2) + ' million';
	if (n >= 1e3) return (n / 1e3).toFixed(2) + 'k';
	return n.toFixed(2);
}

export function formatFraction(n: number): string {
	if (n >= 0.01) return (n * 100).toFixed(2) + '%';
	if (n >= 1e-6) return (n * 1e6).toFixed(2) + ' millionths';
	if (n >= 1e-9) return (n * 1e9).toFixed(2) + ' billionths';
	if (n >= 1e-12) return (n * 1e12).toFixed(2) + ' trillionths';
	if (n >= 1e-15) return (n * 1e15).toFixed(2) + ' quadrillionths';
	return n.toExponential(2);
}
