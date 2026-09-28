import Link from "next/link";
import { revalidatePath } from "next/cache";
import { FolderKanban, Paperclip, Plus } from "lucide-react";
import { formatDateTimeLong } from "@/lib/booking";
import { dbReady } from "@/lib/db";
import {
  estadosExpediente,
  etiquetaEstado,
  listarExpedientes,
  notasDe,
  obtenerExpediente,
  registrarAvance,
  resumenExpedientes,
} from "@/lib/expedientes";
import { getSession } from "@/lib/panel-auth";
import { formatMoney } from "@/lib/pricing";
import { normalizarTelefono } from "@/lib/seguimiento";
import { productoPorId, situacionLabel } from "@content/productos";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Expedientes: uno por cita pagada, creado solo por un trigger de la base.
// El abogado registra aquí el avance, y el avance es una bitácora: se añade,
// nunca se sobreescribe.

async function anotar(formData: FormData) {
  "use server";
  const sesion = await getSession();
  if (!sesion) throw new Error("Sesión no válida.");
  const id = String(formData.get("id") ?? "");
  const nota = String(formData.get("nota") ?? "");
  const estado = String(formData.get("estado") ?? "");
  if (!id || !nota.trim()) return;
  await registrarAvance({
    expedienteId: id,
    autor: sesion.usuario,
    nota,
    estadoNuevo: estado || undefined,
  });
  revalidatePath("/panel/expedientes");
}

const filtros = [
  { key: "abiertos", label: "Abiertos" },
  ...estadosExpediente.map((e) => ({ key: e.valor as string, label: e.etiqueta })),
  { key: "todos", label: "Todos" },
];

const colorEstado: Record<string, string> = {
  nuevo: "bg-azul text-blanco",
  en_analisis: "bg-dorado/20 text-azul",
  con_estrategia: "bg-dorado/20 text-azul",
  en_representacion: "bg-azul text-blanco",
  cerrado: "bg-marfil text-carbon/75",
  descartado: "bg-marfil text-carbon/60",
};

