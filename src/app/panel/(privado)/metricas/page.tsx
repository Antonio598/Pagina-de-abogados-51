import Link from "next/link";
import { supabaseReady } from "@/lib/db";
import { getMetricas } from "@/lib/metrics";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const rangos = [
  { key: "7", label: "7 días" },
  { key: "30", label: "30 días" },
  { key: "90", label: "90 días" },
] as const;

const duracion = (ms: number) => {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
};

const Tarjeta = ({ titulo, valor, pie }: { titulo: string; valor: string; pie?: string }) => (
  <div className="rounded-brand border border-gris bg-blanco p-5">
    <p className="eyebrow">{titulo}</p>
    <p className="font-display mt-2 text-[2rem] leading-none tabular-nums text-azul">{valor}</p>
    {pie && <p className="mt-2 text-sm text-carbon/75">{pie}</p>}
  </div>
);

/** Barras apiladas en CSS: sin librerías de gráficas ni JavaScript extra. */
const Barras = ({ datos }: { datos: { etiqueta: string; sitio: number; landing: number }[] }) => {
  const max = Math.max(1, ...datos.map((d) => d.sitio + d.landing));
  return (
    <div className="flex h-40 items-end gap-1" role="img" aria-label="Visitas por día: sitio y landing">
      {datos.map((d) => {
        const total = d.sitio + d.landing;
        return (
          <div key={d.etiqueta} className="flex flex-1 flex-col items-center justify-end gap-1">
            <span className="flex w-full flex-col justify-end" style={{ height: `${(total / max) * 100}%` }}>
              <span className="w-full bg-dorado" style={{ height: `${((d.landing / (total || 1)) * 100).toFixed(1)}%` }} title={`Landing: ${d.landing}`} />
              <span className="w-full flex-1 bg-azul" title={`Sitio: ${d.sitio}`} />
            </span>
            <span className="text-[0.6rem] text-carbon/70">{d.etiqueta}</span>
          </div>
        );
      })}
    </div>
  );
};

export default async function MetricasPage({ searchParams }: PageProps<"/panel/metricas">) {
  const sp = await searchParams;
  const dias = Number(typeof sp.d === "string" && rangos.some((r) => r.key === sp.d) ? sp.d : "30");

  if (!supabaseReady) {
    return <p className="rounded-brand border border-gris bg-blanco p-6 text-carbon/85">Falta configurar Supabase para ver las métricas.</p>;
  }

  const m = await getMetricas(dias);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Tráfico</p>
          <h1 className="font-display type-h2 mt-1 text-azul">Métricas</h1>
          <p className="mt-2 text-sm text-carbon/75">Medición propia, sin datos personales ni IP.</p>
        </div>
        <div className="flex gap-2">
          {rangos.map((r) => (
            <Link
              key={r.key}
              href={`/panel/metricas?d=${r.key}`}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors",
                String(dias) === r.key ? "border-azul bg-azul text-blanco" : "border-gris bg-blanco text-azul hover:border-azul/40",
              )}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tarjeta titulo="Visitantes del sitio" valor={String(m.sitio.visitantes)} pie={`${m.sitio.vistas} páginas vistas`} />
        <Tarjeta titulo="Visitantes de la landing" valor={String(m.landing.visitantes)} pie={`${m.landing.vistas} páginas vistas`} />
        <Tarjeta titulo="Permanencia · sitio" valor={duracion(m.sitio.permanenciaMs)} pie="promedio por página" />
        <Tarjeta titulo="Permanencia · landing" valor={duracion(m.landing.permanenciaMs)} pie="promedio por página" />
      </div>

      <section className="mt-8 rounded-brand border border-gris bg-blanco p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display type-h3 text-azul">Visitas por día</h2>
          <p className="flex items-center gap-4 text-xs text-carbon/75">
            <span className="flex items-center gap-1.5">
              <span className="size-3 bg-azul" aria-hidden /> Sitio
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 bg-dorado" aria-hidden /> Landing
            </span>
          </p>
        </div>
        <div className="mt-5">
          <Barras datos={m.serie} />
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-brand border border-gris bg-blanco p-5">
          <h2 className="font-display type-h3 text-azul">Embudo de la landing</h2>
          <ul className="mt-4 space-y-3">
            {m.embudo.map((paso, i) => {
              const base = m.embudo[0].valor || 1;
              const pct = Math.round((paso.valor / base) * 100);
              return (
                <li key={paso.label}>
                  <div className="flex items-baseline justify-between gap-3 text-[0.95rem]">
                    <span className="text-carbon/90">{paso.label}</span>
                    <span className="tabular-nums text-azul">
                      {paso.valor}
                      {i > 0 && <span className="ml-2 text-xs text-carbon/70">{pct}%</span>}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-marfil">
                    <div className="h-2 rounded-full bg-azul" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-brand border border-gris bg-blanco p-5">
          <h2 className="font-display type-h3 text-azul">Páginas más vistas</h2>
          <ul className="mt-4 divide-y divide-gris">
            {m.topPaths.length === 0 && <li className="py-3 text-carbon/75">Todavía no hay datos.</li>}
            {m.topPaths.map(([path, n]) => (
              <li key={path} className="flex items-center justify-between gap-4 py-2.5 text-[0.95rem]">
                <span className="truncate text-carbon/90">{path}</span>
                <span className="tabular-nums text-azul">{n}</span>
              </li>
            ))}
          </ul>

          {m.topReferrers.length > 0 && (
            <>
              <h3 className="eyebrow mt-6">De dónde llegan</h3>
              <ul className="mt-2 divide-y divide-gris">
                {m.topReferrers.map(([host, n]) => (
                  <li key={host} className="flex items-center justify-between gap-4 py-2.5 text-[0.95rem]">
                    <span className="truncate text-carbon/90">{host}</span>
                    <span className="tabular-nums text-azul">{n}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </>
  );
}
