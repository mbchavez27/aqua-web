<script lang="ts">
	import type { ModelRow } from '$lib/types';
	import { formatNumber, formatMl } from '$lib/utils/format';

	let { modelBreakdown, totalTokens, totalMl }: { modelBreakdown: ModelRow[]; totalTokens: number; totalMl: number } = $props();

	let hoveredRow = $state<string | null>(null);
</script>

<div class="table-wrapper">
	<div class="table">
		<div class="row header">
			<span class="col model">Model</span>
			<span class="col tokens">Tokens</span>
			<span class="col water">Water (est.)</span>
		</div>

		<div class="separator"></div>

		{#each modelBreakdown as row}
			<div
				class="row data-row"
				class:hovered={hoveredRow === row.model}
				onmouseenter={() => (hoveredRow = row.model)}
				onmouseleave={() => (hoveredRow = null)}
				role="presentation"
			>
				<span class="col model">{row.model}</span>
				<span class="col tokens">{formatNumber(row.tokens)}</span>
				<span class="col water">{formatMl(row.mlPer1k * (row.tokens / 1000))}</span>
			</div>
		{/each}

		<div class="separator"></div>

		<div class="row total">
			<span class="col model">Total</span>
			<span class="col tokens">{formatNumber(totalTokens)}</span>
			<span class="col water">{formatMl(totalMl)}</span>
		</div>
	</div>
</div>

<style>
	.table-wrapper {
		width: 100%;
		overflow-x: auto;
	}

	.table {
		background: rgba(30, 41, 59, 0.5);
		border: 1px solid rgba(56, 189, 248, 0.1);
		border-radius: 12px;
		padding: 20px 24px;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		min-width: 400px;
		transition: border-color 0.3s ease;
	}

	.table:hover {
		border-color: rgba(56, 189, 248, 0.2);
	}

	.row {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		transition: background 0.2s ease;
		border-radius: 6px;
	}

	.row.data-row.hovered {
		background: rgba(56, 189, 248, 0.03);
	}

	.row.header {
		font-weight: 600;
		color: #64748b;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.row.total {
		font-weight: 600;
		color: #38bdf8;
	}

	.separator {
		border-top: 1px solid rgba(56, 189, 248, 0.08);
		margin: 2px 0;
	}

	.col.model {
		flex: 2;
		text-align: left;
		color: #f8fafc;
		font-size: 0.875rem;
	}

	.col.tokens {
		flex: 1;
		text-align: right;
		color: #94a3b8;
		font-size: 0.875rem;
	}

	.col.water {
		flex: 1;
		text-align: right;
		color: #38bdf8;
		font-size: 0.875rem;
	}
</style>
