"use client";

import { motion, useReducedMotion } from "motion/react";
import { home } from "@content/home";
import { site } from "@content/site";
import { ButtonLink } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { pad2 } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export const Hero = () => {
  const reduced = useReducedMotion();
  const up = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0.15 : 0.6, ease: EASE, delay: reduced ? 0 : delay },
  });

  return (
    <section className="relative overflow-hidden bg-marfil">
      {/* Retícula editorial muy sutil: no retrasa el contenido ni tapa nada. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-marfil [mask-image:radial-gradient(70%_60%_at_70%_20%,black,transparent)]" />

      <div className="container-editorial relative grid gap-14 pb-20 pt-14 md:pt-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="lg:col-span-7">
          <motion.p {...up(0)} className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-dorado" aria-hidden />
            {site.descriptor}
          </motion.p>
          <motion.h1 {...up(0.08)} className="font-display type-h1 mt-6 max-w-[16ch] text-balance text-azul">
            {home.hero.title}
          </motion.h1>
          <motion.p {...up(0.16)} className="measure mt-7 text-pretty text-[1.05rem] text-carbon/85 md:text-[1.15rem]">
            {home.hero.text}
          </motion.p>
          <motion.div {...up(0.24)} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={home.hero.primary.href} size="lg" arrow onClick={() => track("cta_agenda", { section: "hero", element_id: "hero_agenda" })}>
              {home.hero.primary.label}
            </ButtonLink>
            <ButtonLink href={home.hero.secondary.href} size="lg" variant="secondary">
              {home.hero.secondary.label}
            </ButtonLink>
          </motion.div>
        </div>

        {/* Panel del Método VERITUM: Escuchar → Entender → Diagnosticar → Diseñar → Actuar → Acompañar */}
        <motion.aside
          aria-label="Método VERITUM"
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.7, ease: EASE, delay: reduced ? 0 : 0.2 }}
          className="relative lg:col-span-5"
        >
          <div className="absolute -inset-x-3 -inset-y-3 rounded-[10px] border border-dorado/25 lg:-inset-x-5 lg:-inset-y-5" aria-hidden />
          <div className="relative rounded-brand bg-azul p-7 text-marfil shadow-card-hover md:p-9">
            <p className="eyebrow !text-dorado">Método VERITUM</p>
            <ol className="mt-6 space-y-0">
              {site.method.map((step, i) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: reduced ? 0 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduced ? 0.15 : 0.45, ease: EASE, delay: reduced ? 0 : 0.45 + i * 0.09 }}
                  className="relative flex items-baseline gap-4 py-3"
                >
                  <span className="font-display w-8 shrink-0 text-sm tabular-nums text-dorado" aria-hidden>
                    {pad2(i + 1)}
                  </span>
                  <span className="font-display text-[1.45rem] leading-tight text-blanco md:text-[1.6rem]">{step}</span>
                  <motion.span
                    aria-hidden
                    className="absolute bottom-0 left-12 right-0 h-px bg-blanco/15"
                    style={{ transformOrigin: "left" }}
                    initial={{ scaleX: reduced ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduced ? 0.15 : 0.7, ease: EASE, delay: reduced ? 0 : 0.55 + i * 0.09 }}
                  />
                </motion.li>
              ))}
            </ol>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: reduced ? 0 : 1.1 }}
              className="mt-6 text-sm text-marfil/70"
            >
              {site.tagline}
            </motion.p>
          </div>
        </motion.aside>
      </div>
    </section>
  );
};
