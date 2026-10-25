import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { showcase } from "@/data/taxonomy";

const LAYERS = ["s1.webp", "s2.webp", "s3.webp", "s4.webp"].map(showcase);
const TRANSITIONS = LAYERS.length - 1;

interface StoryStep {
  title: string;
  text: string;
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const hiddenClip = (isRTL: boolean): string => (isRTL ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)");

/**
 * Pinned section: scrolling wipes the kindergarten from line drawing to final render.
 * Scroll work is done imperatively; React state only changes when the active step changes.
 */
export default function StorySection() {
  const { t, tList, isRTL } = useLanguage();
  const sectionRef = useRef<HTMLElement | null>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const meterRefs = useRef<(HTMLElement | null)[]>([]);
  const scanRef = useRef<HTMLSpanElement | null>(null);
  const [active, setActive] = useState(0);
  const steps = tList<StoryStep>("site.story.steps");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const seg = clamp01(-rect.top / span) * TRANSITIONS;
      layerRefs.current.forEach((layer, i) => {
        if (!layer || i === 0) return;
        const k = clamp01(seg - (i - 1));
        layer.style.clipPath = isRTL ? `inset(0 0 0 ${(1 - k) * 100}%)` : `inset(0 ${(1 - k) * 100}% 0 0)`;
      });
      const current = Math.min(TRANSITIONS, Math.round(seg));
      meterRefs.current.forEach((meter, i) => {
        if (!meter) return;
        const fill = i < current ? 1 : i === current ? clamp01(seg - i + 1) : 0;
        meter.style.width = `${fill * 100}%`;
      });
      const local = seg - Math.min(Math.floor(seg), TRANSITIONS - 1);
      if (scanRef.current) {
        scanRef.current.style.opacity = local > 0.02 && local < 0.98 && seg < TRANSITIONS ? "1" : "0";
        scanRef.current.style.insetInlineStart = `${local * 100}%`;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [isRTL]);

  return (
    <section ref={sectionRef} className="tb-story" aria-label={t("site.story.title")}>
      <div className="tb-wrap tb-pin">
        <div className="tb-steps">
          <span className="tb-eyebrow">{t("site.story.eyebrow")}</span>
          <h2>{t("site.story.title")}</h2>
          {steps.map((step, i) => (
            <div key={step.title} className={`tb-step${i === active ? " is-on" : ""}`}>
              <span className="tb-no">{String(i + 1).padStart(2, "0")}</span>
              <b>{step.title}</b>
              <p>{step.text}</p>
              <span className="tb-meter">
                <i
                  ref={(el) => {
                    meterRefs.current[i] = el;
                  }}
                />
              </span>
            </div>
          ))}
        </div>
        <div className="tb-frame tb-stage" role="img" aria-label={steps[active]?.title ?? t("site.story.title")}>
          <span className="tb-badge" aria-hidden="true">
            {String(active + 1).padStart(2, "0")} / {String(LAYERS.length).padStart(2, "0")}
          </span>
          {LAYERS.map((src, i) => (
            <div
              key={src}
              className="tb-layer"
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              style={i === 0 ? undefined : { clipPath: hiddenClip(isRTL) }}
            >
              <img src={src} alt="" loading="lazy" decoding="async" width={1600} height={1200} />
            </div>
          ))}
          <span className="tb-scan" ref={scanRef} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
