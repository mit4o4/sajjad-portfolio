import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const projects = [
  {
    id: 1,
    image: '/images/hotel-project.jpg',
    titleKey: 'portfolio.projects.hotel_supervision.title',
    categoryKey: 'portfolio.projects.hotel_supervision.category',
    descriptionKey: 'portfolio.projects.hotel_supervision.description',
    category: 'supervision',
  },
  {
    id: 2,
    image: '/images/farm-project.jpg',
    titleKey: 'portfolio.projects.farm_design.title',
    categoryKey: 'portfolio.projects.farm_design.category',
    descriptionKey: 'portfolio.projects.farm_design.description',
    category: 'design',
  },
  {
    id: 3,
    image: '/images/abstract-bim.jpg',
    titleKey: 'portfolio.projects.villa_supervision.title',
    categoryKey: 'portfolio.projects.villa_supervision.category',
    descriptionKey: 'portfolio.projects.villa_supervision.description',
    category: 'supervision',
  },
  {
    id: 4,
    image: '/images/commercial-design.jpg',
    titleKey: 'portfolio.projects.commercial_offices.title',
    categoryKey: 'portfolio.projects.commercial_offices.category',
    descriptionKey: 'portfolio.projects.commercial_offices.description',
    category: 'design',
  },
];

export default function PortfolioSection() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { key: 'all', value: 'all' },
    { key: 'design', value: 'design' },
    { key: 'supervision', value: 'supervision' },
    { key: 'hospitality', value: 'hospitality' },
    { key: 'industrial', value: 'industrial' },
  ];

  const filteredProjects =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="portfolio" className="py-20 bg-secondary/30">
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('portfolio.title')}
          </h2>
          <p className="text-lg text-foreground/60">{t('portfolio.subtitle')}</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setActiveCategory(cat.value)}
              className="transition-all"
            >
              {t(`portfolio.categories.${cat.key}`)}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-lg overflow-hidden bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative h-64 md:h-72 overflow-hidden bg-muted">
                <img
                  src={project.image}
                  alt={t(project.titleKey)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                    {t(project.categoryKey)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t(project.titleKey)}
                </h3>
                <p className="text-foreground/60 text-sm mb-4">
                  {t(project.descriptionKey)}
                </p>
                <Button
                  variant="ghost"
                  className="text-primary hover:text-primary/80 p-0 h-auto font-semibold"
                >
                  {t('portfolio.viewProject')} →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
