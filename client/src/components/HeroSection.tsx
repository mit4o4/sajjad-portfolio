import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Reveal from '@/components/Reveal';
import heroBimDesign from '../../public/images/hero-bim-design.jpg';

/** Animate a number from 0 → target with an easeOutCubic curve. */
function useCountUp(target: number, durationMs = 1600): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export default function HeroSection() {
  const { t } = useLanguage();
  const bgRef = useRef<HTMLDivElement | null>(null);

  // Subtle parallax: drift the background image as the hero scrolls away.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (bgRef.current) {
          bgRef.current.style.transform = `translate3d(0, ${window.scrollY * 0.18}px, 0) scale(1.06)`;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const projects = useCountUp(171);
  const years = useCountUp(5);
  const companies = useCountUp(3);
  const stats: Stat[] = [
    { value: projects, suffix: '+', label: 'Projects Completed' },
    { value: years, suffix: '+', label: 'Years Experience' },
    { value: companies, suffix: '', label: 'Major Companies' },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen pt-20 flex items-center overflow-hidden"
    >
      {/* Background image with parallax + layered editorial gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div ref={bgRef} className="absolute inset-0 will-change-transform">
          <img
            src={heroBimDesign}
            alt="BIM Design"
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/85 to-background/30"></div>
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <div className="space-y-7">
            {/* Eyebrow badge */}
            <Reveal as="div" delay={50}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                <span className="eyebrow !text-primary">{t('hero.subtitle')}</span>
              </div>
            </Reveal>

            {/* Main title — Fraunces display */}
            <Reveal as="h1" delay={150} className="text-foreground">
              {t('hero.title')}
            </Reveal>

            {/* Description */}
            <Reveal as="p" delay={350} className="text-lg md:text-xl text-foreground/70 max-w-xl font-light leading-relaxed">
              {t('hero.description')}
            </Reveal>

            {/* CTA Buttons */}
            <Reveal as="div" delay={500} className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 group rounded-none px-7 h-13 hover-lift"
                onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('hero.cta')}
                <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-none px-7 h-13 border-foreground/20 hover:border-foreground/60"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Mail size={20} />
                {t('hero.contact')}
              </Button>
            </Reveal>

            {/* Stats — animated count-up, hairline-separated */}
            <Reveal as="div" delay={650} className="flex flex-wrap gap-x-10 gap-y-6 pt-10 border-t border-border/60 mt-2">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-4xl font-mono font-medium text-primary tabular-nums">
                    {s.value}
                    {s.suffix}
                  </div>
                  <div className="text-xs text-foreground/60 uppercase tracking-widest mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="eyebrow text-foreground/40 !text-[0.6rem]">Scroll</span>
          <svg className="w-5 h-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
