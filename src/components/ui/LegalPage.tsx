import { Info } from "lucide-react";
import type { LegalDoc } from "@content/legal";
import { legalPending } from "@content/legal";
import { site } from "@content/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { DrawLine, Reveal } from "@/components/motion/Reveal";
import { formatDate, pad2 } from "@/lib/utils";

/** Plantilla común para los tres avisos legales. */
export const LegalPage = ({ doc }: { doc: LegalDoc }) => (
  <>
    <Breadcrumbs items={[{ name: "Inicio", href: "/" }, { name: doc.title, href: `/${doc.slug}` }]} />
    <PageHero eyebrow={site.name} title={doc.title} compact />
    <Section tone="blanco" className="pt-10 md:pt-14 lg:pt-14">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <nav aria-label="Secciones del documento" className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">Contenido</p>
            <DrawLine className="my-4" />
            <ol className="space-y-1 text-[0.95rem]">
              {doc.sections.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="font-display tabular-nums text-dorado-2" aria-hidden>
                    {pad2(i + 1)}
                  </span>
                  <a href={`#seccion-${i + 1}`} className="link-text inline-block py-1.5">
                    {s}
                  </a>
                </li>
              ))}
            </ol>
            {doc.updatedAt && <p className="mt-6 text-sm text-carbon/70">Última actualización: {formatDate(doc.updatedAt)}</p>}
          </div>
        </nav>

        <article className="lg:col-span-8">
          {doc.body && doc.body.length > 0 ? (
            doc.body.map((b, i) => (
              <Reveal key={b.heading} className="mb-10">
                <h2 id={`seccion-${i + 1}`} className="font-display type-h2 scroll-mt-28 text-azul">
                  {b.heading}
                </h2>
                {b.paragraphs.map((p) => (
                  <p key={p} className="measure mt-4 text-carbon/90">
                    {p}
                  </p>
                ))}
              </Reveal>
            ))
          ) : (
            <>
              <Reveal className="flex gap-4 rounded-brand border border-dorado/40 bg-marfil p-6">
                <Info className="mt-0.5 size-5 shrink-0 text-dorado-2" strokeWidth={1.5} aria-hidden />
                <p className="text-carbon/90">{legalPending}</p>
              </Reveal>
              {/* Estructura de secciones lista para recibir el texto de VERITUM (content/legal.ts → body). */}
              <ol className="mt-10 space-y-6">
                {doc.sections.map((s, i) => (
                  <li key={s}>
                    <h2 id={`seccion-${i + 1}`} className="font-display type-h3 scroll-mt-28 text-azul/70">
                      {s}
                    </h2>
                    <DrawLine className="mt-3" delay={i * 0.04} />
                  </li>
                ))}
              </ol>
            </>
          )}
        </article>
      </div>
    </Section>
  </>
);
