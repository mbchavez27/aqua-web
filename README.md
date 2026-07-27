# aqua-web

> Water footprint estimator for AI coding sessions — a web companion to the [`aqua`](https://github.com/mbchavez/aqua) CLI.

Drop in your `aqua export` JSON file and see a visual breakdown of your estimated water consumption across models and sessions. Compare your usage against Earth's water bodies — from bathtubs to the Pacific Ocean.

**[Live Demo →](https://aqua-web.vercel.app)**

## What It Does

aqua-web estimates how much water was consumed to power your AI coding sessions. Water is used to cool data centers that run the models you use every day — and this tool makes that invisible cost visible.

### Features

- **Drag-and-drop import** — drop your `aqua export` JSON, or paste from clipboard
- **Animated water container** — visual fill animation with wave and bubble effects
- **Model breakdown table** — per-model token usage and estimated water cost
- **Real-world comparisons** — "Your session filled 2.3 bathtubs 🛁"
- **Earth impact comparisons** — how many sessions to fill Lake Superior, the Pacific Ocean, etc.
- **Global water facts** — learn about Earth's water and AI's growing footprint
- **Reservoir levels** — live global reservoir data from 11 countries
- **Zero dependencies** — vanilla CSS, no frameworks, no animation libraries

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [aqua CLI](https://github.com/mbchavez/aqua) installed

### Install & Run

```sh
# Clone the repo
git clone https://github.com/mbchavez/aqua-web.git
cd aqua-web

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Export Your Data

```sh
# From the aqua CLI
aqua export
```

This generates a JSON file. Drag it into aqua-web to see your report.

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | [SvelteKit](https://kit.svelte.dev/) (Svelte 5 with runes) |
| Language | TypeScript (strict) |
| Styling | Vanilla CSS |
| Hosting | [Vercel](https://vercel.com) |

**Zero runtime dependencies.** No Tailwind, no component libraries, no animation libraries. Everything is Svelte 5 runes (`$state`, `$derived`, `$effect`) + vanilla CSS.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mbchavez/aqua-web)

Vercel auto-detects SvelteKit. Just click the button or:

```sh
npx vercel
```

## Project Structure

```
src/
├── app.html                         # HTML shell (og tags, fonts)
├── app.css                          # Global styles, reset, typography
├── routes/
│   ├── +layout.svelte               # Root layout (metadata, global CSS)
│   └── +page.svelte                 # Root page (data state management)
└── lib/
    ├── types.ts                     # AquaExport, SourceRow, ModelRow, HistoryData
    ├── DropZone.svelte              # File import UI (drag, click, paste)
    ├── Report.svelte                # Main report layout
    ├── ModelTable.svelte            # Per-model breakdown table
    ├── WaterContainer.svelte        # Animated CSS grid container
    ├── WaterImpact.svelte           # Earth comparison cards
    ├── WaterFacts.svelte            # Global water statistics grid
    ├── ReservoirWidget.svelte       # Live reservoir levels
    ├── Progress.svelte              # Fill progress bar
    ├── Comparisons.svelte           # Real-world comparison text
    └── utils/
        ├── colors.ts                # Color palette constants
        ├── format.ts                # Number formatting helpers
        ├── containers.ts            # Container definitions & selection
        ├── comparisons.ts           # Comparison data & picker
        └── water-bodies.ts          # Earth water body data & comparisons
```

## Data Schema

aqua-web expects a JSON file matching this interface:

```typescript
interface AquaExport {
  version: 1;
  exportedAt: string;        // ISO 8601 timestamp
  mode: "sync" | "auto";
  totalTokens: number;       // total tokens across all models
  totalMl: number;           // estimated water consumed (mL)
  sources: SourceRow[];      // which CLI tools were used
  modelBreakdown: ModelRow[];// per-model token counts + water rates
  history: HistoryData;      // lifetime totals
}

interface SourceRow {
  id: string;                // "opencode" | "claude" | "codex" | "gemini"
  label: string;             // display name
  tokens: number;
  files: number;
}

interface ModelRow {
  model: string;             // e.g. "mimo-v2.5-free"
  tokens: number;
  mlPer1k: number;           // mL per 1,000 tokens
}

interface HistoryData {
  totalTokens: number;
  totalMl: number;
  runCount: number;
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | TypeScript/Svelte type check |

## How Water Estimation Works

AI models consume water indirectly through data center cooling. The `aqua` CLI estimates this based on:

- Token count × model-specific water rate (mL per 1,000 tokens)
- Rates vary by model architecture, training infrastructure, and cooling efficiency

The web app visualizes these estimates with real-world comparisons to make the invisible visible.

## License

MIT
