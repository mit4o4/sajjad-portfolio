import { useLanguage } from '@/contexts/LanguageContext';
import { Code2, Palette, Zap, Users } from 'lucide-react';

const skillCategories = [
  {
    icon: Code2,
    titleKey: 'skills.categories.bim.title',
    skillsKey: 'skills.categories.bim.skills',
  },
  {
    icon: Palette,
    titleKey: 'skills.categories.design.title',
    skillsKey: 'skills.categories.design.skills',
  },
  {
    icon: Zap,
    titleKey: 'skills.categories.mep.title',
    skillsKey: 'skills.categories.mep.skills',
  },
  {
    icon: Users,
    titleKey: 'skills.categories.supervision.title',
    skillsKey: 'skills.categories.supervision.skills',
  },
];

export default function SkillsSection() {
  const { t } = useLanguage();

  return (
    <section id="skills" className="py-20 bg-secondary/30">
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('skills.title')}
          </h2>
          <p className="text-lg text-foreground/60">{t('skills.subtitle')}</p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            const skillsData = t(category.skillsKey);
            const skills = typeof skillsData === 'string' ? [] : skillsData;

            return (
              <div
                key={index}
                className="bg-card rounded-lg p-6 border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {t(category.titleKey)}
                  </h3>
                </div>

                <div className="space-y-2">
                  {Array.isArray(skills) && skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-foreground/70 text-sm"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
