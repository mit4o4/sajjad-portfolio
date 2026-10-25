# Research 2026: AEC portfolio (AR/EN, Vite+React19+wouter, GitHub Pages)

Method: web search (Oct 2026). [V] = confirmed by a fetched/search source; [K] = established practice from prior knowledge, not re-verified this session; verify before relying. Many sources are vendor blogs; primary docs are flagged.

## 1. Landing page that converts (AEC)
- Section order (single page, each section links to deeper pages): Hero (value prop + 1 CTA) > proof strip (3-4 stats) > featured projects (6, filterable by sector) > services (design / 3D viz / BIM / supervision, each w/ outcome) > process (4-5 steps) > credentials/software/certs > testimonials or client logos (only real) > FAQ > contact/WhatsApp. [K]
- Hero: one sentence "who + for whom + where" (Arabic first), one real hero render/photo, primary CTA = WhatsApp, secondary = "view projects". Avoid carousels/autoplay video above fold (hurts LCP). [K]
- Filtering is the most-cited pattern on architecture sites: horizontal filter bar above image grid; per-project metadata (location, area, year, category); label built vs unbuilt/concept status. [V] https://sendpulse.com/blog/architecture-website-design , https://www.casestudies.com/company/215-guys/case-study/joshua-zinder-launches-a-portfolio-website-with-the-215-guys
- Built vs unbuilt distinction matters more than typology to architecture reviewers. [V] https://architecture.binus.ac.id/?p=3374 (editorial summary of a reviewer's claims; weak source)
- No credible conversion-rate data found for filters or layouts; treat as heuristics and measure own (WhatsApp click events).
- Stat counters: help only if the numbers are real and specific (projects delivered, years, sqm designed/supervised, cities). Use 3-4 max; odd numbers that are verifiable beat round ones. Put them directly under hero (proof near first CTA). [K]
- Counter animation: count only once on intersect, <=1.2s, final value present in the HTML (SSR) so crawlers/AI/no-JS see it; honor `prefers-reduced-motion` (render final number, no tween); give wrapper `aria-label` with final value and don't announce intermediate values (aria-hidden on ticking span, or `role="text"` static sr-only copy). WCAG 2.2.2 / 2.3.3 guidance. [K]
  - https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- Middle East CTA: WhatsApp is the primary channel. Use `https://wa.me/<E164 no +>?text=<urlencoded prefilled Arabic message>`; prefill includes project type + page title so the lead arrives qualified. Sticky floating button (bottom-inline-end, flips in RTL), plus inline CTA after projects and in each case study. Keep phone call + email as secondary. Track clicks (`click_whatsapp` event w/ page + source). [K] https://faq.whatsapp.com/5913398998672934 (click-to-chat format)
- Add CTA micro-copy that lowers friction: "Reply within X hours", "Free first consultation" (only if true), working hours in Asia/Baghdad.
- Case-study page structure: title + one-line outcome > key facts block (location, client type, area m2, year, status, services provided, tools) > brief/challenge > design approach > 3D renders > drawings (plans/sections) > BIM/construction phase > result/photos > related projects > CTA. Keep facts in text (not only in images) so search/AI can quote them. [K]
- Present drawings vs renders in separate, labeled groups/tabs ("Renders", "Plans & sections", "Site/Execution"); drawings need zoom/pan at full res; renders carry captions (view name). [K]

Apply here:
- Reorder AppContent: Hero > StatsStrip (3-4, SSR-safe, reduced-motion aware) > Portfolio (filterable) > Services > Process > Experience/Skills/Certs > FAQ > Contact. Map section later or inside portfolio view (not a LCP competitor).
- Build `<WhatsAppCTA message>` component (wa.me, prefilled AR/EN per lang + page context), floating + inline; fire analytics event.
- Create `/projects/:slug` case-study template with fixed facts block + drawings/renders tabs + "built/unbuilt/under execution" badge.
- Add project fields to projectsData: status, area, year, location(city), services[], sector, tools[].

