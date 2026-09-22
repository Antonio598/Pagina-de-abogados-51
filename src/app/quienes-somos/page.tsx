import type { Metadata } from "next";
import { Check } from "lucide-react";
import { about } from "@content/about";
import { seo } from "@content/seo";
import { site } from "@content/site";
import { home } from "@content/home";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading, Eyebrow } from "@/components/ui/Section";
import { DrawLine, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ClosingCta } from "@/components/home/ClosingCta";
import { pad2 } from "@/lib/utils";

export const metadata: Metadata = {
  title: seo.quienesSomos.title,
  description: seo.quienesSomos.description,
  alternates: { canonical: "/quienes-somos" },
  openGraph: { title: seo.quienesSomos.title, description: seo.quienesSomos.description, url: "/quienes-somos" },
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Inicio", href: "/" }, { name: "Quiénes somos", href: "/quienes-somos" }]} />
      <PageHero
        eyebrow={site.descriptor}
        title={about.title}
        text={about.paragraphs[0]}
        aside={
          <div className="relative">
            <div className="absolute -inset-3 rounded-[10px] border border-dorado/25" aria-hidden />
            <div className="relative rounded-brand bg-azul p-7 text-marfil md:p-8">
              <p className="eyebrow !text-dorado">Pilares</p>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                {site.pillars.map((p) => (
                  <li key={p} className="font-display text-[1.4rem] text-blanco">
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 h-px w-full bg-blanco/15" aria-hidden />
              <p className="mt-5 text-sm text-marfil/75">{site.tagline}</p>
            </div>
          </div>
        }
      />

      <Section tone="blanco">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <Eyebrow number="01">{site.pillars[2]}</Eyebrow>
            <p className="font-display mt-6 text-[1.5rem] leading-[1.3] text-balance text-azul md:text-[1.9rem]">{about.paragraphs[1]}</p>
          </Reveal>
          <div className="lg:col-span-6">
            <Reveal>
              <h2 className="font-display type-h3 text-azul">{about.way.title}</h2>
            </Reveal>
            <DrawLine className="my-5" />
            <Stagger as="ul" className="space-y-4">
              {about.way.bullets.map((b) => (
                <StaggerItem as="li" key={b} className="flex items-start gap-4">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-dorado/50 text-dorado-2">
                    <Check className="size-3.5" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-carbon/90">{b}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </Section>

      {/* Misión y visión */}
      <Section tone="grid-azul">
        <Stagger className="grid gap-6 md:grid-cols-2" amount={0.2}>
          {[about.mission, about.vision].map((block, i) => (
            <StaggerItem key={block.title} className="rounded-brand border border-blanco/15 bg-azul/60 p-8 backdrop-blur-sm md:p-10">
              <p className="eyebrow !text-dorado flex items-center gap-3">
                <span className="tabular-nums" aria-hidden>
                  {pad2(i + 2)}
                </span>
                <span className="h-px w-8 bg-dorado/60" aria-hidden />
                {block.title}
              </p>
              <p className="font-display mt-6 text-[1.35rem] leading-[1.35] text-balance text-blanco md:text-[1.6rem]">{block.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Valores: tabla en escritorio, tarjetas en móvil */}
      <Section tone="marfil">
        <SectionHeading number="04" eyebrow={site.pillars[0]} title={about.values.title} />
        <Reveal>
          <table className="hidden w-full border-collapse md:table">
            <thead>
              <tr className="border-b border-azul/30 text-left">
                {about.values.columns.map((c) => (
                  <th key={c} scope="col" className="eyebrow pb-4 pr-6 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {about.values.rows.map((r) => (
                <tr key={r.value} className="group border-b border-gris transition-colors hover:bg-blanco">
                  <th scope="row" className="font-display w-[30%] py-5 pr-6 text-left text-[1.35rem] font-normal text-azul">
                    {r.value}
                  </th>
                  <td className="py-5 text-carbon/90">{r.expression}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <Stagger as="ul" className="grid gap-4 md:hidden">
          {about.values.rows.map((r) => (
            <StaggerItem as="li" key={r.value} className="rounded-brand border border-gris bg-blanco p-5">
              <p className="eyebrow">{about.values.columns[0]}</p>
              <p className="font-display mt-1 text-[1.35rem] text-azul">{r.value}</p>
              <DrawLine className="my-3" />
              <p className="eyebrow">{about.values.columns[1]}</p>
              <p className="mt-1 text-[0.98rem] text-carbon/90">{r.expression}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/*
        Equipo profesional: sección omitida intencionalmente hasta contar con datos
        confirmados (fotografía profesional, nombre completo, cargo, cédula profesional,
        áreas de práctica, síntesis curricular). No inventar perfiles ni usar fotos de banco.
      */}

      <ClosingCta title={home.closing.title} text={home.closing.text} cta={home.closing.cta} section="about_closing" />
    </>
  );
}
