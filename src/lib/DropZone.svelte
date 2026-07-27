<script lang="ts">
	import type { AquaExport } from '$lib/types';

	let { onImport }: { onImport: (data: AquaExport) => void } = $props();

	let isDragging = $state(false);
	let errorMsg = $state('');
	let fileInput: HTMLInputElement;

	function validateJson(json: unknown): AquaExport {
		if (typeof json !== 'object' || json === null) throw new Error('Invalid JSON file');
		const obj = json as Record<string, unknown>;
		if (obj.version !== 1 || !('totalMl' in obj)) {
			throw new Error('Unrecognized export format — run `aqua export` first');
		}
		if (!('totalTokens' in obj) || (obj.totalTokens as number) === 0) {
			throw new Error('No token usage found in this export');
		}
		return json as AquaExport;
	}

	function handleFile(file: File) {
		errorMsg = '';
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const json = JSON.parse(reader.result as string);
				onImport(validateJson(json));
			} catch (e) {
				errorMsg = e instanceof Error ? e.message : 'Invalid JSON file';
			}
		};
		reader.readAsText(file);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) handleFile(file);
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function onDragLeave() {
		isDragging = false;
	}

	function onClick() {
		fileInput.click();
	}

	function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) handleFile(file);
		input.value = '';
	}

	function onPaste(e: ClipboardEvent) {
		const text = e.clipboardData?.getData('text');
		if (!text) return;
		try {
			const json = JSON.parse(text);
			onImport(validateJson(json));
		} catch {
			errorMsg = 'Invalid JSON file';
		}
	}
</script>

<svelte:window onpaste={onPaste} />

<div class="dropzone-wrapper">
	<div
		class="dropzone"
		class:dragging={isDragging}
		role="button"
		tabindex="0"
		aria-label="Import aqua export file"
		ondrop={onDrop}
		ondragover={onDragOver}
		ondragleave={onDragLeave}
		onclick={onClick}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') onClick();
		}}
	>
		<div class="drop-icon">
			<svg width="56" height="56" viewBox="0 0 24 24" fill="none">
				<path
					d="M12 2C12 2 5 9 5 14C5 17.866 8.134 21 12 21C15.866 21 19 17.866 19 14C19 9 12 2 12 2Z"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M12 18C10.343 18 9 16.657 9 15C9 13.343 12 10 12 10C12 10 15 13.343 15 15C15 16.657 13.657 18 12 18Z"
					stroke="currentColor"
					stroke-width="1"
					stroke-linecap="round"
					stroke-linejoin="round"
					opacity="0.5"
				/>
			</svg>
		</div>

		<p class="drop-title">Drop your aqua export</p>
		<p class="drop-subtitle">or click to browse</p>

		<div class="drop-hint">
			<kbd>.json</kbd> file from <code>aqua export</code>
		</div>

		<input
			bind:this={fileInput}
			type="file"
			accept=".json"
			class="file-input"
			onchange={onFileChange}
		/>
	</div>

	{#if errorMsg}
		<div class="error-toast" role="alert">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="12" />
				<line x1="12" y1="16" x2="12.01" y2="16" />
			</svg>
			<span>{errorMsg}</span>
		</div>
	{/if}
</div>

<style>
	.dropzone-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 32px;
	}

	.dropzone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 480px;
		aspect-ratio: 4 / 3;
		border: 1px solid rgba(56, 189, 248, 0.15);
		border-radius: 20px;
		padding: 48px 32px;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		text-align: center;
		background: rgba(15, 23, 42, 0.5);
	}

	.dropzone:hover {
		border-color: rgba(56, 189, 248, 0.35);
		background: rgba(15, 23, 42, 0.7);
		transform: translateY(-2px);
		box-shadow: 0 8px 32px rgba(56, 189, 248, 0.08);
	}

	.dropzone.dragging {
		border-color: #38bdf8;
		background: rgba(56, 189, 248, 0.05);
		transform: translateY(-4px) scale(1.01);
		box-shadow: 0 12px 48px rgba(56, 189, 248, 0.12);
	}

	.drop-icon {
		color: #38bdf8;
		margin-bottom: 24px;
		opacity: 0.7;
		transition: opacity 0.3s ease, transform 0.3s ease;
	}

	.dropzone:hover .drop-icon {
		opacity: 1;
		transform: translateY(-4px);
	}

	.drop-title {
		font-size: 1.125rem;
		font-weight: 500;
		color: #f8fafc;
		margin: 0 0 6px;
		letter-spacing: -0.01em;
	}

	.drop-subtitle {
		color: #64748b;
		margin: 0 0 20px;
		font-size: 0.875rem;
	}

	.drop-hint {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #475569;
		font-size: 0.75rem;
	}

	.drop-hint kbd {
		display: inline-block;
		padding: 2px 6px;
		background: rgba(56, 189, 248, 0.08);
		border: 1px solid rgba(56, 189, 248, 0.15);
		border-radius: 4px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6875rem;
		color: #38bdf8;
	}

	.drop-hint code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6875rem;
		color: #64748b;
	}

	.file-input {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	.error-toast {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 20px;
		padding: 10px 16px;
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 8px;
		color: #f87171;
		font-size: 0.8125rem;
		animation: slide-in 0.3s ease-out;
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
