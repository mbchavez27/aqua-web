<script lang="ts">
	import { CONTAINERS, pickContainer } from '$lib/utils/containers';
	import { COLORS } from '$lib/utils/colors';

	let { ml }: { ml: number } = $props();

	const containerName = $derived(pickContainer(ml));
	const container = $derived(CONTAINERS[containerName]);
	const fraction = $derived(Math.min(1, ml / container.capMl));

	let animatedFraction = $state(0);

	function easeOutCubic(t: number): number {
		return 1 - Math.pow(1 - t, 3);
	}

	$effect(() => {
		const target = fraction;
		const duration = 1800;
		const start = performance.now();
		const startVal = animatedFraction;

		function tick(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			animatedFraction = startVal + (target - startVal) * easeOutCubic(progress);
			if (progress < 1) requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	});

	const totalCells = $derived(container.innerWidth * container.innerHeight);
	const filledCells = $derived(Math.round(animatedFraction * totalCells));

	const cells = $derived.by(() => {
		const rows: Array<Array<{ color: string; isSurface: boolean; col: number }>> = [];
		const filledRowsCount = Math.ceil(filledCells / container.innerWidth);
		const topFilledRow = container.innerHeight - filledRowsCount;

		for (let row = 0; row < container.innerHeight; row++) {
			const rowData: Array<{ color: string; isSurface: boolean; col: number }> = [];
			for (let col = 0; col < container.innerWidth; col++) {
				const idx = row * container.innerWidth + col;
				const isFilled = idx < filledCells;

				if (!isFilled) {
					rowData.push({ color: COLORS.empty, isSurface: false, col });
					continue;
				}

				const depthFromTop = row - topFilledRow;
				const totalFilled = filledRowsCount;
				const depthRatio = totalFilled > 1 ? depthFromTop / (totalFilled - 1) : 0;

				let color: string;
				if (depthRatio > 0.6) {
					color = COLORS.waterDeep;
				} else if (depthRatio > 0.3) {
					color = COLORS.waterMid;
				} else {
					color = COLORS.waterSurface;
				}

				const isSurface = row === topFilledRow;
				if (isSurface) color = COLORS.waterShine;

				rowData.push({ color, isSurface, col });
			}
			rows.push(rowData);
		}
		return rows;
	});

	const bubblePositions = $derived.by(() => {
		const positions = new Set<number>();
		const seed = 42;
		let s = seed;
		function mulberry32(): number {
			s = (s + 0x6d2b79f5) | 0;
			let t = Math.imul(s ^ (s >>> 15), 1 | s);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		}

		const bubbleCount = 4 + Math.floor(mulberry32() * 5);
		const maxIdx = Math.min(filledCells, totalCells);
		for (let i = 0; i < bubbleCount && positions.size < bubbleCount; i++) {
			const idx = Math.floor(mulberry32() * maxIdx);
			if (idx < filledCells) positions.add(idx);
		}
		return positions;
	});
</script>

<div class="container-wrapper">
	<div class="container-label">
		<span class="label-text">~ {containerName}</span>
	</div>
	<div
		class="container-grid"
		style="grid-template-columns: repeat({container.innerWidth}, 1fr); grid-template-rows: repeat({container.innerHeight}, 1fr);"
	>
		{#each cells as row, rowIdx}
			{#each row as cell, colIdx}
				{@const cellIdx = rowIdx * container.innerWidth + colIdx}
				{@const isBubble = bubblePositions.has(cellIdx)}
				<div
					class="cell"
					class:surface={cell.isSurface}
					class:bubble={isBubble}
					style="--col: {colIdx}; --seed: {cellIdx}; background-color: {cell.color};"
				></div>
			{/each}
		{/each}
	</div>
</div>

<style>
	.container-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.container-label {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.label-text {
		color: #64748b;
		font-size: 0.8125rem;
		text-transform: capitalize;
		font-family: 'JetBrains Mono', monospace;
	}

	.container-grid {
		display: grid;
		gap: 2px;
		border: 1px solid rgba(56, 189, 248, 0.15);
		border-radius: 8px;
		padding: 3px;
		width: 100%;
		max-width: 480px;
		background: rgba(15, 23, 42, 0.5);
		box-shadow: 0 0 24px rgba(56, 189, 248, 0.06);
		transition: border-color 0.3s ease, box-shadow 0.3s ease;
	}

	.container-grid:hover {
		border-color: rgba(56, 189, 248, 0.25);
		box-shadow: 0 0 32px rgba(56, 189, 248, 0.1);
	}

	.cell {
		aspect-ratio: 1;
		border-radius: 2px;
		min-width: 8px;
		min-height: 8px;
		transition: background-color 0.3s ease;
	}

	.cell.surface {
		animation: wave 2s ease-in-out infinite;
		animation-delay: calc(var(--col) * 0.06s);
	}

	.cell.bubble {
		animation: bubble-rise 2.5s ease-in-out infinite;
		animation-delay: calc(var(--seed) * 0.35s);
	}

	@keyframes wave {
		0%,
		100% {
			transform: translateX(0) translateY(0);
		}
		25% {
			transform: translateX(-1.5px) translateY(-0.5px);
		}
		75% {
			transform: translateX(1.5px) translateY(0.5px);
		}
	}

	@keyframes bubble-rise {
		0% {
			transform: translateY(0) scale(1);
			opacity: 0.6;
		}
		50% {
			transform: translateY(-6px) scale(1.15);
			opacity: 0.9;
		}
		100% {
			transform: translateY(-14px) scale(0.85);
			opacity: 0;
		}
	}

	@media (min-width: 1024px) {
		.cell {
			min-width: 12px;
			min-height: 12px;
		}
	}
</style>
