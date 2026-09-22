import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Info } from "lucide-react";
import { getResource, library, resources } from "@content/library";
import { getService } from "@content/services";
import { faqsById } from "@content/faqs";
import { articleSeo } from "@content/seo";
import { env } from "@/lib/env";
import { articleSchema, faqSchema } from "@/lib/schema";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { DrawLine, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ResourceCta } from "@/components/library/LibraryGrid";
import { ArticleHeader } from "@/components/library/ArticleHeader";

export const generateStaticParams = () => resources.map((r) => ({ slug: r.slug }));

export async function generateMetadata({ params }: PageProps<"/biblioteca/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = getResource(slug);
  if (!r) return {};
  const s = articleSeo(r.title, r.topics);
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: `/biblioteca/${r.slug}` },
    openGraph: { title: s.title, description: s.description, url: `/biblioteca/${r.slug}`, type: "article" },
  };
}

// Plantilla de artículo (tipo de contenido del CMS): título, resumen, fechas,
// responsable, categoría, tiempo de lectura, contenido con subtítulos y listas,
// FAQ relacionadas, aviso informativo, CTA al servicio y agenda, y relacionados.
export default async function ArticlePage({ params }: PageProps<"/biblioteca/[slug]">) {
  const { slug } = await params;
  const r = getResource(slug);
  if (!r) notFound();

  const service = getService(r.serviceSlug);
  const faqs = faqsById(r.faqIds);
  const related = resources.filter((x) => x.slug !== r.slug && x.categories.some((c) => r.categories.includes(c)));
  const url = `${env.siteUrl}/biblioteca/${r.slug}`;

  return (
    <>
      <JsonLd
        data={[
          articleSchema({ title: r.title, description: r.topics.join(" · "), url, datePublished: r.publishedAt, dateModified: r.updatedAt, author: r.author }),
          faqSchema(faqs),
        ]}
      />
      <Breadcrumbs
        items={[
          { name: "Inicio", href: "/" },
          { name: "Biblioteca", href: "/biblioteca" },
          { name: r.title, href: `/biblioteca/${r.slug}` },
        ]}
      />

      <ArticleHeader resource={r} />

      <Section tone="blanco" className="pt-12 md:pt-16 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <article className="lg:col-span-8">
            {/* Qué cubre el recurso (enfoque aprobado) */}
            <Reveal>
              <h2 className="font-display type-h2 text-azul">{library.coversLabel}</h2>
            </Reveal>
            <DrawLine className="my-6" />
            <Stagger as="ul" className="space-y-3">
              {r.topics.map((t) => (
                <StaggerItem as="li" key={t} className="flex items-start gap-4">
                  <span className="mt-[0.7em] h-px w-5 shrink-0 bg-dorado" aria-hidden />
                  <span className="text-carbon/90">{t}</span>
                </StaggerItem>
              ))}
            </Stagger>

            {/* Cuerpo del artículo: secciones con subtítulos, párrafos y listas (CMS). */}
            {r.body?.map((section) => (
              <Reveal key={section.heading} className="mt-12">
                <h2 className="font-display type-h2 text-azul">{section.heading}</h2>
                {section.paragraphs?.map((p) => (
                  <p key={p} className="measure mt-4 text-carbon/90">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-4 space-y-2">
                    {section.list.map((item) => (
                      <li key={item} className="flex items-start gap-4">
                        <span className="mt-[0.7em] h-px w-5 shrink-0 bg-dorado" aria-hidden />
                        <span className="text-carbon/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ))}

            {faqs.length > 0 && (
              <Reveal className="mt-14">
                <h2 className="font-display type-h2 text-azul">{library.faqLabel}</h2>
                <Accordion items={faqs} className="mt-4" />
              </Reveal>
            )}

            <Reveal className="mt-12 flex gap-4 rounded-brand border border-dorado/40 bg-marfil p-5">
              <Info className="mt-0.5 size-5 shrink-0 text-dorado-2" strokeWidth={1.5} aria-hidden />
              <p className="text-[0.95rem] text-carbon/85">{library.notice}</p>
            </Reveal>
          </article>

          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-28">
              <Reveal className="rounded-brand border border-gris bg-marfil p-6">
                <p className="eyebrow">{r.cta.label}</p>
                <DrawLine className="my-4" />
                <ResourceCta r={r} className="text-base" />
              </Reveal>
              {service && (
                <Reveal delay={0.1} className="rounded-brand border border-gris bg-blanco p-6 shadow-card">
                  <p className="eyebrow">{library.serviceLabel}</p>
                  <Link href={`/servicios/${service.slug}`} className="group mt-4 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-brand bg-marfil text-azul transition-colors group-hover:bg-azul group-hover:text-blanco">
                      <ServiceIcon name={service.icon} className="size-5" />
                    </span>
                    <span className="font-medium text-azul underline-offset-4 group-hover:underline">{service.name}</span>
                  </Link>
                  <ButtonLink href={`/agenda?tipo=${service.formType}`} className="mt-6 w-full" size="sm" arrow>
                    Agenda una asesoría
                  </ButtonLink>
                </Reveal>
              )}
            </div>
          </aside>
        </div>
      </Section>

      {related.length > 0 && (
        <Section tone="marfil" tight>
          <Reveal>
            <h2 className="font-display type-h3 text-azul">{library.relatedLabel}</h2>
          </Reveal>
          <Stagger as="ul" className="mt-6 grid gap-4 md:grid-cols-3">
            {related.map((x) => (
              <StaggerItem as="li" key={x.slug}>
                <Link href={`/biblioteca/${x.slug}`} className="group flex h-full flex-col rounded-brand border border-gris bg-blanco p-5 transition-[border-color,transform] duration-250 hover:-translate-y-0.5 hover:border-dorado/40">
                  <span className="text-xs uppercase tracking-widest text-dorado-2">{x.kind}</span>
                  <span className="font-display mt-2 flex-1 text-[1.2rem] text-azul">{x.title}</span>
                  <ArrowUpRight className="mt-4 size-4 text-azul/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}
    </>
  );
}
