"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  eyebrow?: string;
  title: string;
  text?: string;
  tone?: "marfil" | "azul";
  children?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
};

/** Encabezado de página interior: eyebrow, H1 serif y texto de introducción. */
export const PageHero = ({ eyebrow, title, text, tone = "marfil", children, aside, compact }: Props) => {
  const reduced = useReducedMotion();
  const inverse = tone === "azul";
  const up = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0.15 : 0.55, ease: EASE, delay: reduced ? 0 : delay },
  });

  return (
    <section className={cn("relative overflow-hidden", inverse ? "bg-grid-azul text-marfil" : "bg-marfil text-carbon")}>
      {!inverse && <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-marfil [mask-image:radial-gradient(60%_60%_at_80%_0%,black,transparent)]" />}
      <div className={cn("container-editorial relative grid gap-10 lg:grid-cols-12", compact ? "py-14 md:py-20" : "pb-16 pt-14 md:pb-24 md:pt-20 lg:pt-24")}>
        <div className={cn(aside ? "lg:col-span-7" : "lg:col-span-9")}>
          {eyebrow && (
            <motion.p {...up(0)} className={cn("eyebrow flex items-center gap-3", inverse && "!text-dorado")}>
              <span className="h-px w-8 bg-dorado" aria-hidden />
              {eyebrow}
            </motion.p>
          )}
          <motion.h1 {...up(0.08)} className={cn("font-display type-h1 mt-6 max-w-[18ch] text-balance", inverse ? "text-blanco" : "text-azul")}>
            {title}
          </motion.h1>
          {text && (
            <motion.p {...up(0.16)} className={cn("measure mt-7 text-pretty text-[1.05rem] md:text-[1.15rem]", inverse ? "text-marfil/85" : "text-carbon/85")}>
              {text}
            </motion.p>
          )}
          {children && (
            <motion.div {...up(0.24)} className="mt-9">
              {children}
            </motion.div>
          )}
        </div>
        {aside && (
          <motion.div {...up(0.2)} className="lg:col-span-5 lg:self-end">
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  );
};