## 2. Portfolio categorization, filters, gallery
- Two axes: Sector (villa, residential complex, apartments, retail, commercial, medical, kindergarten, fuel station, agricultural) and Service (architectural design, 3D viz, BIM, supervision/execution). Show sector as primary chips; service as secondary toggle. Grouping 9 sectors into 4-5 super-groups (Residential / Commercial & Retail / Institutional (medical, kindergarten) / Infrastructure & Agri) keeps chip row short. [K]
- Chips: "All" first, show counts, multi-select only if needed (single-select is simpler and URL-friendlier), horizontal scroll with snap on mobile, `aria-pressed` buttons, results live region ("12 projects"). [K]
- URL-synced filters: `?sector=villa&service=bim` via wouter `useSearch`/`useLocation`; filtering must work with JS-off? No; but each filtered view should be shareable and back-button safe (use replace for chip toggles). Canonical stays on unfiltered `/projects/`; or give top sectors their own indexable pages `/projects/villas/` (better for SEO than query params). [K]
- Gallery/lightbox: use native `<dialog>` or a small a11y-correct lib (Radix Dialog already in repo); keyboard arrows/Esc, focus trap + restore, swipe, preload neighbor, URL hash per image optional, RTL-aware arrow direction, captions, `alt` describing view ("front elevation of two-storey villa, Najaf"). [K]
- Thumbnails: fixed aspect-ratio boxes (no CLS), `loading="lazy"` + `decoding="async"`; full-res only loads in lightbox.
- Drawings: serve high-res plans separately (large pixel width, WebP/AVIF lossless-ish or SVG/PDF download); don't over-compress line art (use WebP lossless or PNG-8 for CAD linework).
- Do not paginate by JS-only infinite scroll; render all cards in HTML (SSR) with lazy images, or paginate with real links.

Apply here:
- Add `sector` + `services[]` to projectsData; chips driven from data; counts computed.
- Sync filters to URL (replace); sector landing pages for top 3 sectors (villas, residential, commercial).
- Lightbox on Radix Dialog with keyboard/RTL support; separate "Drawings" group inside each project.

## 3. Prerender / SSG for Vite + React 19 + wouter on GitHub Pages
Comparison:
- vite-react-ssg: built around react-router; README says wouter/tanstack support "in progress"; recommends React Router v7 for its built-in SSG. Would force router migration. [V] https://github.com/Daydreamer-riri/vite-react-ssg , https://cdn.jsdelivr.net/npm/vite-react-ssg@0.9.2/README.md
- React Router v7 framework-mode prerender: solid and official, but a full framework migration (routes config, loaders, root.tsx), heavy for ~10 routes. [V] https://reactrouter.com/start/framework/rendering
- Vike (vite-plugin-ssr) prerender: mature, supports static pre-render, but own filesystem routing; replaces wouter and app shell. [K] https://vike.dev/pre-rendering
- Custom Vite SSR + `renderToString` script: Vite documents the pattern (entry-client + entry-server, `vite build --ssr`). wouter supports SSR via `<Router ssrPath="/x" ssrSearch="">` [K: wouter README], so no router change. [V pattern] https://vite.dev/guide/ssr
- Puppeteer crawl-and-snapshot: works with zero code change but slow, flaky, snapshot includes client-injected junk, hydration mismatches; avoid. [K]
- RECOMMENDATION: custom Vite SSR prerender script (~80 lines). Reasons: keeps wouter + current tree; ~dozens of routes (2 langs x (home + N projects + sector pages)); no new framework; fully static output; deterministic; easy to inject per-route `<title>`, meta, canonical, hreflang, JSON-LD.
- Implementation outline:
  1. `client/src/entry-server.tsx`: `render(url, lang)` => `renderToString(<Router ssrPath={url}><App lang/></Router>)`; collect head tags via a tiny head collector (own context, or `react-helmet-async`, or React 19 native `<title>/<meta>/<link>` hoisting - React 19 hoists them in the rendered output; with renderToString you must read them from the string/portion; simplest: generate head in the script from route metadata, not from components).
  2. `entry-client.tsx`: `hydrateRoot` when `#root` has children, else `createRoot`.
  3. Build: `vite build` (client) then `vite build --ssr entry-server.tsx --outDir dist-ssr`; `scripts/prerender.mjs` reads `dist/index.html` template, loops routes from `projectsData` + static list, writes `dist/<route>/index.html` (directory index files).
  4. Language from URL: `/` Arabic (dir=rtl), `/en/` English. Make LanguageContext read initial lang from route (not localStorage/navigator) during SSR; set `<html lang dir>` in the script. localStorage preference may only redirect user via client JS; never change content on first render (hydration mismatch).
  5. Guard browser-only code (window, Google Maps, Three.js, IntersectionObserver) in effects or lazy components; render a static placeholder in SSR.
  6. Output `dist/404.html` = copy of the SPA shell (or a real "not found" page w/ links); GitHub Pages serves it for unknown paths with HTTP 404 status (acceptable for real unknown URLs; since every real route has its own `index.html`, no soft-404 SPA fallback trick is needed). [K] https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site
  7. Add `dist/CNAME` (sajjad-studio.com), `.nojekyll`, `sitemap.xml`, `robots.txt` (put in `client/public`).
