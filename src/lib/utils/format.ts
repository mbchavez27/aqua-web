export function formatNumber(n: number): string {
	return n.toLocaleString('en-US');
}

export function formatMl(ml: number): string {
	if (ml >= 1000000) return (ml / 1000000).toFixed(2) + ' L';
	if (ml >= 1000) return (ml / 1000).toFixed(1) + ' L';
	return ml.toFixed(1) + ' mL';
}

export function formatPct(fraction: number): string {
	return (fraction * 100).toFixed(2) + '%';
}
