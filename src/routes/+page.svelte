<script lang="ts">
	import type { AquaExport } from '$lib/types';
	import DropZone from '$lib/DropZone.svelte';
	import Report from '$lib/Report.svelte';

	let data = $state<AquaExport | null>(null);
</script>

{#if data}
	<Report {data} onReset={() => (data = null)} />
{:else}
	<DropZone onImport={(json) => (data = json)} />
{/if}
