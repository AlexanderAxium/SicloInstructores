"use client";

import { useAuthContext } from "@/AuthContext";
import { InstructorList } from "@/components/instructor-list";
import { AnimatedSection } from "@/components/landing/animated-section";
import { BentoSection } from "@/components/landing/bento-section";
import { CTASection } from "@/components/landing/cta-section";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingHero } from "@/components/landing/landing-hero";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialGrid } from "@/components/landing/testimonial-grid";

export default function HomePage() {
  const { loading } = useAuthContext();

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Landing page para usuarios no autenticados y autenticados
  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <LandingHero />
        {/* Dashboard Preview Wrapper - positioned to be cut by hero curve */}
        <div className="relative z-30 -mt-[230px] md:-mt-[320px] px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-[1080px]">
            <AnimatedSection>
              <DashboardPreview />
            </AnimatedSection>
          </div>
        </div>
        <AnimatedSection
          id="features-section"
          className="relative w-full mt-20 md:mt-24 lg:mt-32"
          delay={0.2}
        >
          <BentoSection />
        </AnimatedSection>
        <AnimatedSection
          id="pricing-section"
          className="relative w-full mt-20 md:mt-24 lg:mt-32"
          delay={0.2}
        >
          <PricingSection />
        </AnimatedSection>
        <AnimatedSection
          id="instructors-section"
          className="relative container mx-auto mt-20 md:mt-24 lg:mt-32"
          delay={0.2}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <InstructorList />
          </div>
        </AnimatedSection>
        <AnimatedSection
          id="testimonials-section"
          className="relative container mx-auto mt-20 md:mt-24 lg:mt-32"
          delay={0.2}
        >
          <TestimonialGrid />
        </AnimatedSection>
        <AnimatedSection
          id="faq-section"
          className="relative w-full mt-20 md:mt-24 lg:mt-32"
          delay={0.2}
        >
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection
          className="relative w-full mt-20 md:mt-24 lg:mt-32 mb-0"
          delay={0.2}
        >
          <CTASection />
        </AnimatedSection>
      </div>
    </div>
  );
}