export default async function ExpedientesPage({ searchParams }: PageProps<"/panel/expedientes">) {
  const sp = await searchParams;
  const estado = typeof sp.f === "string" && filtros.some((x) => x.key === sp.f) ? sp.f : "abiertos";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const abierto = typeof sp.e === "string" ? sp.e : undefined;

  if (!dbReady) {
    return (
      <p className="rounded-brand border border-gris bg-blanco p-6 text-carbon/85">
        Falta configurar la base de datos (<code className="text-azul">DATABASE_URL</code>) para ver los expedientes.
      </p>
    );
  }

  const [filas, resumen] = await Promise.all([listarExpedientes({ estado, q }), resumenExpedientes()]);
  const detalle = abierto ? await obtenerExpediente(abierto) : null;
  const notas = detalle ? await notasDe(detalle.id) : [];
  const volverA = `/panel/expedientes?f=${estado}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  const totalAbiertos = ["nuevo", "en_analisis", "con_estrategia", "en_representacion"].reduce(
    (n, e) => n + (resumen[e] ?? 0),
    0,
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Asuntos</p>
          <h1 className="font-display type-h2 mt-1 text-azul">Expedientes</h1>
          <p className="mt-2 text-sm text-carbon/75">
            Se crea uno solo por cada cita pagada. {totalAbiertos} {totalAbiertos === 1 ? "abierto" : "abiertos"} ·{" "}
            {filas.length} en esta vista.
          </p>
        </div>
        <form className="flex gap-2">
          <input type="hidden" name="f" value={estado} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Folio, nombre o teléfono"
            aria-label="Buscar"
            className="min-h-10 w-52 rounded-brand border border-gris bg-blanco px-3 text-[0.9rem] text-carbon focus:border-azul focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex min-h-10 items-center rounded-brand border border-azul px-4 text-[0.9rem] font-medium text-azul hover:bg-azul/5"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="mt-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {filtros.map((x) => (
          <Link
            key={x.key}
            href={`/panel/expedientes?f=${x.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm transition-colors",
              estado === x.key ? "border-azul bg-azul text-blanco" : "border-gris bg-blanco text-azul hover:border-azul/40",
            )}
          >
            {x.label}
            {resumen[x.key] ? <span className="ml-1.5 tabular-nums opacity-70">{resumen[x.key]}</span> : null}
          </Link>
        ))}
      </div>

      {filas.length === 0 ? (
        <div className="mt-8 rounded-brand border border-gris bg-blanco p-10 text-center">
          <FolderKanban className="mx-auto size-8 text-carbon/40" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-carbon/80">
            {q ? "Ningún expediente coincide con esa búsqueda." : "Todavía no hay expedientes. Se crean al pagarse una cita."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filas.map((f) => {
            const docs = Number(f.documentos ?? 0);
            return (
              <article key={f.id} className="rounded-brand border border-gris bg-blanco p-5">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <p className="font-medium text-azul">{f.nombre}</p>
                    <p className="text-sm text-carbon/75">
                      <span className="tabular-nums">{f.folio}</span>
                      {productoPorId(f.producto_id) && <> · {productoPorId(f.producto_id)!.nombre}</>}
                      {f.situacion && <> · {situacionLabel(f.situacion)}</>}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs uppercase tracking-wider",
                      colorEstado[f.estado] ?? "bg-marfil text-carbon/75",
                    )}
                  >
                    {etiquetaEstado(f.estado)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-carbon/75">
                  Sesión: {formatDateTimeLong(f.slot_start)} · {formatMoney(f.precio_centavos, f.moneda)}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 text-sm">
                  <span className="flex min-h-10 items-center gap-1.5 text-carbon/75">
                    <Paperclip className="size-4 text-dorado-2" strokeWidth={1.75} aria-hidden />
                    {docs} {docs === 1 ? "documento" : "documentos"}
                  </span>
                  <span className="flex min-h-10 items-center text-carbon/75">
                    {Number(f.notas_n ?? 0)} {Number(f.notas_n ?? 0) === 1 ? "nota" : "notas"}
                  </span>
                  <Link
                    href={`/panel/expedientes?f=${estado}${q ? `&q=${encodeURIComponent(q)}` : ""}&e=${f.id}`}
                    className="link-text ml-auto inline-flex min-h-10 items-center font-medium"
                  >
                    Abrir expediente
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Detalle: panel lateral por parámetro de URL, funciona sin JS. */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <Link href={volverA} className="absolute inset-0 bg-azul/30 backdrop-blur-[2px]" aria-label="Cerrar" />
          <aside
            aria-label={`Expediente ${detalle.folio}`}
            className="anim-rise relative flex w-full max-w-md flex-col overflow-y-auto border-l border-gris bg-blanco shadow-card-hover [animation-duration:250ms]"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gris bg-blanco px-6 py-4">
              <div>
                <p className="eyebrow">Expediente</p>
                <p className="font-display text-[1.3rem] tabular-nums text-azul">{detalle.folio}</p>
                <p className="text-sm text-carbon/75">{detalle.nombre}</p>
              </div>
              <Link
                href={volverA}
                className="inline-flex size-10 items-center justify-center rounded-brand text-azul hover:bg-marfil"
                aria-label="Cerrar"
              >
                ×
              </Link>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-carbon/85">
                {formatDateTimeLong(detalle.slot_start)}
                {productoPorId(detalle.producto_id) && <> · {productoPorId(detalle.producto_id)!.nombre}</>}
              </p>
              <p className="mt-1 text-sm">
                <a href={`mailto:${detalle.correo}`} className="link-text">
                  {detalle.correo}
                </a>
                {" · "}
                <a href={`tel:${detalle.telefono.replace(/[^\d+]/g, "")}`} className="link-text tabular-nums">
                  {detalle.telefono}
                </a>
              </p>
              <p className="mt-3 flex flex-wrap gap-3 text-sm">
                <Link href={`/panel/citas?f=todas&cita=${detalle.appointment_id}`} className="link-text font-medium">
                  Ver la cita
                </Link>
                {normalizarTelefono(detalle.telefono) && (
                  <Link
                    href={`/panel/archivos?cliente=${normalizarTelefono(detalle.telefono)}`}
                    className="link-text font-medium"
                  >
                    Ver sus {Number(detalle.documentos ?? 0)} documentos
                  </Link>
                )}
              </p>

              {/* Registrar avance */}
              <form action={anotar} className="mt-6 space-y-3 rounded-brand border border-gris bg-marfil p-4">
                <input type="hidden" name="id" value={detalle.id} />
                <p className="eyebrow flex items-center gap-2">
                  <Plus className="size-4 text-dorado-2" strokeWidth={2} aria-hidden />
                  Registrar avance
                </p>
                <label htmlFor="nota" className="sr-only">
                  Nota
                </label>
                <textarea
                  id="nota"
                  name="nota"
                  required
                  rows={3}
                  maxLength={2000}
                  placeholder="Qué se hizo, qué sigue, plazos."
                  className="w-full rounded-brand border border-gris bg-blanco px-3 py-2 text-[0.95rem] text-carbon focus:border-azul focus:outline-none"
                />
                <label htmlFor="estado" className="block text-[0.85rem] font-medium text-azul">
                  Mover a estado (opcional)
                </label>
                <select
                  id="estado"
                  name="estado"
                  defaultValue=""
                  className="min-h-10 w-full rounded-brand border border-gris bg-blanco px-3 text-[0.95rem] text-carbon focus:border-azul focus:outline-none"
                >
                  <option value="">Sin cambio ({etiquetaEstado(detalle.estado)})</option>
                  {estadosExpediente.map((e) => (
                    <option key={e.valor} value={e.valor}>
                      {e.etiqueta}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-brand bg-azul px-4 text-[0.9rem] font-medium text-blanco hover:bg-azul-2"
                >
                  Guardar avance
                </button>
              </form>

              {/* Bitácora */}
              <p className="eyebrow mt-6">Avance</p>
              {notas.length === 0 ? (
                <p className="mt-2 text-sm text-carbon/75">Sin anotaciones todavía.</p>
              ) : (
                <ol className="mt-2 space-y-3 pb-10">
                  {notas.map((n) => (
                    <li key={n.id} className="border-l-2 border-dorado pl-3">
                      <p className="text-xs text-carbon/70">
                        {formatDateTimeLong(n.created_at)} · {n.autor}
                        {n.estado_nuevo && <> · pasó a {etiquetaEstado(n.estado_nuevo)}</>}
                      </p>
                      <p className="mt-1 whitespace-pre-line text-[0.95rem] text-carbon/90">{n.nota}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
