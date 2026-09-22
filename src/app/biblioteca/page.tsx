import type { Metadata } from "next";
import { library, resources } from "@content/library";
import { seo } from "@content/seo";
import { home } from "@content/home";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { LibraryGrid } from "@/components/library/LibraryGrid";
import { ClosingCta } from "@/components/home/ClosingCta";

export const metadata: Metadata = {
  title: seo.biblioteca.title,
  description: seo.biblioteca.description,
  alternates: { canonical: "/biblioteca" },
  openGraph: { title: seo.biblioteca.title, description: seo.biblioteca.description, url: "/biblioteca" },
};

export default function LibraryPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Inicio", href: "/" }, { name: "Biblioteca", href: "/biblioteca" }]} />
      <PageHero eyebrow="Biblioteca" title={library.title} text={library.text} compact />
      <Section tone="blanco" className="pt-12 md:pt-16 lg:pt-16">
        <Reveal>
          <LibraryGrid resources={resources} />
        </Reveal>
        <p className="mt-10 text-sm text-carbon/60">{library.notice}</p>
      </Section>
      <ClosingCta title={home.closing.title} text={home.closing.text} cta={home.closing.cta} section="library_closing" />
    </>
  );
}
