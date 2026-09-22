import type { Metadata } from "next";
import { seo } from "@content/seo";
import { services, servicesLabels, commonClosing } from "@content/services";
import { site } from "@content/site";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section } from "@/components/ui/Section";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { MethodBand } from "@/components/services/MethodBand";
import { ClosingCta } from "@/components/home/ClosingCta";

export const metadata: Metadata = {
  title: seo.servicios.title,
  description: seo.servicios.description,
  alternates: { canonical: "/servicios" },
  openGraph: { title: seo.servicios.title, description: seo.servicios.description, url: "/servicios" },
};

export default function ServicesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Inicio", href: "/" }, { name: servicesLabels.title, href: "/servicios" }]} />
      <PageHero eyebrow={site.descriptor} title={servicesLabels.title} text={seo.servicios.description} compact />

      <Section tone="marfil" className="pt-0 md:pt-0 lg:pt-0">
        <Stagger className="grid gap-6 md:grid-cols-2">
          {services.map((s, i) => (
            <StaggerItem key={s.slug} className="h-full">
              <ServiceCard service={s} index={i} large />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <MethodBand />

      <ClosingCta title={commonClosing.question} text={commonClosing.text} cta={commonClosing.cta} section="services_index" />
    </>
  );
}
