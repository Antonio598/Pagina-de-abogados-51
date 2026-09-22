import { home } from "@content/home";
import { site } from "@content/site";
import { ButtonLink } from "@/components/ui/Button";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { pad2 } from "@/lib/utils";

// Entrada coreografiada con CSS (anim-rise / anim-slide-x / anim-draw-x); sin JS.
const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as React.CSSProperties;

export const Hero = () => (
  <section className="relative overflow-hidden bg-marfil">
    {/* Retícula editorial muy sutil: no retrasa el contenido ni tapa nada. */}
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-marfil [mask-image:radial-gradient(70%_60%_at_70%_20%,black,transparent)]" />

    <div className="container-editorial relative grid gap-12 pb-16 pt-12 md:pt-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-28 lg:pt-24">
      <div className="lg:col-span-7">
        <p className="eyebrow anim-rise flex items-center gap-3" style={d(0)}>
          <span className="h-px w-8 bg-dorado" aria-hidden />
          {site.descriptor}
        </p>
        <h1 className="font-display type-h1 anim-rise-lcp mt-6 max-w-[16ch] text-balance text-azul" style={d(80)}>
          {home.hero.title}
        </h1>
        <p className="measure anim-rise-lcp mt-6 text-pretty text-[1.05rem] text-carbon/85 md:mt-7 md:text-[1.15rem]" style={d(160)}>
          {home.hero.text}
        </p>
        <div className="anim-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10" style={d(240)}>
          <TrackedLink href={home.hero.primary.href} event="cta_agenda" payload={{ section: "hero", element_id: "hero_agenda" }} size="lg" arrow>
            {home.hero.primary.label}
          </TrackedLink>
          <ButtonLink href={home.hero.secondary.href} size="lg" variant="secondary">
            {home.hero.secondary.label}
          </ButtonLink>
        </div>
      </div>

      {/* Panel del Método VERITUM: Escuchar → Entender → Diagnosticar → Diseñar → Actuar → Acompañar */}
      <aside aria-label="Método VERITUM" className="anim-rise relative lg:col-span-5" style={d(200)}>
        <div className="absolute -inset-x-3 -inset-y-3 rounded-[10px] border border-dorado/25 lg:-inset-x-5 lg:-inset-y-5" aria-hidden />
        <div className="relative rounded-brand bg-azul p-6 text-marfil shadow-card-hover md:p-9">
          <p className="eyebrow !text-dorado">Método VERITUM</p>
          <ol className="mt-5 md:mt-6">
            {site.method.map((step, i) => (
              <li key={step} className="anim-slide-x relative flex items-baseline gap-4 py-2.5 md:py-3" style={d(450 + i * 90)}>
                <span className="font-display w-8 shrink-0 text-sm tabular-nums text-dorado" aria-hidden>
                  {pad2(i + 1)}
                </span>
                <span className="font-display text-[1.35rem] leading-tight text-blanco md:text-[1.6rem]">{step}</span>
                <span aria-hidden className="anim-draw-x absolute bottom-0 left-12 right-0 h-px bg-blanco/15" style={d(550 + i * 90)} />
              </li>
            ))}
          </ol>
          <p className="anim-fade mt-5 text-sm text-marfil/70 md:mt-6" style={d(1100)}>
            {site.tagline}
          </p>
        </div>
      </aside>
    </div>
  </section>
);
