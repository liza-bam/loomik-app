# Loomik

AI-assisted sales alignment platform. A dashboard for sales teams to track deals, spot risk signals, and get suggested next actions.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Zustand for client state
- React Router

No external services at runtime. All data (deals, stakeholders, signals, activity, assets) comes from local mock modules in `src/data/`. The AI chat and deal-analysis features return scripted responses generated locally.

## Local setup

Requires Node.js 18+ and npm.

```sh
git clone https://github.com/liza-bam/loomik-app.git
cd loomik-app
npm install
npm run dev
```

That's it — no env vars, no API keys.

## Scripts

```sh
npm run dev        # start dev server on http://localhost:8080
npm run build      # production build
npm run build:dev  # development-mode build
npm run preview    # preview the production build locally
npm run lint       # run ESLint
npm run test       # run Vitest once
npm run test:watch # Vitest in watch mode
```

## Project structure

```
src/
  pages/          Routes: Dashboard, DealGPS, ActionHub, Calendar, History, Assets
  components/    UI components — dashboard, deal-gps, calendar, stakeholder, shadcn ui/
  stores/        Zustand stores (deals, signals, actions, activity, assets, ui, search)
  contexts/      React contexts for global popups (stakeholder, event)
  data/          Mock data for demo/simulation
  hooks/         Custom hooks (use-mobile, use-toast, use-ai-chat, use-ai-analysis)
  lib/           Utilities including the simulation engine
```

## Design system

All colours, the font and the corner radius come from semantic design tokens in `src/index.css` (primitives → semantic, light and dark modes), exposed to Tailwind in `tailwind.config.ts`. Shared colour rules live in `src/lib/tone.ts`. See [docs/design-tokens.md](docs/design-tokens.md) for the token list, usage rules and how to add a skin.
