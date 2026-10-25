/**
 * Per-page <head> data: title, description, canonical, hreflang, Open Graph and JSON-LD.
 * Pure functions (no DOM) so the prerender step and the browser share one implementation.
 */
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";
import type { Language, Project } from "@/data/types";
import { SECTORS, DECLARED_TOTAL_PROJECTS, showcase } from "@/data/taxonomy";
import { EMAIL, PHONE_E164 } from "@/data/contact";
import { SITE_URL, absoluteUrl, alternatePath, homePath, type Route } from "./routes";

export interface HeadData {
  lang: Language;
  dir: "rtl" | "ltr";
  title: string;
  description: string;
  canonical: string;
  alternates: { hreflang: string; href: string }[];
  ogType: "website" | "article";
  ogImage: string;
  ogLocale: string;
  jsonLd: Record<string, unknown>;
  noindex?: boolean;
}

const MAX_DESCRIPTION = 160;
const STUDIO_ID = `${SITE_URL}/#studio`;
const PERSON_ID = `${SITE_URL}/#sajjad`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SOCIAL_PROFILES = [
  "https://www.linkedin.com/in/sajjad-abdulhamead/",
  "https://instagram.com/te.bim",
  "https://www.facebook.com/TeBIM.Design",
  "https://github.com/mit4o4",
];

type SiteCopy = (typeof ar)["site"];
const COPY: Record<Language, SiteCopy> = { ar: ar.site, en: en.site as SiteCopy };

const HOME_TITLE: Record<Language, string> = {
  ar: "سجاد عبد الحميد | تصميم معماري وBIM وإشراف تنفيذ في النجف — TeBIM",
  en: "Sajjad Abdulhameed | Architecture, BIM & Construction Supervision in Najaf — TeBIM",
};

function truncate(text: string, max = MAX_DESCRIPTION): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,،.]+\S*$/, "")}…`;
}

function abs(pathOrUrl: string): string {
  return pathOrUrl.startsWith("http") ? pathOrUrl : absoluteUrl(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`);
}

export function projectTitle(project: Project, lang: Language): string {
  return lang === "ar" ? project.titleAr : project.title;
}

export function projectDescription(project: Project, lang: Language): string {
  const base = lang === "ar" ? project.descriptionAr : project.description;
  const role = project.role?.[lang];
  const sector = SECTORS.find((s) => s.id === project.sector)?.name[lang];
  const parts = [base, role && (lang === "ar" ? `دورنا: ${role}` : `Our role: ${role}`), project.location?.[lang]];
  const text = parts.filter(Boolean).join(lang === "ar" ? ". " : ". ");
  return text || `${projectTitle(project, lang)}${sector ? ` — ${sector}` : ""}`;
}

function studioNode(lang: Language) {
  const services = COPY[lang].services.items;
  return {
    "@type": ["ProfessionalService", "Organization"],
    "@id": STUDIO_ID,
    name: "TeBIM",
    alternateName: lang === "ar" ? "سجاد عبد الحميد — تصميم معماري وBIM" : "Sajjad Abdulhameed — Architecture & BIM",
    url: SITE_URL,
    image: abs(showcase("k-a.webp")),
    telephone: PHONE_E164,
    email: EMAIL,
    founder: { "@id": PERSON_ID },
    address: { "@type": "PostalAddress", addressLocality: lang === "ar" ? "النجف" : "Najaf", addressCountry: "IQ" },
    areaServed: { "@type": "Country", name: lang === "ar" ? "العراق" : "Iraq" },
    knowsAbout: ["Architectural design", "BIM", "Revit", "Interior design", "Construction supervision", "3D visualization"],
    sameAs: SOCIAL_PROFILES,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: COPY[lang].services.title,
      itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title, description: s.text } })),
    },
  };
}

function personNode(lang: Language) {
  const about = COPY[lang].about;
  const credentials = COPY[lang].credentials.items;
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: about.name,
    jobTitle: about.role,
    description: about.bio,
    worksFor: { "@id": STUDIO_ID },
    alumniOf: { "@type": "CollegeOrUniversity", name: lang === "ar" ? "جامعة الكوفة" : "University of Kufa" },
    hasCredential: credentials.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.title,
      credentialCategory: c.kind === "degree" ? "degree" : "certificate",
      recognizedBy: { "@type": "Organization", name: c.issuer },
    })),
    sameAs: SOCIAL_PROFILES.slice(0, 1),
  };
}

function websiteNode() {
  return { "@type": "WebSite", "@id": WEBSITE_ID, url: SITE_URL, name: "TeBIM", inLanguage: ["ar", "en"], publisher: { "@id": STUDIO_ID } };
}

