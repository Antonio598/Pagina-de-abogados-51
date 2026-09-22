import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, Info } from "lucide-react";
import { commonClosing, commonScopeNotice, getService, services, servicesLabels } from "@content/services";
import { faqsById } from "@content/faqs";
import { home } from "@content/home";
import { resources } from "@content/library";
import { serviceSeo } from "@content/seo";
import { env } from "@/lib/env";
import { faqSchema, serviceSchema } from "@/lib/schema";
import { pad2 } from "@/lib/utils";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { DrawLine, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ServiceViewTracker } from "@/components/services/ServiceViewTracker";
import { ClosingCta } from "@/components/home/ClosingCta";

export const generateStaticParams = () => services.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: PageProps<"/servicios/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  const s = serviceSeo(service.name, service.cardText);
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: `/servicios/${service.slug}` },
    openGraph: { title: s.title, description: s.description, url: `/servicios/${service.slug}` },
  };
}

export default async function ServicePage({ params }: PageProps<"/servicios/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const faqs = faqsById(service.faqIds);
  const related = resources.filter((r) => service.library.includes(r.slug));
  const others = services.filter((s) => s.slug !== service.slug);
  const agendaHref = `/agenda?tipo=${service.formType}`;

  return (
    <>
      <ServiceViewTracker slug={service.slug} />
      <JsonLd
        data={[
          serviceSchema({ name: service.name, description: service.cardText, url: `${env.siteUrl}/servicios/${service.slug}` }),
          faqSchema(faqs),
        ]}
      />
      <Breadcrumbs
        items={[
          { name: "Inicio", href: "/" },
          { name: servicesLabels.title, href: "/servicios" },
          { name: service.name, href: `/servicios/${service.slug}` },
        ]}
      />
      <PageHero
        eyebrow={service.name}
        title={service.title}
        text={service.intro}
        aside={
          <div className="rounded-brand border border-gris bg-blanco p-6 shadow-card md:p-7">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-brand bg-marfil text-azul">
                <ServiceIcon name={service.icon} className="size-6" />
              </span>
              <p className="text-xs uppercase tracking-widest text-dorado-2">{service.short}</p>
            </div>
            <p className="mt-5 text-[0.98rem] text-carbon/85">{service.cardText}</p>
            <ButtonLink href={agendaHref} className="mt-6 w-full" arrow>
              {commonClosing.cta.label}
            </ButtonLink>
          </div>
        }
      />

      {/* Asuntos que podemos revisar */}
      <Section tone="blanco" id="asuntos">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHeading number="01" eyebrow={service.short} title={servicesLabels.mattersTitle} className="mb-0 lg:sticky lg:top-28" />
          </div>
          <Stagger as="ul" className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8" amount={0.15}>
            {service.matters.map((m) => (
              <StaggerItem as="li" key={m} className="flex items-start gap-4 border-b border-gris py-5">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-dorado/50 text-dorado-2">
                  <Check className="size-3.5" strokeWidth={2} aria-hidden />
                </span>
                <span className="text-carbon/90">{m}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Forma de trabajo */}
      <Section tone="marfil" id="forma-de-trabajo">
        <SectionHeading number="02" eyebrow={home.how.title} title={servicesLabels.howTitle} />
        <Stagger as="ol" className="grid gap-6 md:grid-cols-2 lg:grid-cols-5" amount={0.15}>
          {home.how.steps.map((step, i) => (
            <StaggerItem as="li" key={step} className="rounded-brand border border-gris bg-blanco p-6">
              <span className="font-display text-2xl tabular-nums text-dorado-2" aria-hidden>
                {pad2(i + 1)}
              </span>
              <DrawLine className="my-4" delay={i * 0.08} />
              <p className="text-[0.98rem] text-carbon/90">{step}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Preguntas frecuentes del área */}
      <Section tone="blanco" id="preguntas">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHeading number="03" eyebrow={service.short} title={servicesLabels.faqTitle} className="mb-0" />
          </div>
          <Reveal className="lg:col-span-8">
            <Accordion items={faqs} defaultOpen={0} />
          </Reveal>
        </div>
      </Section>

      {/* Aviso de alcance */}
      <Section tone="marfil" tight id="alcance">
        <Reveal className="flex gap-5 rounded-brand border border-dorado/40 bg-blanco p-6 md:p-8">
          <Info className="mt-1 size-6 shrink-0 text-dorado-2" strokeWidth={1.5} aria-hidden />
          <div>
            <h2 className="font-display type-h3 text-azul">{servicesLabels.scopeTitle}</h2>
            <p className="measure mt-3 text-carbon/85">{service.scopeNotice ?? commonScopeNotice}</p>
          </div>
        </Reveal>
      </Section>

      {/* Biblioteca relacionada + otros servicios */}
      <Section tone="blanco" id="relacionados" tight>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {related.length > 0 && (
            <div>
              <SectionHeading number="04" eyebrow="Biblioteca" title={servicesLabels.libraryTitle} className="mb-6" />
              <Stagger as="ul" className="divide-y divide-gris border-y border-gris">
                {related.map((r) => (
                  <StaggerItem as="li" key={r.slug}>
                    <Link href={`/biblioteca/${r.slug}`} className="group flex items-center justify-between gap-6 py-5 transition-[padding] duration-250 hover:pl-2">
                      <span>
                        <span className="block text-xs uppercase tracking-widest text-dorado-2">{r.kind}</span>
                        <span className="font-display mt-1 block text-[1.2rem] text-azul">{r.title}</span>
                      </span>
                      <ArrowUpRight className="size-5 text-azul/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}
          <div>
            <SectionHeading number={related.length > 0 ? "05" : "04"} eyebrow={servicesLabels.title} title="Otros servicios" className="mb-6" />
            <Stagger as="ul" className="divide-y divide-gris border-y border-gris">
              {others.map((s) => (
                <StaggerItem as="li" key={s.slug}>
                  <Link href={`/servicios/${s.slug}`} className="group flex items-center gap-4 py-4 transition-[padding] duration-250 hover:pl-2">
                    <span className="flex size-10 items-center justify-center rounded-brand bg-marfil text-azul group-hover:bg-azul group-hover:text-blanco">
                      <ServiceIcon name={s.icon} className="size-5" />
                    </span>
                    <span className="font-medium text-azul">{s.name}</span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </Section>

      {/* Bloque común de cierre */}
      <ClosingCta title={commonClosing.question} text={commonClosing.text} cta={{ ...commonClosing.cta, href: agendaHref }} tone="azul" section={`service_${service.slug}`} />
    </>
  );
}
