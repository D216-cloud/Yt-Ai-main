import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BeforeAfterSection } from "@/components/before-after-section"
import { VideoDemoSection } from "@/components/video-demo-section"
import { TwitterGrowthShowcase } from "@/components/twitter-growth-showcase"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TwitterGrowthShowcase />
        <BeforeAfterSection />
        <VideoDemoSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
