<script lang="ts">
	import { COMPARISONS } from '$lib/utils/comparisons';
	import {
		pickEarthComparisons,
		sessionsToFill,
		fractionOf,
		formatScientific,
		formatFraction,
		type WaterBody
	} from '$lib/utils/water-bodies';
	import { formatMl } from '$lib/utils/format';

	let { ml }: { ml: number } = $props();

	const earthBodies = $derived(pickEarthComparisons(ml));

	const containerComparisons = $derived.by(() => {
		const results: Array<{ count: number; singular: string; plural: string; emoji: string }> = [];
		for (let i = COMPARISONS.length - 1; i >= 0; i--) {
			const c = COMPARISONS[i];
			const count = ml / c.ml;
			if (count >= 0.5) {
				results.push({
					count,
					singular: c.singular,
					plural: c.plural,
					emoji: c.emoji
				});
			}
			if (results.length >= 3) break;
		}
		return results.reverse();
	});

	const whatItCouldDo = $derived.by(() => {
		const results: Array<{ text: string; emoji: string }> = [];
		const dailyUse = 150000;
		const gardenUse = 5000;
		const coffeeUse = 240;

		const days = ml / dailyUse;
		if (days >= 0.01) {
			results.push({ text: `Supply 1 person for ${days < 1 ? (days * 24).toFixed(1) + ' hours' : days.toFixed(1) + ' days'}`, emoji: '🧑' });
		}

		const gardens = ml / gardenUse;
		if (gardens >= 0.01) {
			results.push({ text: `Water a garden for ${gardens < 1 ? (gardens * 24).toFixed(1) + ' hours' : gardens.toFixed(1) + ' days'}`, emoji: '🌱' });
		}

		const coffees = ml / coffeeUse;
		if (coffees >= 1) {
			results.push({ text: `Make ${Math.floor(coffees)} cups of coffee`, emoji: '☕' });
		}

		const baths = ml / 300;
		if (baths >= 0.5 && results.length < 3) {
			results.push({ text: `Fill ${baths.toFixed(1)} bathtubs`, emoji: '🛁' });
		}

		return results.slice(0, 3);
	});

	const fractionBody = $derived(earthBodies[0]);
	const fraction = $derived(fractionBody ? fractionOf(ml, fractionBody.volumeL) : 0);
</script>

