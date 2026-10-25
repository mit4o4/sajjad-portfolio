import { useLanguage } from "@/contexts/LanguageContext";
import { EMAIL, PHONE_DISPLAY, whatsappUrl } from "@/data/contact";
import { WhatsAppIcon } from "@/components/site/icons";

export default function ContactSection() {
  const { t } = useLanguage();

  return (
    <section
      id="contact"
      className="tb-wrap"
      style={{ paddingBottom: "var(--tb-sec)" }}
    >
      <div className="tb-cta tb-rv">
        <div className="tb-txt">
          <span className="tb-eyebrow">{t("site.cta.eyebrow")}</span>
          <h2>{t("site.cta.title")}</h2>
          <p>{t("site.cta.text")}</p>
        </div>
        <div className="tb-act">
          <a
            className="tb-btn tb-btn--wa"
            href={whatsappUrl(t("site.wa.message"))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            {t("site.cta.wa")}
          </a>
          <a className="tb-btn tb-btn--ghost-light" href={`mailto:${EMAIL}`}>
            {t("site.cta.email")}
          </a>
          <span className="tb-ltr">
            {PHONE_DISPLAY} · {EMAIL}
          </span>
        </div>
      </div>
    </section>
  );
}
