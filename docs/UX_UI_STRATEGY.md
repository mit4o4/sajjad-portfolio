# Sajjad Studio — UX/UI Strategy

> A "less is more" architectural-magazine system for an architectural designer + BIM/algorithmic-geometry engineer. Goal: impress high-end clients and collaborators in the first 5 seconds.

---

## 1. Visual Language & Identity

**Positioning idea:** *"Architecture you can read like a drawing set."* The brand should feel like a quiet, expensive monograph — engineering rigor expressed through restraint, not decoration.

### Color palette (restrained, ink-on-paper with one signal accent)
| Role | Light | Dark | Use |
|------|-------|------|-----|
| Paper / canvas | `#F6F5F2` (warm off-white) | `#0E0F11` (near-black) | Page background |
| Ink / primary text | `#16181C` | `#ECECEA` | Headlines, body |
| Concrete / muted | `#6B6E73` | `#9A9DA2` | Captions, metadata |
| Hairline | `#E2E0DB` | `#26282C` | 1px rules, grid lines |
| Accent (single) | `#C7613B` (terracotta/blueprint-cyan alt) | same | One CTA, one active state, data highlights |

Rule: **90% neutral, 10% accent.** Never two accents on one screen. The accent is a scalpel, used to mark *the one thing* you want clicked or read. (Optional alternate accent: blueprint cyan `#1F6FEB` if you want a more "technical" read; pick one and lock it.)

