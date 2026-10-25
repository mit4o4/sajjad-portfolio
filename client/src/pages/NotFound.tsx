import { useLanguage } from "@/contexts/LanguageContext";
import { homePath } from "@/seo/routes";

export default function NotFound() {
  const { t, language } = useLanguage();
  return (
    <section
      className="tb-wrap tb-sec"
      style={{
        minHeight: "50vh",
        display: "grid",
        alignContent: "center",
        gap: 16,
      }}
    >
      <span className="tb-eyebrow">404</span>
      <h1>{t("site.notFound.title")}</h1>
      <p style={{ color: "var(--tb-ink-2)" }}>{t("site.notFound.text")}</p>
      <div className="tb-actions">
        <a className="tb-btn tb-btn--primary" href={homePath(language)}>
          {t("site.notFound.home")}
        </a>
        <a
          className="tb-btn tb-btn--line"
          href={`${homePath(language)}#portfolio`}
        >
          {t("site.notFound.projects")}
        </a>
      </div>
    </section>
  );
}
