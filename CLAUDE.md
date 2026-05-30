# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **pnpm** (v10).

- `pnpm dev` — Vite dev server on port 3000 (host enabled).
- `pnpm build` — Vite client build into `dist/`, then `scripts/esbuild-build.cjs` bundles `server/index.ts` to `dist/index.js` (ESM, Node platform).
- `pnpm start` — Run the production server (`NODE_ENV=production node dist/index.js`). Note: the start script uses POSIX `NODE_ENV=...` syntax; on Windows PowerShell, set `$env:NODE_ENV="production"` first then `node dist/index.js`, or run via Git Bash.
- `pnpm preview` — Vite preview of the built client.
- `pnpm check` — Type-check only (`tsc --noEmit`).
- `pnpm format` — Prettier across the repo.

There is no test runner wired up despite `vitest` being a devDependency — no `test` script and no test files exist.

## Architecture

This is a **client-rendered SPA with a thin Express static-file server**. The server has no API surface — it only serves the built client and falls back to `index.html` for client-side routing.

- **`client/`** — Vite React 19 + TypeScript app (the only meaningful runtime code).
  - `client/index.html` is the Vite entry; `vite.config.ts` sets `root: client/` and outputs to top-level `dist/`.
  - `src/App.tsx` wires `ErrorBoundary → LanguageProvider → ThemeProvider → AppContent`. `AppContent.tsx` is the single page composed of section components (Hero, Map, Portfolio, Experience, Skills, Certifications, About, Contact). Routing uses `wouter` but the app is effectively one page; `pages/NotFound.tsx` exists for unmatched routes.
  - **Bilingual (AR/EN)** via `contexts/LanguageContext.tsx` reading `locales/{ar,en}.json`. RTL/LTR is driven by language selection — when editing UI strings, update both locale files.
  - **Theming** via `contexts/ThemeContext.tsx` (default `"light"`) layered with `next-themes`. Tailwind v4 + `@tailwindcss/vite` plugin; `tailwindcss-animate` and `tw-animate-css` add motion utilities. UI primitives are shadcn-style under `components/ui/` built on Radix.
  - **Project data** lives in `client/src/data/projectsData.ts` — this is the source of truth for the portfolio grid and map markers. Many `.bak*` files in this directory are historical snapshots from migration scripts; ignore them when editing.
  - **Map** uses Google Maps (`@types/google.maps`); `Map.tsx` / `MapSection.tsx` plot project coordinates from `projectsData.ts`.

- **`server/index.ts`** — ~30-line Express server. Serves `dist/public` in production, `../dist/public` in dev. Wildcard route returns `index.html` for SPA routing. Bundled by `scripts/esbuild-build.cjs` into `dist/index.js` (ESM, no externals).

- **`shared/const.ts`** — Cross-cutting constants (aliased as `@shared`).

- **Path aliases** (`vite.config.ts`):
  - `@` → `client/src`
  - `@shared` → `shared`
  - `@assets` → `attached_assets` (directory may not exist in repo)

## Asset & Image Pipeline

The repo root is dense with Python scripts (`*.py`) and a few JS scripts (`compress-images.js`, `validate-images.js`, `scripts/create_map_images.py`) that **were used historically to normalize, rename, renumber, and compress project images** in `client/public/images/`. Their state is captured in the various `*_summary.json`, `*_mapping.json`, and the `*_REPORT.md` / `IMAGE_*.md` files at the repo root.

Important:
- These scripts are **one-shot migration tools**, not part of any build step. Do not run them as routine maintenance — they mutate filenames and `projectsData.ts` based on JSON mapping files.
- When adding new project images, update `client/src/data/projectsData.ts` directly and place files under `client/public/images/`. Do not invent a new renumber pass.
- `client/src/data/projectsData.ts.bak*` are historical backups from those migrations — leave them alone unless the user asks for a cleanup.

## Conventions specific to this repo

- **Single source of truth for content**: textual UI strings live in `locales/{ar,en}.json`; project records live in `data/projectsData.ts`. Keep these aligned (every project surfaced in the UI must exist in both the data file and any locale strings it references).
- **No backend API** — do not add server routes for data; data is bundled into the client at build time.
- **Vite root is `client/`** but the build outputs to the **top-level `dist/`**. The Express server expects `dist/public` for static assets, so any change to Vite's `build.outDir` must be matched in `server/index.ts`.
- **Node 22.13+** per README; the project uses ESM (`"type": "module"`).
