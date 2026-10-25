import type { Bilingual, Language, Project, SectorId } from "./types";

const BASE_URL = import.meta.env.BASE_URL;
export const showcase = (name: string): string =>
  `${BASE_URL}images/showcase/${name}`;

/**
 * Headline total declared by the studio (includes projects not yet published online).
 * Everything else on the site is computed from projectsData.
 */
export const DECLARED_TOTAL_PROJECTS = 200;
export const YEARS_OF_PRACTICE = 7;

export interface SectorDef {
  id: SectorId;
  name: Bilingual;
  blurb: Bilingual;
  image: string;
}

/** Display order of sector tiles and filter chips. */
export const SECTORS: SectorDef[] = [
  {
    id: "villa",
    image: showcase("villa-faiz.webp"),
    name: { ar: "فلل سكنية", en: "Private villas" },
    blurb: {
      ar: "واجهات ومخططات وBIM للمنازل الخاصة",
      en: "Facades, plans and BIM for private homes",
    },
  },
  {
    id: "complex",
    image: showcase("complex.webp"),
    name: { ar: "مجمعات سكنية", en: "Residential complexes" },
    blurb: {
      ar: "مخطط عام ونماذج وحدات متكررة",
      en: "Master plans and repeatable unit types",
    },
  },
  {
    id: "education",
    image: showcase("k-a.webp"),
    name: { ar: "رياض أطفال", en: "Kindergartens" },
    blurb: {
      ar: "روضتان، إحداهما بخيارين للواجهة",
      en: "Two schools, one with two facade options",
    },
  },
  {
    id: "fuel",
    image: showcase("fuel2.webp"),
    name: { ar: "محطات وقود", en: "Fuel stations" },
    blurb: {
      ar: "تصميم ثلاثي الأبعاد وإظهار",
      en: "3D design and visualization",
    },
  },
  {
    id: "medical",
    image: showcase("medical.webp"),
    name: { ar: "مجمعات طبية", en: "Medical" },
    blurb: { ar: "عيادات ومراكز صحية", en: "Clinics and health centers" },
  },
  {
    id: "dining",
    image: showcase("resto.webp"),
    name: { ar: "مطاعم ومقاهي", en: "Restaurants & cafés" },
    blurb: {
      ar: "واجهات تجارية وتجربة زبون",
      en: "Storefronts and guest experience",
    },
  },
  {
    id: "retail",
    image: showcase("shop.webp"),
    name: { ar: "محلات ومعارض", en: "Retail & showrooms" },
    blurb: {
      ar: "تصميم داخلي وواجهات للمتاجر",
      en: "Store interiors and storefronts",
    },
  },
  {
    id: "civic",
    image: showcase("gate.webp"),
    name: { ar: "مبانٍ إدارية وحكومية", en: "Civic & administrative" },
    blurb: {
      ar: "منها بوابة ديوان محافظة النجف",
      en: "Including the Najaf Governorate gateway",
    },
  },
  {
    id: "interior",
    image: showcase("int-201.webp"),
    name: { ar: "تصميم داخلي", en: "Interior design" },
    blurb: {
      ar: "صالات، غرف نوم، ضيافة ومطابخ",
      en: "Living rooms, bedrooms, majlis, kitchens",
    },
  },
];

/** Groups used by the headline counter band. */
export const COUNTER_GROUPS: {
  key: string;
  sectors: SectorId[];
  label: Bilingual;
  sub: Bilingual;
}[] = [
  {
    key: "residential",
    sectors: ["villa", "complex", "apartments"],
    label: { ar: "سكني", en: "Residential" },
    sub: { ar: "فلل، مجمعات، شقق", en: "Villas, complexes, apartments" },
  },
  {
    key: "commercial",
    sectors: ["dining", "retail"],
    label: { ar: "تجاري ومطاعم", en: "Commercial & dining" },
    sub: {
      ar: "محلات، معارض، مطاعم ومقاهي",
      en: "Stores, showrooms, restaurants",
    },
  },
  {
    key: "public",
    sectors: ["education", "fuel", "medical", "civic", "agricultural"],
    label: { ar: "مشاريع كبرى وعامة", en: "Large-scale & public" },
    sub: {
      ar: "طبي، روضات، محطات وقود، حكومي",
      en: "Medical, kindergartens, fuel, civic",
    },
  },
];

export const pick = (value: Bilingual, lang: Language): string => value[lang];

export function projectSectors(project: Project): SectorId[] {
  return [project.sector ?? "other", ...(project.alsoIn ?? [])];
}

export function countBySector(
  projects: readonly Project[],
  sector: SectorId
): number {
  return projects.filter(p => projectSectors(p).includes(sector)).length;
}

export function countGroup(
  projects: readonly Project[],
  sectors: readonly SectorId[]
): number {
  return projects.filter(
    p => p.sector !== undefined && sectors.includes(p.sector)
  ).length;
}

/** Interiors are counted per designed space, not per project. */
export function countInteriorSpaces(projects: readonly Project[]): number {
  return projects.reduce((sum, p) => sum + (p.interiorSpaces ?? 0), 0);
}
