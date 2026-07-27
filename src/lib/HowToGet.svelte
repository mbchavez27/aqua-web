<script lang="ts">
	let expanded = $state(false);

	const tools = [
		{ name: 'opencode', icon: '💻', path: '~/.local/share/opencode/opencode.db' },
		{ name: 'Claude Code', icon: '🤖', path: '~/.claude/projects/**/*.jsonl' },
		{ name: 'Gemini CLI', icon: '🔷', path: '~/.gemini/tmp/*/chats/*.json' },
		{ name: 'Codex CLI', icon: '⚡', path: '~/.codex/sessions/**/*.jsonl' }
	];

	function copyCommand(cmd: string) {
		navigator.clipboard.writeText(cmd);
	}
</script>

<div class="how-to">
	<button class="toggle-btn" onclick={() => (expanded = !expanded)} aria-expanded={expanded}>
		<span class="toggle-icon" class:rotated={expanded}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="6 9 12 15 18 9" />
			</svg>
		</span>
		<span class="toggle-text">Don't have a JSON file yet?</span>
		<span class="toggle-subtext">Get your data from the CLI</span>
	</button>

	{#if expanded}
		<div class="content">
			<div class="step">
				<div class="step-header">
					<span class="step-num">1</span>
					<span class="step-title">Install aqua-cli</span>
				</div>
				<div class="code-block">
					<code>git clone https://github.com/mbchavez27/aqua-cli.git && cd aqua-cli && npm link</code>
					<button class="copy-btn" onclick={() => copyCommand('git clone https://github.com/mbchavez27/aqua-cli.git && cd aqua-cli && npm link')} aria-label="Copy">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
							<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
						</svg>
					</button>
				</div>
			</div>

			<div class="step">
				<div class="step-header">
					<span class="step-num">2</span>
					<span class="step-title">Scan your sessions</span>
				</div>
				<div class="code-block">
					<code>aqua auto</code>
					<button class="copy-btn" onclick={() => copyCommand('aqua auto')} aria-label="Copy">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
							<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
						</svg>
					</button>
				</div>
				<p class="step-note">Or <code>aqua sync</code> for all historical sessions</p>
			</div>

			<div class="step">
				<div class="step-header">
					<span class="step-num">3</span>
					<span class="step-title">Export for this web app</span>
				</div>
				<div class="code-block">
					<code>aqua export -o data.json</code>
					<button class="copy-btn" onclick={() => copyCommand('aqua export -o data.json')} aria-label="Copy">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
							<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
						</svg>
					</button>
				</div>
				<p class="step-note">Then drag <code>data.json</code> into the box above</p>
			</div>

			<div class="tools-section">
				<p class="tools-title">Supported tools</p>
				<div class="tools-grid">
					{#each tools as tool}
						<div class="tool-card">
							<span class="tool-icon">{tool.icon}</span>
							<span class="tool-name">{tool.name}</span>
							<code class="tool-path">{tool.path}</code>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.how-to {
		width: 100%;
		max-width: 480px;
		margin-top: 32px;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 14px 16px;
		background: rgba(30, 41, 59, 0.3);
		border: 1px solid rgba(56, 189, 248, 0.08);
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.toggle-btn:hover {
		background: rgba(30, 41, 59, 0.5);
		border-color: rgba(56, 189, 248, 0.15);
	}

	.toggle-icon {
		color: #64748b;
		transition: transform 0.2s ease;
		display: flex;
		flex-shrink: 0;
	}

	.toggle-icon.rotated {
		transform: rotate(180deg);
	}

	.toggle-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: #94a3b8;
	}

	.toggle-subtext {
		font-size: 0.75rem;
		color: #475569;
		margin-left: auto;
	}

	.content {
		margin-top: 12px;
		padding: 20px;
		background: rgba(30, 41, 59, 0.3);
		border: 1px solid rgba(56, 189, 248, 0.08);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		animation: fade-in 0.2s ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.step {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.step-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.step-num {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		background: rgba(56, 189, 248, 0.1);
		border: 1px solid rgba(56, 189, 248, 0.2);
		border-radius: 6px;
		font-size: 0.6875rem;
		font-weight: 600;
		color: #38bdf8;
		font-family: 'JetBrains Mono', monospace;
		flex-shrink: 0;
	}

	.step-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: #f8fafc;
	}

	.code-block {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(56, 189, 248, 0.06);
		border-radius: 8px;
	}

	.code-block code {
		flex: 1;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: #38bdf8;
		overflow-x: auto;
		white-space: nowrap;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: transparent;
		border: 1px solid rgba(56, 189, 248, 0.1);
		border-radius: 6px;
		cursor: pointer;
		color: #64748b;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.copy-btn:hover {
		background: rgba(56, 189, 248, 0.08);
		color: #38bdf8;
		border-color: rgba(56, 189, 248, 0.2);
	}

	.step-note {
		font-size: 0.75rem;
		color: #475569;
		margin: 0;
		padding-left: 32px;
	}

	.step-note code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6875rem;
		color: #64748b;
		background: rgba(56, 189, 248, 0.06);
		padding: 1px 4px;
		border-radius: 3px;
	}

	.tools-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-top: 16px;
		border-top: 1px solid rgba(56, 189, 248, 0.06);
	}

	.tools-title {
		font-size: 0.75rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	@media (max-width: 400px) {
		.tools-grid {
			grid-template-columns: 1fr;
		}
	}

	.tool-card {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		background: rgba(15, 23, 42, 0.4);
		border: 1px solid rgba(56, 189, 248, 0.04);
		border-radius: 6px;
	}

	.tool-icon {
		font-size: 0.875rem;
	}

	.tool-name {
		font-size: 0.75rem;
		font-weight: 500;
		color: #94a3b8;
	}

	.tool-path {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.5625rem;
		color: #475569;
		margin-left: auto;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 120px;
	}
</style>
