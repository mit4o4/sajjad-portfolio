import { useLanguage } from "@/contexts/LanguageContext";
import { projectsData } from "@/data/projectsData";
import { SECTORS } from "@/data/taxonomy";
import { projectPath } from "@/seo/routes";

/**
 * Complete register of projects grouped by sector. Collapsed for visitors, but always in the
 * HTML so every project page is reachable by an internal link (crawlers and AI agents).
 */
export default function ProjectRegister() {
  const { t, language, isRTL } = useLanguage();
  const groups = SECTORS.map((sector) => ({
    sector,
    projects: projectsData.filter((p) => p.sector === sector.id),
  })).filter((g) => g.projects.length > 0);
  const listed = new Set(groups.flatMap((g) => g.projects.map((p) => p.id)));
  const others = projectsData.filter((p) => !listed.has(p.id));

  return (
    <details className="tb-register">
      <summary>
        {t("site.projects.register")} <span>{projectsData.length}</span>
      </summary>
      <div className="tb-register-grid">
        {groups.map(({ sector, projects }) => (
          <section key={sector.id}>
            <h3>{sector.name[language]}</h3>
            <ul>
              {projects.map((p) => (
                <li key={p.id}>
                  <a href={projectPath(p, language)}>{isRTL ? p.titleAr : p.title}</a>
                  <span className="tb-mono">{p.id}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {others.length > 0 && (
          <section>
            <h3>{t("site.projects.otherSector")}</h3>
            <ul>
              {others.map((p) => (
                <li key={p.id}>
                  <a href={projectPath(p, language)}>{isRTL ? p.titleAr : p.title}</a>
                  <span className="tb-mono">{p.id}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </details>
  );
}
