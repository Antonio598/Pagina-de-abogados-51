import type { Metadata } from "next";
import { Building2, Check, User } from "lucide-react";
import { preventive } from "@content/process";
import { seo } from "@content/seo";
import { site } from "@content/site";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section } from "@/components/ui/Section";
import { DrawLine, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ClosingCta } from "@/components/home/ClosingCta";

export const metadata: Metadata = {
  title: seo.preventiva.title,
  description: seo.preventiva.description,
  alternates: { canonical: "/estrategia-preventiva" },
  openGraph: { title: seo.preventiva.title, description: seo.preventiva.description, url: "/estrategia-preventiva" },
};

const columns = [
  { key: "people", icon: User, block: preventive.people },
  { key: "companies", icon: Building2, block: preventive.companies },
] as const;

export default function PreventivePage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Inicio", href: "/" }, { name: "Estrategia legal preventiva", href: "/estrategia-preventiva" }]} />
      <PageHero eyebrow={site.pillars[3]} title={preventive.title} text={preventive.intro} />

      <Section tone="blanco" className="pt-0 md:pt-0 lg:pt-0">
        <Stagger className="grid gap-6 lg:grid-cols-2" amount={0.15}>
          {columns.map(({ key, icon: Icon, block }, i) => (
            <StaggerItem key={key} className="rounded-brand border border-gris bg-marfil p-7 md:p-10">
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-brand bg-blanco text-azul">
                  <Icon className="size-6" strokeWidth={1.25} aria-hidden />
                </span>
                <h2 className="font-display type-h2 text-azul">{block.title}</h2>
              </div>
              <DrawLine className="my-6" delay={i * 0.1} />
              <ul className="space-y-4">
                {block.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-4">
                    <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-dorado/50 text-dorado-2">
                      <Check className="size-3.5" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="text-carbon/90">{b}</span>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <ClosingCta title={site.tagline} cta={preventive.cta} tone="azul" section="preventive_closing" />
    </>
  );
}
