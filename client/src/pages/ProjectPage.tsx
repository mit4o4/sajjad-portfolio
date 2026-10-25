import { useLanguage } from "@/contexts/LanguageContext";
import { projectsData } from "@/data/projectsData";
import { SECTORS, projectSectors } from "@/data/taxonomy";
import { whatsappUrl } from "@/data/contact";
import type { Project } from "@/data/types";
import { homePath, projectPath } from "@/seo/routes";
import Gallery from "@/components/site/Gallery";
import ProjectFacts from "@/components/site/ProjectFacts";
import { WhatsAppIcon } from "@/components/site/icons";
import ContactSection from "@/components/ContactSection";

const RELATED_COUNT = 3;

function relatedProjects(project: Project): Project[] {
  const sectors = projectSectors(project);
  const sameSector = projectsData.filter((p) => p.id !== project.id && projectSectors(p).some((s) => sectors.includes(s)));
  const ranked = [...sameSector.filter((p) => p.featured), ...sameSector.filter((p) => !p.featured)];
  return ranked.slice(0, RELATED_COUNT);
}

function RelatedCard({ project }: { project: Project }) {
  const { language, isRTL } = useLanguage();
  const sectorName = SECTORS.find((s) => s.id === project.sector)?.name[language];
  return (
    <a className="tb-card" href={projectPath(project, language)}>
      <div className="tb-frame">
        <img src={project.thumb ?? project.image} alt="" loading="lazy" decoding="async" width={800} height={600} />
      </div>
      <div className="tb-top">
        <h3>{isRTL ? project.titleAr : project.title}</h3>
        <span className="tb-mono">{project.id}</span>
      </div>
      {sectorName && <span className="tb-meta">{sectorName}</span>}
    </a>
  );
}

/** Indexable page for one project: gallery, verifiable facts, related work and a contact path. */
export default function ProjectPage({ project }: { project: Project }) {
  const { t, language, isRTL } = useLanguage();
  const title = isRTL ? project.titleAr : project.title;
  const description = isRTL ? project.descriptionAr : project.description;
  const sector = SECTORS.find((s) => s.id === project.sector);
  const similarMessage = t("site.dialog.similarMessage").replace("{title}", title).replace("{code}", project.id);
  const related = relatedProjects(project);
  const home = homePath(language);

  return (
    <>
      <article className="tb-wrap tb-project">
        <nav className="tb-crumbs" aria-label={t("site.project.breadcrumb")}>
          <a href={home}>{t("site.project.home")}</a>
          <span aria-hidden="true">/</span>
          <a href={`${home}#portfolio`}>{t("site.project.projects")}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>

        <header className="tb-project-head">
          <span className="tb-eyebrow">
            {sector?.name[language]} · {project.id}
          </span>
          <h1>{title}</h1>
          {description && <p className="tb-lede">{description}</p>}
          <div className="tb-tags">
            {project.role && <span className="tb-tag tb-tag--role">{project.role[language]}</span>}
            {project.collaborator && (
              <span className="tb-tag tb-tag--collab">
                {t("site.projects.with")} {project.collaborator[language]}
              </span>
            )}
          </div>
        </header>

        <div className="tb-project-body">
          <div className="tb-project-media">
            <Gallery project={project} />
          </div>
          <aside className="tb-project-aside">
            <h2>{t("site.project.factsTitle")}</h2>
            <ProjectFacts project={project} />
            <a className="tb-btn tb-btn--primary" href={whatsappUrl(similarMessage)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              {t("site.dialog.similar")}
            </a>
            <a className="tb-btn tb-btn--line" href={`${home}#portfolio`}>
              {t("site.project.back")}
            </a>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="tb-sec" aria-labelledby="related-title">
            <div className="tb-head">
              <h2 id="related-title">{t("site.project.related")}</h2>
            </div>
            <div className="tb-grid">
              {related.map((p) => (
                <RelatedCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}
      </article>
      <ContactSection />
    </>
  );
}
