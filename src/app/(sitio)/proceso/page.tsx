import type { Metadata } from "next";
import { AlertCircle, Check } from "lucide-react";
import { process as proc } from "@content/process";
import { seo } from "@content/seo";
import { site } from "@content/site";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { DrawLine, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ProcessSteps } from "@/components/services/ProcessSteps";
import { ClosingCta } from "@/components/home/ClosingCta";

export const metadata: Metadata = {
  title: seo.proceso.title,
  description: seo.proceso.description,
  alternates: { canonical: "/proceso" },
  openGraph: { title: seo.proceso.title, description: seo.proceso.description, url: "/proceso" },
};

export default function ProcessPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Inicio", href: "/" }, { name: "Proceso", href: "/proceso" }]} />
      <PageHero eyebrow={site.pillars[1]} title={proc.title} compact />

      <ProcessSteps steps={proc.steps} />

      <Section tone="marfil">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading number="02" eyebrow={site.pillars[3]} title={proc.prepare.title} className="mb-8" />
            <Stagger as="ul" className="space-y-4">
              {proc.prepare.bullets.map((b) => (
                <StaggerItem as="li" key={b} className="flex items-start gap-4 rounded-brand border border-gris bg-blanco px-5 py-4">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-dorado/50 text-dorado-2">
                    <Check className="size-3.5" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-carbon/90">{b}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Reveal delay={0.15} className="lg:col-span-5 lg:pt-24">
            <div className="rounded-brand border-l-2 border-dorado bg-blanco p-7 shadow-card md:p-8">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 text-dorado-2" strokeWidth={1.5} aria-hidden />
                <h2 className="eyebrow">{proc.note.title}</h2>
              </div>
              <DrawLine className="my-5" />
              <p className="text-carbon/90">{proc.note.text}</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <ClosingCta title={site.tagline} cta={proc.cta} tone="azul" section="process_closing" />
    </>
  );
}
