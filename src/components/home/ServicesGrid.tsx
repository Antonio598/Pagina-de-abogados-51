import { home } from "@content/home";
import { services } from "@content/services";
import { site } from "@content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

export const ServicesGrid = () => (
  <Section tone="marfil" id="servicios">
    <SectionHeading number="02" eyebrow={site.pillars[1]} title={home.servicesTitle} />
    <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {services.map((s, i) => (
        <StaggerItem key={s.slug} className="h-full">
          <ServiceCard service={s} index={i} />
        </StaggerItem>
      ))}
    </Stagger>
  </Section>
);
