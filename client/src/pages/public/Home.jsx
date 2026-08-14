import PublicLayout from '@/components/public/PublicLayout';
import HeroSection from '@/components/public/HeroSection';
import LatestEventSection from '@/components/public/LatestEventSection';
import AboutSection from '@/components/public/AboutSection';
import HistorySection from '@/components/public/HistorySection';
import Footer from '@/components/public/Footer';

export default function Home() {
  return (
    <PublicLayout>
      <HeroSection />
      <LatestEventSection />
      <AboutSection />
      <HistorySection />
      <Footer />
    </PublicLayout>
  );
}