import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileUp, Gavel, Info, ShieldCheck, Video, X } from "lucide-react";
import { landing } from "@content/landing";
import { creditoRepresentacion, productos, situaciones } from "@content/productos";
import { site } from "@content/site";
import { env } from "@/lib/env";
import { formatMoney } from "@/lib/pricing";
import { getCupoSemana } from "@/lib/booking";
import { dbReady } from "@/lib/db";
import { pad2 } from "@/lib/utils";
import { Accordion } from "@/components/ui/Accordion";
import { VideoBlock } from "@/components/landing/VideoBlock";
import { AgenteIaLink } from "@/components/landing/AgenteIaLink";
import { CountUp, ReadingProgress, SpotlightCard, TrazoIcono, WordReveal } from "@/components/landing/Efectos";
import { EquipoBlock } from "@/components/landing/EquipoBlock";
import { ExitIntent } from "@/components/landing/ExitIntent";
import { MagneticLink } from "@/components/landing/Magnetico";
import { BarraFija } from "@/components/landing/BarraFija";
import { TrackedLink } from "@/components/ui/TrackedLink";

export const metadata: Metadata = {
  title: "Defensa laboral para patrones y empresas · VERITUM",
  description: landing.hero.text,
  robots: { index: false, follow: false },
};

// El cupo sale de la agenda real en cada visita: sin esto la página se
// prerenderizaría y el número quedaría congelado en el momento del build.
export const dynamic = "force-dynamic";

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as React.CSSProperties;

/** Enlace al alta llevando la situación, para que el formulario llegue resuelto. */
const hrefSituacion = (id: string) => `/consulta/agendar?situacion=${id}`;

