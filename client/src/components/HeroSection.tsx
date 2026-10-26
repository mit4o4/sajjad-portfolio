import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { homePath } from "@/seo/routes";
import { useLanguage } from "@/contexts/LanguageContext";
import { projectsData } from "@/data/projectsData";
import { showcase } from "@/data/taxonomy";
import { whatsappUrl } from "@/data/contact";
import { WhatsAppIcon } from "@/components/site/icons";
import { FOUNDER_AVATAR } from "@/data/founder";

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

/**
 * Auto-advancing slideshow. It pauses when the user asks, while hovered/focused,
 * and while the hero is off screen, and it never runs under reduced motion (WCAG 2.2.2).
 */
function useSlideshow(
  count: number,
  barRef: React.RefObject<HTMLElement | null>,
  stageRef: React.RefObject<HTMLElement | null>
) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const elapsedRef = useRef(0);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
      elapsedRef.current = 0;
    },
    [count]
  );

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsVisible(entry.isIntersecting)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stageRef]);

  const isRunning = !isPaused && !isHeld && isVisible;
  useEffect(() => {
    if (
      !isRunning ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      const progress = elapsedRef.current / SLIDE_MS;
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${Math.min(1, progress)})`;
      if (progress >= 1) {
        elapsedRef.current = 0;
        setIndex(i => (i + 1) % count);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count, barRef, isRunning]);

  return { index, goTo, isPaused, setIsPaused, setIsHeld };
}

export default function HeroSection() {
  const { t, language, isRTL } = useLanguage();
  const barRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const { index, goTo, isPaused, setIsPaused, setIsHeld } = useSlideshow(
    SLIDES.length,
    barRef,
    stageRef
  );

  const current = projectsData.find(p => p.id === SLIDES[index].id);
  const title = current ? (isRTL ? current.titleAr : current.title) : "";
  const role = current?.role?.[language] ?? "";

  return (
    <section id="home" className="tb-wrap tb-hero">
      <div className="tb-hero-copy">
        <span className="tb-eyebrow">{t("site.hero.eyebrow")}</span>
        <h1>
          {t("site.hero.title1")}
          <br />
          <span>{t("site.hero.title2")}</span>
        </h1>
        <p className="tb-lede">{t("site.hero.lede")}</p>
        <div className="tb-actions">
          <a
            className="tb-btn tb-btn--primary"
            href={whatsappUrl(t("site.wa.message"))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            {t("site.hero.cta")}
          </a>
          <a
            className="tb-btn tb-btn--line"
            href={`${homePath(language)}#portfolio`}
          >
            {t("site.hero.work")}
          </a>
        </div>
        <a className="tb-founder-line" href={`${homePath(language)}#about`}>
          <img src={FOUNDER_AVATAR} alt="" width={48} height={48} />
          <span>
            <b>{t("site.hero.founderName")}</b>
            <small>{t("site.hero.founderRole")}</small>
          </span>
        </a>
      </div>

      <div className="tb-hero-media">
        <div
          className="tb-frame"
          ref={stageRef}
          onMouseEnter={() => setIsHeld(true)}
          onMouseLeave={() => setIsHeld(false)}
          onFocus={() => setIsHeld(true)}
          onBlur={() => setIsHeld(false)}
        >
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
          <div className="tb-tcard">
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
                onClick={() => setIsPaused(p => !p)}
                aria-pressed={isPaused}
                aria-label={
                  isPaused ? t("site.hero.play") : t("site.hero.pause")
                }
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
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
