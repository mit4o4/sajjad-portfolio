/**
 * Builders for static SEO / AI-visibility files: sitemap.xml, robots.txt,
 * llms.txt and llms-full.txt. Pure TypeScript (no DOM) so it can run in Node
 * during the prerender step. All facts come from project data and locales.
 */
import en from "@/locales/en.json";
import { EMAIL, PHONE_DISPLAY, PHONE_E164 } from "@/data/contact";
import { projectsData } from "@/data/projectsData";
import {
  DECLARED_TOTAL_PROJECTS,
  SECTORS,
  YEARS_OF_PRACTICE,
  countBySector,
  countInteriorSpaces,
} from "@/data/taxonomy";
import type { Language, Project } from "@/data/types";
import {
  SITE_URL,
  absoluteUrl,
  allRoutes,
  alternatePath,
  homePath,
  projectPath,
  type Route,
} from "./routes";

const SITE_NAME = "Eng. Sajjad Al-Hindawi — TeBIM";
const DEFAULT_LANG: Language = "ar";

const SEARCH_BOTS = [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "Applebot",
  "ia_archiver",
] as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const XML_ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, ch => XML_ESCAPES[ch]);
}

const siteEn = en.site;

function sectorName(id: string | undefined): string {
  const sector = SECTORS.find(s => s.id === id);
  return sector ? sector.name.en : id === "other" || !id ? "Other" : id;
}

function projectUrl(project: Project, lang: Language): string {
  return absoluteUrl(projectPath(project, lang));
}

function projectMeta(project: Project): string {
  const parts = [
    sectorName(project.sector),
    project.role?.en,
    project.location?.en,
  ].filter((part): part is string => Boolean(part));
  return parts.join(" · ");
}

function projectCode(project: Project): string {
  return project.id;
}

/* ------------------------------------------------------------------ */
/* sitemap.xml                                                         */
/* ------------------------------------------------------------------ */

function hreflangLinks(route: Route): string[] {
  const hrefs: Record<Language, string> = {
    ar: absoluteUrl(alternatePath(route, "ar")),
    en: absoluteUrl(alternatePath(route, "en")),
  };
  const link = (hreflang: string, href: string): string =>
    `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`;
  return [
    link("ar", hrefs.ar),
    link("en", hrefs.en),
    link("x-default", hrefs[DEFAULT_LANG]),
  ];
}

function imageEntry(route: Route): string[] {
  const image = route.project?.image;
  if (route.kind !== "project" || !image) return [];
  return [
    "    <image:image>",
    `      <image:loc>${escapeXml(`${SITE_URL}${image}`)}</image:loc>`,
    "    </image:image>",
  ];
}

