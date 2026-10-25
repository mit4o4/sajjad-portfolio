import HeroSection from "@/components/HeroSection";
import StatsBand from "@/components/StatsBand";
import SectorsSection from "@/components/SectorsSection";
import StorySection from "@/components/StorySection";
import PortfolioSection from "@/components/PortfolioSection";
import MapSection from "@/components/MapSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import FaqSection from "@/components/FaqSection";
import ContactSection from "@/components/ContactSection";

/** Section order follows the client's decision path: proof → sectors → method → work → who → questions → contact. */
export default function HomePage() {
  return (
    <>
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
    </>
  );
}