### Typography (legibility + architectural elegance)
- **Display / headlines:** a high-contrast or grotesk-with-character serif/sans — e.g. *Fraunces*, *PP Editorial New*, or *Neue Haas Grotesk Display*. Set **huge** (clamp 3rem→7rem), tight tracking (`-0.02em`), tight leading.
- **Body / UI:** *Inter* or *Suisse Int'l* — neutral, screen-optimized, generous line-height (1.6).
- **Mono (the engineer's voice):** *IBM Plex Mono* / *JetBrains Mono* for project codes (`00A-0080`), coordinates, BIM metrics, and data overlays. Mono is your signature — it signals precision without saying "I'm technical."
- **Arabic:** *IBM Plex Sans Arabic* or *Tajawal* (the TeBIM app already uses Tajawal/Amiri — keep that lineage). Pair display-Arabic with display-Latin at matched optical weight; the current AR/EN system in `LanguageContext` should drive type swaps, not just strings.

Scale: use a **modular type scale** (1.25 ratio) and only ~5 sizes total. Discipline > variety.

### Whitespace
- Treat whitespace as a material. Section padding `120–160px` desktop, `64px` mobile.
- One idea per viewport. Let renders breathe edge-to-edge; let text columns stay narrow (max ~62ch).
- A visible **baseline grid + hairline rules** reads as "drafting precision" — borrow the look of a title block.

---

## 2. Homepage UX — high-impact landing

**Structure (top to bottom):**

1. **Hero — the dual-identity statement.** Full-bleed, one hero render (your best D5/Enscape frame) at 70–100vh, slightly desaturated with an ink gradient at the base for text legibility. Overlay, left-aligned:
   - Mono kicker: `ARCHITECTURAL DESIGN · BIM COORDINATION · ALGORITHMIC GEOMETRY`
   - Giant display line: *"Sajjad Studio — designing the buildable."*
   - One accent CTA: **View Work** · ghost secondary: **Capabilities**
   - Bottom-left **title-block strip** (mono): location, year, project count, e.g. `BAGHDAD · EST. 20XX · 40+ PROJECTS`. This single strip is what fuses "designer" and "engineer."
2. **Live numeric ticker / index row** — `40+ projects · 12 typologies · BIM LOD 350 · 3 algorithmic systems`. Pure mono, hairline-separated. Quiet proof of depth.
3. **Featured project (one)** — not a grid yet. One large case-study teaser with render + a faint Grasshopper/wireframe overlay on hover (see §4 micro-interactions).
4. **Capability triad** — three columns: *Design · Coordination · Computation*. Each is a doorway into the filtered portfolio, not a wall of text.
5. **Selected works grid** → existing `PortfolioSection`, but redesigned per §3.
6. Map → Experience → Skills → Certifications → About → Contact (keep current order; restyle to the system).

Keep the hero **silent and confident** — no carousels, no autoplay video unless it's a single 6s looping orbit of one model.

---

## 3. Project Case Study Layout (`00A-0080`, etc.)

Move from "image gallery modal" toward a **structured case-study template** (even inside the modal it can follow this rhythm):

```
┌───────────────────────────────────────────────┐
│  00A-0080            RESIDENTIAL · 2024         │  ← mono title block
│  Project Title (display, huge)                  │
│  One-line thesis (what the project solves)      │
├───────────────────────────────────────────────┤
│  ████████████  HERO RENDER (full-bleed) ██████  │  ← D5/Enscape
├───────────────────────────────────────────────┤
│  CONTEXT (narrow text col)   │   FACTS (mono)   │
│  2–3 short paragraphs        │   GFA, site,     │
│                              │   typology, role │
├───────────────────────────────────────────────┤
│  ── PROCESS: GEOMETRY ──                        │
│  Grasshopper graph still / wireframe ↔ render   │  ← before/after slider
│  toggle. Mono caption: "definition: facade.gh"  │
├───────────────────────────────────────────────┤
│  ── COORDINATION: BIM ──                        │
│  Model viewer / clash-free callouts.            │
│  Chips: LOD 350 · Revit · Navisworks · 0 clashes│
├───────────────────────────────────────────────┤
│  ── PERFORMANCE ──                              │
│  Metric cards: kWh/m², daylight %, shading,     │  ← sustainability/functional
│  cost/efficiency. Animated count-up.            │
├───────────────────────────────────────────────┤
│  RENDER GALLERY (2-col masonry, lightbox)       │
├───────────────────────────────────────────────┤
│  NEXT PROJECT → 00A-0081                         │
└───────────────────────────────────────────────┘
```

Three pillars are always present and always in this order — **Render → Geometry → BIM → Performance** — so every project reads the same way and the *engineering* is never hidden behind the *pretty*. Data extends `Project` in `projectsData.ts` with optional fields: `metrics[]`, `bim: { lod, tools[], clashes }`, `scripts[]`, `thesis`.

---

## 4. Micro-interactions (engineering-precision, subtle)

All under 250ms, eased `cubic-bezier(0.2, 0.8, 0.2, 1)`, and **never** decorative-only — each reveals information.

- **Render → schematic reveal:** on project hover, the render dissolves to a wireframe/Grasshopper line drawing (cross-fade + faint isometric grid). "I show you the beauty, then the structure behind it."
- **Hairline draw-on:** section rules animate from 0→100% width on scroll-in — like lines being drawn in CAD.
- **Mono data overlays:** on render hover, small mono tags fade in at corners (`GFA 420m²`, `LOD 350`, `N↑`) like dimension annotations on a drawing.
- **Count-up metrics:** performance numbers tick up when scrolled into view.
- **Magnetic accent CTA:** the single accent button subtly attracts the cursor.
- **Cursor crosshair (desktop):** replace cursor with a thin crosshair + live coordinate readout over the map/renders — pure draftsman signal.
- **Page transitions:** content slides under a fixed hairline "title block" header, never a flashy wipe.

Respect `prefers-reduced-motion` — collapse all of the above to instant cross-fades.

---

## 5. Navigation — diverse skills without clutter

Problem: Engineering, Algorithms, **and Poultry Infrastructure** are very different audiences. Don't flatten them into one grid.

**Solution — a thin persistent top bar + one "Capabilities" layer:**

- Top bar (always): `Sajjad Studio` · `Work` · `Capabilities` · `About` · `Contact` · `AR/EN` · theme. Minimal, mono-accented.
- **Work** = the portfolio grid with **typology filters you already have** (houses, commercial, model_farms, villas, restaurants, clinics) — keep these.
- **Capabilities** = a separate, calm page/section that segments by *discipline*, not typology:
  1. **Architectural Design** — renders, concepts.
  2. **BIM Coordination** — Revit/Navisworks, clash workflows, LOD.
  3. **Algorithmic / Computational** — Grasshopper systems, parametric facades.
  4. **Specialized Infrastructure** — *Model Farms & Poultry Infrastructure* lives here as a credible engineering specialty (it already maps to your `model_farms` category), framed as "functional/agricultural infrastructure" so it reads as range, not detour.
- **Featured external tools** (like **TeBIM Seals — Design Your Space**) get a distinct "Launch App" tile that taps straight through to the live product — already implemented.

This gives two clean mental models: *browse by what it is (Work)* or *by what I can do (Capabilities)*. No mega-menus, no clutter.

---

## Implementation notes (this repo)
- Content stays bilingual: every new string → both `locales/ar.json` and `locales/en.json`.
- Extend the `Project` interface in `client/src/data/projectsData.ts` for case-study fields (`metrics`, `bim`, `scripts`, `thesis`, `link`).
- `link` is now supported — external apps render a **Launch App** tile that opens in a new tab (used for TeBIM Seals → `https://tebim-seals-mangement.web.app`).
- Build/theme: Tailwind v4 tokens in `index.css` — define the palette above as CSS custom properties so light/dark and AR/EN all inherit one source of truth.
