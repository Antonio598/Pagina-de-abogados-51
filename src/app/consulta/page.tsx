import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { landing } from "@content/landing";
import { faqsById } from "@content/faqs";
import { site } from "@content/site";
import { env } from "@/lib/env";
import { cobroConfigurado } from "@/lib/pricing";
import { getPromo } from "@/lib/promo-server";
import { promoMinutes } from "@/lib/promo";
import { SLOT_MINUTES } from "@/lib/booking";
import { pad2 } from "@/lib/utils";
import { Accordion } from "@/components/ui/Accordion";
import { VideoBlock } from "@/components/landing/VideoBlock";
import { AgenteIaLink } from "@/components/landing/AgenteIaLink";
import { TrackedLink } from "@/components/ui/TrackedLink";

export const metadata: Metadata = {
  title: "Agenda tu asesoría legal · VERITUM",
  description: landing.hero.text,
  robots: { index: false, follow: false },
};

// Landing de campaña para anuncios de Meta. Mobile-first: una sola columna,
// CTA siempre a un pulgar de distancia y barra fija inferior.
export default async function LandingPage() {
  const { promo, precio } = await getPromo();
  const faqs = [...faqsById(["garantia", "primera-llamada", "documentos"]), ...landing.faq.extra];

  return (
    <>
      {/* Hero ---------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-grid-marfil opacity-70" />
        <div className="relative mx-auto max-w-2xl px-4 pb-10 pt-8">
          <p className="eyebrow anim-rise flex items-center gap-2">
            <span className="h-px w-6 bg-dorado" aria-hidden />
            {landing.hero.eyebrow}
          </p>
          <h1 className="font-display type-h1 anim-rise-lcp mt-4 text-balance text-azul" style={{ ["--d" as string]: "60ms" }}>
            {landing.hero.title}
          </h1>
          <p className="anim-rise-lcp mt-4 text-pretty text-[1.05rem] text-carbon/85" style={{ ["--d" as string]: "120ms" }}>
            {landing.hero.text}
          </p>

          <ul className="anim-rise mt-6 space-y-2.5" style={{ ["--d" as string]: "180ms" }}>
            {landing.hero.puntos.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[0.98rem] text-carbon/90">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-dorado/60 text-dorado-2">
                  <Check className="size-3" strokeWidth={2.5} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>

          {cobroConfigurado && (
            <div className="anim-rise mt-7 flex items-end gap-3" style={{ ["--d" as string]: "220ms" }}>
              <p className="font-display text-[2.4rem] leading-none text-azul">{precio.etiqueta}</p>
              {precio.conDescuento && (
                <p className="pb-1 text-sm text-carbon/70">
                  <span className="line-through">{precio.etiquetaNormal}</span>
                  <br />
                  <span className="text-dorado-2">{landing.promoLabel.toLowerCase()}</span>
                </p>
              )}
            </div>
          )}

          <div className="anim-rise mt-6 flex flex-col gap-3" style={{ ["--d" as string]: "260ms" }}>
            <TrackedLink href="/consulta/agendar" size="lg" arrow event="cta_agenda" payload={{ section: "landing_hero", element_id: "hero" }} className="w-full">
              {landing.hero.cta}
            </TrackedLink>
            <AgenteIaLink href={env.agenteIaUrl} className="w-full">
              {landing.agente.cta}
            </AgenteIaLink>
          </div>

          {promo.enabled && promo.active && (
            <p className="anim-fade mt-4 text-center text-xs text-carbon/70" style={{ ["--d" as string]: "320ms" }}>
              {landing.promoAviso(promoMinutes)}
            </p>
          )}
        </div>
      </section>

      {/* Video ---------------------------------------------------------- */}
      {env.landingVideo && (
        <section className="border-y border-gris bg-blanco">
          <div className="mx-auto max-w-2xl px-4 py-10">
            <p className="eyebrow">{landing.video.eyebrow}</p>
            <h2 className="font-display type-h2 mt-2 text-azul">{landing.video.title}</h2>
            <div className="mt-5">
              <VideoBlock src={env.landingVideo} poster={env.landingVideoPoster} />
            </div>
          </div>
        </section>
      )}

      {/* Para quién es -------------------------------------------------- */}
      <section className="mx-auto max-w-2xl px-4 py-12">
        <p className="eyebrow">{landing.paraTi.eyebrow}</p>
        <h2 className="font-display type-h2 mt-2 text-azul">{landing.paraTi.title}</h2>
        <ul className="mt-6 space-y-3">
          {landing.paraTi.items.map((item, i) => (
            <li key={item.titulo} className="rounded-brand border border-gris bg-blanco p-5 shadow-card">
              <p className="font-display flex items-baseline gap-3 text-[1.15rem] text-azul">
                <span className="text-sm tabular-nums text-dorado-2" aria-hidden>
                  {pad2(i + 1)}
                </span>
                {item.titulo}
              </p>
              <p className="mt-2 pl-8 text-[0.95rem] text-carbon/85">{item.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Qué incluye ---------------------------------------------------- */}
      <section className="bg-grid-azul text-marfil">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <p className="eyebrow !text-dorado">{landing.incluye.eyebrow}</p>
          <h2 className="font-display type-h2 mt-2 text-blanco">{landing.incluye.title}</h2>
          <ul className="mt-6 divide-y divide-blanco/15 border-y border-blanco/15">
            {landing.incluye.items.map((item) => (
              <li key={item} className="flex items-start gap-3 py-4">
                <Check className="mt-1 size-4 shrink-0 text-dorado" strokeWidth={2.5} aria-hidden />
                <span className="text-marfil/90">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-brand border-l-2 border-dorado bg-blanco/5 p-4 text-[0.95rem] text-marfil/85">
            {landing.incluye.honestidad}
          </p>
        </div>
      </section>

      {/* Cómo funciona -------------------------------------------------- */}
      <section className="mx-auto max-w-2xl px-4 py-12">
        <p className="eyebrow">{landing.pasos.eyebrow}</p>
        <h2 className="font-display type-h2 mt-2 text-azul">{landing.pasos.title}</h2>
        <ol className="mt-6 space-y-5">
          {landing.pasos.items.map((p, i) => (
            <li key={p.titulo} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dorado bg-blanco font-display text-sm tabular-nums text-azul">
                {pad2(i + 1)}
              </span>
              <span>
                <span className="font-display block text-[1.15rem] text-azul">{p.titulo}</span>
                <span className="mt-1 block text-[0.95rem] text-carbon/85">{p.texto}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <TrackedLink href="/consulta/agendar" size="lg" arrow event="cta_agenda" payload={{ section: "landing_pasos" }} className="w-full">
            {landing.hero.cta}
          </TrackedLink>
        </div>
      </section>

      {/* Confianza ------------------------------------------------------ */}
      <section className="border-y border-gris bg-blanco">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <p className="eyebrow">{landing.confianza.eyebrow}</p>
          <h2 className="font-display type-h2 mt-2 text-azul">{landing.confianza.title}</h2>
          <p className="mt-4 text-carbon/85">{landing.confianza.text}</p>
          <ol className="mt-6 grid grid-cols-3 gap-y-4 border-y border-gris py-5">
            {site.method.map((m, i) => (
              <li key={m} className="text-center">
                <span className="font-display block text-xs tabular-nums text-dorado-2" aria-hidden>
                  {pad2(i + 1)}
                </span>
                <span className="font-display mt-1 block text-[1.05rem] text-azul">{m}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 flex items-center gap-2 text-sm text-carbon/75">
            <ShieldCheck className="size-4 text-dorado-2" aria-hidden />
            {site.coverage} · sesión de {SLOT_MINUTES} minutos
          </p>
        </div>
      </section>

      {/* Preguntas ------------------------------------------------------ */}
      <section className="mx-auto max-w-2xl px-4 py-12">
        <p className="eyebrow">{landing.faq.eyebrow}</p>
        <h2 className="font-display type-h2 mt-2 text-azul">{landing.faq.title}</h2>
        <Accordion items={faqs} className="mt-4" defaultOpen={0} />
      </section>

      {/* Agente IA ------------------------------------------------------ */}
      {env.agenteIaUrl && (
        <section className="border-t border-gris bg-blanco">
          <div className="mx-auto max-w-2xl px-4 py-10">
            <h2 className="font-display type-h3 text-azul">{landing.agente.title}</h2>
            <p className="mt-3 text-[0.95rem] text-carbon/85">{landing.agente.text}</p>
            <AgenteIaLink href={env.agenteIaUrl} className="mt-5 w-full">
              {landing.agente.cta}
            </AgenteIaLink>
          </div>
        </section>
      )}

      {/* Cierre --------------------------------------------------------- */}
      <section className="bg-azul text-marfil">
        <div className="mx-auto max-w-2xl px-4 py-14 text-center">
          <h2 className="font-display type-h1 text-balance text-blanco">{landing.cierre.title}</h2>
          <p className="mx-auto mt-4 max-w-md text-marfil/85">{landing.cierre.text}</p>
          <TrackedLink href="/consulta/agendar" size="lg" arrow variant="inverse" event="cta_agenda" payload={{ section: "landing_cierre" }} className="mt-7 w-full">
            {landing.cierre.cta}
          </TrackedLink>
          <p className="mt-6 text-sm text-marfil/70">
            <Link href="/" className="underline underline-offset-4 hover:text-blanco">
              Conoce el sitio de VERITUM
            </Link>
          </p>
        </div>
      </section>

      {/* Barra fija inferior -------------------------------------------- */}
      <div className="sticky bottom-0 z-30 border-t border-gris bg-marfil pb-safe">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-2.5">
          <TrackedLink href="/consulta/agendar" size="sm" event="cta_agenda" payload={{ section: "landing_barra" }} className="h-11 flex-1">
            {landing.barra.cta}
            {cobroConfigurado && <span className="ml-1 opacity-90">· {precio.etiqueta}</span>}
            <ArrowRight className="size-4" aria-hidden />
          </TrackedLink>
          <AgenteIaLink href={env.agenteIaUrl} compact className="h-11">
            {landing.barra.asistente}
          </AgenteIaLink>
        </div>
      </div>
    </>
  );
}
