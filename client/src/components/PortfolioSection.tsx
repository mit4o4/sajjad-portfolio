import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { projectsData } from "@/data/projectsData";
import { SECTORS, projectSectors } from "@/data/taxonomy";
import type { Project, SectorId } from "@/data/types";
import ProjectDialog from "@/components/site/ProjectDialog";
import { projectPath } from "@/seo/routes";
import ProjectRegister from "@/components/site/ProjectRegister";

type Filter = SectorId | "all";

/** Curated order for the selected-work grid: strongest, most varied work first. */
const FEATURED_ORDER = [
  "00A-0196",
  "00A-0085",
  "00A-0198",
  "00A-0115",
  "00A-0094",
  "00A-0190",
  "00A-0156",
  "00A-0195",
  "00A-0182",
  "00A-0179",
  "00A-0189",
  "00A-0204",
];
const featuredRank = (p: Project): number => {
  const i = FEATURED_ORDER.indexOf(p.id);
  return i === -1 ? FEATURED_ORDER.length : i;
};
const FEATURED = projectsData
  .filter(p => p.featured)
  .sort((a, b) => featuredRank(a) - featuredRank(b));
const NOT_FEATURED = projectsData.filter(p => !p.featured);

interface CardProps {
  project: Project;
  onOpen: (project: Project) => void;
}

function ProjectCard({ project, onOpen }: CardProps) {
  const { t, language, isRTL } = useLanguage();
  const [showOptionB, setShowOptionB] = useState(false);
  const title = isRTL ? project.titleAr : project.title;
  const sectorName = SECTORS.find(s => s.id === project.sector)?.name[language];
  const meta = [project.location?.[language], sectorName]
    .filter(Boolean)
    .join(" · ");
  const optionB = project.options?.[1]?.images[0];

  return (
    <article className="tb-card tb-rv" onClick={() => onOpen(project)}>
      <div className={`tb-frame tb-rv-img${showOptionB ? " show-b" : ""}`}>
        {project.options && optionB && (
          <span
            className="tb-opts"
            role="group"
            aria-label={t("site.projects.options")}
            onClick={e => e.stopPropagation()}
          >
            {project.options.map((option, i) => (
              <button
                key={option.label.en}
                type="button"
                aria-pressed={showOptionB === (i === 1)}
                onClick={() => setShowOptionB(i === 1)}
              >
                {option.label[language]}
              </button>
            ))}
          </span>
        )}
        <img
          src={project.thumb ?? project.image}
          alt=""
          loading="lazy"
          width={800}
          height={600}
          draggable={false}
        />
        {optionB && (
          <img
            className="tb-alt"
            src={optionB}
            alt=""
            loading="lazy"
            draggable={false}
          />
        )}
      </div>
      <div className="tb-top">
        <h3>
          {/* Real link for crawlers and new-tab users; a plain click opens the quick-look dialog. */}
          <a
            className="tb-card-link"
            href={projectPath(project, language)}
            onClick={e => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              e.stopPropagation();
              onOpen(project);
            }}
          >
            {title}
          </a>
        </h3>
        <span className="tb-mono">{project.id}</span>
      </div>
      {meta && <span className="tb-meta">{meta}</span>}
      <div className="tb-tags">
        {project.role && (
          <span className="tb-tag tb-tag--role">{project.role[language]}</span>
        )}
        {project.collaborator && (
          <span className="tb-tag tb-tag--collab">
            {t("site.projects.with")} {project.collaborator[language]}
          </span>
        )}
      </div>
    </article>
  );
}

/** Opens a project from map markers (`open-project`) and applies sector filters requested by the sector tiles. */
function useExternalOpen(
  open: (project: Project, image?: number) => void,
  setFilter: (f: Filter) => void
) {
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string; imageIndex?: number }>)
        .detail;
      const project = projectsData.find(p => p.id === detail?.id);
      if (project) open(project, detail?.imageIndex ?? 0);
    };
    const onFilter = (e: Event) => {
      const sector = (e as CustomEvent<{ sector?: SectorId }>).detail?.sector;
      if (sector) setFilter(sector);
    };
    window.addEventListener("open-project", onOpen);
    window.addEventListener("filter-sector", onFilter);
    return () => {
      window.removeEventListener("open-project", onOpen);
      window.removeEventListener("filter-sector", onFilter);
    };
  }, [open, setFilter]);
}

export default function PortfolioSection() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<{
    project: Project;
    image: number;
  } | null>(null);

  const open = useMemo(
    () =>
      (project: Project, image = 0) =>
        setSelected({ project, image }),
    []
  );
  useExternalOpen(open, setFilter);

  const filters = useMemo(() => {
    const present = SECTORS.filter(s =>
      projectsData.some(p => projectSectors(p).includes(s.id))
    );
    return [
      {
        id: "all" as Filter,
        label: t("site.projects.all"),
        count: projectsData.length,
      },
      ...present.map(s => ({
        id: s.id as Filter,
        label: s.name[language],
        count: projectsData.filter(p => projectSectors(p).includes(s.id))
          .length,
      })),
    ];
  }, [language, t]);

  const visible = useMemo(() => {
    if (filter !== "all")
      return projectsData.filter(p => projectSectors(p).includes(filter));
    return showAll ? [...FEATURED, ...NOT_FEATURED] : FEATURED;
  }, [filter, showAll]);

  return (
    <section id="portfolio" className="tb-wrap tb-sec">
      <div className="tb-head">
        <span className="tb-eyebrow">{t("site.projects.eyebrow")}</span>
        <h2>{t("site.projects.title")}</h2>
        <p>{t("site.projects.intro")}</p>
      </div>
      <div
        className="tb-filters"
        role="group"
        aria-label={t("site.projects.filterLabel")}
      >
        {filters.map(f => (
          <button
            key={f.id}
            type="button"
            className="tb-chip"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span>{f.count}</span>
          </button>
        ))}
      </div>
      <div className="tb-grid">
        {visible.map(project => (
          <ProjectCard key={project.id} project={project} onOpen={open} />
        ))}
      </div>
      {filter === "all" && (
        <div className="tb-more">
          <button
            type="button"
            className="tb-btn tb-btn--line"
            onClick={() => setShowAll(v => !v)}
          >
            {showAll
              ? t("site.projects.less")
              : t("site.projects.more").replace(
                  "{count}",
                  String(projectsData.length)
                )}
          </button>
        </div>
      )}
      <ProjectRegister />
      {selected && (
        <ProjectDialog
          key={`${selected.project.id}-${selected.image}`}
          project={selected.project}
          initialImage={selected.image}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
