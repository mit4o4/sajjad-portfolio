import { useLanguage } from "@/contexts/LanguageContext";

/** Typographic partner strip: organisations the studio has worked with (no logos available, so names set as wordmarks). */
export default function PartnersSection() {
  const { t, tList } = useLanguage();
  const partners = tList<string>("site.partners.items");

  return (
    <section className="tb-partners" aria-labelledby="partners-title">
      <div className="tb-wrap">
        <div className="tb-partners-head">
          <span className="tb-eyebrow">{t("site.partners.eyebrow")}</span>
          <h2 id="partners-title">{t("site.partners.title")}</h2>
        </div>
        <ul className="tb-partner-list">
          {partners.map(name => (
            <li key={name} className="tb-rv">
              {name}
            </li>
          ))}
        </ul>
        <p className="tb-partners-more">{t("site.partners.more")}</p>
      </div>
    </section>
  );
}
