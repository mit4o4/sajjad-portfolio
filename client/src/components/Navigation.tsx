import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TEBIM_PRICING_URL, whatsappUrl } from "@/data/contact";
import { homePath } from "@/seo/routes";
import sajjadProfile from "../../public/images/sajjad.png";

interface NavItem {
  key: string;
  href: string;
  external?: boolean;
}

/** Section anchors resolve against the home page of the current language, so they work from project pages too. */
const NAV_ITEMS: NavItem[] = [
  { key: "sectors", href: "#sectors" },
  { key: "projects", href: "#portfolio" },
  { key: "services", href: "#services" },
  { key: "about", href: "#about" },
  { key: "pricing", href: TEBIM_PRICING_URL, external: true },
  { key: "contact", href: "#contact" },
];

function useScrollChrome(barRef: React.RefObject<HTMLElement | null>): boolean {
  const [isSolid, setIsSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      setIsSolid(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [barRef]);
  return isSolid;
}

export default function Navigation() {
  const { t, language, switchHref } = useLanguage();
  const progressRef = useRef<HTMLElement | null>(null);
  const isSolid = useScrollChrome(progressRef);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const home = homePath(language);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const links = NAV_ITEMS.map(item => (
    <a
      key={item.key}
      href={item.external ? item.href : `${home}${item.href}`}
      onClick={() => setIsMenuOpen(false)}
      {...(item.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {t(`site.nav.${item.key}`)}
    </a>
  ));

  return (
    <>
      <div className="tb-progress" aria-hidden="true">
        <i ref={progressRef} />
      </div>
      <header className={`tb-header${isSolid ? " is-solid" : ""}`}>
        <div className="tb-wrap">
          <div className="tb-bar">
            <a className="tb-brand" href={home}>
              <img src={sajjadProfile} alt="" width={36} height={36} />
              <span>
                {t("site.brand.name")}
                <small>{t("site.brand.tagline")}</small>
              </span>
            </a>
            <nav className="tb-nav" aria-label={t("site.nav.label")}>
              {links}
            </nav>
            <a
              className="tb-lang"
              href={switchHref}
              hrefLang={language === "ar" ? "en" : "ar"}
              lang={language === "ar" ? "en" : "ar"}
              aria-label={t("site.nav.switchLanguage")}
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              {language === "ar" ? "EN" : "عربي"}
            </a>
            <a
              className="tb-btn tb-btn--primary"
              href={whatsappUrl(t("site.wa.message"))}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("site.nav.cta")}
            </a>
            <button
              className="tb-menu-btn"
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="tb-mobile-nav"
              aria-label={t("site.nav.menu")}
              onClick={() => setIsMenuOpen(open => !open)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          <nav
            id="tb-mobile-nav"
            className={`tb-mobile-nav${isMenuOpen ? " is-open" : ""}`}
            aria-label={t("site.nav.mobileLabel")}
            hidden={!isMenuOpen}
          >
            {links}
          </nav>
        </div>
      </header>
    </>
  );
}
