import { library, type LibraryResource } from "@content/library";
import { formatDate } from "@/lib/utils";

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as React.CSSProperties;

/** Cabecera de artículo: categoría, título, metadatos (fechas, responsable, lectura). */
export const ArticleHeader = ({ resource: r }: { resource: LibraryResource }) => {
  return (
    <header className="relative overflow-hidden bg-marfil">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-marfil [mask-image:radial-gradient(60%_60%_at_80%_0%,black,transparent)]" />
      <div className="container-editorial relative pb-12 pt-10 md:pb-16 md:pt-16">
        <p className="eyebrow anim-rise flex flex-wrap items-center gap-3" style={d(0)}>
          <span className="h-px w-8 bg-dorado" aria-hidden />
          <span>{r.kind}</span>
          <span aria-hidden>·</span>
          <span className="normal-case tracking-normal text-carbon/70">{r.categories.join(" · ")}</span>
        </p>
        <h1 className="font-display type-h1 anim-rise-lcp mt-6 max-w-[20ch] text-balance text-azul" style={d(80)}>
          {r.title}
        </h1>
        <dl className="anim-rise mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-carbon/70" style={d(160)}>
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
        </dl>
      </div>
    </header>
  );
};