- Trailing slashes: GitHub Pages serves `/foo/index.html` at `/foo/` and 301s `/foo` -> `/foo/`. Use trailing-slash URLs everywhere (canonical, sitemap, hreflang, internal links) to avoid redirect hops. [K]
- Bilingual URLs: `/` (ar), `/en/` (en); projects `/projects/<slug>/` and `/en/projects/<slug>/`. Arabic slugs vs latin slugs: use short latin slugs for both (cleaner sharing on WhatsApp, no percent-encoding); Arabic titles stay in content.
- hreflang: on every page, reciprocal set incl. self + `x-default` (to `/`), in `<link rel="alternate" hreflang>` in head AND in sitemap `xhtml:link`. `ar` and `en` (add `ar-IQ`/`en` only if targeting). Each language page has self-referencing canonical. https://developers.google.com/search/docs/specialty/international/localized-versions [K, primary doc]
- Google can render JS, but separate crawl queue + other engines/AI crawlers (many don't execute JS) => prerender is the biggest GEO/SEO win here. Most AI crawlers do not run JS. [K]
- Sitemap generated by the same script from the route list (lastmod from git/data).
- Validate: `curl -s https://sajjad-studio.com/en/ | grep -c "<h1"`; Search Console URL inspection; Rich Results Test; disable JS and compare.

Apply here:
- Add `entry-server.tsx`, `scripts/prerender.mjs`, update `pnpm build` (client -> ssr -> prerender). Keep Express server only for local `start`.
- Convert LanguageContext to route-driven initial lang; mount app under `/en` base for English (wouter `<Router base="/en">`).
- Route metadata table (title, description, canonical, hreflang, OG image, JSON-LD builder) shared by prerender + client head updates.
- Replace current SPA-only index.html SEO tags with per-route injected ones.

## 4. Structured data
- Org-level (home, both languages): `ProfessionalService` (subtype of LocalBusiness) with `name`, `url`, `logo`, `image`, `address` (Najaf, IQ), `areaServed` (Najaf, Karbala, Iraq), `geo`, `telephone`, `sameAs` (Instagram/LinkedIn/Behance/etc.), `founder` -> `Person`, `knowsAbout`, `makesOffer`/`hasOfferCatalog` for the 4 services, `inLanguage`, `openingHours` if real. Use stable `@id` (e.g. `https://sajjad-studio.com/#org`). [K] https://schema.org/ProfessionalService
- `Person` (architect): `name`, `jobTitle` "Architect", `alternateName` (Arabic), `worksFor`, `alumniOf`, `hasCredential`/`hasOccupation`, `sameAs`, `image`. Supports author E-E-A-T.
- `WebSite` w/ `inLanguage`; no SearchAction (no site search).
- Project pages: `CreativeWork` (or `Article`/`WebPage` w/ `about`) with `name`, `description`, `image` (ImageObject[] w/ `caption`, `contentLocation`, `creator`), `dateCreated`, `locationCreated`/`contentLocation` (Place w/ address), `creator` -> Person `@id`, `genre` (sector), `keywords`. There is no Google rich result for portfolio projects; value is entity clarity. [K]
- `ImageObject`: `contentUrl`, `caption`, `creator`, `creditText`, `license`/`acquireLicensePage` can qualify for Google Images "licensable" badge (optional). https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
- `BreadcrumbList` on project/sector pages (Home > Projects > Villas > X) - still supported. https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- FAQPage: Google ended FAQ rich results for all sites in 2026 (after 2023 restriction to gov/health); Search Console report/tool support ending mid-2026. Markup is still valid schema.org and harmless; keep visible FAQ content (helps AI/readers), JSON-LD optional. [V, secondary] https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/ , https://jsonld.com/google-faq-rich-results-deprecated/ , https://www.techwyse.com/news/ai-search/google-faq-rich-results-deprecated-2026
- Self-serving AggregateRating/Review: since 2019, Google does not show review stars for LocalBusiness/Organization when the entity controls the reviews (own site or widget). Do NOT add AggregateRating from own testimonials. Real reviews are fine as visible text, and Google Business Profile reviews carry weight instead. [V, secondary of primary] https://webmasters.googleblog.com/2019/09/making-review-rich-results-more-helpful.html , https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- Markup must match visible content; JSON-LD in prerendered HTML head (not injected late). Validate with Rich Results Test + schema.org validator.
- Arabic: use `inLanguage: "ar"`, Arabic `name` + `alternateName` English; JSON-LD per language page.

Apply here:
- `buildJsonLd(route, lang)` util: org+person on home, CreativeWork+ImageObject+BreadcrumbList on projects. Use `@graph` with shared `@id`s.
- Skip AggregateRating; skip FAQ JSON-LD dependence (keep FAQ visible; optional JSON-LD).
- Create Google Business Profile (Najaf) and link in `sameAs`; consistency of NAP across profiles.

## 5. GEO / AI search 2026
- Google: no special optimization required for AI Overviews/AI Mode; page must be indexed and snippet-eligible; follow normal SEO; structured data must match visible text. Primary doc. [V] https://developers.google.com/search/docs/appearance/ai-features
- llms.txt: adoption grew (about 36k sites by May 2026 per one tracker) but an Ahrefs log study found 97% of llms.txt files got zero AI requests; major AI vendors have not confirmed use. Cheap to add (30 min), but expect no measurable lift; don't spend more. [V, secondary] https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/ , https://commoncrawl.org/blog/a-content-analysis-of-llms-txt-files-from-the-july-2026-crawl-archive
- robots.txt, split by purpose [V third-party guides; confirm on vendor pages]: https://platform.openai.com/docs/bots , https://support.claude.com/en/articles/8896518 , https://docs.perplexity.ai/guides/bots , https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
  - Search/answer bots (ALLOW for visibility): `OAI-SearchBot`, `ChatGPT-User` (user-triggered), `PerplexityBot`, `Perplexity-User`, `Claude-SearchBot`, `Claude-User`, `Googlebot`, `Bingbot`, `Applebot`.
  - Training bots (policy choice): `GPTBot`, `ClaudeBot`, `Google-Extended` (affects Gemini training/grounding, not Search ranking), `Applebot-Extended`, `CCBot`, `Bytespider`. For a portfolio seeking exposure, allowing is reasonable; blocking training does not hurt search visibility.
  - Blocking a search bot removes you from that product's answers. ChatGPT-User/Perplexity-User may not obey robots.txt strictly.
  - Make sure GitHub Pages/CDN does not bot-challenge these (GH Pages doesn't).
- Content patterns that get cited [K, practitioner consensus, weak evidence]: crisp entity statements in first 100 words ("Sajjad X is an architect in Najaf, Iraq, offering architectural design, 3D visualization, BIM (Revit) and construction supervision since 20XX"); fact blocks/tables (services, locations served, typical timelines, deliverables, software, standards); named projects with numbers (area, floors, year); FAQ in plain visible text (cost drivers, process, timelines, BIM vs 2D, supervision scope); consistent name/Arabic spelling across site, GBP, LinkedIn, Behance; author/about page with credentials (syndicate membership, degree, certs) = E-E-A-T; dates ("updated 2026-10"); quotable stat sentences; third-party mentions (directories, Behance, ArchDaily Arabia submissions).
- Content must be in HTML (prerender); most AI crawlers do not execute JS. Keep key text out of images and canvas/Three.js.
- Arabic: write natural Modern Standard + Iraqi-relevant terms people search (تصميم فلل النجف, مخططات بيوت, تصميم داخلي/واجهات, اشراف هندسي, نمذجة معلومات البناء BIM); use both "مصمم معماري" / "مهندس معماري"; one canonical Arabic name spelling; avoid tashkeel in headings; include the English brand/transliteration once for entity linking; hreflang for ar/en; Arabic pages should be the fully written version, not machine-translated.
- Monitoring: search "Najaf architect" style prompts in ChatGPT/Perplexity/Gemini monthly; check Bing Webmaster Tools (ChatGPT search leans on Bing index) and submit sitemap/IndexNow.

Apply here:
- robots.txt: allow all search/answer bots + Googlebot; decide training-bot policy (default allow), `Sitemap:` lines. Add concise `llms.txt` (summary, services, key project URLs, contact) - low priority.
- Add "About + credentials" page, FAQ section (visible), "Services" fact table, per-project fact block.
- Register Bing Webmaster Tools + Google Search Console (existing Google verification) + IndexNow.

## 6. Core Web Vitals, image-heavy portfolio
- Format: serve AVIF with WebP fallback via `<picture>` (AVIF ~20-50% smaller than WebP on photos; AVIF support roughly 94% global per one source, WebP ~97%; figures differ across vendor blogs, check caniuse). AVIF encoding is much slower: do at build time (sharp/squoosh, `avif` quality ~50-60, effort 4-6), not at runtime. For CAD/linework use lossless WebP or PNG. [V weak] https://modpagespeed.com/blog/avif-vs-webp-2026/ , https://hiredigital.com/blog/jpg-vs-webp-vs-avif-2026 ; check https://caniuse.com/avif
- Responsive: generate 480/768/1200/1600/2400 widths; `srcset` w-descriptors + accurate `sizes` (e.g. `(min-width:1024px) 33vw, 100vw`); explicit `width`/`height` or CSS `aspect-ratio` on all images (CLS ~0). [K] https://web.dev/articles/responsive-images
- LCP hero: ONE image, in HTML (prerendered `<img>`/`<picture>`), `fetchpriority="high"`, NOT lazy, `<link rel="preload" as="image" imagesrcset imagesizes>` in head, ~100-200KB at mobile width, no JS-gated reveal that delays paint (fade-in with opacity 0 until JS = bad LCP). Everything below fold: `loading="lazy" decoding="async"`. [K] https://web.dev/articles/optimize-lcp , https://web.dev/articles/fetch-priority
- Fonts (Arabic): self-host subset WOFF2, `font-display: swap` (or optional for display font), preload the one critical face; Arabic fonts are large, subset to Arabic+Latin ranges. Avoid Google Fonts render-blocking CSS chains.
- INP: avoid heavy handlers on scroll; keep counters/animations on compositor (transform/opacity); virtualize nothing, but split heavy sections with `React.lazy` + intersection-triggered import; use `content-visibility:auto` on below-fold sections with `contain-intrinsic-size`.
- Three.js accent: dynamic `import()` after `requestIdleCallback`/first interaction/IntersectionObserver visible; never in the entry chunk; static poster image (same size) shown first so there's no layout shift; skip entirely when `prefers-reduced-motion`, `saveData`, low `deviceMemory`/mobile width; pause on `visibilitychange`; cap DPR at 1.5; dispose on unmount. Keep canvas out of LCP element candidacy (hero text/image should be the LCP). [K]
- Google Maps: load on interaction/visible (facade with static map image), not on load.
- Budget: JS < 200KB gz initial, total hero page < 1.5MB on mobile, LCP < 2.5s on 4G (iraqi mobile networks are slow: test with Slow 4G throttle). CWV thresholds: LCP 2.5s, INP 200ms, CLS 0.1. https://web.dev/articles/vitals
- GitHub Pages: no custom headers; cache is 10 min. Put images under hashed filenames won't help cache TTL; consider Cloudflare (free) in front for longer cache, Brotli, AVIF, HTTP/3 - only if DNS control allows.

Apply here:
- Build-time image pipeline script (sharp) -> AVIF+WebP at 5 widths, emits manifest consumed by an `<Img>` component (handles picture/srcset/sizes/dimensions).
- Hero: preload + fetchpriority; remove opacity-0-until-JS gating; lazy Three.js with poster + reduced-motion bypass; lazy Map.
- Audit with Lighthouse mobile + CrUX (PageSpeed Insights) after prerender.

## 7. Web archiving
- Wayback "Save Page Now" now uses Brozzler (executes JS), so client-rendered SPAs often archive, but prerendered HTML is far more reliable and fully replays without JS timing issues. Capture is per-URL; crawler follows links on page; unlinked pages can be missed => submit URLs. Site-wide scheduled crawling = paid Archive-It. [V] https://help.archive.org/help/save-pages-in-the-wayback-machine/ , https://blog.archive.org/2019/10/23/the-wayback-machines-save-page-now-is-new-and-improved/
- Make site archive-friendly: prerendered per-route HTML; real `<a href>` links between all pages (incl. language switcher and project cards); no `Disallow` for `ia_archiver`/`archive.org_bot` (robots.txt); images/CSS/JS on same host or stable CDN with static URLs (hashed assets stay valid); avoid content that depends on third-party APIs at render; avoid hash-only routing; provide `sitemap.xml` (Wayback may use) and a plain HTML "Site map" page; Google Maps/Three.js degrade gracefully to static images.
- Procedure: after each release, submit key URLs: `https://web.archive.org/save/https://sajjad-studio.com/` (+ `/en/`, sitemap URLs) - script via `curl` or the SPN2 API (needs free archive.org account S3-style keys; store as GitHub secret, never commit). Optionally GitHub Action on `release` tag looping sitemap URLs with polite delay (>=5s). [K] https://archive.org/details/spn-2
- Versioned archives owned by you: git tag each release (`site-YYYY-MM-DD`), GitHub Release attaching `dist.zip` (static output = exact site snapshot); optional Zenodo-GitHub integration gives a DOI per release. Keep source of truth for images in repo/LFS or a separate assets repo. [K] https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases , https://docs.github.com/en/repositories/archiving-a-github-repository/referencing-and-citing-content
- Optional: WARC snapshot with `wget --mirror --warc-file` or `browsertrix-crawler` for an offline copy.

Apply here:
- robots.txt must not block `ia_archiver`; keep internal links as real anchors.
- Add `scripts/archive.mjs` + GH Action step (post-deploy, on tag) that pings Save Page Now for sitemap URLs; tag releases `site-YYYY-MM-DD` and attach `dist.zip`.

## Priority (impact/effort)
1. Prerender + per-route metadata + bilingual URLs/hreflang (section 3) - unblocks SEO, GEO, archiving.
2. Hero LCP/image pipeline + lazy Three.js/Maps (6).
3. WhatsApp CTA + stats strip + sector filters + case-study template (1, 2).
4. JSON-LD graph + Google Business Profile + FAQ/About content (4, 5).
5. robots.txt/llms.txt/sitemap, archive script (5, 7).

## Caveats
- FAQ deprecation dates and llms.txt stats come from secondary sources (SEJ, ppc.land, techwyse); verify on Google docs before citing.
- AI-crawler roles from third-party guides; confirm on OpenAI/Anthropic/Perplexity bot pages.
- wouter `ssrPath` usage and GH Pages trailing-slash/404 behavior are from prior knowledge; test in a throwaway build before committing to the pipeline.
- No source gave conversion-rate evidence for counters, filters or WhatsApp placement; A/B or track clicks yourself.
