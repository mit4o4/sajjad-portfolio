import { useLanguage } from "@/contexts/LanguageContext";
import { projectsData } from "@/data/projectsData";
import { SECTORS, countBySector, countInteriorSpaces } from "@/data/taxonomy";
import type { SectorId } from "@/data/types";

/** Asks the portfolio grid to apply a sector filter, then scrolls to it. */
export function requestSectorFilter(sector: SectorId): void {
  window.dispatchEvent(
    new CustomEvent("filter-sector", { detail: { sector } })
  );
  document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
}

export default function SectorsSection() {
  const { t, language } = useLanguage();
  const interiorSpaces = countInteriorSpaces(projectsData);

  return (
    <section id="sectors" className="tb-wrap tb-sec">
      <div className="tb-head">
        <span className="tb-eyebrow">{t("site.sectors.eyebrow")}</span>
        <h2>{t("site.sectors.title")}</h2>
        <p>{t("site.sectors.intro")}</p>
      </div>
      <div className="tb-sectors">
        {SECTORS.map(sector => {
          const isInterior = sector.id === "interior";
          const count = isInterior
            ? interiorSpaces
            : countBySector(projectsData, sector.id);
          const unit = isInterior
            ? t("site.sectors.unitSpaces")
            : t("site.sectors.unitProjects");
          return (
            <button
              key={sector.id}
              type="button"
              className="tb-sector tb-rv"
              onClick={() => requestSectorFilter(sector.id)}
            >
              <div className="tb-frame tb-rv-img">
                <img
                  src={sector.image}
                  alt=""
                  loading="lazy"
                  width={1600}
                  height={1200}
                />
              </div>
              <div className="tb-row">
                <h3>{sector.name[language]}</h3>
                <span className="tb-cnt">
                  {count} {unit}
                </span>
              </div>
              <p>{sector.blurb[language]}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
