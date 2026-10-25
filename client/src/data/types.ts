/** Shared content types for the portfolio. Project records live in projectsData.ts. */

export type Language = "ar" | "en";

/** A string in both site languages. */
export interface Bilingual {
  ar: string;
  en: string;
}

export type SectorId =
  | "villa"
  | "complex"
  | "apartments"
  | "education"
  | "fuel"
  | "medical"
  | "dining"
  | "retail"
  | "civic"
  | "interior"
  | "agricultural"
  | "other";

export type ServiceId =
  | "architecture"
  | "visualization"
  | "interior"
  | "bim"
  | "supervision";

export interface ProjectSection {
  name: string;
  nameAr: string;
  images: string[];
  allImages?: string[];
  coordinates?: { lat: number; lng: number };
}

export interface Project {
  id: string;
  title: string;
  titleAr: string;
  image: string;
  /** Legacy field kept for backwards compatibility; use `sector` for filtering. */
  category: string;
  description: string;
  descriptionAr: string;
  year?: number;
  sections?: ProjectSection[];
  allImages?: string[];
  coordinates?: { lat: number; lng: number };

  /** Primary sector used for filters, counts and sector pages. */
  sector?: SectorId;
  /** Secondary sectors (e.g. a store that is also an interior project). */
  alsoIn?: SectorId[];
  services?: ServiceId[];
  /** What we actually did on this project, e.g. "3D design & visualization". */
  role?: Bilingual;
  /** Consultancy / partner credited on the project (never private individuals). */
  collaborator?: Bilingual;
  location?: Bilingual;
  /** Number of distinct interior spaces designed in this project. */
  interiorSpaces?: number;
  /** Alternative design options (e.g. two facade schemes), each with its own images. */
  options?: { label: Bilingual; images: string[] }[];
  /** Shown in the selected-work grid and hero slideshow. */
  featured?: boolean;
  /** URL slug for the project page (ASCII, lowercase, hyphenated). */
  slug?: string;
  /** Previous slugs; their URLs keep working as redirect pages to the current slug. */
  legacySlugs?: string[];
  /** Thumbnail for grids (800px). Falls back to `image`. */
  thumb?: string;
}
