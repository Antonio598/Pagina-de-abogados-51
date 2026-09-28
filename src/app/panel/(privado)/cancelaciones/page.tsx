import Link from "next/link";
import { revalidatePath } from "next/cache";
import { CalendarClock, CheckCheck, Inbox, X } from "lucide-react";
import { formatDateTimeLong, SLOT_MINUTES } from "@/lib/booking";
import { dbReady } from "@/lib/db";
import { getSession } from "@/lib/panel-auth";
import {
  aplicarCancelacion,
  aplicarReprogramacion,
  listarSolicitudes,
  rechazarSolicitud,
} from "@/lib/solicitudes";
import { productoPorId } from "@content/productos";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Cola de solicitudes de cancelación y reprogramación.
//
// El cliente solicita desde /mi-cita y su horario sigue reservado: es aquí donde
// una persona del despacho decide. Aplicar una cancelación es el único camino por
// el que un horario pagado vuelve a estar libre.

async function aplicar(formData: FormData) {
  "use server";
  const sesion = await getSession();
  if (!sesion) throw new Error("Sesión no válida.");
  const id = String(formData.get("id") ?? "");
  const accion = String(formData.get("accion") ?? "");
  if (!id) return;

  if (accion === "cancelar") {
    await aplicarCancelacion(id, sesion.usuario);
  } else if (accion === "reprogramar") {
    const cuando = String(formData.get("cuando") ?? "");
    const inicio = new Date(cuando);
    if (Number.isNaN(inicio.getTime())) return;
    // La duración la fija el servidor, no el formulario.
    const fin = new Date(inicio.getTime() + SLOT_MINUTES * 60_000);
    await aplicarReprogramacion(id, sesion.usuario, inicio, fin);
  } else if (accion === "rechazar") {
    await rechazarSolicitud(id, sesion.usuario, String(formData.get("notas") ?? ""));
  }
  revalidatePath("/panel/cancelaciones");
  revalidatePath("/panel/citas");
}

const filtros = [
  { key: "pendiente", label: "Pendientes" },
  { key: "aplicada", label: "Aplicadas" },
  { key: "rechazada", label: "Rechazadas" },
  { key: "todas", label: "Todas" },
] as const;

