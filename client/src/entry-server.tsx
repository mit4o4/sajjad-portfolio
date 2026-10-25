/**
 * Server entry used only by the prerender step (scripts/prerender.mjs).
 * Renders a route to static HTML and exposes the SEO file builders.
 */
import { renderToString } from "react-dom/server";
import App from "./App";
import { allRoutes, parseRoute } from "./seo/routes";
import { buildHead, headToHtml } from "./seo/head";

export {
  buildSitemap,
  buildRobots,
  buildLlmsTxt,
  buildLlmsFullTxt,
} from "./seo/files";

export interface RenderedPage {
  path: string;
  lang: string;
  dir: string;
  head: string;
  html: string;
}

export function renderPage(pathname: string): RenderedPage {
  const route = parseRoute(pathname);
  const head = buildHead(route);
  return {
    path: route.path,
    lang: head.lang,
    dir: head.dir,
    head: headToHtml(head),
    html: renderToString(<App pathname={pathname} />),
  };
}

export function routePaths(): string[] {
  return allRoutes().map(r => r.path);
}
