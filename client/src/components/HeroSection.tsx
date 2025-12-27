import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const { t, isRTL } = useLanguage();

  return (
    <section
      id="home"
      className="relative min-h-screen pt-20 flex items-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-bim-design.jpg"
          alt="BIM Design"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/50"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-2xl">
          <div className="space-y-6 fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span className="text-sm font-medium text-primary">
                {t('hero.subtitle')}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              {t('hero.title')}
            </h1>

            {/* Description */}
            <p className="text-lg text-foreground/70 max-w-xl">
              {t('hero.description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={() => {
                  const element = document.getElementById('portfolio');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('hero.cta')}
                <ArrowRight size={20} />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  const element = document.getElementById('contact');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Mail size={20} />
                {t('hero.contact')}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary">171+</div>
                <div className="text-sm text-foreground/60">Projects Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">5+</div>
                <div className="text-sm text-foreground/60">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">3</div>
                <div className="text-sm text-foreground/60">Major Companies</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-foreground/50 uppercase tracking-widest">
            Scroll
          </span>
          <svg
            className="w-5 h-5 text-foreground/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
