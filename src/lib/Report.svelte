<script lang="ts">
	import type { AquaExport } from '$lib/types';
	import { formatNumber, formatMl } from '$lib/utils/format';
	import { pickContainer, CONTAINERS } from '$lib/utils/containers';
	import ModelTable from './ModelTable.svelte';
	import WaterContainer from './WaterContainer.svelte';
	import Progress from './Progress.svelte';
	import WaterImpact from './WaterImpact.svelte';
	import WaterFacts from './WaterFacts.svelte';
	import ReservoirWidget from './ReservoirWidget.svelte';

	let { data, onReset }: { data: AquaExport; onReset: () => void } = $props();

	const containerName = $derived(pickContainer(data.totalMl));
	const container = $derived(CONTAINERS[containerName]);
	const fraction = $derived(Math.min(1, data.totalMl / container.capMl));

	const sourceLabels = $derived(
		data.sources.length > 0 ? data.sources.map((s) => s.label).join(', ') : 'unknown'
	);

	let displayTokens = $state(0);
	let displayMl = $state(0);

	$effect(() => {
		const targetTokens = data.totalTokens;
		const targetMl = data.totalMl;
		const duration = 1200;
		const start = performance.now();

		function tick(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			displayTokens = Math.round(eased * targetTokens);
			displayMl = Math.round(eased * targetMl);
			if (progress < 1) requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	});

	function handleExport() {
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `aqua-export-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="report">
	<header class="logo-section">
		<h1 class="logo-text">
		<span class="logo-icon">💧</span> Aqua
	</h1>
		<p class="tagline">water footprint estimator, for fun</p>
	</header>

	<div class="summary-row">
		<div class="summary-pill">
			<span class="pill-icon">🔎</span>
			<span class="pill-label">Detected</span>
			<span class="pill-value">{sourceLabels}</span>
		</div>
		<div class="summary-pill accent">
			<span class="pill-icon">💧</span>
			<span class="pill-value">{formatNumber(displayTokens)} tokens</span>
		</div>
	</div>

	<section class="section">
		<ModelTable
			modelBreakdown={data.modelBreakdown}
			totalTokens={data.totalTokens}
			totalMl={data.totalMl}
		/>
	</section>

	<section class="section visualization">
		<Progress {fraction} />
		<WaterContainer ml={data.totalMl} />
	</section>

	<div class="divider"></div>

	<section class="section">
		<WaterImpact ml={data.totalMl} />
	</section>

	<section class="section">
		<div class="two-col">
			<div class="col">
				<WaterFacts />
			</div>
			<div class="col">
				<ReservoirWidget />
			</div>
		</div>
	</section>

	<div class="divider"></div>

	<footer class="footer">
		<div class="history-row">
			<span class="history-label">Lifetime</span>
			<span class="history-value">{formatNumber(data.history.totalTokens)} tokens</span>
			<span class="history-sep">·</span>
			<span class="history-value">{formatMl(data.history.totalMl)}</span>
			<span class="history-sep">·</span>
			<span class="history-value">{data.history.runCount} runs</span>
		</div>
		<div class="actions">
			<button class="btn btn-primary" onclick={handleExport}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				Export Again
			</button>
			<button class="btn btn-ghost" onclick={onReset}>Reset</button>
		</div>
	</footer>
</div>

<style>
	.report {
		max-width: 960px;
		margin: 0 auto;
		padding: 64px 24px;
		display: flex;
		flex-direction: column;
		gap: 48px;
	}

	@media (max-width: 640px) {
		.report {
			padding: 40px 16px;
			gap: 40px;
		}
	}

	.logo-section {
		text-align: center;
		padding: 24px 0;
	}

	.logo-text {
		font-family: 'Inter', sans-serif;
		font-size: 3rem;
		font-weight: 700;
		color: #f8fafc;
		letter-spacing: -0.04em;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 12px;
		justify-content: center;
	}

	.logo-icon {
		font-size: 2.5rem;
	}

	@media (max-width: 480px) {
		.logo-text {
			font-size: 2.25rem;
		}
		.logo-icon {
			font-size: 1.75rem;
		}
	}

	.tagline {
		color: #64748b;
		font-size: 0.9375rem;
		margin: 16px 0 0;
		letter-spacing: 0.02em;
	}

	.summary-row {
		display: flex;
		gap: 12px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.summary-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: rgba(30, 41, 59, 0.5);
		border: 1px solid rgba(56, 189, 248, 0.08);
		border-radius: 99px;
		transition: border-color 0.3s ease;
	}

	.summary-pill:hover {
		border-color: rgba(56, 189, 248, 0.2);
	}

	.summary-pill.accent {
		border-color: rgba(56, 189, 248, 0.2);
		background: rgba(56, 189, 248, 0.05);
	}

	.pill-icon {
		font-size: 0.875rem;
	}

	.pill-label {
		font-size: 0.75rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.pill-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #f8fafc;
		font-family: 'JetBrains Mono', monospace;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.visualization {
		align-items: center;
	}

	.divider {
		height: 1px;
		background: rgba(56, 189, 248, 0.08);
		margin: 0;
	}

	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		align-items: start;
	}

	@media (max-width: 768px) {
		.two-col {
			grid-template-columns: 1fr;
		}
	}

	.footer {
		display: flex;
		flex-direction: column;
		gap: 20px;
		align-items: center;
	}

	.history-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.history-label {
		font-size: 0.75rem;
		color: #475569;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.history-value {
		font-size: 0.8125rem;
		color: #94a3b8;
		font-family: 'JetBrains Mono', monospace;
	}

	.history-sep {
		color: #334155;
	}

	.actions {
		display: flex;
		gap: 12px;
	}

	.btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		border-radius: 8px;
		border: 1px solid transparent;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.8125rem;
	}

	.btn-primary {
		border-color: rgba(56, 189, 248, 0.2);
		background: rgba(56, 189, 248, 0.08);
		color: #38bdf8;
	}

	.btn-primary:hover {
		background: rgba(56, 189, 248, 0.15);
		border-color: rgba(56, 189, 248, 0.3);
	}

	.btn-ghost {
		background: transparent;
		color: #64748b;
	}

	.btn-ghost:hover {
		color: #94a3b8;
		background: rgba(100, 116, 139, 0.08);
	}
</style>
