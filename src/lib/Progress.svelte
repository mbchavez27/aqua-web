<script lang="ts">
	let { fraction }: { fraction: number } = $props();

	const totalCells = 24;
	const filled = $derived(Math.round(fraction * totalCells));
	const empty = $derived(totalCells - filled);
</script>

<div class="progress-container">
	<div class="progress-header">
		<span class="progress-label">Fill level</span>
		<span class="progress-pct">{(fraction * 100).toFixed(2)}%</span>
	</div>
	<div class="bar">
		{#each Array(filled) as _, i}
			<span class="cell filled" style="--i: {i}">━</span>
		{/each}
		{#each Array(empty) as _, i}
			<span class="cell empty" style="--i: {filled + i}">━</span>
		{/each}
	</div>
</div>

<style>
	.progress-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.progress-label {
		font-size: 0.75rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.progress-pct {
		font-weight: 600;
		color: #f8fafc;
		font-size: 0.875rem;
		font-family: 'JetBrains Mono', monospace;
	}

	.bar {
		display: flex;
		gap: 1px;
		font-family: 'JetBrains Mono', monospace;
		overflow: hidden;
		border-radius: 4px;
		background: rgba(15, 23, 42, 0.5);
		padding: 6px 8px;
		border: 1px solid rgba(56, 189, 248, 0.06);
	}

	.cell {
		font-size: 0.75rem;
		line-height: 1;
		flex: 1;
		transition: transform 0.2s ease, text-shadow 0.2s ease;
	}

	.bar:hover .cell.filled {
		animation: cell-pulse 0.4s ease-in-out;
		animation-delay: calc(var(--i, 0) * 0.03s);
	}

	.cell.filled {
		color: #38bdf8;
	}

	.cell.empty {
		color: #1e293b;
	}

	@keyframes cell-pulse {
		0%, 100% { transform: scaleY(1); text-shadow: none; }
		50% { transform: scaleY(1.4); text-shadow: 0 0 8px rgba(56, 189, 248, 0.5); }
	}
</style>
