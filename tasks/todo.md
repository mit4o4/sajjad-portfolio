# Master Plan — Portfolio Redesign, Ingestion & SEO/GEO (2026-10-25)

Manager: Opus (plans, designs, reviews, writes client-facing copy).
Workers: Haiku agents for scans/manifests/mechanical edits; Sonnet agents for scripted pipelines & component builds.
Rule: only ONE agent writes `projectsData.ts` / `locales/*.json` at a time.

## Ground truth (from scouting)
- Repo clean on `main`; push to `main` auto-deploys to GitHub Pages (`.github/workflows/deploy.yml`).
- 52 projects; 51 tagged `design`, 1 `hospitality` → taxonomy is effectively missing.
- Hero claims "200+ projects" while 52 are shown. Counter numbers must be real.
- **Build = 919 MB; GitHub Pages limit ≈ 1 GB.** Images (1174 webp, tracked in git) are the cause.
- SPA, single URL: hreflang ar/en both point to same URL; no per-project pages; sitemap has 1 URL.
- JSON-LD has `AggregateRating` without visible reviews → Google penalty risk.
- New folder `H:\Temp Work\TEMP`: 146 images (renders 1920px + A1/A4 sheets up to 9922×7016), 1 Arabic Readme, 12 project codes, none overlap existing IDs.
- Readme: most work done **for Al-Qaws Engineering Consultancy**, with partial roles (3D/visualization only on some fuel stations; A+ house only in 0173). Attribution must be accurate.
- Disk: H: 21 GB free, C: 80 GB free. Python 3.12 + Pillow + OpenCV + PyMuPDF available.

## Phase 0 — Isolation
- [ ] Work on branch `redesign-2026` (never push `main` until approved merge).

## Phase 1 — Backup & Rollback (before any change)
- [ ] Annotated tag `pre-redesign-2026-10-25` on `main` (local + push tag only).
- [ ] `git bundle --all` → `C:\Users\sajja\Backups\sajjad-portfolio\2026-10-25\repo.bundle`
- [ ] Zip working tree (excl. node_modules/.venv) → same folder.
- [ ] Archive current live build (`dist/` + last Pages artifact if downloadable) = web archive of deployed site.
- [ ] Restore test: extract bundle to scratchpad, `pnpm install && pnpm build` succeeds.
- [ ] `ROLLBACK.md`: (a) revert merge on main → auto-redeploy; (b) reset to tag; (c) restore from bundle. Verify whether Pages env allows deploying from tag before documenting that path.

## Phase 2 — Image size budget (unblocks everything)
- [ ] Measure image size distribution; re-encode existing webp to max 2400px long edge / q≈80 + 800px thumbnails. Target build < 500 MB.
- [ ] Raw originals stay in backup, never committed.

## Phase 3 — Ingestion pipeline (`scripts/ingest/`, read-only on H:)
- [ ] Manifest (CSV/JSON): file → code, project, kind (render|sheet), role, client.
- [ ] Classify by dimensions: renders pass through; sheets → cropping.
- [ ] Smart crop: detect frame + title block (remove — contains Al-Qaws branding), split multi-viewport sheets, fallback = white mat (gallery style).
- [ ] Output ASCII names `00A-0198-1.webp` (+ thumb) into `client/public/images/Project/`.
- [ ] Contact-sheet HTML for human review of every crop before integration.

## Phase 4 — Data model & taxonomy
- [ ] Extend `Project`: `sector`, `services[]`, `role`, `client`, `location`, `year`, `bim`, `featured`, `slug`.
- [ ] Sectors: residential villas · residential complexes · apartments · commercial/retail · hospitality & restaurants · medical · education (kindergartens) · fuel stations & infrastructure · agricultural · interior.
- [ ] Mapping file for the 52 existing projects → user confirms.
- [ ] Add 12 new projects with bilingual copy (Opus writes copy).

## Phase 5 — Design & UX
- [ ] Concept artifact (hero, counters, project card, case-study page) → user approval before build.
- [ ] Landing narrative: Hero (value prop + CTA) → Proof counters → Capabilities (Design · BIM · Supervision/Execution) → Featured work → Filterable portfolio → Process → About/credentials → Contact CTA (WhatsApp + form).
- [ ] Counter section: real numbers, `prefers-reduced-motion`, final values in HTML; weak categories go to filter chips, not counters.
- [ ] Case-study page per project: role, scope, BIM/LOD, location, gallery with lightbox.
- [ ] Performance: static LCP image, lazy 3D/heavy JS, responsive srcset.

## Phase 6 — SEO + GEO
- [ ] Build-time prerender: `/`, `/en/`, `/projects/<slug>`, `/en/projects/<slug>`, sector pages.
- [ ] Correct hreflang pairs; generated `sitemap.xml`, `llms.txt`, `llms-full.txt` from data.
- [ ] JSON-LD: Organization/ProfessionalService + Person + per-project `CreativeWork`; remove fake `AggregateRating`; FAQ block.
- [ ] Verify `sajjad-studio.com` is the serving domain (no CNAME in repo).

## Phase 7 — Verification
- [ ] `pnpm check`, `pnpm build`, build size < budget.
- [ ] Browser check AR/EN, mobile/desktop, Lighthouse.
- [ ] Code review agent; user sign-off; merge → deploy; keep tag for rollback.

