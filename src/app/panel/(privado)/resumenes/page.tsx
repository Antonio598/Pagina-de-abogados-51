import Link from "next/link";
import { CalendarClock, FileText, Inbox, Paperclip, TriangleAlert } from "lucide-react";
import { formatDateOnly, formatDateTimeLong } from "@/lib/booking";
import { db, dbReady, t, type Appointment } from "@/lib/db";
import { normalizarTelefono } from "@/lib/seguimiento";
import { productoPorId, situacionLabel } from "@content/productos";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Resúmenes de lo que la gente respondió en el formulario al agendar.
//
// Es una vista de lectura: sirve para leer los casos antes de las sesiones, sin
// abrir cita por cita. Lo que aporta sobre /panel/citas es que aquí el texto que
// escribió el cliente se lee completo y se ordena por cuándo es la sesión.

type Fila = Pick<
  Appointment,
  | "id"
  | "folio"
  | "nombre"
  | "correo"
  | "telefono"
  | "slot_start"
  | "created_at"
  | "descripcion"
  | "situacion"
  | "producto_id"
  | "area"
  | "fecha_proxima"
  | "origen"
> & { documentos: string };

const filtros = [
  { key: "proximas", label: "Próximas" },
  { key: "sin-leer", label: "Con texto" },
  { key: "urgentes", label: "Con fecha encima" },
  { key: "todas", label: "Todas" },
] as const;

type FiltroKey = (typeof filtros)[number]["key"];

const areaLabel: Record<string, string> = {
  familiar: "Derecho familiar",
  laboral: "Derecho laboral",
  empresa: "Asesoría para empresas",
  civil: "Derecho civil y contratos",
  otro: "Otro",
};

/** Días que faltan para la sesión, para poder priorizar la lectura. */
const cuandoEs = (slot: Date) => {
  const dias = Math.round((slot.getTime() - Date.now()) / 86_400_000);
  if (dias < 0) return { texto: "ya ocurrió", urgente: false };
  if (dias === 0) return { texto: "hoy", urgente: true };
  if (dias === 1) return { texto: "mañana", urgente: true };
  return { texto: `en ${dias} días`, urgente: dias <= 3 };
};

