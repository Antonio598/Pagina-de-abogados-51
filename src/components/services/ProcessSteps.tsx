"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { pad2 } from "@/lib/utils";

type Step = { title: string; text: string };

/** Seis pasos del proceso: el número queda fijo a la izquierda mientras el texto
 *  avanza; una línea vertical marca el progreso de lectura. */
export const ProcessSteps = ({ steps }: { steps: readonly Step[] }) => {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 });

  return (
    <Section tone="blanco" className="pt-4 md:pt-8 lg:pt-8">
      <ol ref={ref} className="relative">
        <div aria-hidden className="absolute bottom-0 left-6 top-0 w-px bg-gris lg:left-[calc(25%-0.5rem)]" />
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-6 top-0 w-px bg-dorado lg:left-[calc(25%-0.5rem)]"
          style={reduced ? undefined : { scaleY: progress, transformOrigin: "top" }}
        />
        {steps.map((step, i) => (
          <li key={step.title} className="grid gap-4 py-10 pl-16 lg:grid-cols-4 lg:gap-8 lg:py-14 lg:pl-0">
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
