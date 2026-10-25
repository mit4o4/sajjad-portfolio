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

/** Pinned section: scrolling wipes the kindergarten from line drawing to final render. */
export default function StorySection() {
  const { t, isRTL } = useLanguage();
  const sectionRef = useRef<HTMLElement | null>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scanRef = useRef<HTMLSpanElement | null>(null);
  const [progress, setProgress] = useState(0);
  const steps: StoryStep[] = t("site.story.steps");

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p = clamp01(-rect.top / (rect.height - window.innerHeight));
      const seg = p * TRANSITIONS;
      layerRefs.current.forEach((layer, i) => {
        if (!layer || i === 0) return;
        const k = clamp01(seg - (i - 1));
        layer.style.clipPath = isRTL
          ? `inset(0 0 0 ${(1 - k) * 100}%)`
          : `inset(0 ${(1 - k) * 100}% 0 0)`;
      });
      const local = seg - Math.min(Math.floor(seg), TRANSITIONS - 1);
      if (scanRef.current) {
        scanRef.current.style.opacity =
          local > 0.02 && local < 0.98 && seg < TRANSITIONS ? "1" : "0";
        scanRef.current.style.insetInlineStart = `${local * 100}%`;
      }
      setProgress(seg);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isRTL]);

  const active = Math.min(TRANSITIONS, Math.round(progress));

  return (
    <section
      ref={sectionRef}
      className="tb-story"
      aria-label={t("site.story.title")}
    >
      <div className="tb-wrap tb-pin">
        <div className="tb-steps">
          <span className="tb-eyebrow">{t("site.story.eyebrow")}</span>
          <h2>{t("site.story.title")}</h2>
          {Array.isArray(steps) &&
            steps.map((step, i) => {
              const fill =
                i < active ? 1 : i === active ? clamp01(progress - i + 1) : 0;
              return (
                <div
                  key={step.title}
                  className={`tb-step${i === active ? " is-on" : ""}`}
                >
                  <span className="tb-no">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <b>{step.title}</b>
                  <p>{step.text}</p>
                  <span className="tb-meter">
                    <i style={{ width: `${fill * 100}%` }} />
                  </span>
                </div>
              );
            })}
        </div>
        <div className="tb-frame tb-stage">
          <span className="tb-badge">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(LAYERS.length).padStart(2, "0")}
          </span>
          {LAYERS.map((src, i) => (
            <div
              key={src}
              className="tb-layer"
              ref={el => {
                layerRefs.current[i] = el;
              }}
              style={
                i === 0
                  ? undefined
                  : {
                      clipPath: isRTL
                        ? "inset(0 0 0 100%)"
                        : "inset(0 100% 0 0)",
                    }
              }
            >
              <img
                src={src}
                alt={Array.isArray(steps) ? (steps[i]?.title ?? "") : ""}
                loading="lazy"
                width={1600}
                height={1200}
              />
            </div>
          ))}
          <span className="tb-scan" ref={scanRef} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
