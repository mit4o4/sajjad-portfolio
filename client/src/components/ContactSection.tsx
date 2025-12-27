import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactSection() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-20 bg-secondary/30">
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-lg text-foreground/60">{t('contact.subtitle')}</p>
        </div>

        {/* Contact Information */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email Card */}
            <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-lg mb-4">
                  <Mail className="text-primary" size={28} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                <a
                  href={`mailto:${t('contact.info.email')}`}
                  className="text-primary hover:underline break-all"
                >
                  {t('contact.info.email')}
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-lg mb-4">
                  <Phone className="text-primary" size={28} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                <a
                  href={`tel:${t('contact.info.phone')}`}
                  className="text-primary hover:underline"
                >
                  {t('contact.info.phone')}
                </a>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-lg mb-4">
                  <MapPin className="text-primary" size={28} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Location</h3>
                <p className="text-foreground/70">{t('contact.info.location')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
