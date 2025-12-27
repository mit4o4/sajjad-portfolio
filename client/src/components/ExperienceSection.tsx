import { useLanguage } from '@/contexts/LanguageContext';
import { Briefcase, Calendar } from 'lucide-react';

const experiences = [
  {
    companyKey: 'experience.items.madina.company',
    positionKey: 'experience.items.madina.position',
    durationKey: 'experience.items.madina.duration',
    descriptionKey: 'experience.items.madina.description',
  },
  {
    companyKey: 'experience.items.wadi.company',
    positionKey: 'experience.items.wadi.position',
    durationKey: 'experience.items.wadi.duration',
    descriptionKey: 'experience.items.wadi.description',
  },
  {
    companyKey: 'experience.items.dar.company',
    positionKey: 'experience.items.dar.position',
    durationKey: 'experience.items.dar.duration',
    descriptionKey: 'experience.items.dar.description',
  },
];

export default function ExperienceSection() {
  const { t } = useLanguage();

  return (
    <section id="experience" className="py-20">
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('experience.title')}
          </h2>
          <p className="text-lg text-foreground/60">{t('experience.subtitle')}</p>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div key={index} className="relative pl-8 md:pl-12">
              {/* Timeline Dot */}
              <div className="absolute left-0 top-0 w-6 h-6 bg-primary rounded-full border-4 border-background"></div>

              {/* Timeline Line */}
              {index !== experiences.length - 1 && (
                <div className="absolute left-2.5 top-6 w-0.5 h-24 bg-border"></div>
              )}

              {/* Content Card */}
              <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {t(exp.positionKey)}
                    </h3>
                    <p className="text-primary font-semibold">{t(exp.companyKey)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/60 text-sm">
                    <Calendar size={16} />
                    {t(exp.durationKey)}
                  </div>
                </div>
                <p className="text-foreground/70">{t(exp.descriptionKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
