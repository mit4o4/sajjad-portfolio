import { useLanguage } from '@/contexts/LanguageContext';
import { Award } from 'lucide-react';

export default function CertificationsSection() {
  const { t } = useLanguage();

  // Get certifications from translation
  const getCertifications = () => {
    const data = t('certifications.items');
    if (typeof data === 'string') return [];
    return Array.isArray(data) ? data : [];
  };

  const certifications = getCertifications();

  return (
    <section id="certifications" className="py-20">
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('certifications.title')}
          </h2>
          <p className="text-lg text-foreground/60">
            {t('certifications.subtitle')}
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.length > 0 ? (
            certifications.map((cert: any, index: number) => (
              <div
                key={index}
                className="bg-card rounded-lg p-6 border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <Award className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {cert.title}
                    </h3>
                    <p className="text-primary text-sm font-semibold mb-2">
                      {cert.issuer}
                    </p>
                    <p className="text-foreground/60 text-sm">{cert.date}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-foreground/60">
                {t('certifications.items')}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
