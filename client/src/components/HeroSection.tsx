import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { projectsData } from "@/data/projectsData";
import { showcase } from "@/data/taxonomy";
import { whatsappUrl } from "@/data/contact";
import { WhatsAppIcon } from "@/components/site/icons";

/** Hero slides: a curated 4:3 image per flagship project. */
const SLIDES = [
  { id: "00A-0196", image: showcase("k-a.webp") },
  { id: "00A-0115", image: showcase("resto.webp") },
  { id: "00A-0198", image: showcase("fuel2.webp") },
  { id: "00A-0156", image: showcase("villa-faiz.webp") },
  { id: "00A-0085", image: showcase("gate.webp") },
  { id: "00A-0204", image: showcase("int-204.webp") },
];
const SLIDE_MS = 6500;

function useSlideshow(
  count: number,
  barRef: React.RefObject<HTMLElement | null>
) {
  const [index, setIndex] = useState(0);
  const startRef = useRef(performance.now());

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
      startRef.current = performance.now();
    },
    [count]
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const tick = (now: number) => {
      const progress = (now - startRef.current) / SLIDE_MS;
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${Math.min(1, progress)})`;
      if (progress >= 1) {
        startRef.current = now;
        setIndex(i => (i + 1) % count);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count, barRef]);

  return { index, goTo };
}

export default function HeroSection() {
  const { t, language, isRTL } = useLanguage();
  const barRef = useRef<HTMLElement | null>(null);
  const { index, goTo } = useSlideshow(SLIDES.length, barRef);

  const current = projectsData.find(p => p.id === SLIDES[index].id);
  const title = current ? (isRTL ? current.titleAr : current.title) : "";
  const role = current?.role?.[language] ?? "";
  const trust: string[] = t("site.hero.trust");

  return (
    <section id="home" className="tb-wrap tb-hero">
      <div className="tb-hero-copy">
        <span className="tb-eyebrow tb-rv">{t("site.hero.eyebrow")}</span>
        <h1 className="tb-rv">
          {t("site.hero.title1")}
          <br />
          <span>{t("site.hero.title2")}</span>
        </h1>
        <p className="tb-lede tb-rv">{t("site.hero.lede")}</p>
        <div className="tb-actions tb-rv">
          <a
            className="tb-btn tb-btn--primary"
            href={whatsappUrl(t("site.wa.message"))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            {t("site.hero.cta")}
          </a>
          <a className="tb-btn tb-btn--line" href="#portfolio">
            {t("site.hero.work")}
          </a>
        </div>
        <div className="tb-trust tb-rv">
          <span className="tb-mono">{t("site.hero.trustTitle")}</span>
          <ul>
            {Array.isArray(trust) &&
              trust.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="tb-hero-media">
        <div className="tb-frame">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              className={`tb-slide${i === index ? " is-on" : ""}`}
              aria-hidden={i !== index}
            >
              <img
                src={slide.image}
                alt={i === index ? title : ""}
                width={1600}
                height={1200}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
              />
            </div>
          ))}
          <div className="tb-tcard" aria-live="polite">
            <span className="tb-code">{SLIDES[index].id}</span>
            <span>
              <b>{title}</b>
              {role && <span className="tb-role"> · {role}</span>}
            </span>
            <span className="tb-ctrl">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label={t("site.hero.prev")}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label={t("site.hero.next")}
              >
                <ChevronRight size={16} />
              </button>
            </span>
            <span className="tb-bar-track" aria-hidden="true">
              <i ref={barRef} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
