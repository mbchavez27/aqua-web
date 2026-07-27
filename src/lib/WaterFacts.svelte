<script lang="ts">
	import waterFacts from '$lib/water-facts.json';

	const sections = [
		{
			title: 'Earth\'s Water',
			facts: Object.values(waterFacts.globalStats),
			icon: '🌍'
		},
		{
			title: 'Water Stress',
			facts: Object.values(waterFacts.waterStress),
			icon: '⚠️'
		},
		{
			title: 'AI Water Footprint',
			facts: Object.values(waterFacts.aiWaterFootprint),
			icon: '🤖'
		},
		{
			title: 'Your Tokens in Perspective',
			facts: Object.values(waterFacts.perspective),
			icon: '💧'
		}
	];

	let visibleSections = $state(new Set<number>());

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const idx = Number(entry.target.getAttribute('data-index'));
					if (entry.isIntersecting) {
						visibleSections = new Set([...visibleSections, idx]);
					}
				});
			},
			{ threshold: 0.2 }
		);

		const els = document.querySelectorAll('.fact-section');
		els.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	});
</script>

<div class="water-facts">
	<h2 class="section-title">Water on Earth</h2>
	<div class="facts-grid">
		{#each sections as section, i}
			<div
				class="fact-section"
				class:visible={visibleSections.has(i)}
				data-index={i}
			>
				<div class="fact-header">
					<span class="fact-icon">{section.icon}</span>
					<h3 class="fact-title">{section.title}</h3>
				</div>
				<ul class="fact-list">
					{#each section.facts as fact}
						<li>{fact}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</div>

<style>
	.water-facts {
		padding: 48px 0;
	}

	.section-title {
		text-align: center;
		font-size: 1.5rem;
		font-weight: 600;
		color: #f8fafc;
		margin: 0 0 40px;
		letter-spacing: -0.02em;
	}

	.facts-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24px;
	}

	@media (max-width: 640px) {
		.facts-grid {
			grid-template-columns: 1fr;
		}
	}

	.fact-section {
		background: rgba(30, 41, 59, 0.5);
		border: 1px solid rgba(56, 189, 248, 0.1);
		border-radius: 12px;
		padding: 24px;
		opacity: 0;
		transform: translateY(16px);
		transition: opacity 0.6s ease, transform 0.6s ease, border-color 0.3s ease;
	}

	.fact-section.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.fact-section:hover {
		border-color: rgba(56, 189, 248, 0.25);
	}

	.fact-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
	}

	.fact-icon {
		font-size: 1.25rem;
	}

	.fact-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #38bdf8;
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.fact-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.fact-list li {
		color: #94a3b8;
		font-size: 0.8125rem;
		line-height: 1.5;
		padding-left: 16px;
		position: relative;
	}

	.fact-list li::before {
		content: '·';
		position: absolute;
		left: 0;
		color: #38bdf8;
		font-weight: 700;
	}
</style>