## Decisions (user, 2026-10-25)
- Counters: computed from site data (after re-categorization) — no hand-typed totals.
- Design: Premium dark architectural + subtle lazy-loaded 3D accent.
- Attribution: show role + "In collaboration with Al-Qaws Engineering Consultancy".
- URLs: per-project + per-language prerendered pages approved.

## Progress log
- [x] Phase 0: branch `redesign-2026`, tag `pre-redesign-2026-10-25`.
- [x] Phase 1: bundle + source zip + live dist zip in `C:\Users\sajja\Backups\sajjad-portfolio\2026-10-25\`; restore-from-bundle build test PASSED; `ROLLBACK.md` written (Pages deploys only from `main`; domain sajjad-studio.com confirmed via Pages API).
- [x] Ingestion prototype `scripts/ingest/ingest.py`: 146 files → 154 gallery webp + thumbs (40.5 MB); title blocks/branding removed; visual spot-check OK. Minor: stray view captions on a few crops (0190-1 "- c").
- [x] Research → `tasks/research-2026.md`. Prerender = custom Vite SSR script w/ wouter ssrPath.
- [x] Taxonomy drafts → `tasks/category-mapping.json` + `tasks/category-mapping-vision.json` (vision corrected 0115→restaurant, 0085→Najaf Governorate gate (civic), 0097/0099→interior).

- [x] Size budget solved: `client/public/images/Project-backup` (752 MB, unreferenced) ships in dist. Remove from public (kept in backups) → build ≈170 MB. Recompression of existing images optional.
- [x] Counters from data (64 total): Residential 31 · Large-scale & Public 16 · Interior 10 · Commercial & Hospitality 7.
- [x] Concept v1 published: https://claude.ai/artifact/VRVhSbc44rXjNnCEUCTwLY (awaiting approval).

## New projects (identified from filenames + Readme)
| Code | Project | Sector | Role | Client credit |
|---|---|---|---|---|
| 0173 | Residential complex — A+ house type + landscape (incl. "Landscape"/"Type" files) | residential-complex | A+ house design, exterior, visualization | Al-Qaws |
| 0179 | Private residence, Kinda district | residential-villa | Facade + interior | private (no name) |
| 0182 | Al-Jinsiya fuel station | fuel-infrastructure | Visualization only | Al-Qaws |
| 0189 | Ya Ali Road fuel station | fuel-infrastructure | 3D design + visualization | Al-Qaws |
| 0190 | Women's fashion store, Al-Furat Mall | commercial-retail / interior | Interior design | private |
| 0191 | Home-appliance showroom, Atiya Jabouri St. | commercial-retail | Design + visualization | private |
| 0195 | Kindergarten | education | Full design, all outputs | Al-Qaws |
| 0196 | Kindergarten 50×25 m | education | Full design, all outputs | Al-Qaws |
| 0198 | Fuel station, Baghdad | fuel-infrastructure | 3D design + visualization | Al-Qaws |
| 0200 | House 13×20 m | residential-villa | Facade design | private |
| 0201 | House renovation, Al-Jamia district | interior | Renovation / interior | private |
| 0204 | Doctors' house | interior / residential-villa | Interior design | private |
Privacy default: private individuals' names (doctor, engineer, contractor) are NOT published.

## Open questions for user (remaining)
1. Real counter totals per category.
2. Identity/details of 0195, 200, 201, 204, "Landscape…", "Type…" files; 0196 split into two kindergartens.
3. Design direction (3D immersive vs other).
4. Approval of new URL structure.

## Review (2026-10-25)
- Commit 1904b01, redesign v3:
  - Light design system, sectors, data-driven counters, 64 projects (12 new), About with a credentials rail, FAQ.
  - Build size dropped from 919 MB to 208 MB.
- Commit fc3792b, SEO/GEO:
  - 130 prerendered pages, each with its own head, hreflang and JSON-LD.
  - Sitemap, robots.txt, llms.txt and llms-full.txt are generated at build time.
  - 404 page with noindex.
  - Code-review fixes applied.
- Verified:
  - `pnpm check` and `pnpm build` pass.
  - Static production build tested in the browser: hydration has no errors, the AR↔EN switch works, and the project pages render.
- DEPLOYED 2026-10-25:
  - Merge 3123e52 to `main`, GitHub Pages run succeeded.
  - The live sajjad-studio.com serves `/`, `/en/`, the project pages, the sitemap and llms.txt; unknown URLs return 404.
  - Rollback tag `pre-redesign-2026-10-25` pushed.
- DEPLOYED e7ccfe4:
  - 65 older sheets re-cropped in 21 projects, including manual fixes to 0077-4, 0147-1 and 0091-19/-21.
  - 423 thumbnails added.
  - Live assets verified to match the new files.
- DEPLOYED 253b852:
  - Private client names removed from 14 project titles and URLs.
  - 28 legacy redirects (old URLs → new pages).
  - 0115 description corrected.
- Counter category totals are labelled "published portfolio" until the user supplies real totals.
- Not done / next:
  - Run the crop pipeline on the 52 existing projects' raw sheets.
  - Resubmit the sitemap in Google Search Console and Bing.
  - Category totals for the 200+ figure, from the user.