<div class="impact">
	<h2 class="impact-title">Your Impact on Earth</h2>

	<div class="cards">
		<!-- Card 1: Containers Filled -->
		{#if containerComparisons.length > 0}
			<div class="card">
				<div class="card-header">
					<span class="card-emoji">📦</span>
					<h3 class="card-title">Containers Filled</h3>
				</div>
				<div class="card-body">
					<p class="card-subtitle">Your {formatMl(ml)} could fill:</p>
					<div class="comparison-list">
						{#each containerComparisons as c}
							<div class="comparison-item">
								<span class="item-emoji">{c.emoji}</span>
								<span class="item-count">{c.count < 10 ? c.count.toFixed(1) : Math.floor(c.count).toLocaleString()}</span>
								<span class="item-label">{c.count === 1 ? c.singular : c.plural}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Card 2: Sessions to Fill -->
		<div class="card">
			<div class="card-header">
				<span class="card-emoji">🔄</span>
				<h3 class="card-title">Sessions to Fill</h3>
			</div>
			<div class="card-body">
				<p class="card-subtitle">How many sessions like yours to fill:</p>
				<div class="sessions-list">
					{#each earthBodies as body}
						{@const sessions = sessionsToFill(ml, body.volumeL)}
						<div class="session-item">
							<div class="session-header">
								<span class="session-emoji">{body.emoji}</span>
								<span class="session-name">{body.name}</span>
								<span class="session-count">{formatScientific(sessions)}</span>
							</div>
							<div class="session-bar-track">
								<div
									class="session-bar-fill"
									style="width: {Math.min(100, (1 / sessions) * 100 * 1000)}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Card 3: The Fraction -->
		{#if fractionBody}
			<div class="card card-highlight">
				<div class="card-header">
					<span class="card-emoji">{fractionBody.emoji}</span>
					<h3 class="card-title">The Fraction</h3>
				</div>
				<div class="card-body">
					<p class="fraction-text">
						Your <span class="mono">{formatMl(ml)}</span> is
						<span class="mono fraction-value">{formatFraction(fraction)}</span>
						of the {fractionBody.name}
					</p>
					<p class="fraction-context">{fractionBody.description}</p>
					<div class="fraction-bar-track">
						<div
							class="fraction-bar-fill"
							style="width: {Math.max(0.1, Math.min(100, fraction * 100))}%"
						></div>
					</div>
					<p class="fraction-dramatic">
						{#if fraction < 1e-10}
							That's like a single drop in a swimming pool 🫧
						{:else if fraction < 1e-6}
							That's smaller than a grain of sand on a beach 🏖️
						{:else if fraction < 0.001}
							That's barely a whisper in an ocean of data 🌊
						{:else}
							Every drop counts 💧
						{/if}
					</p>
				</div>
			</div>
		{/if}

		<!-- Card 4: What Your Water Could Do -->
		{#if whatItCouldDo.length > 0}
			<div class="card">
				<div class="card-header">
					<span class="card-emoji">✨</span>
					<h3 class="card-title">What Your Water Could Do</h3>
				</div>
				<div class="card-body">
					<div class="could-do-list">
						{#each whatItCouldDo as item}
							<div class="could-do-item">
								<span class="could-emoji">{item.emoji}</span>
								<span class="could-text">{item.text}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.impact {
		padding: 0;
	}

	.impact-title {
		text-align: center;
		font-size: 1.5rem;
		font-weight: 600;
		color: #f8fafc;
		margin: 0 0 32px;
		letter-spacing: -0.02em;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}

	@media (max-width: 768px) {
		.cards {
			grid-template-columns: 1fr;
		}
	}

	.card {
		background: rgba(30, 41, 59, 0.5);
		border: 1px solid rgba(56, 189, 248, 0.1);
		border-radius: 12px;
		padding: 24px;
		transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
	}

	.card:hover {
		border-color: rgba(56, 189, 248, 0.25);
		transform: translateY(-4px);
		box-shadow: 0 8px 32px rgba(56, 189, 248, 0.08);
	}

	.card-highlight {
		border-color: rgba(56, 189, 248, 0.15);
		background: rgba(56, 189, 248, 0.03);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
	}

	.card-emoji {
		font-size: 1.25rem;
	}

	.card-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #f8fafc;
		margin: 0;
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.card-subtitle {
		font-size: 0.8125rem;
		color: #64748b;
		margin: 0;
	}

	.comparison-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.comparison-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
	}

	.item-emoji {
		font-size: 1rem;
		width: 24px;
		text-align: center;
	}

	.item-count {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
		color: #38bdf8;
		min-width: 60px;
	}

	.item-label {
		color: #94a3b8;
	}

	.sessions-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.session-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.session-header {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8125rem;
	}

	.session-emoji {
		font-size: 0.875rem;
	}

	.session-name {
		color: #94a3b8;
		flex: 1;
	}

	.session-count {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
		color: #38bdf8;
	}

	.session-bar-track {
		height: 3px;
		background: rgba(56, 189, 248, 0.08);
		border-radius: 2px;
		overflow: hidden;
	}

	.session-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #38bdf8, #0ea5e9);
		border-radius: 2px;
		min-width: 2px;
	}

	.fraction-text {
		font-size: 0.9375rem;
		color: #f8fafc;
		margin: 0;
		line-height: 1.5;
	}

	.fraction-value {
		color: #38bdf8;
		font-weight: 600;
		font-size: 1.125rem;
	}

	.fraction-context {
		font-size: 0.75rem;
		color: #475569;
		margin: 0;
		font-style: italic;
	}

	.fraction-bar-track {
		height: 6px;
		background: rgba(56, 189, 248, 0.08);
		border-radius: 3px;
		overflow: hidden;
	}

	.fraction-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #38bdf8, #0ea5e9);
		border-radius: 3px;
		transition: width 0.8s ease-out;
	}

	.fraction-dramatic {
		font-size: 0.8125rem;
		color: #64748b;
		margin: 0;
		text-align: center;
		font-style: italic;
	}

	.could-do-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.could-do-item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.875rem;
	}

	.could-emoji {
		font-size: 1rem;
		width: 24px;
		text-align: center;
	}

	.could-text {
		color: #94a3b8;
	}

	.mono {
		font-family: 'JetBrains Mono', monospace;
	}
</style>