function urlEntry(route: Route, lastmod: string): string {
  return [
    "  <url>",
    `    <loc>${escapeXml(absoluteUrl(route.path))}</loc>`,
    `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
    ...hreflangLinks(route),
    ...imageEntry(route),
    "  </url>",
  ].join("\n");
}

export function buildSitemap(lastmod: string): string {
  const entries = allRoutes().map(route => urlEntry(route, lastmod));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* robots.txt                                                          */
/* ------------------------------------------------------------------ */

export function buildRobots(): string {
  const botBlocks = SEARCH_BOTS.map(bot => `User-agent: ${bot}\nAllow: /`);
  return [
    "User-agent: *",
    "Allow: /",
    "",
    ...botBlocks.flatMap(block => [block, ""]),
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* llms.txt                                                            */
/* ------------------------------------------------------------------ */

function summaryLine(): string {
  return (
    `> Eng. Sajjad Al-Hindawi (Arabic: المهندس سجاد الهنداوي; also published as Sajjad Abdulhameed Majeed) ` +
    `is a civil engineer and architectural designer based in Najaf, Iraq, and the founder of TeBIM. ` +
    `The studio offers architecture and design, full BIM modeling in Revit, and construction supervision ` +
    `and execution, with ${DECLARED_TOTAL_PROJECTS}+ projects delivered over ${YEARS_OF_PRACTICE}+ years ` +
    `across Najaf and other Iraqi provinces. Clients and partners include the Najaf Governorate office, ` +
    `Al-Qaws Engineering Consultancy, Dar Al-Naseem Company, Um Qasr Northern Cement Company, ` +
    `Wadi Al-Khair Company and Madina Al-Moali Company, as well as local engineering offices and contractors.`
  );
}

function servicesBullet(): string {
  return siteEn.services.items.map(item => item.title).join("; ");
}

function sectorsBullet(): string {
  return SECTORS.map(
    s => `${s.name.en} (${countBySector(projectsData, s.id)})`
  ).join(", ");
}

function keyFacts(): string[] {
  return [
    "## Key facts",
    "",
    `- Services: ${servicesBullet()}`,
    `- Sectors (published projects): ${sectorsBullet()}`,
    `- Interior spaces designed: ${countInteriorSpaces(projectsData)}`,
    `- Location: Najaf, Iraq (projects across Iraq)`,
    `- Contact: WhatsApp ${PHONE_DISPLAY} (https://wa.me/${PHONE_E164.replace("+", "")}), email ${EMAIL}`,
    "- Languages: Arabic (ar), English (en)",
    "",
  ];
}

function pageLinks(): string[] {
  return [
    "## Pages",
    "",
    `- [Home (Arabic)](${absoluteUrl(homePath("ar"))})`,
    `- [Home (English)](${absoluteUrl(homePath("en"))})`,
    "",
  ];
}

function projectLines(): string[] {
  return projectsData.map(
    p => `- [${p.title}](${projectUrl(p, "en")}): ${projectMeta(p)}`
  );
}

function header(): string[] {
  return [`# ${SITE_NAME}`, "", summaryLine(), ""];
}

export function buildLlmsTxt(): string {
  return [
    ...header(),
    ...keyFacts(),
    ...pageLinks(),
    "## Projects",
    "",
    ...projectLines(),
    "",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* llms-full.txt                                                       */
/* ------------------------------------------------------------------ */

function projectSection(project: Project): string[] {
  const field = (label: string, value: string | undefined): string[] =>
    value ? [`- ${label}: ${value}`] : [];
  return [
    `### ${project.title}`,
    "",
    `- Arabic title: ${project.titleAr}`,
    `- Code: ${projectCode(project)}`,
    `- Sector: ${sectorName(project.sector)}`,
    ...field("Our role", project.role?.en),
    ...field("In collaboration with", project.collaborator?.en),
    ...field("Location", project.location?.en),
    `- Description: ${project.description}`,
    `- URL (ar): ${projectUrl(project, "ar")}`,
    `- URL (en): ${projectUrl(project, "en")}`,
    "",
  ];
}

function aboutSection(): string[] {
  const about = siteEn.about;
  return [
    "## About",
    "",
    `${about.name} — ${about.role}`,
    "",
    about.bio,
    "",
    `### ${about.experienceTitle}`,
    "",
    ...about.experience.map(
      e => `- ${e.when} · ${e.title}, ${e.org}: ${e.text}`
    ),
    "",
    `### ${about.skillsTitle}`,
    "",
    ...about.skills.map(s => `- ${s}`),
    "",
  ];
}

function credentialsSection(): string[] {
  const cred = siteEn.credentials;
  return [
    `## ${cred.title}`,
    "",
    ...cred.items.map(i => `- ${i.title}, ${i.issuer} (${i.date})`),
    "",
    `### ${cred.moreTitle}`,
    "",
    ...cred.more.map(m => `- ${m}`),
    "",
  ];
}

function servicesSection(): string[] {
  return [
    "## Services",
    "",
    ...siteEn.services.items.flatMap(item => [
      `### ${item.title}`,
      "",
      item.text,
      "",
      ...item.points.map(p => `- ${p}`),
      "",
    ]),
  ];
}

function faqSection(): string[] {
  return [
    "## FAQ",
    "",
    ...siteEn.faq.items.flatMap(item => [`**Q: ${item.q}**`, "", item.a, ""]),
  ];
}

export function buildLlmsFullTxt(): string {
  return [
    ...header(),
    ...keyFacts(),
    ...pageLinks(),
    ...aboutSection(),
    ...servicesSection(),
    ...credentialsSection(),
    ...faqSection(),
    "## Projects",
    "",
    ...projectsData.flatMap(projectSection),
  ].join("\n");
}
