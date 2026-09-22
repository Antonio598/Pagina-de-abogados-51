"use client";

import { home } from "@content/home";
import { site } from "@content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { pad2 } from "@/lib/utils";

/** "Cómo trabajamos": cinco pasos con una línea dorada que se dibuja conforme se
 *  avanza en el scroll (horizontal en escritorio, vertical en móvil). */
export const MethodTimeline = () => {
  const { targetRef, lineRef } = useScrollProgress<HTMLOListElement, HTMLDivElement>("both");

  return (
    <Section tone="blanco" id="como-trabajamos">
      <SectionHeading number="03" eyebrow={site.pillars[1]} title={home.how.title} />

      <ol ref={targetRef} className="relative grid gap-9 lg:grid-cols-5 lg:gap-6">
        <div aria-hidden className="absolute left-[1.35rem] top-0 h-full w-px bg-gris lg:left-0 lg:top-[1.35rem] lg:h-px lg:w-full" />
        <div
          ref={lineRef}
          aria-hidden
          className="absolute left-[1.35rem] top-0 h-full w-px origin-top-left bg-dorado lg:left-0 lg:top-[1.35rem] lg:h-px lg:w-full"
          style={{ transform: "scale(0, 0)" }}
        />
        {home.how.steps.map((step, i) => (
          <Reveal as="li" key={step} delay={i * 0.06} className="relative flex gap-5 lg:block lg:pt-14">
            <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border border-dorado bg-blanco font-display text-sm tabular-nums text-azul lg:absolute lg:left-0 lg:top-0">
              {pad2(i + 1)}
            </span>
            <p className="pt-2 text-pretty text-carbon/90 lg:pr-6 lg:pt-0">{step}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
};