// Landing de campaña para anuncios de Meta. Defensa laboral patronal.
// Mobile-first: una sola columna, CTA siempre a un pulgar y barra fija inferior.
export default async function LandingPage() {
  const desde = formatMoney(Math.min(...productos.map((p) => p.precioCentavos)));

  // Cupo real: se cuenta la agenda de verdad. Sin base de datos no se muestra
  // ningún número en lugar de inventarlo.
  const cupo = dbReady ? await getCupoSemana().catch(() => null) : null;
  const libres = cupo?.libres ?? 0;
  const pocos = libres > 0 && libres <= 5;

  return (
    <>
      <ReadingProgress />
      <ExitIntent agenteUrl={env.agenteIaUrl} />

      {/* Hero ---------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="orbe orbe-azul left-[-18%] top-[-10%] size-[22rem]" />
          <span className="orbe orbe-dorado right-[-16%] top-[14%] size-[18rem]" />
          <div className="absolute inset-x-0 top-0 h-64 bg-grid-marfil opacity-50" />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 pb-10 pt-8">
          <p className="eyebrow anim-fade flex items-center gap-2" style={d(0)}>
            <span className="h-px w-6 bg-dorado" aria-hidden />
            {landing.hero.eyebrow}
          </p>

          <WordReveal
            texto={landing.hero.title}
            as="h1"
            brillo="azul"
            className="font-display type-h1 mt-3 text-balance text-azul"
          />

          <p className="anim-rise-lcp mt-5 text-[1.0625rem] leading-relaxed text-carbon/90" style={d(140)}>
            {landing.hero.text}
          </p>

          <ul className="mt-6 space-y-2.5" data-stagger="">
            {landing.hero.puntos.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[0.98rem] text-carbon/90" data-reveal="">
                <TrazoIcono className="mt-0.5 shrink-0 text-dorado-2">
                  <Check className="size-[18px]" strokeWidth={2} aria-hidden />
                </TrazoIcono>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          {/* Precio de entrada y crédito, sin cuenta atrás ni precio tachado */}
          <div className="anim-rise mt-8 rounded-brand border border-gris bg-blanco p-5 shadow-card" style={d(240)}>
            <p className="eyebrow">Desde</p>
            <p className="font-display mt-1 text-[2.25rem] leading-none text-azul">{desde}</p>
            <p className="mt-2 text-[0.95rem] text-carbon/85">
              Sesión de hasta 60 minutos con un abogado laboral. Dos servicios según lo que necesites revisar.
            </p>
            <p className="mt-3 flex gap-2 rounded-brand bg-marfil p-3 text-[0.9rem] text-carbon/90">
              <Check className="mt-0.5 size-4 shrink-0 text-dorado-2" strokeWidth={2} aria-hidden />
              <span>{creditoRepresentacion.titulo}.</span>
            </p>
          </div>

          {/* Cupo real de la agenda */}
          {libres > 0 && (
            <p className="anim-fade mt-5 flex items-center gap-2 text-[0.95rem] text-carbon/85" style={d(300)}>
              <span className={pocos ? "punto-vivo" : "size-2 rounded-full bg-dorado"} aria-hidden />
              <span>
                <strong className="text-azul">{landing.escasez.titulo(libres)}</strong>
                {pocos && <> · {landing.escasez.pocos}</>}
              </span>
            </p>
          )}

          <div className="anim-rise mt-7 space-y-3" style={d(360)}>
            <MagneticLink
              href="#servicios"
              size="lg"
              arrow
              className="w-full"
              event="cta_agenda"
              payload={{ section: "hero", element_id: "hero_cta" }}
            >
              {landing.hero.cta}
            </MagneticLink>
            {env.agenteIaUrl && (
              <AgenteIaLink href={env.agenteIaUrl} className="w-full">
                {landing.agente.cta}
              </AgenteIaLink>
            )}
          </div>

          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-carbon/70">
            <Video className="size-3.5 text-dorado-2" aria-hidden />
            {site.modalidad} · {site.coverage}
          </p>
        </div>

        {/* Cinta de alcance: una línea, y todo lo que dice es cierto */}
        <div className="cinta relative border-y border-gris bg-blanco py-3">
          <div className="cinta-anim flex w-max gap-8 px-4 text-sm uppercase tracking-wider text-carbon/70">
            {[...landing.alcance, ...landing.alcance].map((a, i) => (
              <span key={`${a}-${i}`} className="flex shrink-0 items-center gap-8">
                {a}
                <span className="size-1 rounded-full bg-dorado" aria-hidden />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Las tres situaciones ------------------------------------------- */}
      <section className="mx-auto max-w-2xl px-4 py-12" aria-labelledby="situaciones-titulo">
        <p className="eyebrow" data-reveal="">
          {landing.situaciones.eyebrow}
        </p>
        <h2 id="situaciones-titulo" className="font-display type-h2 mt-2 text-balance text-azul" data-reveal="">
          {landing.situaciones.title}
        </h2>
        <p className="mt-3 text-carbon/85" data-reveal="">
          {landing.situaciones.text}
        </p>

        <div className="mt-8 space-y-4" data-stagger="">
          {situaciones.map((s, i) => (
            <div key={s.id} data-reveal="">
              <SpotlightCard className="rounded-brand border border-gris bg-blanco p-5">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[1.6rem] leading-none text-dorado/70 tabular-nums">{pad2(i + 1)}</span>
                <h3 className="font-display text-[1.15rem] leading-snug text-azul">{s.titulo}</h3>
              </div>
              <p className="mt-3 text-[0.98rem] text-carbon/85">{s.texto}</p>
              <ul className="mt-4 space-y-2">
                {s.queHacemos.map((q) => (
                  <li key={q} className="flex gap-2.5 text-[0.92rem] text-carbon/80">
                    <Check className="mt-0.5 size-4 shrink-0 text-dorado-2" strokeWidth={2} aria-hidden />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
              <TrackedLink
                href={hrefSituacion(s.id)}
                variant="secondary"
                size="sm"
                arrow
                className="mt-5 w-full"
                event="cta_agenda"
                payload={{ section: "situaciones", element_id: s.id }}
              >
                {landing.situaciones.cta}
              </TrackedLink>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </section>

      {/* Solo defensa patronal ------------------------------------------ */}
      <section className="relative overflow-hidden bg-azul text-blanco">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-azul opacity-30" />
        <div className="relative mx-auto max-w-2xl px-4 py-12">
          <p className="eyebrow text-dorado" data-reveal="">
            {landing.soloPatronal.eyebrow}
          </p>
          <h2 className="font-display type-h2 mt-2 text-balance" data-reveal="">
            {landing.soloPatronal.title}
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-blanco/90" data-reveal="">
            {landing.soloPatronal.text}
          </p>

          <ul className="mt-6 space-y-3" data-stagger="">
            {landing.soloPatronal.puntos.map((p) => (
              <li key={p} className="flex gap-3 text-[0.98rem] text-blanco/90" data-reveal="">
                <Gavel className="mt-0.5 size-[18px] shrink-0 text-dorado" strokeWidth={1.75} aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 flex gap-3 border-l-2 border-dorado pl-4 text-[0.95rem] text-blanco/75" data-reveal="">
            <X className="mt-0.5 size-4 shrink-0 text-dorado" strokeWidth={2} aria-hidden />
            <span>{landing.soloPatronal.noHacemos}</span>
          </p>
        </div>
      </section>

      {/* Cómo trabajamos ----------------------------------------------- */}
      <section id="como-trabajamos" className="mx-auto max-w-2xl scroll-mt-16 px-4 py-12">
        <p className="eyebrow" data-reveal="">
          {landing.comoTrabajamos.eyebrow}
        </p>
        <h2 className="font-display type-h2 mt-2 text-balance text-azul" data-reveal="">
          {landing.comoTrabajamos.title}
        </h2>

        <ol className="mt-8 space-y-6" data-stagger="">
          {landing.comoTrabajamos.items.map((p, i) => (
            <li key={p.titulo} className="flex gap-4" data-reveal="">
              <span className="font-display shrink-0 text-[1.5rem] leading-none text-dorado/70 tabular-nums">
                {pad2(i + 1)}
              </span>
              <span>
                <span className="block font-medium text-azul">{p.titulo}</span>
                <span className="mt-1 block text-[0.98rem] text-carbon/85">{p.texto}</span>
              </span>
            </li>
          ))}
        </ol>

        <MagneticLink
          href="#servicios"
          size="lg"
          arrow
          className="mt-8 w-full"
          event="cta_agenda"
          payload={{ section: "como-trabajamos", element_id: "proceso_cta" }}
        >
          {landing.hero.cta}
        </MagneticLink>
      </section>

      {/* Video (solo si hay archivo configurado) ------------------------ */}
      {env.landingVideo && (
        <section className="mx-auto max-w-2xl px-4 pb-12">
          <p className="eyebrow" data-reveal="">
            {landing.video.eyebrow}
          </p>
          <h2 className="font-display type-h2 mt-2 text-balance text-azul" data-reveal="">
            {landing.video.title}
          </h2>
          <div className="mt-6" data-reveal="">
            <VideoBlock src={env.landingVideo} poster={env.landingVideoPoster} />
          </div>
        </section>
      )}

      {/* Qué recibes --------------------------------------------------- */}
      <section className="bg-blanco">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <p className="eyebrow" data-reveal="">
            {landing.recibes.eyebrow}
          </p>
          <h2 className="font-display type-h2 mt-2 text-balance text-azul" data-reveal="">
            {landing.recibes.title}
          </h2>

          <ul className="mt-6 space-y-3" data-stagger="">
            {landing.recibes.items.map((x) => (
              <li key={x} className="flex gap-3 text-[0.98rem] text-carbon/90" data-reveal="">
                <Check className="mt-0.5 size-[18px] shrink-0 text-dorado-2" strokeWidth={2} aria-hidden />
                <span>{x}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 rounded-brand border-l-2 border-dorado bg-marfil p-4 text-[0.95rem] text-carbon/85" data-reveal="">
            {landing.recibes.honestidad}
          </p>
        </div>
      </section>

      {/* Los dos servicios + el crédito --------------------------------- */}
      <section id="servicios" className="mx-auto max-w-2xl scroll-mt-16 px-4 py-12" aria-labelledby="servicios-titulo">
        <p className="eyebrow" data-reveal="">
          Elige tu servicio
        </p>
        <h2 id="servicios-titulo" className="font-display type-h2 mt-2 text-balance text-azul" data-reveal="">
          Dos formas de empezar hoy
        </h2>

        <div className="mt-8 space-y-4" data-stagger="">
          {productos.map((p) => (
            <div key={p.id} className="borde-vivo rounded-brand border border-gris bg-blanco p-5" data-reveal="">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-[1.15rem] leading-snug text-azul">{p.nombre}</h3>
                <p className="font-display text-[1.75rem] leading-none tabular-nums text-azul">
                  {formatMoney(p.precioCentavos)}
                </p>
              </div>
              <p className="mt-3 text-[0.98rem] text-carbon/85">{p.resumen}</p>

              <ul className="mt-4 space-y-2">
                {p.incluye.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[0.92rem] text-carbon/85">
                    <Check className="mt-0.5 size-4 shrink-0 text-dorado-2" strokeWidth={2} aria-hidden />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>

              {p.requiereDocumentos && (
                <p className="mt-4 flex items-center gap-2 text-xs text-carbon/75">
                  <FileUp className="size-3.5 shrink-0 text-dorado-2" aria-hidden />
                  Cargas tu documentación en tu portal al confirmar el pago.
                </p>
              )}

              {p.aviso && (
                <p className="mt-4 flex gap-2 rounded-brand border border-dorado/40 bg-marfil p-3 text-[0.88rem] text-carbon/85">
                  <Info className="mt-0.5 size-4 shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
                  <span>{p.aviso}</span>
                </p>
              )}

              <MagneticLink
                href={`/consulta/agendar?producto=${p.id}`}
                size="lg"
                arrow
                className="mt-5 w-full"
                event="cta_agenda"
                payload={{ section: "servicios", element_id: p.id }}
              >
                Contratar este servicio
              </MagneticLink>
            </div>
          ))}
        </div>

        {/* El crédito de representación, junto a los precios y los botones */}
        <div className="mt-6 rounded-brand border border-dorado bg-blanco p-5" data-reveal="">
          <p className="eyebrow text-dorado-2">El beneficio</p>
          <h3 className="font-display mt-2 text-[1.25rem] leading-snug text-azul">{creditoRepresentacion.titulo}</h3>
          <p className="mt-3 text-[0.98rem] text-carbon/85">{creditoRepresentacion.texto}</p>

          <div className="mt-5 rounded-brand bg-marfil p-4">
            <p className="eyebrow">{creditoRepresentacion.ejemplo.titulo}</p>
            <dl className="mt-3 space-y-1.5 text-[0.95rem]">
              <div className="flex justify-between gap-4">
                <dt className="text-carbon/85">Tu asesoría</dt>
                <dd className="tabular-nums text-carbon/85">
                  {formatMoney(creditoRepresentacion.ejemplo.asesoriaCentavos)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-carbon/85">Honorarios de representación</dt>
                <dd className="tabular-nums text-carbon/85">
                  {formatMoney(creditoRepresentacion.ejemplo.honorariosCentavos)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-carbon/85">Se descuenta</dt>
                <dd className="tabular-nums text-dorado-2">
                  − {formatMoney(creditoRepresentacion.ejemplo.asesoriaCentavos)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-gris pt-2">
                <dt className="font-medium text-azul">Saldo de honorarios</dt>
                <dd className="font-display text-[1.25rem] leading-none text-azul">
                  <CountUp hasta={creditoRepresentacion.ejemplo.saldoCentavos / 100} moneda="MXN" />
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-carbon/70">{creditoRepresentacion.ejemplo.nota}</p>
          </div>

          <ul className="mt-5 space-y-2">
            {creditoRepresentacion.condiciones.map((c) => (
              <li key={c} className="flex gap-2.5 text-[0.9rem] text-carbon/80">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-dorado" aria-hidden />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Honorarios y condiciones -------------------------------------- */}
      <section className="bg-blanco">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <p className="eyebrow" data-reveal="">
            {landing.honorarios.eyebrow}
          </p>
          <h2 className="font-display type-h2 mt-2 text-balance text-azul" data-reveal="">
            {landing.honorarios.title}
          </h2>

          <div className="mt-6 space-y-4" data-stagger="">
            {landing.honorarios.items.map((h) => (
              <div key={h.titulo} className="rounded-brand border border-gris bg-marfil p-4" data-reveal="">
                <p className="font-medium text-azul">{h.titulo}</p>
                <p className="mt-1.5 text-[0.95rem] text-carbon/85">{h.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objeciones ---------------------------------------------------- */}
      <section className="mx-auto max-w-2xl px-4 py-12">
        <p className="eyebrow" data-reveal="">
          {landing.objeciones.eyebrow}
        </p>
        <h2 className="font-display type-h2 mt-2 text-balance text-azul" data-reveal="">
          {landing.objeciones.title}
        </h2>
        <div className="mt-6 space-y-4" data-stagger="">
          {landing.objeciones.items.map((o) => (
            <div key={o.objecion} className="rounded-brand border border-gris bg-blanco p-4" data-reveal="">
              <p className="font-medium text-azul">{o.objecion}</p>
              <p className="mt-1.5 text-[0.95rem] text-carbon/85">{o.respuesta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quién te atiende ---------------------------------------------- */}
      <section className="bg-blanco">
        <div className="mx-auto max-w-2xl px-4 py-12" data-reveal="">
          <EquipoBlock />
        </div>
      </section>

      {/* Tu portal ----------------------------------------------------- */}
      <section className="mx-auto max-w-2xl px-4 py-12">
        <p className="eyebrow" data-reveal="">
          {landing.portal.eyebrow}
        </p>
        <h2 className="font-display type-h2 mt-2 text-balance text-azul" data-reveal="">
          {landing.portal.title}
        </h2>
        <p className="mt-3 text-carbon/85" data-reveal="">
          {landing.portal.text}
        </p>
        <ul className="mt-5 space-y-3" data-stagger="">
          {landing.portal.puntos.map((p) => (
            <li key={p} className="flex gap-3 text-[0.98rem] text-carbon/90" data-reveal="">
              <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Preguntas ----------------------------------------------------- */}
      <section className="bg-blanco">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <p className="eyebrow" data-reveal="">
            {landing.faq.eyebrow}
          </p>
          <h2 className="font-display type-h2 mt-2 text-balance text-azul" data-reveal="">
            {landing.faq.title}
          </h2>
          <div className="mt-6" data-reveal="">
            <Accordion items={landing.faq.extra.map((f) => ({ id: f.id, q: f.q, a: f.a }))} />
          </div>
        </div>
      </section>

      {/* Agente IA ----------------------------------------------------- */}
      {env.agenteIaUrl && (
        <section className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-brand border border-gris bg-blanco p-5" data-reveal="">
            <p className="font-display text-[1.1rem] text-azul">{landing.agente.title}</p>
            <p className="mt-2 text-[0.95rem] text-carbon/85">{landing.agente.text}</p>
            <AgenteIaLink href={env.agenteIaUrl} className="mt-4 w-full">
              {landing.agente.cta}
            </AgenteIaLink>
          </div>
        </section>
      )}

      {/* Cierre -------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-azul text-blanco">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-azul opacity-30" />
        <div className="relative mx-auto max-w-2xl px-4 py-14 text-center">
          <WordReveal
            texto={landing.cierre.title}
            as="h2"
            brillo="claro"
            className="font-display type-h2 text-balance"
          />
          <p className="mx-auto mt-4 max-w-lg text-blanco/85">{landing.cierre.text}</p>

          {libres > 0 && (
            <p className="mt-4 text-sm text-blanco/75">{landing.escasez.titulo(libres)}</p>
          )}

          <MagneticLink
            href="#servicios"
            variant="inverse"
            size="lg"
            arrow
            className="mt-7 w-full sm:w-auto"
            event="cta_agenda"
            payload={{ section: "cierre", element_id: "cierre_cta" }}
          >
            {landing.cierre.cta}
          </MagneticLink>

          <p className="mt-6 text-xs text-blanco/70">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-1 underline underline-offset-4 hover:text-dorado"
            >
              Conocer VERITUM
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </p>
        </div>
      </section>

      <BarraFija>
        <TrackedLink
          href="#servicios"
          size="sm"
          event="cta_agenda"
          payload={{ section: "landing_barra" }}
          className="h-11 flex-1"
        >
          {landing.barra.cta}
          <span className="ml-1 opacity-90">· desde {desde}</span>
          <ArrowRight className="size-4" aria-hidden />
        </TrackedLink>
        <AgenteIaLink href={env.agenteIaUrl} compact className="h-11">
          {landing.barra.asistente}
        </AgenteIaLink>
      </BarraFija>
    </>
  );
}