export default async function ResumenesPage({ searchParams }: PageProps<"/panel/resumenes">) {
  const sp = await searchParams;
  const filtro = (typeof sp.f === "string" && filtros.some((x) => x.key === sp.f) ? sp.f : "proximas") as FiltroKey;

  if (!dbReady) {
    return (
      <p className="rounded-brand border border-gris bg-blanco p-6 text-carbon/85">
        Falta configurar la base de datos (<code className="text-azul">DATABASE_URL</code>) para ver los resúmenes.
      </p>
    );
  }

  const sql = db();
  let filas: Fila[] = [];
  try {
    // El conteo de documentos se cruza por los 10 últimos dígitos del teléfono,
    // igual que en el resto del sistema.
    const base = sql`
      select a.id, a.folio, a.nombre, a.correo, a.telefono, a.slot_start, a.created_at,
             a.descripcion, a.situacion, a.producto_id, a.area, a.fecha_proxima, a.origen,
             (select count(*) from ${t("documentos")} d
               where d.eliminado_at is null
                 and d.telefono_normalizado = right(regexp_replace(a.telefono, '[^0-9]', '', 'g'), 10)
             ) as documentos
        from ${t("appointments")} a
       where a.status = 'pagada'`;

    filas =
      filtro === "proximas"
        ? await sql<Fila[]>`${base} and a.slot_start >= now() order by a.slot_start asc limit 200`
        : filtro === "sin-leer"
          ? await sql<Fila[]>`${base} and coalesce(trim(a.descripcion), '') <> '' order by a.slot_start desc limit 200`
          : filtro === "urgentes"
            ? await sql<Fila[]>`${base} and a.fecha_proxima is not null order by a.fecha_proxima asc limit 200`
            : await sql<Fila[]>`${base} order by a.slot_start desc limit 200`;
  } catch (err) {
    console.error("[panel/resumenes]", err);
  }

  const conTexto = filas.filter((f) => (f.descripcion ?? "").trim() !== "").length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Lo que nos contaron</p>
          <h1 className="font-display type-h2 mt-1 text-azul">Resúmenes</h1>
          <p className="mt-2 max-w-xl text-sm text-carbon/75">
            Lo que cada persona escribió en el formulario al agendar. {filas.length}{" "}
            {filas.length === 1 ? "cita" : "citas"} · {conTexto} con descripción.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {filtros.map((x) => (
          <Link
            key={x.key}
            href={`/panel/resumenes?f=${x.key}`}
            className={cn(
              "inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors",
              filtro === x.key ? "border-azul bg-azul text-blanco" : "border-gris bg-blanco text-azul hover:border-azul/40",
            )}
          >
            {x.label}
          </Link>
        ))}
      </div>

      {filas.length === 0 ? (
        <div className="mt-8 rounded-brand border border-gris bg-blanco p-10 text-center">
          <Inbox className="mx-auto size-8 text-carbon/40" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-carbon/80">No hay citas en este filtro.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filas.map((f) => {
            const c = cuandoEs(f.slot_start);
            const docs = Number(f.documentos ?? 0);
            const texto = (f.descripcion ?? "").trim();
            return (
              <article
                key={f.id}
                className={cn(
                  "rounded-brand border bg-blanco p-5",
                  c.urgente ? "border-dorado" : "border-gris",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <p className="font-medium text-azul">{f.nombre}</p>
                    <p className="text-sm text-carbon/75">
                      <span className="tabular-nums">{f.folio}</span> ·{" "}
                      {productoPorId(f.producto_id)?.nombre ?? areaLabel[f.area] ?? f.area}
                      {f.situacion && <> · {situacionLabel(f.situacion)}</>}
                    </p>
                  </div>
                  <p className="flex shrink-0 items-center gap-1.5 text-sm text-carbon/85">
                    <CalendarClock className="size-4 text-dorado-2" strokeWidth={1.75} aria-hidden />
                    {formatDateTimeLong(f.slot_start)}
                    <span className={cn("ml-1 rounded-full px-2 py-0.5 text-xs uppercase tracking-wider", c.urgente ? "bg-azul text-blanco" : "bg-marfil text-carbon/75")}>
                      {c.texto}
                    </span>
                  </p>
                </div>

                {f.fecha_proxima && (
                  <p className="mt-3 flex items-center gap-2 text-[0.92rem] text-carbon/90">
                    <TriangleAlert className="size-4 shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
                    Fecha que le corre: <strong>{formatDateOnly(f.fecha_proxima)}</strong>
                  </p>
                )}

                {texto ? (
                  <blockquote className="mt-4 border-l-2 border-dorado bg-marfil p-4 text-[0.98rem] leading-relaxed text-carbon/90">
                    <p className="whitespace-pre-line">{texto}</p>
                  </blockquote>
                ) : (
                  <p className="mt-4 flex items-center gap-2 text-[0.92rem] text-carbon/70">
                    <FileText className="size-4 shrink-0 text-carbon/40" strokeWidth={1.75} aria-hidden />
                    No escribió descripción al agendar.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 text-sm">
                  <span className="flex min-h-10 items-center gap-1.5 text-carbon/75">
                    <Paperclip className="size-4 text-dorado-2" strokeWidth={1.75} aria-hidden />
                    {docs} {docs === 1 ? "documento" : "documentos"}
                  </span>
                  <a href={`mailto:${f.correo}`} className="link-text inline-flex min-h-10 items-center">
                    {f.correo}
                  </a>
                  <a
                    href={`tel:${f.telefono.replace(/[^\d+]/g, "")}`}
                    className="link-text inline-flex min-h-10 items-center tabular-nums"
                  >
                    {f.telefono}
                  </a>
                  <Link
                    href={`/panel/citas?f=todas&cita=${f.id}`}
                    className="link-text ml-auto inline-flex min-h-10 items-center font-medium"
                  >
                    Ver la cita completa
                  </Link>
                  {docs > 0 && normalizarTelefono(f.telefono) && (
                    <Link
                      href={`/panel/archivos?cliente=${normalizarTelefono(f.telefono)}`}
                      className="link-text inline-flex min-h-10 items-center font-medium"
                    >
                      Ver sus archivos
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
