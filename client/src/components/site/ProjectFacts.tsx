import { useLanguage } from "@/contexts/LanguageContext";
import { SECTORS } from "@/data/taxonomy";
import type { Project } from "@/data/types";

/** Definition list of a project's verifiable facts; empty rows are omitted. */
export default function ProjectFacts({ project }: { project: Project }) {
  const { t, language } = useLanguage();
  const rows: [string, string | undefined][] = [
    [t("site.dialog.code"), project.id],
    [t("site.dialog.sector"), SECTORS.find((s) => s.id === project.sector)?.name[language]],
    [t("site.dialog.role"), project.role?.[language]],
    [t("site.dialog.collaborator"), project.collaborator?.[language]],
    [t("site.dialog.location"), project.location?.[language]],
    [t("site.dialog.spaces"), project.interiorSpaces ? String(project.interiorSpaces) : undefined],
  ];
  return (
    <dl className="tb-facts">
      {rows
        .filter(([, value]) => Boolean(value))
        .map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
    </dl>
  );
}
