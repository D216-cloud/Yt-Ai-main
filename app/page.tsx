import { HeroSection } from "@/components/hero-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChangelogPlansSection } from "@/components/changelog-plans-section"
import { SuccessEarningSection } from "@/components/success-earning-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 md:pt-20">
        <HeroSection />
        <ChangelogPlansSection />
        <SuccessEarningSection />
      </main>
      <Footer />
    </div>
  )
}
