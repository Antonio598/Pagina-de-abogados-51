import type { Metadata } from "next";
import { seo } from "@content/seo";
import { home } from "@content/home";
import { Hero } from "@/components/home/Hero";
import { HelpSelector } from "@/components/home/HelpSelector";
import { TrustBlock } from "@/components/home/TrustBlock";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { MethodTimeline } from "@/components/home/MethodTimeline";
import { WhyVeritum } from "@/components/home/WhyVeritum";
import { LibraryTeaser } from "@/components/home/LibraryTeaser";
import { FaqEssentials } from "@/components/home/FaqEssentials";
import { ClosingCta } from "@/components/home/ClosingCta";

export const metadata: Metadata = {
  title: seo.home.title,
  description: seo.home.description,
  alternates: { canonical: "/" },
  openGraph: { title: seo.home.title, description: seo.home.description, url: "/" },
};

// Orden obligatorio de Inicio (Bloque 4): encabezado → selector → confianza →
// servicios → proceso → razones → Biblioteca → FAQ → cierre con un solo CTA.
export default function HomePage() {
  return (
    <>
      <Hero />
      <HelpSelector />
      <TrustBlock />
      <ServicesGrid />
      <MethodTimeline />
      <WhyVeritum />
      <LibraryTeaser />
      <FaqEssentials />
      <ClosingCta title={home.closing.title} text={home.closing.text} cta={home.closing.cta} section="home_closing" />
    </>
  );
}