export default async function CancelacionesPage({ searchParams }: PageProps<"/panel/cancelaciones">) {
  const sp = await searchParams;
  const estado = typeof sp.f === "string" && filtros.some((x) => x.key === sp.f) ? sp.f : "pendiente";

  if (!dbReady) {
    return (
      <p className="rounded-brand border border-gris bg-blanco p-6 text-carbon/85">
        Falta configurar la base de datos (<code className="text-azul">DATABASE_URL</code>) para ver las solicitudes.
      </p>
    );
  }

  const filas = await listarSolicitudes(estado);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Solicitudes de los clientes</p>
          <h1 className="font-display type-h2 mt-1 text-azul">Cancelaciones y cambios</h1>
          <p className="mt-2 max-w-xl text-sm text-carbon/75">
            El horario del cliente <strong>sigue reservado</strong> hasta que apliques la solicitud. Es lo que se le dice
            en el correo, así que conviene resolverlas pronto.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filtros.map((x) => (
          <Link
            key={x.key}
            href={`/panel/cancelaciones?f=${x.key}`}
            className={cn(
              "inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors",
              estado === x.key ? "border-azul bg-azul text-blanco" : "border-gris bg-blanco text-azul hover:border-azul/40",
            )}
          >
            {x.label}
          </Link>
        ))}
      </div>

      {filas.length === 0 ? (
        <div className="mt-8 rounded-brand border border-gris bg-blanco p-10 text-center">
          <Inbox className="mx-auto size-8 text-carbon/40" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-carbon/80">
            {estado === "pendiente" ? "No hay solicitudes pendientes." : "Nada en este filtro."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filas.map((s) => {
            const pendiente = s.estado === "pendiente";
            return (
              <article
                key={s.id}
                className={cn("rounded-brand border bg-blanco p-5", pendiente ? "border-dorado" : "border-gris")}
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <p className="font-medium text-azul">
                      {s.nombre} · pide {s.tipo === "cancelar" ? "cancelar" : "mover"} su cita
                    </p>
                    <p className="text-sm text-carbon/75">
                      <span className="tabular-nums">{s.folio}</span>
                      {productoPorId(s.producto_id) && <> · {productoPorId(s.producto_id)!.nombre}</>}
                      {" · solicitado el "}
                      {formatDateTimeLong(s.created_at)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs uppercase tracking-wider",
                      pendiente ? "bg-azul text-blanco" : "bg-marfil text-carbon/75",
                    )}
                  >
                    {s.estado}
                  </span>
                </div>

                <p className="mt-3 flex items-center gap-2 text-[0.95rem] text-carbon/90">
                  <CalendarClock className="size-4 shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
                  Cita actual: <strong>{formatDateTimeLong(s.slot_start)}</strong>
                  <span className="text-carbon/70">({s.cita_status})</span>
                </p>
                {s.slot_propuesto && (
                  <p className="mt-1 text-[0.95rem] text-carbon/90">
                    Prefiere: <strong>{formatDateTimeLong(s.slot_propuesto)}</strong>
                  </p>
                )}
                {s.motivo && (
                  <blockquote className="mt-3 border-l-2 border-dorado bg-marfil p-3 text-[0.95rem] text-carbon/90">
                    {s.motivo}
                  </blockquote>
                )}
                {!pendiente && s.resuelta_at && (
                  <p className="mt-3 text-sm text-carbon/70">
                    Resuelta el {formatDateTimeLong(s.resuelta_at)} por {s.resuelta_por}
                    {s.notas && ` · ${s.notas}`}
                  </p>
                )}

                <p className="mt-3 text-sm">
                  <Link href={`/panel/citas?f=todas&cita=${s.appointment_id}`} className="link-text inline-flex min-h-10 items-center font-medium">
                    Ver la cita completa
                  </Link>
                </p>

                {pendiente && (
                  <div className="mt-4 grid gap-3 border-t border-gris pt-4 sm:grid-cols-2">
                    {s.tipo === "cancelar" ? (
                      <form action={aplicar}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="accion" value="cancelar" />
                        <button
                          type="submit"
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-brand bg-azul px-4 text-[0.9rem] font-medium text-blanco hover:bg-azul-2"
                        >
                          <CheckCheck className="size-4" strokeWidth={2} aria-hidden />
                          Cancelar y liberar el horario
                        </button>
                      </form>
                    ) : (
                      <form action={aplicar} className="space-y-2">
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="accion" value="reprogramar" />
                        <label htmlFor={`cuando-${s.id}`} className="block text-[0.85rem] font-medium text-azul">
                          Nuevo horario
                        </label>
                        <input
                          id={`cuando-${s.id}`}
                          name="cuando"
                          type="datetime-local"
                          required
                          defaultValue={
                            s.slot_propuesto
                              ? new Date(s.slot_propuesto.getTime() - s.slot_propuesto.getTimezoneOffset() * 60000)
                                  .toISOString()
                                  .slice(0, 16)
                              : undefined
                          }
                          className="min-h-10 w-full rounded-brand border border-gris bg-blanco px-3 text-[0.9rem] text-carbon focus:border-azul focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-brand bg-azul px-4 text-[0.9rem] font-medium text-blanco hover:bg-azul-2"
                        >
                          <CheckCheck className="size-4" strokeWidth={2} aria-hidden />
                          Mover la cita
                        </button>
                      </form>
                    )}

                    <form action={aplicar} className="space-y-2">
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="accion" value="rechazar" />
                      <label htmlFor={`notas-${s.id}`} className="block text-[0.85rem] font-medium text-azul">
                        Motivo del rechazo
                      </label>
                      <input
                        id={`notas-${s.id}`}
                        name="notas"
                        maxLength={500}
                        className="min-h-10 w-full rounded-brand border border-gris bg-blanco px-3 text-[0.9rem] text-carbon focus:border-azul focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-brand border border-azul px-4 text-[0.9rem] font-medium text-azul hover:bg-azul/5"
                      >
                        <X className="size-4" strokeWidth={2} aria-hidden />
                        Rechazar
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
