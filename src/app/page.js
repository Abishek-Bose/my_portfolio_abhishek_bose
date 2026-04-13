import HeroSection from "@/components/HeroSection";
import MarqueeStrip from "@/components/MarqueeStrip";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <HeroSection />
      <MarqueeStrip />
      <ServicesSection />
      <PortfolioSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
