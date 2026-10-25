import { Facebook, Github, Instagram, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { whatsappUrl } from "@/data/contact";
import { WhatsAppIcon } from "@/components/site/icons";

const SOCIAL_LINKS = [
  { icon: Instagram, href: "https://instagram.com/te.bim", label: "Instagram" },
  {
    icon: Facebook,
    href: "https://www.facebook.com/TeBIM.Design",
    label: "Facebook",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/sajjad-abdulhamead/",
    label: "LinkedIn",
  },
  { icon: Github, href: "https://github.com/mit4o4", label: "GitHub" },
];

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <>
      <footer className="tb-footer">
        <div className="tb-wrap">
          <span>
            © {year} {t("site.footer.rights")}
          </span>
          <nav aria-label={t("site.footer.social")}>
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </nav>
          <span>{t("site.footer.place")}</span>
        </div>
      </footer>
      <a
        className="tb-wa-float"
        href={whatsappUrl(t("site.wa.message"))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <WhatsAppIcon />
      </a>
    </>
  );
}
