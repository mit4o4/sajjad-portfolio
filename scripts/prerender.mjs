#!/usr/bin/env node
/**
 * Prerenders every route to static HTML so search engines and AI crawlers (most of which
 * do not run JavaScript) receive full content, per-page <head>, hreflang and JSON-LD.
 *
 * Runs after: `vite build` (client → dist) and `vite build --ssr src/entry-server.tsx` (→ dist-ssr).
 * Writes: dist/<route>/index.html, dist/404.html, sitemap.xml, robots.txt, llms.txt, llms-full.txt.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SSR_DIR = path.join(ROOT, "dist-ssr");
const HEAD_MARKER = "<!--app-head-->";
const HTML_MARKER = "<!--app-html-->";
const NOT_FOUND_PATH = "/__not-found__/";

function fail(message) {
  console.error(`prerender: ${message}`);
  process.exit(1);
}

function readTemplate() {
  const file = path.join(DIST, "index.html");
  if (!fs.existsSync(file)) fail(`missing ${file}; run the client build first`);
  const template = fs.readFileSync(file, "utf8");
  if (!template.includes(HEAD_MARKER) || !template.includes(HTML_MARKER)) fail("template markers not found in dist/index.html");
  return template;
}

function fillTemplate(template, page) {
  return template
    .replace(/<html[^>]*>/, `<html lang="${page.lang}" dir="${page.dir}">`)
    .replace(HEAD_MARKER, page.head)
    .replace(HTML_MARKER, page.html);
}

function outputFile(routePath) {
  const relative = routePath.replace(/^\/|\/$/g, "");
  return relative ? path.join(DIST, relative, "index.html") : path.join(DIST, "index.html");
}

/** GitHub Pages has no server redirects, so moved pages use canonical + meta refresh + JS replace. */
function redirectPage(absoluteTarget, relativeTarget) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Moved</title>
    <link rel="canonical" href="${absoluteTarget}" />
    <meta name="robots" content="noindex, follow" />
    <meta http-equiv="refresh" content="0; url=${relativeTarget}" />
    <script>location.replace(${JSON.stringify(relativeTarget)} + location.hash);</script>
  </head>
  <body><a href="${relativeTarget}">${absoluteTarget}</a></body>
</html>
`;
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

async function main() {
  const entry = path.join(SSR_DIR, "entry-server.js");
  if (!fs.existsSync(entry)) fail(`missing ${entry}; run the SSR build first`);
  const server = await import(pathToFileURL(entry).href);
  const template = readTemplate();

  const paths = server.routePaths();
  for (const routePath of paths) {
    const page = server.renderPage(routePath);
    write(outputFile(page.path), fillTemplate(template, page));
  }

  // Renamed project URLs: static pages that send visitors and crawlers to the current URL.
  const redirects = server.legacyRedirects();
  for (const { from, to } of redirects) {
    write(outputFile(from), redirectPage(server.absoluteUrl(to), to));
  }

  // GitHub Pages serves 404.html for unknown URLs.
  write(path.join(DIST, "404.html"), fillTemplate(template, server.renderPage(NOT_FOUND_PATH)));

  const today = new Date().toISOString().slice(0, 10);
  write(path.join(DIST, "sitemap.xml"), server.buildSitemap(today));
  write(path.join(DIST, "robots.txt"), server.buildRobots());
  write(path.join(DIST, "llms.txt"), server.buildLlmsTxt());
  write(path.join(DIST, "llms-full.txt"), server.buildLlmsFullTxt());

  fs.rmSync(SSR_DIR, { recursive: true, force: true });
  console.log(`prerender: ${paths.length} pages + ${redirects.length} redirects + 404, sitemap, robots, llms files written to dist/`);
}

main().catch((error) => fail(error instanceof Error ? error.stack ?? error.message : String(error)));
