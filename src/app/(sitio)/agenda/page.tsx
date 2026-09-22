import type { Metadata } from "next";
import { agenda } from "@content/contact";
import { process as proc } from "@content/process";
import { seo } from "@content/seo";
import { site } from "@content/site";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section } from "@/components/ui/Section";
import { DrawLine, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { AgendaFlow } from "@/components/forms/AgendaFlow";
import { SLOT_MINUTES } from "@/lib/booking";
import { cobroConfigurado } from "@/lib/pricing";
import { getPromo } from "@/lib/promo-server";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: seo.agenda.title,
  description: seo.agenda.description,
  alternates: { canonical: "/agenda" },
  openGraph: { title: seo.agenda.title, description: seo.agenda.description, url: "/agenda" },
  robots: { index: false, follow: true },
};

export default async function AgendaPage({ searchParams }: PageProps<"/agenda">) {
  const sp = await searchParams;
  const tipo = typeof sp.tipo === "string" ? sp.tipo : undefined;
  const cancelado = sp.pago === "cancelado";
  const { precio } = await getPromo();

  return (
    <>
      <Breadcrumbs items={[{ name: "Inicio", href: "/" }, { name: agenda.title, href: "/agenda" }]} />
      <PageHero eyebrow={site.pillars[2]} title={agenda.title} text={site.tagline} compact />

      <Section tone="marfil" className="pt-4 md:pt-6 lg:pt-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-8">
            <AgendaFlow defaultAsunto={tipo} precio={precio} duracionMinutos={SLOT_MINUTES} cobroDisponible={cobroConfigurado} cancelado={cancelado} />
          </Reveal>
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <h2 className="eyebrow">{proc.prepare.title}</h2>
              </Reveal>
              <DrawLine className="my-5" />
              <Stagger as="ul" className="space-y-3">
                {proc.prepare.bullets.map((b) => (
                  <StaggerItem as="li" key={b} className="flex items-start gap-3 text-[0.95rem] text-carbon/85">
                    <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border border-dorado/50 text-dorado-2">
                      <Check className="size-3" strokeWidth={2} aria-hidden />
                    </span>
                    {b}
                  </StaggerItem>
                ))}
              </Stagger>
              <Reveal delay={0.2} className="mt-8 rounded-brand border-l-2 border-dorado bg-blanco p-5 text-sm text-carbon/85">
                {proc.note.text}
              </Reveal>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
