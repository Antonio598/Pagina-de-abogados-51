import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MapPin, ShieldCheck, Video } from "lucide-react";
import { landing } from "@content/landing";
import { faqsById } from "@content/faqs";
import { site } from "@content/site";
import { env } from "@/lib/env";
import { cobroConfigurado } from "@/lib/pricing";
import { getPromo } from "@/lib/promo-server";
import { promoMinutes } from "@/lib/promo";
import { getCupoSemana, SLOT_MINUTES } from "@/lib/booking";
import { dbReady } from "@/lib/db";
import { pad2 } from "@/lib/utils";
import { Accordion } from "@/components/ui/Accordion";
import { VideoBlock } from "@/components/landing/VideoBlock";
import { AgenteIaLink } from "@/components/landing/AgenteIaLink";
import { CountUp, ReadingProgress, SpotlightCard, TrazoIcono, WordReveal } from "@/components/landing/Efectos";
import { ExitIntent } from "@/components/landing/ExitIntent";
import { MagneticLink } from "@/components/landing/Magnetico";
import { BarraFija } from "@/components/landing/BarraFija";
import { TrackedLink } from "@/components/ui/TrackedLink";

export const metadata: Metadata = {
  title: "Agenda tu asesoría legal en línea · VERITUM",
  description: landing.hero.text,
  robots: { index: false, follow: false },
};

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as React.CSSProperties;

