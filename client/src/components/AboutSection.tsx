import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, Linkedin, Github } from 'lucide-react';
import sajjadProfile from '../../public/images/sajjad.png';

export default function AboutSection() {
  const { t } = useLanguage();

  const highlights = [
    'about.expertise',
    'about.education',
    'about.interests',
  ];

  return (
    <section id="about" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative flex justify-center">
            <div className="relative w-80 h-80">
              <img
                src={sajjadProfile}
                alt="About"
                className="w-full h-full rounded-full shadow-lg object-cover border-4 border-primary/20"
              />
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-primary/20 rounded-full -z-10"></div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              {t('about.title')}
            </h2>

            <p className="text-lg text-foreground/70 leading-relaxed">
              {t('about.intro')}
            </p>

            {/* Highlights */}
            <div className="space-y-4">
              {highlights.map((key, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="text-primary shrink-0 mt-1" size={20} />
                  <p className="text-foreground/70">{t(key)}</p>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-4">
              <a
                href={t('about.linkedin')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href={t('about.github')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div>
                <div className="text-2xl font-bold text-primary">171+</div>
                <p className="text-sm text-foreground/60">Projects</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">5+</div>
                <p className="text-sm text-foreground/60">Years</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">6</div>
                <p className="text-sm text-foreground/60">Certifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
