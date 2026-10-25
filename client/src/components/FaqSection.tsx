import { useLanguage } from "@/contexts/LanguageContext";

interface FaqItem {
  q: string;
  a: string;
}

/** Visible FAQ: answers real client questions and gives search/AI engines quotable facts. */
export default function FaqSection() {
  const { t } = useLanguage();
  const items: FaqItem[] = t("site.faq.items");

  return (
    <section id="faq" className="tb-wrap tb-sec tb-sec-tight">
      <div className="tb-faq">
        <div className="tb-head">
          <span className="tb-eyebrow">{t("site.faq.eyebrow")}</span>
          <h2>{t("site.faq.title")}</h2>
          <p>{t("site.faq.intro")}</p>
        </div>
        <div className="tb-faq-list">
          {Array.isArray(items) &&
            items.map(item => (
              <details key={item.q}>
                <summary>
                  <span>{item.q}</span>
                  <i aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
        </div>
      </div>
    </section>
  );
}
