<script lang="ts">
	const countries = [
		{ name: 'South Africa', fill: 96.3, reservoirs: 218 },
		{ name: 'Portugal', fill: 85.0, reservoirs: 51 },
		{ name: 'Colombia', fill: 80.6, reservoirs: 24 },
		{ name: 'Pakistan', fill: 79.7, reservoirs: 3 },
		{ name: 'Brazil', fill: 75.2, reservoirs: 102 },
		{ name: 'Spain', fill: 73.4, reservoirs: 401 },
		{ name: 'United States', fill: 62.0, reservoirs: 515 },
		{ name: 'Norway', fill: 62.0, reservoirs: 5 },
		{ name: 'Australia', fill: 60.6, reservoirs: 281 },
		{ name: 'Taiwan', fill: 58.3, reservoirs: 22 },
		{ name: 'India', fill: 35.3, reservoirs: 307 }
	];

	const globalAvg = 50.6;
	const totalReservoirs = 1942;
	const countriesTracked = 11;
	const criticallyLow = 145;
	const lastUpdated = 'July 2026';

	let hoveredCountry = $state<string | null>(null);
</script>

<div class="reservoir-widget">
	<div class="widget-header">
		<h3 class="widget-title">Global Reservoir Levels</h3>
		<span class="widget-badge">Live</span>
	</div>

	<div class="global-stats">
		<div class="gauge-wrapper">
			<svg class="gauge" viewBox="0 0 120 70">
				<path
					d="M 10 65 A 50 50 0 0 1 110 65"
					fill="none"
					stroke="rgba(56, 189, 248, 0.15)"
					stroke-width="8"
					stroke-linecap="round"
				/>
				<path
					d="M 10 65 A 50 50 0 0 1 110 65"
					fill="none"
					stroke="#38bdf8"
					stroke-width="8"
					stroke-linecap="round"
					stroke-dasharray="{globalAvg * 1.57} 157"
					class="gauge-fill"
				/>
			</svg>
			<div class="gauge-label">
				<span class="gauge-value">{globalAvg}%</span>
				<span class="gauge-subtitle">global average fill</span>
			</div>
		</div>

		<div class="stat-pills">
			<div class="pill">
				<span class="pill-value">{totalReservoirs.toLocaleString()}</span>
				<span class="pill-label">reservoirs</span>
			</div>
			<div class="pill">
				<span class="pill-value">{countriesTracked}</span>
				<span class="pill-label">countries</span>
			</div>
			<div class="pill pill-warn">
				<span class="pill-value">{criticallyLow}</span>
				<span class="pill-label">critically low</span>
			</div>
		</div>
	</div>

	<div class="country-bars">
		{#each countries as country}
			<div
				class="bar-row"
				class:hovered={hoveredCountry === country.name}
				onmouseenter={() => (hoveredCountry = country.name)}
				onmouseleave={() => (hoveredCountry = null)}
				role="presentation"
			>
				<div class="bar-info">
					<span class="bar-name">{country.name}</span>
					<span class="bar-value">{country.fill}%</span>
				</div>
				<div class="bar-track">
					<div
						class="bar-fill"
						class:critical={country.fill < 40}
						class:low={country.fill >= 40 && country.fill < 60}
						class:mid={country.fill >= 60 && country.fill < 75}
						class:high={country.fill >= 75}
						style="width: {country.fill}%"
					></div>
				</div>
			</div>
		{/each}
	</div>

	<p class="widget-footer">
		Source: reservoirs.earth · Updated {lastUpdated}
	</p>
</div>

<style>
	.reservoir-widget {
		background: rgba(30, 41, 59, 0.5);
		border: 1px solid rgba(56, 189, 248, 0.1);
		border-radius: 16px;
		padding: 32px;
		transition: border-color 0.3s ease;
	}

	.reservoir-widget:hover {
		border-color: rgba(56, 189, 248, 0.2);
	}

	.widget-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 24px;
	}

	.widget-title {
		font-size: 1rem;
		font-weight: 600;
		color: #f8fafc;
		margin: 0;
	}

	.widget-badge {
		font-size: 0.6875rem;
		font-weight: 600;
		color: #22c55e;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.2);
		padding: 2px 8px;
		border-radius: 99px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.global-stats {
		display: flex;
		align-items: center;
		gap: 32px;
		margin-bottom: 28px;
		padding-bottom: 24px;
		border-bottom: 1px solid rgba(56, 189, 248, 0.1);
	}

	@media (max-width: 480px) {
		.global-stats {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	.gauge-wrapper {
		position: relative;
		width: 120px;
		height: 70px;
		flex-shrink: 0;
	}

	.gauge {
		width: 100%;
		height: 100%;
	}

	.gauge-fill {
		animation: gauge-draw 1.5s ease-out forwards;
	}

	@keyframes gauge-draw {
		from {
			stroke-dasharray: 0 157;
		}
	}

	.gauge-label {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		text-align: center;
	}

	.gauge-value {
		display: block;
		font-size: 1.25rem;
		font-weight: 700;
		color: #38bdf8;
		font-family: 'JetBrains Mono', monospace;
	}

	.gauge-subtitle {
		font-size: 0.625rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-pills {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.pill {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 8px 14px;
		background: rgba(15, 23, 42, 0.5);
		border-radius: 8px;
		border: 1px solid rgba(56, 189, 248, 0.08);
	}

	.pill-warn {
		border-color: rgba(245, 158, 11, 0.2);
	}

	.pill-warn .pill-value {
		color: #f59e0b;
	}

	.pill-value {
		font-size: 1rem;
		font-weight: 700;
		color: #f8fafc;
		font-family: 'JetBrains Mono', monospace;
	}

	.pill-label {
		font-size: 0.625rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.country-bars {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.bar-row {
		padding: 6px 10px;
		border-radius: 6px;
		transition: background 0.2s ease;
		cursor: default;
	}

	.bar-row.hovered {
		background: rgba(56, 189, 248, 0.05);
	}

	.bar-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}

	.bar-name {
		font-size: 0.75rem;
		color: #94a3b8;
	}

	.bar-value {
		font-size: 0.75rem;
		font-weight: 600;
		color: #f8fafc;
		font-family: 'JetBrains Mono', monospace;
	}

	.bar-track {
		height: 4px;
		background: rgba(56, 189, 248, 0.08);
		border-radius: 2px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.8s ease-out;
	}

	.bar-fill.high {
		background: #22c55e;
	}

	.bar-fill.mid {
		background: #38bdf8;
	}

	.bar-fill.low {
		background: #f59e0b;
	}

	.bar-fill.critical {
		background: #ef4444;
	}

	.widget-footer {
		margin: 20px 0 0;
		font-size: 0.6875rem;
		color: #475569;
		text-align: center;
	}
</style>