// Landing de campaña para anuncios de Meta. Mobile-first: una sola columna,
// CTA siempre a un pulgar de distancia y barra fija inferior.
export default async function LandingPage() {
  const { promo, precio } = await getPromo();
  const faqs = [...faqsById(["garantia", "primera-llamada", "documentos"]), ...landing.faq.extra];

  // Escasez real: se cuenta la agenda de verdad. Si no hay base de datos, no se
  // muestra ningún número en lugar de inventarlo.
  const cupo = dbReady ? await getCupoSemana().catch(() => null) : null;
  const libres = cupo?.libres ?? 0;
  const pocos = libres > 0 && libres <= 5;

  return (
    <>
      <ReadingProgress />
      <ExitIntent
        precio={precio.etiqueta}
        precioNormal={precio.etiquetaNormal}
        conDescuento={precio.conDescuento}
        restanteMs={promo.restanteMs}
        libres={libres}
      />

      {/* Hero ---------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        {/* Esferas de luz que respiran detrás del encabezado. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="orbe orbe-azul left-[-18%] top-[-10%] size-[22rem]" />
          <span className="orbe orbe-dorado right-[-16%] top-[14%] size-[18rem]" />
          <div className="absolute inset-x-0 top-0 h-64 bg-grid-marfil opacity-50" />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 pb-10 pt-8">
          <p className="eyebrow anim-rise flex items-center gap-2" style={d(0)}>
            <span className="h-px w-6 bg-dorado" aria-hidden />
            {landing.hero.eyebrow}
          </p>

          <WordReveal texto={landing.hero.title} delay={80} brillo="azul" className="font-display type-h1 mt-4 text-balance" />

          <p className="anim-rise-lcp mt-4 text-pretty text-[1.05rem] text-carbon/85" style={d(160)}>
            {landing.hero.text}
          </p>

          <ul className="anim-rise mt-6 space-y-2.5" style={d(220)}>
            {landing.hero.puntos.map((p, i) => (
              <li key={p} className="flex items-start gap-3 text-[0.98rem] text-carbon/90">
                <TrazoIcono largo={40} className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-dorado/60 text-dorado-2">
                  <Check className="size-3" strokeWidth={2.5} aria-hidden />
                </TrazoIcono>
                {p}
                <span className="sr-only">{i === 0 ? "" : ""}</span>
              </li>
            ))}
          </ul>

          {cobroConfigurado && (
            <div className="anim-rise mt-7 flex flex-wrap items-end gap-x-4 gap-y-2" style={d(260)}>
              <p className="font-display anim-pop text-[2.6rem] leading-none text-azul" style={d(320)}>
                <CountUp hasta={Math.round(precio.centavos / 100)} moneda={precio.moneda} />
              </p>
              {precio.conDescuento && (
                <p className="pb-1 text-sm text-carbon/70">
                  <span className="line-through">{precio.etiquetaNormal}</span>
                  <br />
                  <span className="text-dorado-2">{landing.promoLabel.toLowerCase()}</span>
                </p>
              )}
            </div>
          )}

          {/* Escasez real, calculada desde la agenda */}
          {libres > 0 && (
            <div
              className={`anim-rise mt-5 flex items-start gap-3 rounded-brand border p-4 ${pocos ? "pulso-dorado border-dorado/60 bg-dorado/10" : "border-gris bg-blanco"}`}
              style={d(300)}
            >
              <span className="punto-vivo mt-1.5 size-2.5 shrink-0 rounded-full bg-dorado text-dorado" aria-hidden />
              <p className="text-[0.95rem] text-carbon/90">
                <strong className="font-medium text-azul">{landing.escasez.titulo(libres)}</strong>
                <br />
                <span className="text-carbon/75">{pocos ? landing.escasez.pocos : landing.escasez.texto}</span>
              </p>
            </div>
          )}

          <div className="anim-rise mt-6 flex flex-col gap-3" style={d(340)}>
            <MagneticLink
              href="/consulta/agendar"
              size="lg"
              arrow
              event="cta_agenda"
              payload={{ section: "landing_hero", element_id: "hero" }}
              className="w-full"
            >
              {landing.hero.cta}
            </MagneticLink>
            <AgenteIaLink href={env.agenteIaUrl} className="w-full">
              {landing.agente.cta}
            </AgenteIaLink>
          </div>

          {promo.enabled && promo.active && (
            <p className="anim-fade mt-4 text-center text-xs text-carbon/70" style={d(400)}>
              {landing.promoAviso(promoMinutes)}
            </p>
          )}
        </div>

        {/* Cinta con las áreas de práctica */}
        <div className="relative overflow-hidden border-y border-gris bg-blanco py-3" aria-hidden>
          <div className="cinta-anim flex w-max gap-8 whitespace-nowrap">
            {[0, 1].map((v) => (
              <div key={v} className="flex gap-8">
                {landing.areas.map((a) => (
                  <span key={a} className="flex items-center gap-3 text-sm uppercase tracking-widest text-carbon/75">
                    <span className="size-1.5 rounded-full bg-dorado" />
                    {a}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cifras --------------------------------------------------------- */}
      <section className="mx-auto max-w-2xl px-4 py-10">
        <ul className="grid grid-cols-3 gap-3">
          {landing.cifras.map((c) => (
            <li key={c.texto} className="borde-vivo rounded-brand border border-gris bg-blanco p-4 text-center">
              <p className="font-display text-[1.7rem] leading-none text-azul">
                <CountUp hasta={c.valor} sufijo={"sufijo" in c ? c.sufijo : ""} />
              </p>
              <p className="mt-2 text-[0.75rem] leading-tight text-carbon/75">{c.texto}</p>
            </li>
          ))}
        </ul>
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
            <li key={item.titulo}>
              <SpotlightCard className="borde-vivo rounded-brand border border-gris bg-blanco p-5 shadow-card transition-transform duration-250 hover:-translate-y-1">
                <p className="font-display flex items-baseline gap-3 text-[1.15rem] text-azul">
                  <span className="text-sm tabular-nums text-dorado-2" aria-hidden>
                    {pad2(i + 1)}
                  </span>
                  {item.titulo}
                </p>
                <p className="mt-2 pl-8 text-[0.95rem] text-carbon/85">{item.texto}</p>
              </SpotlightCard>
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

      {/* Objeciones ----------------------------------------------------- */}
      <section className="mx-auto max-w-2xl px-4 py-12">
        <p className="eyebrow">{landing.objeciones.eyebrow}</p>
        <h2 className="font-display type-h2 mt-2 text-azul">{landing.objeciones.title}</h2>
        <ul className="mt-6 space-y-4">
          {landing.objeciones.items.map((o) => (
            <li key={o.objecion} className="rounded-brand border border-gris bg-marfil p-5">
              <p className="font-display text-[1.1rem] text-azul">{o.objecion}</p>
              <p className="mt-2 text-[0.95rem] text-carbon/85">{o.respuesta}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Cómo funciona -------------------------------------------------- */}
      <section className="border-y border-gris bg-blanco">
        <div className="mx-auto max-w-2xl px-4 py-12">
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
            <MagneticLink href="/consulta/agendar" size="lg" arrow event="cta_agenda" payload={{ section: "landing_pasos" }} className="w-full">
              {landing.hero.cta}
            </MagneticLink>
          </div>
        </div>
      </section>

      {/* Confianza ------------------------------------------------------ */}
      <section className="mx-auto max-w-2xl px-4 py-12">
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
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-carbon/75">
          <span className="flex items-center gap-2">
            <Video className="size-4 text-dorado-2" aria-hidden />
            {site.modalidad}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-dorado-2" aria-hidden />
            {site.coverage}
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-dorado-2" aria-hidden />
            Sesión de {SLOT_MINUTES} minutos
          </span>
        </div>
      </section>

      {/* Preguntas ------------------------------------------------------ */}
      <section className="border-t border-gris bg-blanco">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <p className="eyebrow">{landing.faq.eyebrow}</p>
          <h2 className="font-display type-h2 mt-2 text-azul">{landing.faq.title}</h2>
          <Accordion items={faqs} className="mt-4" defaultOpen={0} />
        </div>
      </section>

      {/* Agente IA ------------------------------------------------------ */}
      {env.agenteIaUrl && (
        <section className="mx-auto max-w-2xl px-4 py-10">
          <h2 className="font-display type-h3 text-azul">{landing.agente.title}</h2>
          <p className="mt-3 text-[0.95rem] text-carbon/85">{landing.agente.text}</p>
          <AgenteIaLink href={env.agenteIaUrl} className="mt-5 w-full">
            {landing.agente.cta}
          </AgenteIaLink>
        </section>
      )}

      {/* Cierre --------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-azul text-marfil">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="orbe orbe-dorado left-[-10%] top-[-20%] size-[20rem] opacity-40" />
          <span className="orbe orbe-azul right-[-12%] bottom-[-25%] size-[22rem] opacity-60" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 py-14 text-center">
          <WordReveal as="h2" texto={landing.cierre.title} brillo="claro" className="font-display type-h1 block text-balance" />
          <p className="mx-auto mt-4 max-w-md text-marfil/85">{landing.cierre.text}</p>
          {libres > 0 && <p className="mt-3 text-sm text-dorado">{landing.escasez.titulo(libres)}</p>}
          <MagneticLink
            href="/consulta/agendar"
            size="lg"
            arrow
            variant="inverse"
            event="cta_agenda"
            payload={{ section: "landing_cierre" }}
            className="mt-7 w-full"
          >
            {landing.cierre.cta}
          </MagneticLink>
          <p className="mt-6 text-sm text-marfil/70">
            <Link href="/" className="underline underline-offset-4 hover:text-blanco">
              Conoce el sitio de VERITUM
            </Link>
          </p>
        </div>
      </section>

      {/* Barra de acción: aparece al dejar atrás el encabezado ----------- */}
      <BarraFija>
        <TrackedLink href="/consulta/agendar" size="sm" event="cta_agenda" payload={{ section: "landing_barra" }} className="h-11 flex-1">
          {landing.barra.cta}
          {cobroConfigurado && <span className="ml-1 opacity-90">· {precio.etiqueta}</span>}
          <ArrowRight className="size-4" aria-hidden />
        </TrackedLink>
        <AgenteIaLink href={env.agenteIaUrl} compact className="h-11">
          {landing.barra.asistente}
        </AgenteIaLink>
      </BarraFija>
    </>
  );
}
