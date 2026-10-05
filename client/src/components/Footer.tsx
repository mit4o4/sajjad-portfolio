import { useLanguage } from '@/contexts/LanguageContext';
import { Github, Linkedin, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/te.bim', label: 'Instagram' },
    { icon: Facebook, href: 'https://www.facebook.com/TeBIM.Design', label: 'Facebook' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/sajjad-abdulhamead/', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com/mit4o4', label: 'GitHub' },
    { icon: Mail, href: 'mailto:sajjad.abdulhameed@gmail.com', label: 'Email' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">TeBIM</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              {t('footer.tagline') || 'تصميم معماري، نمذجة BIM، وإشراف وتنفيذ هندسي في العراق'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#portfolio" className="text-foreground/60 hover:text-primary transition-colors">
                  {t('nav.portfolio')}
                </a>
              </li>
              <li>
                <a href="#about" className="text-foreground/60 hover:text-primary transition-colors">
                  {t('nav.about')}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-foreground/60 hover:text-primary transition-colors">
                  {t('nav.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {t('footer.followMe')}
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                    aria-label={link.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
              {/* TikTok link */}
              <a
                href="https://www.tiktok.com/@t.ebim"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors flex items-center justify-center"
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.38a6.34 6.34 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.66a6.34 6.34 0 0 0 6.34 6.34c3.5 0 6.34-2.84 6.34-6.34V9.06a8.28 8.28 0 0 0 3.71 1.09V6.69z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <p className="text-center text-foreground/60 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
