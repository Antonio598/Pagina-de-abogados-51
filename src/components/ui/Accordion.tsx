"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Faq } from "@content/faqs";
import { cn } from "@/lib/utils";

type Props = { items: Faq[]; className?: string; inverse?: boolean; defaultOpen?: number };

export const Accordion = ({ items, className, inverse, defaultOpen }: Props) => {
  const [open, setOpen] = useState<number | null>(defaultOpen ?? null);
  const base = useId();
  const reduced = useReducedMotion();

  return (
    <div className={cn("divide-y", inverse ? "divide-blanco/15" : "divide-gris", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${base}-b-${i}`;
        const panelId = `${base}-p-${i}`;
        return (
          <div key={item.id}>
            <h3 className="m-0">
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  "flex w-full items-start justify-between gap-6 py-5 text-left type-h3 font-display transition-colors",
                  inverse ? "text-blanco hover:text-dorado" : "text-azul hover:text-azul-2",
                )}
              >
                <span className="text-pretty">{item.q}</span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-1.5 flex size-7 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-250 ease-brand",
                    inverse ? "border-blanco/30" : "border-azul/25",
                    isOpen && (inverse ? "rotate-45 border-dorado bg-dorado/15" : "rotate-45 border-dorado bg-dorado/10"),
                  )}
                >
                  <Plus className="size-4" strokeWidth={1.75} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0.15 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className={cn("measure pb-6 pr-12 text-pretty", inverse ? "text-marfil/80" : "text-carbon/85")}>{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
