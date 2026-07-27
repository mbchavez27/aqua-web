<script lang="ts">
	import { untrack } from 'svelte';
	import { CONTAINERS, pickContainer } from '$lib/utils/containers';
	import { COLORS } from '$lib/utils/colors';
	import { formatMl } from '$lib/utils/format';

	let { ml }: { ml: number } = $props();

	const containerName = $derived(pickContainer(ml));
	const container = $derived(CONTAINERS[containerName]);
	const fraction = $derived(Math.min(1, ml / container.capMl));

	let animatedFraction = $state(0);
	let animatedDisplayMl = $state(0);
	let waterEl: HTMLDivElement;

	// Ripple state
	type Ripple = { id: number; x: number; y: number; time: number };
	let ripples = $state<Ripple[]>([]);
	let nextRippleId = 0;

	// Splash state
	type Splash = {
		id: number;
		x: number;
		y: number;
		particles: Array<{ dx: number; dy: number; size: number; delay: number }>;
		time: number;
	};
	let splashes = $state<Splash[]>([]);
	let nextSplashId = 0;
	let splashIntensity = $state(0);

	// Bubble state
	type Bubble = { id: number; x: number; y: number; size: number; delay: number; time: number };
	let bubbles = $state<Bubble[]>([]);
	let nextBubbleId = 0;

	// Hover state
	let mouseX = $state(0);
	let mouseY = $state(0);
	let isHovering = $state(false);
	let hoverIntensity = $state(0);

	function easeOutCubic(t: number): number {
		return 1 - Math.pow(1 - t, 3);
	}

	$effect(() => {
		const target = fraction;
		const targetMl = ml;
		const duration = 1800;
		const start = performance.now();
		const startVal = untrack(() => animatedFraction);
		const startMl = untrack(() => animatedDisplayMl);

		function tick(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easeOutCubic(progress);
			animatedFraction = startVal + (target - startVal) * eased;
			animatedDisplayMl = startMl + (targetMl - startMl) * eased;
			if (progress < 1) requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	});

	// Decay hover intensity
	$effect(() => {
		if (!isHovering) {
			const interval = setInterval(() => {
				hoverIntensity = Math.max(0, hoverIntensity - 0.05);
			}, 16);
			return () => clearInterval(interval);
		}
	});

	function handleClick(e: MouseEvent) {
		if (!waterEl) return;
		const rect = waterEl.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		// Only splash if clicking in the water area (below the water surface)
		const waterSurfaceY = (1 - animatedFraction) * 100;
		if (y < waterSurfaceY - 5) return;

		// Create splash with particles
		const particleCount = 6 + Math.floor(Math.random() * 4);
		const particles: Splash['particles'] = [];
		for (let i = 0; i < particleCount; i++) {
			const angle = (Math.PI * 0.2) + (Math.random() * Math.PI * 0.6);
			const velocity = 40 + Math.random() * 80;
			particles.push({
				dx: Math.cos(angle) * velocity * (Math.random() > 0.5 ? 1 : -1) * 0.5,
				dy: -Math.abs(Math.sin(angle) * velocity),
				size: 3 + Math.random() * 5,
				delay: Math.random() * 100
			});
		}

		const splash: Splash = { id: nextSplashId++, x, y, particles, time: Date.now() };
		splashes = [...splashes, splash];
		splashIntensity = 1;
		setTimeout(() => {
			splashes = splashes.filter((s) => s.id !== splash.id);
		}, 1200);

		// Add ripple
		const ripple: Ripple = { id: nextRippleId++, x, y, time: Date.now() };
		ripples = [...ripples, ripple];
		setTimeout(() => {
			ripples = ripples.filter((r) => r.id !== ripple.id);
		}, 1500);

		// Add bubbles rising from splash point
		const bubbleCount = 4 + Math.floor(Math.random() * 4);
		for (let i = 0; i < bubbleCount; i++) {
			const bubble: Bubble = {
				id: nextBubbleId++,
				x: x + (Math.random() - 0.5) * 15,
				y: y + Math.random() * 10,
				size: 3 + Math.random() * 7,
				delay: Math.random() * 300,
				time: Date.now()
			};
			bubbles = [...bubbles, bubble];
			setTimeout(() => {
				bubbles = bubbles.filter((b) => b.id !== bubble.id);
			}, 1500 + bubble.delay);
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (!waterEl) return;
		const rect = waterEl.getBoundingClientRect();
		mouseX = ((e.clientX - rect.left) / rect.width) * 100;
		mouseY = ((e.clientY - rect.top) / rect.height) * 100;
		hoverIntensity = Math.min(1, hoverIntensity + 0.1);
	}

	function handleMouseEnter() {
		isHovering = true;
	}

	function handleMouseLeave() {
		isHovering = false;
	}

	const waterHeight = $derived(animatedFraction * 100);
	const displayMl = $derived(animatedDisplayMl);
	const displayPct = $derived((animatedFraction * 100).toFixed(2));

	// Dev validation: displayMl should converge to ml
	$effect(() => {
		if (Math.abs(displayMl - ml) > 0.01 && animatedFraction >= 0.99) {
			console.error(
				'Pool water mismatch:',
				`displayMl=${displayMl.toFixed(2)}, ml=${ml.toFixed(2)}`
			);
		}
	});
	const waveOffset = $derived(isHovering ? (mouseX / 100) * 20 - 10 : 0);

	// Water movement toward cursor
	const waterTiltX = $derived(isHovering ? ((mouseX - 50) / 50) * 3 : 0);
	const waterTiltY = $derived(isHovering ? ((mouseY - 50) / 50) * -1.5 : 0);
	const waterPushX = $derived(isHovering ? ((mouseX - 50) / 50) * 8 : 0);
	const waterPushY = $derived(isHovering ? ((mouseY - 50) / 50) * -4 : 0);

	const containerShape = $derived(container.shape);

	// Generate caustic-like light patterns
	const caustics = $derived.by(() => {
		const points: Array<{ cx: number; cy: number; r: number; opacity: number }> = [];
		const seed = 7;
		let s = seed;
		function rand() {
			s = (s * 16807) % 2147483647;
			return (s - 1) / 2147483646;
		}
		for (let i = 0; i < 8; i++) {
			points.push({
				cx: rand() * 100,
				cy: 60 + rand() * 40,
				r: 5 + rand() * 15,
				opacity: 0.02 + rand() * 0.04
			});
		}
		return points;
	});
</script>

<div class="container-wrapper">
	<div class="container-label">
		<span class="label-text">~ {containerName}</span>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="pool shape-{containerShape}"
		bind:this={waterEl}
		onclick={handleClick}
		onmousemove={handleMouseMove}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		role="presentation"
	>
		<!-- Water body -->
		<div
			class="water-body"
			style="
				height: {waterHeight}%;
				--tilt-x: {waterTiltX}deg;
				--tilt-y: {waterTiltY}deg;
				--push-x: {waterPushX}px;
				--push-y: {waterPushY}px;
			"
		>
			<!-- Shimmer overlay -->
			<div class="shimmer"></div>

			<!-- Shape-specific graphics -->
			{#if containerShape === 'pool'}
				<!-- Tile grid -->
				<svg class="pool-tiles" viewBox="0 0 100 100" preserveAspectRatio="none">
					{#each Array(10) as _, i}
						<line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="rgba(255,255,255,0.04)" stroke-width="0.5" />
						<line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="rgba(255,255,255,0.04)" stroke-width="0.5" />
					{/each}
				</svg>
				<!-- Lane lines -->
				<div class="pool-lanes">
					<div class="lane-line"></div>
					<div class="lane-line"></div>
					<div class="lane-line"></div>
				</div>
				<!-- Pool steps -->
				<div class="pool-steps">
					<div class="step step-1"></div>
					<div class="step step-2"></div>
					<div class="step step-3"></div>
				</div>
			{:else if containerShape === 'bottle'}
				<!-- Bottle neck visual -->
				<div class="bottle-neck"></div>
				<!-- Condensation droplets -->
				<div class="condensation">
					{#each Array(8) as _, i}
						<div class="droplet" style="left: {10 + (i * 12)}%; top: {20 + (i % 3) * 25}%; animation-delay: {i * 0.3}s;"></div>
					{/each}
				</div>
				<!-- Label area -->
				<div class="bottle-label"></div>
			{:else if containerShape === 'bathtub'}
				<!-- Soap bubbles on surface -->
				<div class="soap-bubbles">
					{#each Array(12) as _, i}
						<div class="soap-bubble" style="left: {5 + (i * 8)}%; top: {-5 + (i % 2) * 3}%; width: {8 + (i % 4) * 4}px; height: {8 + (i % 4) * 4}px; animation-delay: {i * 0.2}s;"></div>
					{/each}
				</div>
				<!-- Faucet -->
				<div class="bathtub-faucet">
					<div class="faucet-body"></div>
					<div class="faucet-spout"></div>
					<div class="faucet-water"></div>
				</div>
			{:else if containerShape === 'glass'}
				<!-- Ice cubes -->
				<div class="ice-cubes">
					<div class="ice-cube ice-1"></div>
					<div class="ice-cube ice-2"></div>
				</div>
				<!-- Condensation -->
				<div class="glass-condensation">
					{#each Array(6) as _, i}
						<div class="glass-droplet" style="right: {5 + (i * 15)}%; top: {30 + (i % 3) * 20}%; animation-delay: {i * 0.5}s;"></div>
					{/each}
				</div>
				<!-- Straw -->
				<div class="glass-straw"></div>
			{/if}

			<!-- Caustic light patterns -->
			<svg class="caustics" viewBox="0 0 100 100" preserveAspectRatio="none">
				{#each caustics as c}
					<circle
						cx={c.cx}
						cy={c.cy}
						r={c.r}
						fill="white"
						opacity={c.opacity}
						class="caustic-dot"
					/>
				{/each}
			</svg>

			<!-- Wave surface -->
			<svg class="wave-surface" viewBox="0 0 200 20" preserveAspectRatio="none">
				<defs>
					<linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color={COLORS.waterShine} />
						<stop offset="100%" stop-color={COLORS.waterSurface} />
					</linearGradient>
				</defs>
				<path
					class="wave wave-1"
					d="M0,10 C20,4 40,16 60,10 C80,4 100,16 120,10 C140,4 160,16 180,10 C200,4 220,16 240,10 L240,20 L0,20 Z"
					fill="url(#waveGrad)"
					style="transform: translateX({waveOffset}px)"
				/>
				<path
					class="wave wave-2"
					d="M0,12 C25,6 45,18 70,12 C95,6 115,18 140,12 C165,6 185,18 210,12 L240,12 L240,20 L0,20 Z"
					fill={COLORS.waterSurface}
					opacity="0.6"
					style="transform: translateX({-waveOffset * 0.5}px)"
				/>
			</svg>

			<!-- Surface glint -->
			<div
				class="glint"
				style="left: {30 + (isHovering ? mouseX * 0.4 : 0)}%"
			></div>
		</div>

		<!-- Ripples -->
		{#each ripples as ripple (ripple.id)}
			<div
				class="ripple"
				style="left: {ripple.x}%; top: {ripple.y}%"
			>
				<div class="ripple-ring ripple-ring-1"></div>
				<div class="ripple-ring ripple-ring-2"></div>
				<div class="ripple-ring ripple-ring-3"></div>
			</div>
		{/each}

		<!-- Bubbles -->
		{#each bubbles as bubble (bubble.id)}
			<div
				class="bubble-particle"
				style="
					left: {bubble.x}%;
					top: {bubble.y}%;
					width: {bubble.size}px;
					height: {bubble.size}px;
					animation-delay: {bubble.delay}ms;
				"
			></div>
		{/each}

		<!-- Splash droplets -->
		{#each splashes as splash (splash.id)}
			{#each splash.particles as particle, i}
				<div
					class="splash-droplet"
					style="
						left: {splash.x}%;
						top: {splash.y}%;
						width: {particle.size}px;
						height: {particle.size}px;
						--dx: {particle.dx}px;
						--dy: {particle.dy}px;
						animation-delay: {particle.delay}ms;
					"
				></div>
			{/each}
		{/each}

		<!-- Hover glow -->
		{#if isHovering}
			<div
				class="hover-glow"
				style="left: {mouseX}%; top: {mouseY}%; opacity: {hoverIntensity * 0.3}"
			></div>
		{/if}

		<!-- Center stats -->
		{#if animatedFraction >= 0.01}
			<div class="stats-overlay">
				<span class="stats-ml">{formatMl(displayMl)}</span>
				<span class="stats-pct">{displayPct}% full</span>
			</div>
		{/if}

		<!-- Empty state -->
		{#if animatedFraction < 0.01}
			<div class="empty-label">No water yet</div>
		{/if}
	</div>
</div>

<style>
	.container-wrapper {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 12px;
		width: 100%;
	}

	.container-label {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.label-text {
		color: #64748b;
		font-size: 0.8125rem;
		text-transform: capitalize;
		font-family: 'JetBrains Mono', monospace;
	}

	.pool {
		position: relative;
		width: 100%;
		overflow: hidden;
		transition: border-color 0.3s ease, box-shadow 0.3s ease;
		cursor: pointer;
	}

	.pool:hover {
		box-shadow:
			0 0 40px rgba(56, 189, 248, 0.12),
			inset 0 0 40px rgba(15, 23, 42, 0.15);
	}

	.shape-glass:hover {
		border-color: rgba(148, 163, 184, 0.35);
		box-shadow:
			0 0 24px rgba(148, 163, 184, 0.1),
			inset 0 0 30px rgba(15, 23, 42, 0.1),
			inset 2px 0 8px rgba(148, 163, 184, 0.12),
			inset -2px 0 8px rgba(148, 163, 184, 0.12);
	}

	.shape-bottle:hover {
		border-color: rgba(56, 189, 248, 0.3);
		box-shadow:
			0 0 20px rgba(56, 189, 248, 0.06),
			inset 0 0 30px rgba(15, 23, 42, 0.08),
			inset 2px 0 6px rgba(56, 189, 248, 0.08),
			inset -2px 0 6px rgba(56, 189, 248, 0.08);
	}

	.shape-bathtub:hover {
		border-color: rgba(226, 232, 240, 0.4);
		box-shadow:
			0 0 28px rgba(226, 232, 240, 0.1),
			inset 0 0 40px rgba(15, 23, 42, 0.15),
			0 -2px 12px rgba(226, 232, 240, 0.15),
			inset 0 2px 6px rgba(226, 232, 240, 0.12);
	}

	.shape-pool:hover {
		border-color: rgba(148, 163, 184, 0.3);
		box-shadow:
			0 0 32px rgba(56, 189, 248, 0.1),
			inset 0 0 40px rgba(15, 23, 42, 0.2),
			0 4px 16px rgba(0, 0, 0, 0.4),
			inset 0 2px 4px rgba(148, 163, 184, 0.15);
	}

	/* Glass — tall, narrow, wider at top, clear glass feel */
	.shape-glass {
		width: 40%;
		max-width: 280px;
		height: 420px;
		margin: 0 auto;
		border-radius: 4px 4px 16px 16px;
		border: 2px solid rgba(148, 163, 184, 0.25);
		background: rgba(15, 23, 42, 0.2);
		box-shadow:
			0 0 20px rgba(148, 163, 184, 0.06),
			inset 0 0 30px rgba(15, 23, 42, 0.15),
			inset 2px 0 8px rgba(148, 163, 184, 0.08),
			inset -2px 0 8px rgba(148, 163, 184, 0.08);
	}

	@media (max-width: 640px) {
		.shape-glass {
			width: 50%;
			height: 340px;
		}
	}

	/* Bottle — plastic bottle with cap rim */
	.shape-bottle {
		width: 28%;
		max-width: 200px;
		height: 420px;
		margin: 0 auto;
		border-radius: 6px 6px 20px 20px;
		border: 2px solid rgba(56, 189, 248, 0.15);
		background: rgba(15, 23, 42, 0.18);
		box-shadow:
			0 0 16px rgba(56, 189, 248, 0.03),
			inset 0 0 30px rgba(15, 23, 42, 0.1),
			inset 2px 0 6px rgba(56, 189, 248, 0.05),
			inset -2px 0 6px rgba(56, 189, 248, 0.05);
	}

	.shape-bottle::before {
		content: '';
		position: absolute;
		top: -8px;
		left: 30%;
		right: 30%;
		height: 8px;
		background: linear-gradient(180deg, rgba(56, 189, 248, 0.3), rgba(56, 189, 248, 0.15));
		border-radius: 4px 4px 0 0;
		border: 1px solid rgba(56, 189, 248, 0.2);
		border-bottom: none;
	}

	@media (max-width: 640px) {
		.shape-bottle {
			width: 35%;
			height: 340px;
		}
	}

	/* Bathtub — porcelain white rim, classic tub */
	.shape-bathtub {
		width: 100%;
		height: 280px;
		border-radius: 40px 40px 20px 20px;
		border: 3px solid rgba(226, 232, 240, 0.3);
		background: rgba(15, 23, 42, 0.35);
		box-shadow:
			0 0 24px rgba(226, 232, 240, 0.06),
			inset 0 0 40px rgba(15, 23, 42, 0.2),
			0 -2px 8px rgba(226, 232, 240, 0.1),
			inset 0 2px 6px rgba(226, 232, 240, 0.08);
	}

	@media (max-width: 640px) {
		.shape-bathtub {
			height: 220px;
			border-radius: 32px 32px 16px 16px;
		}
	}

	/* Pool — concrete/tile edge */
	.shape-pool {
		width: 100%;
		height: 480px;
		border-radius: 8px;
		border: 4px solid rgba(148, 163, 184, 0.2);
		background: rgba(15, 23, 42, 0.45);
		box-shadow:
			0 0 24px rgba(56, 189, 248, 0.06),
			inset 0 0 40px rgba(15, 23, 42, 0.25),
			0 4px 12px rgba(0, 0, 0, 0.3),
			inset 0 2px 4px rgba(148, 163, 184, 0.1);
	}

	@media (max-width: 640px) {
		.shape-pool {
			height: 320px;
		}
	}

	/* Pool graphics */
	.pool-tiles {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		opacity: 0.6;
	}

	.pool-lanes {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.lane-line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 3px;
		background: repeating-linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.15) 0px,
			rgba(255, 255, 255, 0.15) 8px,
			transparent 8px,
			transparent 16px
		);
	}

	.lane-line:nth-child(1) { left: 25%; }
	.lane-line:nth-child(2) { left: 50%; }
	.lane-line:nth-child(3) { left: 75%; }

	.pool-steps {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 60px;
		pointer-events: none;
	}

	.step {
		background: rgba(255, 255, 255, 0.08);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.step-1 { width: 60px; height: 12px; }
	.step-2 { width: 48px; height: 12px; margin-left: 6px; }
	.step-3 { width: 36px; height: 12px; margin-left: 12px; }

	/* Bottle graphics */
	.bottle-neck {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 30%;
		height: 15%;
		background: linear-gradient(180deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%);
		border-radius: 0 0 8px 8px;
		pointer-events: none;
	}

	.condensation {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.droplet {
		position: absolute;
		width: 3px;
		height: 6px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
		animation: droplet-drip 3s ease-in infinite;
	}

	@keyframes droplet-drip {
		0%, 100% { opacity: 0.3; transform: translateY(0); }
		50% { opacity: 0.6; transform: translateY(4px); }
	}

	.bottle-label {
		position: absolute;
		left: 10%;
		right: 10%;
		top: 35%;
		height: 20%;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 4px;
		pointer-events: none;
	}

	/* Bathtub graphics */
	.soap-bubbles {
		position: absolute;
		top: -8px;
		left: 0;
		right: 0;
		pointer-events: none;
		z-index: 5;
	}

	.soap-bubble {
		position: absolute;
		background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		animation: bubble-wobble 2s ease-in-out infinite;
	}

	@keyframes bubble-wobble {
		0%, 100% { transform: translateY(0) scale(1); }
		50% { transform: translateY(-3px) scale(1.05); }
	}

	.bathtub-faucet {
		position: absolute;
		top: -20px;
		right: 20%;
		pointer-events: none;
		z-index: 6;
	}

	.faucet-body {
		width: 16px;
		height: 24px;
		background: linear-gradient(180deg, #94a3b8, #64748b);
		border-radius: 4px 4px 0 0;
		margin: 0 auto;
	}

	.faucet-spout {
		width: 8px;
		height: 12px;
		background: #64748b;
		margin: 0 auto;
		border-radius: 0 0 4px 4px;
	}

	.faucet-water {
		width: 2px;
		height: 16px;
		background: linear-gradient(180deg, rgba(56, 189, 248, 0.6), transparent);
		margin: 0 auto;
		animation: faucet-drip 1.5s ease-in-out infinite;
	}

	@keyframes faucet-drip {
		0%, 100% { height: 16px; opacity: 0.6; }
		50% { height: 8px; opacity: 0.3; }
	}

	/* Glass graphics */
	.ice-cubes {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.ice-cube {
		position: absolute;
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 3px;
		animation: ice-float 4s ease-in-out infinite;
	}

	.ice-1 {
		width: 20px;
		height: 18px;
		top: 20%;
		left: 20%;
		transform: rotate(12deg);
	}

	.ice-2 {
		width: 16px;
		height: 14px;
		top: 25%;
		right: 25%;
		transform: rotate(-8deg);
		animation-delay: -2s;
	}

	@keyframes ice-float {
		0%, 100% { transform: translateY(0) rotate(var(--r, 12deg)); }
		50% { transform: translateY(-3px) rotate(calc(var(--r, 12deg) + 5deg)); }
	}

	.glass-condensation {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.glass-droplet {
		position: absolute;
		width: 2px;
		height: 8px;
		background: rgba(255, 255, 255, 0.25);
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
		animation: glass-drip 4s ease-in infinite;
	}

	@keyframes glass-drip {
		0%, 100% { opacity: 0.25; height: 8px; }
		50% { opacity: 0.5; height: 12px; }
	}

	.glass-straw {
		position: absolute;
		top: -20px;
		right: 30%;
		width: 6px;
		height: 80%;
		background: linear-gradient(90deg, #f87171, #ef4444);
		border-radius: 3px;
		transform: rotate(8deg);
		transform-origin: top center;
		pointer-events: none;
	}

	.water-body {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(
			180deg,
			#0c4a6e 0%,
			#075985 30%,
			#0369a1 60%,
			#0284c7 100%
		);
		transition: height 0.05s linear, transform 0.15s ease-out;
		overflow: hidden;
		transform-origin: bottom center;
		transform: perspective(800px) rotateY(var(--tilt-x, 0deg)) rotateX(var(--tilt-y, 0deg)) translate(var(--push-x, 0px), var(--push-y, 0px));
	}

	.shimmer {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			110deg,
			transparent 25%,
			rgba(56, 189, 248, 0.08) 37%,
			transparent 50%
		);
		background-size: 200% 100%;
		animation: shimmer 4s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.caustics {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.caustic-dot {
		animation: caustic-pulse 3s ease-in-out infinite alternate;
	}

	@keyframes caustic-pulse {
		0% { opacity: 0.01; transform: scale(0.8); }
		100% { opacity: 0.06; transform: scale(1.2); }
	}

	.wave-surface {
		position: absolute;
		top: -12px;
		left: -10%;
		width: 120%;
		height: 32px;
		pointer-events: none;
	}

	.wave {
		animation: wave-move 3s ease-in-out infinite;
	}

	.wave-1 {
		animation-delay: 0s;
	}

	.wave-2 {
		animation-delay: -1.5s;
		animation-duration: 4s;
	}

	@keyframes wave-move {
		0%, 100% { transform: translateX(0); }
		50% { transform: translateX(-12px); }
	}

	.glint {
		position: absolute;
		top: 4px;
		width: 100px;
		height: 12px;
		background: radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 70%);
		border-radius: 50%;
		pointer-events: none;
		animation: glint-drift 5s ease-in-out infinite;
		transition: left 0.3s ease;
	}

	@keyframes glint-drift {
		0%, 100% { opacity: 0.6; transform: translateX(0) scaleX(1); }
		50% { opacity: 1; transform: translateX(20px) scaleX(1.3); }
	}

	.ripple {
		position: absolute;
		transform: translate(-50%, -50%);
		pointer-events: none;
		z-index: 10;
	}

	.ripple-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 10px;
		height: 10px;
		border: 1.5px solid rgba(56, 189, 248, 0.6);
		border-radius: 50%;
		animation: ripple-expand 1.2s ease-out forwards;
	}

	.ripple-ring-2 {
		animation-delay: 0.15s;
	}

	.ripple-ring-3 {
		animation-delay: 0.3s;
	}

	@keyframes ripple-expand {
		0% {
			width: 10px;
			height: 10px;
			opacity: 0.8;
		}
		100% {
			width: 160px;
			height: 160px;
			opacity: 0;
		}
	}

	.bubble-particle {
		position: absolute;
		transform: translate(-50%, -50%);
		background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(56, 189, 248, 0.2));
		border: 1px solid rgba(255,255,255,0.2);
		border-radius: 50%;
		pointer-events: none;
		z-index: 10;
		animation: bubble-float 1.5s ease-out forwards;
	}

	@keyframes bubble-float {
		0% {
			opacity: 0.9;
			transform: translate(-50%, -50%) scale(0.3);
		}
		20% {
			opacity: 1;
			transform: translate(-50%, -80%) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -250%) scale(0.5);
		}
	}

	.splash-droplet {
		position: absolute;
		background: radial-gradient(circle at 30% 30%, rgba(125, 211, 252, 0.9), rgba(56, 189, 248, 0.7));
		border-radius: 50%;
		pointer-events: none;
		z-index: 15;
		animation: splash-fly 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
		box-shadow: 0 0 4px rgba(56, 189, 248, 0.5);
	}

	@keyframes splash-fly {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(0.5);
		}
		30% {
			opacity: 1;
			transform: translate(calc(-50% + var(--dx, 0px)), calc(-50% + var(--dy, 0px))) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(calc(-50% + var(--dx, 0px)), calc(-50% + var(--dy, 0px) + 60px)) scale(0.3);
		}
	}

	.hover-glow {
		position: absolute;
		width: 180px;
		height: 180px;
		transform: translate(-50%, -50%);
		background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%);
		border-radius: 50%;
		pointer-events: none;
		transition: left 0.15s ease, top 0.15s ease, opacity 0.3s ease;
		z-index: 5;
	}

	.empty-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #475569;
		font-size: 0.8125rem;
		font-family: 'JetBrains Mono', monospace;
		pointer-events: none;
	}

	.stats-overlay {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		pointer-events: none;
		z-index: 8;
	}

	.stats-ml {
		font-size: 3.5rem;
		font-weight: 700;
		color: #f8fafc;
		font-family: 'Inter', sans-serif;
		letter-spacing: -0.03em;
		text-shadow:
			0 2px 16px rgba(0, 0, 0, 0.5),
			0 0 32px rgba(2, 132, 199, 0.4);
		line-height: 1;
	}

	.stats-pct {
		font-size: 1rem;
		font-weight: 500;
		color: rgba(248, 250, 252, 0.7);
		font-family: 'JetBrains Mono', monospace;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
	}

	@media (max-width: 640px) {
		.stats-ml {
			font-size: 2.25rem;
		}

		.stats-pct {
			font-size: 0.8125rem;
		}
	}
</style>
