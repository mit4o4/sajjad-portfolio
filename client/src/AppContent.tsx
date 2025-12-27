import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import PortfolioSection from "./components/PortfolioSection";
import ExperienceSection from "./components/ExperienceSection";
import SkillsSection from "./components/SkillsSection";
import CertificationsSection from "./components/CertificationsSection";
import AboutSection from "./components/AboutSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

export default function AppContent() {
  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <HeroSection />
        <PortfolioSection />
        <ExperienceSection />
        <SkillsSection />
        <CertificationsSection />
        <AboutSection />
        <ContactSection />
        <Footer />
      </div>
    </TooltipProvider>
  );
}
