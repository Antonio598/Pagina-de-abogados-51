"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { library, libraryCategories, resourceHref, type LibraryCategory, type LibraryResource } from "@content/library";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export const ResourceCta = ({ r, className }: { r: LibraryResource; className?: string }) => {
  const href = resourceHref(r);
  const isDownload = r.cta.kind === "download" && Boolean(r.downloadUrl);
  const onClick = () => {
    if (r.cta.kind === "download") track("guia_descargada", { resource: r.slug, result: isDownload ? "completado" : "iniciado" });
    if (r.cta.kind === "agenda") track("cta_agenda", { section: "library", element_id: `library_${r.slug}` });
  };
  const cls = cn("inline-flex min-h-10 items-center gap-1.5 text-[0.95rem] font-medium text-azul underline-offset-4 hover:underline", className);
  if (isDownload) {
    return (
      <a href={href} download onClick={onClick} className={cls}>
        {r.cta.label}
        <Download className="size-4" strokeWidth={1.75} aria-hidden />
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={cls}>
      {r.cta.label}
      <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden />
    </Link>
  );
};

/** Índice de Biblioteca con filtro por categoría (sin recarga). */
export const LibraryGrid = ({ resources }: { resources: LibraryResource[] }) => {
  const [active, setActive] = useState<LibraryCategory | null>(null);
  const filtered = useMemo(() => (active ? resources.filter((r) => r.categories.includes(active)) : resources), [active, resources]);

  return (
    <div>
      <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
        {[null, ...libraryCategories].map((c) => {
          const selected = active === c;
          return (
            <button
              key={c ?? "all"}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(c)}
              className={cn(
                "min-h-10 rounded-full border px-4 py-2 text-sm transition-[background-color,color,border-color] duration-200",
                selected ? "border-azul bg-azul text-blanco" : "border-gris bg-blanco text-azul hover:border-azul/40",
              )}
            >
              {c ?? library.allLabel}
            </button>
          );
        })}
      </div>

      {/* key={active} vuelve a montar la lista al filtrar para que la entrada en cascada se repita. */}
      <ul key={active ?? "all"} className="mt-10 grid gap-5 md:grid-cols-2" aria-live="polite">
          {filtered.map((r, i) => (
            <li
              key={r.slug}
              className="anim-rise flex h-full flex-col rounded-brand border border-gris bg-blanco p-6 shadow-card transition-[box-shadow,border-color] duration-250 [animation-duration:350ms] hover:border-dorado/40 hover:shadow-card-hover md:p-7"
              style={{ ["--d" as string]: `${i * 50}ms` } as React.CSSProperties}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-widest text-dorado-2">{r.kind}</span>
                <span className="text-xs text-carbon/70">
                  {r.readingMinutes} {library.readingLabel}
                </span>
              </div>
              <h2 className="font-display mt-4 type-h3 text-azul">
                <Link href={`/biblioteca/${r.slug}`} className="inline-block py-1 underline-offset-4 hover:underline">
                  {r.title}
                </Link>
              </h2>
              <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[0.92rem] text-carbon/75">
                {r.topics.slice(0, 4).map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-px w-3 bg-dorado" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                <ResourceCta r={r} />
                <ul className="flex flex-wrap gap-1.5">
                  {r.categories.map((c) => (
                    <li key={c} className="rounded-full bg-marfil px-2.5 py-0.5 text-xs uppercase tracking-wider text-carbon/75">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};
