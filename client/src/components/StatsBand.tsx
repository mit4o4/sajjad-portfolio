import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { projectsData } from "@/data/projectsData";
import {
  COUNTER_GROUPS,
  DECLARED_TOTAL_PROJECTS,
  YEARS_OF_PRACTICE,
  countGroup,
  countInteriorSpaces,
} from "@/data/taxonomy";
import { useCountUp } from "@/hooks/useCountUp";

interface StatProps {
  value: number;
  suffix?: string;
  label: string;
  sub: string;
  isLead?: boolean;
  active: boolean;
}

function Stat({ value, suffix, label, sub, isLead, active }: StatProps) {
  const shown = useCountUp(value, active);
  return (
    <div className={`tb-stat${isLead ? " is-lead" : ""}`}>
      <span className="tb-n">
        {shown}
        {suffix && <em>{suffix}</em>}
      </span>
      <span className="tb-l">{label}</span>
      <span className="tb-s">{sub}</span>
    </div>
  );
}

function useInView<T extends Element>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

export default function StatsBand() {
  const { t, language } = useLanguage();
  const [ref, inView] = useInView<HTMLDivElement>();
  const interiorSpaces = countInteriorSpaces(projectsData);

  return (
    <section className="tb-stats" aria-label={t("site.stats.label")}>
      <div className="tb-wrap" ref={ref}>
        <Stat
          isLead
          active={inView}
          value={DECLARED_TOTAL_PROJECTS}
          suffix="+"
          label={t("site.stats.totalLabel")}
          sub={t("site.stats.totalSub").replace(
            "{years}",
            String(YEARS_OF_PRACTICE)
          )}
        />
        {COUNTER_GROUPS.map(group => (
          <Stat
            key={group.key}
            active={inView}
            value={countGroup(projectsData, group.sectors)}
            label={group.label[language]}
            sub={group.sub[language]}
          />
        ))}
        <Stat
          active={inView}
          value={interiorSpaces}
          suffix="+"
          label={t("site.stats.interiorLabel")}
          sub={t("site.stats.interiorSub")}
        />
      </div>
      {/* Category counts come from the published portfolio until the studio supplies full totals. */}
      <p className="tb-wrap tb-stats-note">{t("site.stats.note")}</p>
    </section>
  );
}
