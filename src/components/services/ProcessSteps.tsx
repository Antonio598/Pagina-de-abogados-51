"use client";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { pad2 } from "@/lib/utils";

type Step = { title: string; text: string };

/** Seis pasos del proceso: el número queda fijo a la izquierda mientras el texto
 *  avanza; una línea vertical marca el progreso de lectura. */
export const ProcessSteps = ({ steps }: { steps: readonly Step[] }) => {
  const { targetRef, lineRef } = useScrollProgress<HTMLOListElement, HTMLDivElement>("y");

  return (
    <Section tone="blanco" className="pt-4 md:pt-8 lg:pt-8">
      <ol ref={targetRef} className="relative">
        <div aria-hidden className="absolute bottom-0 left-6 top-0 w-px bg-gris lg:left-[calc(25%-0.5rem)]" />
        <div ref={lineRef} aria-hidden className="absolute bottom-0 left-6 top-0 w-px origin-top bg-dorado lg:left-[calc(25%-0.5rem)]" style={{ transform: "scale(1, 0)" }} />
        {steps.map((step, i) => (
          <li key={step.title} className="grid gap-4 py-9 pl-16 lg:grid-cols-4 lg:gap-8 lg:py-14 lg:pl-0">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <span className="absolute left-0 flex size-12 items-center justify-center rounded-full border border-dorado bg-blanco font-display text-sm tabular-nums text-azul lg:relative lg:size-auto lg:border-0 lg:bg-transparent lg:text-[3.5rem] lg:leading-none lg:text-azul/90">
                {pad2(i + 1)}
              </span>
            </div>
            <Reveal className="lg:col-span-3 lg:max-w-2xl">
              <h2 className="font-display type-h2 text-azul">{step.title}</h2>
              <p className="mt-4 text-pretty text-carbon/85">{step.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
};
