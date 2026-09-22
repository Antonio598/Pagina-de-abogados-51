"use client";

import { motion, useReducedMotion } from "motion/react";
import { library, type LibraryResource } from "@content/library";
import { formatDate } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Cabecera de artículo: categoría, título, metadatos (fechas, responsable, lectura). */
export const ArticleHeader = ({ resource: r }: { resource: LibraryResource }) => {
  const reduced = useReducedMotion();
  const up = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0.15 : 0.55, ease: EASE, delay: reduced ? 0 : delay },
  });

  return (
    <header className="relative overflow-hidden bg-marfil">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-marfil [mask-image:radial-gradient(60%_60%_at_80%_0%,black,transparent)]" />
      <div className="container-editorial relative pb-12 pt-10 md:pb-16 md:pt-16">
        <motion.p {...up(0)} className="eyebrow flex flex-wrap items-center gap-3">
          <span className="h-px w-8 bg-dorado" aria-hidden />
          <span>{r.kind}</span>
          <span aria-hidden>·</span>
          <span className="normal-case tracking-normal text-carbon/60">{r.categories.join(" · ")}</span>
        </motion.p>
        <motion.h1 {...up(0.08)} className="font-display type-h1 mt-6 max-w-[20ch] text-balance text-azul">
          {r.title}
        </motion.h1>
        <motion.dl {...up(0.16)} className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-carbon/70">
          <div>
            <dt className="text-xs uppercase tracking-widest text-dorado-2">{library.publishedLabel}</dt>
            <dd className="mt-0.5">
              <time dateTime={r.publishedAt}>{formatDate(r.publishedAt)}</time>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-dorado-2">{library.updatedLabel}</dt>
            <dd className="mt-0.5">
              <time dateTime={r.updatedAt}>{formatDate(r.updatedAt)}</time>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-dorado-2">{library.authorLabel}</dt>
            <dd className="mt-0.5">{r.author}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-dorado-2">Lectura</dt>
            <dd className="mt-0.5">
              {r.readingMinutes} {library.readingLabel}
            </dd>
          </div>
        </motion.dl>
      </div>
    </header>
  );
};
