<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<title>Aqua — Water Footprint Estimator for AI Coding</title>
	<meta name="description" content="Water footprint estimator for AI coding sessions. See how much water your AI models consume and compare it to real-world water bodies." />
	<meta property="og:title" content="Aqua — Water Footprint Estimator for AI Coding" />
	<meta property="og:description" content="See how much water your AI coding sessions consume. Compare your usage from bathtubs to the Pacific Ocean." />
	<meta name="twitter:title" content="Aqua — Water Footprint Estimator for AI Coding" />
	<meta name="twitter:description" content="See how much water your AI coding sessions consume. Compare your usage from bathtubs to the Pacific Ocean." />
</svelte:head>

{@render children()}
