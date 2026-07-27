<script lang="ts">
	import { pickComparisons } from '$lib/utils/comparisons';

	let { ml }: { ml: number } = $props();

	let text = $derived(pickComparisons(ml));
</script>

<div class="comparisons-wrapper">
	<p class="comparisons" aria-live="polite">{text}</p>
</div>

<style>
	.comparisons-wrapper {
		padding: 16px 24px;
		background: rgba(30, 41, 59, 0.3);
		border-radius: 10px;
		border: 1px solid rgba(56, 189, 248, 0.06);
	}

	.comparisons {
		font-size: 0.9375rem;
		color: #94a3b8;
		margin: 0;
		text-align: center;
		line-height: 1.6;
		letter-spacing: -0.01em;
	}
</style>
