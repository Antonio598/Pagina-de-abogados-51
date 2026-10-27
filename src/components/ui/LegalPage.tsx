import type { LegalDoc } from "@content/legal";
import { site } from "@content/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { DrawLine, Reveal } from "@/components/motion/Reveal";
import { formatDate, pad2 } from "@/lib/utils";

/** Plantilla común para los tres avisos legales. */
export const LegalPage = ({ doc }: { doc: LegalDoc }) => {
  // El índice sale de los encabezados del propio texto. Mantenerlo en una lista
  // aparte era una trampa: basta con que alguien añada una sección al cuerpo y
  // olvide la lista para que los enlaces #seccion-N señalen a otro apartado.
  const indice = doc.body?.length ? doc.body.map((b) => b.heading) : (doc.sections ?? []);

  return (
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
              {indice.map((s, i) => (
                // Clave por índice: dos encabezados podrían repetirse y la
                // reconciliación de React se corrompería en silencio.
                <li key={`${i}-${s}`} className="flex gap-3">
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
              <Reveal key={`${i}-${b.heading}`} className="mb-10">
                <h2 id={`seccion-${i + 1}`} className="font-display type-h2 scroll-mt-28 text-azul">
                  {b.heading}
                </h2>
                {b.paragraphs.map((p, j) => (
                  <p key={`${j}-${p.slice(0, 24)}`} className="measure mt-4 text-carbon/90">
                    {p}
                  </p>
                ))}
                {b.list && b.list.length > 0 && (
                  <ul className="measure mt-5 space-y-3">
                    {b.list.map((x, j) => (
                      <li key={`${j}-${x.slice(0, 24)}`} className="flex gap-3 text-carbon/90">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-dorado" aria-hidden />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ))
          ) : (
            <>
              {/* Estructura de secciones lista para recibir el texto (content/legal.ts → body). */}
              <ol className="space-y-6">
                {indice.map((s, i) => (
                  // Clave por índice: dos secciones podrían llamarse igual y la
                  // reconciliación de React se corrompería en silencio.
                  <li key={`${i}-${s}`}>
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
};
