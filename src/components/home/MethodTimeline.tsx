"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { home } from "@content/home";
import { site } from "@content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { pad2 } from "@/lib/utils";

/** "Cómo trabajamos": cinco pasos con una línea dorada que se dibuja conforme se
 *  avanza en el scroll. No es parallax: solo el progreso de una línea. */
export const MethodTimeline = () => {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 });
  const scale = useTransform(smooth, [0, 1], [0, 1]);

  return (
    <Section tone="blanco" id="como-trabajamos">
      <SectionHeading number="03" eyebrow={site.pillars[1]} title={home.how.title} />

      <ol ref={ref} className="relative grid gap-10 lg:grid-cols-5 lg:gap-6">
        {/* Línea base + línea de progreso (horizontal en escritorio, vertical en móvil) */}
        <div aria-hidden className="absolute left-[1.35rem] top-0 h-full w-px bg-gris lg:left-0 lg:top-[1.35rem] lg:h-px lg:w-full" />
        <motion.div
          aria-hidden
          className="absolute left-[1.35rem] top-0 h-full w-px bg-dorado lg:left-0 lg:top-[1.35rem] lg:h-px lg:w-full"
          style={reduced ? { scaleY: 1, scaleX: 1 } : { scaleY: scale, scaleX: scale, transformOrigin: "top left" }}
        />
        {home.how.steps.map((step, i) => (
          <Reveal as="li" key={step} delay={i * 0.06} className="relative flex gap-5 lg:block lg:pt-14">
            <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border border-dorado bg-blanco font-display text-sm tabular-nums text-azul lg:absolute lg:top-0 lg:left-0">
              {pad2(i + 1)}
            </span>
            <p className="pt-2 text-pretty text-carbon/90 lg:pr-6 lg:pt-0">{step}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
};
