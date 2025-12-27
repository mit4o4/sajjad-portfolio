import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { projectsData } from '@/data/projectsData';

export default function PortfolioSection() {
  const { t, isRTL } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showMore, setShowMore] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof projectsData[0] | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Auto-rotate images every 3 seconds when modal is open
  useEffect(() => {
    if (!selectedProject) return;

    const interval = setInterval(() => {
      const images = selectedProject.allImages || [selectedProject.image];
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedProject]);

  // Handle image load
  const handleImageLoad = (imageSrc: string) => {
    setLoadedImages((prev) => new Set([...prev, imageSrc]));
  };

  // Reverse projects order (newest first)
  const reversedProjects = [...projectsData].reverse();

  const categories = [
    { key: 'all', value: 'all' },
    { key: 'design', value: 'design' },
    { key: 'supervision', value: 'supervision' },
    { key: 'hospitality', value: 'hospitality' },
    { key: 'industrial', value: 'industrial' },
  ];

  const filteredProjects =
    activeCategory === 'all'
      ? reversedProjects
      : reversedProjects.filter((p: typeof projectsData[0]) => p.category === activeCategory);

  const displayedProjects = showMore ? filteredProjects : filteredProjects.slice(0, 8);
  const hasMore = filteredProjects.length > 8;

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
              onClick={() => {
                setActiveCategory(cat.value);
                setShowMore(false);
              }}
              className="transition-all"
            >
              {t(`portfolio.categories.${cat.key}`)}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {displayedProjects.map((project: typeof projectsData[0]) => (
            <div
              key={project.id}
              className="group rounded-lg overflow-hidden bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-muted select-none pointer-events-none">
                {!loadedImages.has(project.image) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
                )}
                <img
                  src={project.image}
                  alt={isRTL ? project.titleAr : project.title}
                  className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 select-none pointer-events-none ${
                    loadedImages.has(project.image) ? 'opacity-100' : 'opacity-0'
                  }`}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  loading="lazy"
                  onLoad={() => handleImageLoad(project.image)}
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                    {project.id}
                  </span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
                  {isRTL ? project.titleAr : project.title}
                </h3>
                <p className="text-foreground/60 text-xs mb-3 line-clamp-2">
                  {isRTL ? project.descriptionAr : project.description}
                </p>
                <Button
                  onClick={() => {
                    setSelectedProject(project);
                    setExpandedSection(null);
                  }}
                  variant="ghost"
                  className="text-primary hover:text-primary/80 p-0 h-auto font-semibold text-xs w-auto"
                >
                  View →
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {hasMore && !showMore && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowMore(true)}
              size="lg"
              className="px-8"
            >
              Show More Projects ({filteredProjects.length - 8} remaining)
            </Button>
          </div>
        )}

        {showMore && hasMore && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowMore(false)}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Show Less
            </Button>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg max-w-5xl w-full my-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card rounded-t-lg">
              <div>
                <p className="text-sm text-primary font-semibold uppercase">{selectedProject.id}</p>
                <h3 className="text-2xl font-bold text-foreground">
                  {isRTL ? selectedProject.titleAr : selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setExpandedSection(null);
                }}
                className="p-2 hover:bg-secondary rounded-lg transition-colors shrink-0"
              >
                <X size={24} className="text-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-150px)] overflow-y-auto">
              <p className="text-foreground/70 mb-6">
                {isRTL ? selectedProject.descriptionAr : selectedProject.description}
              </p>

              {/* If has sections, show expandable sections */}
              {selectedProject.sections && selectedProject.sections.length > 0 ? (
                <div className="space-y-4">
                  {selectedProject.sections.map((section: typeof projectsData[0]['sections'][0]) => (
                    <div key={section.nameAr} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === section.nameAr ? null : section.nameAr
                          )
                        }
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                      >
                        <h4 className="text-lg font-semibold text-foreground">
                          {isRTL ? section.nameAr : section.name}
                        </h4>
                        {expandedSection === section.nameAr ? (
                          <ChevronUp className="text-primary shrink-0" />
                        ) : (
                          <ChevronDown className="text-primary shrink-0" />
                        )}
                      </button>

                      {expandedSection === section.nameAr && (
                        <div className="px-6 py-6 bg-secondary/30 border-t border-border">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {section.images.map((image: string, idx: number) => (
                              <div
                                key={idx}
                                className="aspect-video rounded-lg overflow-hidden bg-muted group cursor-pointer select-none relative"
                              >
                                {!loadedImages.has(image) && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse z-10" />
                                )}
                                <img
                                  src={image}
                                  alt={`${section.name} ${idx + 1}`}
                                  className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-300 select-none pointer-events-none ${
                                    loadedImages.has(image) ? 'opacity-100' : 'opacity-0'
                                  }`}
                                  draggable={false}
                                  onContextMenu={(e) => e.preventDefault()}
                                  loading="lazy"
                                  onLoad={() => handleImageLoad(image)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // If no sections, show carousel of images that auto-rotate
                <div className="space-y-4">
                  {/* Main carousel image */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group select-none pointer-events-none">
                    {!loadedImages.has((selectedProject.allImages || [selectedProject.image])[currentImageIndex]) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse z-10" />
                    )}
                    <img
                      src={
                        (selectedProject.allImages || [selectedProject.image])[currentImageIndex]
                      }
                      alt={`Gallery ${currentImageIndex + 1}`}
                      className={`w-full h-full object-cover transition-all duration-500 select-none pointer-events-none ${
                        loadedImages.has((selectedProject.allImages || [selectedProject.image])[currentImageIndex])
                          ? 'opacity-100'
                          : 'opacity-0'
                      }`}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      loading="lazy"
                      onLoad={() =>
                        handleImageLoad(
                          (selectedProject.allImages || [selectedProject.image])[currentImageIndex]
                        )
                      }
                    />
                    {/* Image counter */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {currentImageIndex + 1} / {(selectedProject.allImages || [selectedProject.image]).length}
                    </div>
                  </div>

                  {/* Thumbnail grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(selectedProject.allImages || [selectedProject.image]).map((image: string, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`aspect-video rounded-lg overflow-hidden bg-muted group cursor-pointer transition-all select-none ${
                          idx === currentImageIndex
                            ? 'ring-2 ring-primary shadow-lg'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {!loadedImages.has(image) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse z-10" />
                        )}
                        <img
                          src={image}
                          alt={`Thumbnail ${idx + 1}`}
                          className={`w-full h-full object-cover select-none pointer-events-none ${
                            loadedImages.has(image) ? 'opacity-100' : 'opacity-0'
                          }`}
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          loading="lazy"
                          onLoad={() => handleImageLoad(image)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
