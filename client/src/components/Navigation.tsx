import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X, Globe, ExternalLink } from "lucide-react";
import { useState } from "react";
import sajjadProfile from "../../public/images/sajjad.png";

// Standalone pricing app (TeBIM Seals — design/works/services pricing) opened as its own page.
const PRICING_APP_URL = "https://tebim-seals-mangement.web.app";

interface NavItem {
  key: string;
  href: string;
  external?: boolean;
}

export default function Navigation() {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { key: "home", href: "#home" },
    { key: "portfolio", href: "#portfolio" },
    { key: "about", href: "#about" },
    { key: "pricing", href: PRICING_APP_URL, external: true },
    { key: "contact", href: "#contact" },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0 flex items-center gap-2">
            <img
              src={sajjadProfile}
              alt="Sajjad"
              className="w-8 h-8 rounded-full object-cover"
            />
            <a href="#home" className="text-xl font-bold text-primary">
              Sajjad
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <a
                key={item.key}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                {t(`nav.${item.key}`)}
                {item.external && <ExternalLink size={14} />}
              </a>
            ))}
          </div>

          {/* Right Side - Language Toggle & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Toggle language"
            >
              <Globe size={18} />
              <span className="text-sm font-medium">
                {language.toUpperCase()}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            {navItems.map(item => (
              <a
                key={item.key}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t(`nav.${item.key}`)}
                {item.external && <ExternalLink size={14} />}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
