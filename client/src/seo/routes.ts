import { projectsData } from "@/data/projectsData";
import type { Language, Project } from "@/data/types";

/** Canonical production origin (no trailing slash). */
export const SITE_URL = "https://sajjad-studio.com";

export type RouteKind = "home" | "project" | "notFound";

export interface Route {
  kind: RouteKind;
  lang: Language;
  /** Path with leading and trailing slash, e.g. "/en/projects/faiz-house-0156/". */
  path: string;
  project?: Project;
}

const EN_PREFIX = "/en";

export function homePath(lang: Language): string {
  return lang === "en" ? `${EN_PREFIX}/` : "/";
}

export function projectPath(project: Pick<Project, "slug" | "id">, lang: Language): string {
  const slug = project.slug ?? project.id.toLowerCase();
  return `${lang === "en" ? EN_PREFIX : ""}/projects/${slug}/`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/** Equivalent page in the other language (used by the language switch and hreflang). */
export function alternatePath(route: Route, lang: Language): string {
  if (route.kind === "project" && route.project) return projectPath(route.project, lang);
  return homePath(lang);
}

function normalize(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/)[0] || "/";
  const decoded = decodeURIComponent(withoutQuery);
  return decoded.endsWith("/") ? decoded : `${decoded}/`;
}

export function parseRoute(pathname: string): Route {
  const path = normalize(pathname);
  const lang: Language = path === `${EN_PREFIX}/` || path.startsWith(`${EN_PREFIX}/`) ? "en" : "ar";
  const rest = lang === "en" ? path.slice(EN_PREFIX.length) : path;

  if (rest === "/" || rest === "/index.html/") return { kind: "home", lang, path: homePath(lang) };

  const match = rest.match(/^\/projects\/([^/]+)\/$/);
  if (match) {
    const key = match[1];
    const project = projectsData.find((p) => p.slug === key || p.id.toLowerCase() === key.toLowerCase());
    if (project) return { kind: "project", lang, path: projectPath(project, lang), project };
  }
  return { kind: "notFound", lang, path };
}

/** Every page that gets prerendered to static HTML. */
export function allRoutes(): Route[] {
  const langs: Language[] = ["ar", "en"];
  return langs.flatMap((lang) => [
    { kind: "home" as const, lang, path: homePath(lang) },
    ...projectsData.map((project) => ({ kind: "project" as const, lang, path: projectPath(project, lang), project })),
  ]);
}
