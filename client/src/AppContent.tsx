import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import StatsBand from "./components/StatsBand";
import SectorsSection from "./components/SectorsSection";
import StorySection from "./components/StorySection";
import PortfolioSection from "./components/PortfolioSection";
import MapSection from "./components/MapSection";
import ServicesSection from "./components/ServicesSection";
import AboutSection from "./components/AboutSection";
import FaqSection from "./components/FaqSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import { useRevealAll } from "./hooks/useRevealAll";

/** Page order follows the client's decision path: proof → sectors → method → work → who → questions → contact. */
export default function AppContent() {
  useRevealAll();
  return (
    <TooltipProvider>
      <Toaster />
      <div
        className="min-h-screen"
        style={{ background: "var(--tb-paper)", color: "var(--tb-ink)" }}
      >
        <Navigation />
        <main>
          <HeroSection />
          <StatsBand />
          <SectorsSection />
          <StorySection />
          <PortfolioSection />
          <MapSection />
          <ServicesSection />
          <AboutSection />
          <FaqSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
}
