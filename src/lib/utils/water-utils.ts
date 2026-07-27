import type { ModelRow } from '$lib/types';

/**
 * Calculate water usage for a single model in milliliters.
 *
 * Formula: water_mL = (tokens / 1000) * mlPer1k
 *
 * @param tokens - Total tokens consumed by this model
 * @param mlPer1k - Water coefficient in mL per 1,000 tokens
 * @returns Water usage in milliliters (full precision)
 */
export function computeModelWaterMl(tokens: number, mlPer1k: number): number {
	return (tokens / 1000) * mlPer1k;
}

/**
 * Calculate total water usage across all models in milliliters.
 *
 * This is the SINGLE SOURCE OF TRUTH for the entire application.
 * Every component must derive its water value from this function.
 *
 * Formula: total_mL = Σ (tokens_i / 1000) * mlPer1k_i
 *
 * @param modelBreakdown - Array of model rows with tokens and mlPer1k
 * @returns Total water usage in milliliters (full precision, unrounded)
 */
export function computeTotalWaterMl(modelBreakdown: ModelRow[]): number {
	return modelBreakdown.reduce(
		(sum, row) => sum + computeModelWaterMl(row.tokens, row.mlPer1k),
		0
	);
}

/**
 * Validate that the calculation pipeline is consistent.
 * Call this in development to catch bugs early.
 *
 * @param modelBreakdown - Array of model rows
 * @param totalMlFromSource - The totalMl value from the export (for cross-check)
 */
export function validateWaterPipeline(
	modelBreakdown: ModelRow[],
	totalMlFromSource?: number
): void {
	const computedTotal = computeTotalWaterMl(modelBreakdown);

	// Check: sum of per-model values matches computed total
	const sumOfModels = modelBreakdown.reduce(
		(sum, row) => sum + computeModelWaterMl(row.tokens, row.mlPer1k),
		0
	);

	if (Math.abs(computedTotal - sumOfModels) > 0.01) {
		console.error(
			'ERROR: Water calculation pipeline is inconsistent.',
			`\n  computedTotal: ${computedTotal}`,
			`\n  sumOfModels: ${sumOfModels}`
		);
	}

	// Check: computed total matches export total (if provided)
	if (totalMlFromSource !== undefined) {
		if (Math.abs(computedTotal - totalMlFromSource) > 0.01) {
			console.error(
				'ERROR: Water calculation pipeline is inconsistent.',
				'\n  Computed total from model breakdown does not match export totalMl.',
				`\n  computedTotal: ${computedTotal}`,
				`\n  exportTotalMl: ${totalMlFromSource}`
			);
		}
	}
}