function faqNode(lang: Language) {
  return {
    "@type": "FAQPage",
    mainEntity: COPY[lang].faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function projectNodes(project: Project, route: Route) {
  const { lang } = route;
  const url = absoluteUrl(route.path);
  const images = (project.allImages?.length ? project.allImages : [project.image]).slice(0, 8).map(abs);
  const sector = SECTORS.find((s) => s.id === project.sector)?.name[lang];
  const work = {
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    name: projectTitle(project, lang),
    description: projectDescription(project, lang),
    url,
    image: images,
    inLanguage: lang,
    identifier: project.id,
    genre: sector,
    creator: { "@id": PERSON_ID },
    publisher: { "@id": STUDIO_ID },
    isPartOf: { "@id": WEBSITE_ID },
    ...(project.collaborator ? { contributor: { "@type": "Organization", name: project.collaborator[lang] } } : {}),
    ...(project.location ? { locationCreated: { "@type": "Place", name: project.location[lang] } } : {}),
  };
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : "Home", item: absoluteUrl(homePath(lang)) },
      { "@type": "ListItem", position: 2, name: lang === "ar" ? "المشاريع" : "Projects", item: `${absoluteUrl(homePath(lang))}#portfolio` },
      { "@type": "ListItem", position: 3, name: projectTitle(project, lang), item: url },
    ],
  };
  return [work, breadcrumb];
}

export function buildHead(route: Route): HeadData {
  const { lang } = route;
  const alternates = [
    { hreflang: "ar", href: absoluteUrl(alternatePath(route, "ar")) },
    { hreflang: "en", href: absoluteUrl(alternatePath(route, "en")) },
    { hreflang: "x-default", href: absoluteUrl(alternatePath(route, "ar")) },
  ];
  const base = {
    lang,
    dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const),
    canonical: absoluteUrl(route.path),
    alternates,
    ogLocale: lang === "ar" ? "ar_IQ" : "en_US",
  };

  if (route.kind === "project" && route.project) {
    const project = route.project;
    const sector = SECTORS.find((s) => s.id === project.sector)?.name[lang];
    return {
      ...base,
      title: `${projectTitle(project, lang)}${sector ? ` — ${sector}` : ""} | TeBIM`,
      description: truncate(projectDescription(project, lang)),
      ogType: "article",
      ogImage: abs(project.image),
      jsonLd: { "@context": "https://schema.org", "@graph": [studioNode(lang), personNode(lang), websiteNode(), ...projectNodes(project, route)] },
    };
  }

  if (route.kind === "notFound") {
    return {
      ...base,
      title: lang === "ar" ? "الصفحة غير موجودة | TeBIM" : "Page not found | TeBIM",
      description: COPY[lang].hero.lede,
      ogType: "website",
      ogImage: abs(showcase("k-a.webp")),
      jsonLd: { "@context": "https://schema.org", "@graph": [websiteNode()] },
      noindex: true,
    };
  }

  return {
    ...base,
    title: HOME_TITLE[lang],
    description: truncate(COPY[lang].hero.lede.replace("200", String(DECLARED_TOTAL_PROJECTS))),
    ogType: "website",
    ogImage: abs(showcase("k-a.webp")),
    jsonLd: { "@context": "https://schema.org", "@graph": [studioNode(lang), personNode(lang), websiteNode(), faqNode(lang)] },
  };
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Serialises head data to HTML tags for the prerendered page. */
export function headToHtml(head: HeadData): string {
  // Error pages must not declare a canonical URL or language alternates.
  const indexable = !head.noindex;
  const tags = [
    `<title>${escapeAttr(head.title)}</title>`,
    `<meta name="description" content="${escapeAttr(head.description)}" />`,
    ...(indexable ? [`<link rel="canonical" href="${head.canonical}" />`] : []),
    `<meta name="robots" content="${indexable ? "index, follow, max-image-preview:large, max-snippet:-1" : "noindex, follow"}" />`,
    ...(indexable ? head.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`) : []),
    `<meta property="og:type" content="${head.ogType}" />`,
    `<meta property="og:site_name" content="TeBIM" />`,
    `<meta property="og:title" content="${escapeAttr(head.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(head.description)}" />`,
    `<meta property="og:url" content="${head.canonical}" />`,
    `<meta property="og:image" content="${head.ogImage}" />`,
    `<meta property="og:locale" content="${head.ogLocale}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(head.description)}" />`,
    `<meta name="twitter:image" content="${head.ogImage}" />`,
    `<script type="application/ld+json">${JSON.stringify(head.jsonLd).replace(/</g, "\\u003c")}</script>`,
  ];
  return tags.join("\n    ");
}
