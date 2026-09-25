import Link from "next/link";
import { revalidatePath } from "next/cache";
import { CalendarX2, Download } from "lucide-react";
import { formatDateLong, formatTime } from "@/lib/booking";
import { COLS_DOCUMENTO, db, dbReady, t, type Appointment, type Documento } from "@/lib/db";
import { getSession } from "@/lib/panel-auth";
import { formatMoney } from "@/lib/pricing";
import { normalizarTelefono } from "@/lib/seguimiento";
import { productoPorId } from "@content/productos";
import { cn } from "@/lib/utils";
import { CitaDetalle, estadoCredito } from "@/components/panel/CitaDetalle";

export const dynamic = "force-dynamic";

// Acciones de servidor: cada una vuelve a comprobar la sesión, porque una acción
// puede invocarse directamente sin pasar por la página.
async function aplicarCredito(formData: FormData) {
  "use server";
  if (!(await getSession())) throw new Error("Sesión no válida.");
  const id = String(formData.get("id") ?? "");
  const asunto = String(formData.get("asunto") ?? "").trim().slice(0, 160);
  const notas = String(formData.get("notas") ?? "").trim().slice(0, 300);
  // El check de la base exige asunto cuando se marca como aplicado.
  if (!id || !asunto) return;
  await db()`
    update ${t("appointments")}
       set credito_aplicado_at = now(), credito_asunto = ${asunto}, credito_notas = ${notas || null}
     where id = ${id}::uuid and status = 'pagada' and credito_aplicado_at is null`;
  revalidatePath("/panel/citas");
}

async function guardarEnlace(formData: FormData) {
  "use server";
  if (!(await getSession())) throw new Error("Sesión no válida.");
  const id = String(formData.get("id") ?? "");
  const enlace = String(formData.get("enlace") ?? "").trim().slice(0, 500);
  if (!id) return;
  await db()`
    update ${t("appointments")} set enlace_sesion = ${enlace || null} where id = ${id}::uuid`;
  revalidatePath("/panel/citas");
}

const areaLabel: Record<string, string> = {
  familiar: "Familiar",
  laboral: "Laboral",
  empresa: "Empresa",
  civil: "Civil / contratos",
  otro: "Otro",
};

const filtros = [
  { key: "proximas", label: "Próximas" },
  { key: "pasadas", label: "Pasadas" },
  { key: "todas", label: "Todas" },
] as const;

export default async function CitasPage({ searchParams }: PageProps<"/panel/citas">) {
  const sp = await searchParams;
  const filtro = (typeof sp.f === "string" && filtros.some((f) => f.key === sp.f) ? sp.f : "proximas") as (typeof filtros)[number]["key"];
  const abierta = typeof sp.cita === "string" ? sp.cita : undefined;

  if (!dbReady) {
    return (
      <p className="rounded-brand border border-gris bg-blanco p-6 text-carbon/85">
        Falta configurar la base de datos (<code className="text-azul">DATABASE_URL</code>) para ver las citas.
      </p>
    );
  }

  const sql = db();
  let citas: Appointment[] = [];
  try {
    citas =
      filtro === "proximas"
        ? await sql<Appointment[]>`
            select * from ${t("appointments")}
             where status = 'pagada' and slot_start >= now()
             order by slot_start asc limit 300`
        : filtro === "pasadas"
          ? await sql<Appointment[]>`
              select * from ${t("appointments")}
               where status = 'pagada' and slot_start < now()
               order by slot_start desc limit 300`
          : await sql<Appointment[]>`
              select * from ${t("appointments")}
               where status = 'pagada'
               order by slot_start desc limit 300`;
  } catch (err) {
    console.error("[panel/citas]", err);
  }
  const detalle = citas.find((c) => c.id === abierta);

  // Documentos del cliente de la cita abierta. Nunca se traen todos: solo los
  // del expediente que se está mirando, y sin la columna de contenido.
  let documentos: Documento[] = [];
  if (detalle) {
    const norm = normalizarTelefono(detalle.telefono);
    if (norm) {
      try {
        documentos = await sql<Documento[]>`
          select ${sql.unsafe(COLS_DOCUMENTO)} from ${t("documentos")}
           where telefono_normalizado = ${norm} and eliminado_at is null
           order by created_at desc`;
      } catch (err) {
        console.error("[panel/citas] documentos", err);
      }
    }
  }

  const ingresos = citas.reduce((sum, c) => sum + c.precio_centavos, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Agenda</p>
          <h1 className="font-display type-h2 mt-1 text-azul">Citas pagadas</h1>
          <p className="mt-2 text-sm text-carbon/75">
            Solo aparecen las citas con el pago registrado.
          </p>
        </div>
        <a
          href={`/api/panel/citas.csv?f=${filtro}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-brand border border-azul px-4 text-[0.9rem] font-medium text-azul hover:bg-azul/5"
        >
          <Download className="size-4" strokeWidth={1.75} aria-hidden />
          Exportar CSV
        </a>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {filtros.map((f) => (
          <Link
            key={f.key}
            href={`/panel/citas?f=${f.key}`}
            className={cn(
              "inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors",
              filtro === f.key ? "border-azul bg-azul text-blanco" : "border-gris bg-blanco text-azul hover:border-azul/40",
            )}
          >
            {f.label}
          </Link>
        ))}
        <span className="ml-auto text-sm text-carbon/75">
          {citas.length} {citas.length === 1 ? "cita" : "citas"} · {formatMoney(ingresos)}
        </span>
      </div>

      {citas.length === 0 ? (
        <div className="mt-8 rounded-brand border border-gris bg-blanco p-10 text-center">
          <CalendarX2 className="mx-auto size-8 text-carbon/40" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-carbon/80">Aún no hay citas pagadas en este filtro.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-brand border border-gris bg-blanco">
          <table className="w-full border-collapse text-left text-[0.95rem]">
            <thead className="hidden sm:table-header-group">
              <tr className="border-b border-gris">
                {["Fecha", "Hora", "Cliente", "Servicio", "Crédito", "Importe", ""].map((h) => (
                  <th key={h} scope="col" className="eyebrow px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => {
                const inicio = c.slot_start;
                return (
                  <tr key={c.id} className="block border-b border-gris last:border-0 hover:bg-marfil/60 sm:table-row">
                    <td className="block px-4 pt-4 sm:table-cell sm:py-3">
                      <span className="eyebrow mr-2 sm:hidden">Fecha</span>
                      {formatDateLong(inicio)}
                    </td>
                    <td className="block px-4 sm:table-cell sm:py-3">
                      <span className="eyebrow mr-2 sm:hidden">Hora</span>
                      <span className="tabular-nums">{formatTime(inicio)}</span>
                    </td>
                    <td className="block px-4 sm:table-cell sm:py-3">
                      <span className="font-medium text-azul">{c.nombre}</span>
                      <span className="block text-xs text-carbon/70">{c.correo}</span>
                    </td>
                    <td className="block px-4 sm:table-cell sm:py-3">
                      <span className="eyebrow mr-2 sm:hidden">Servicio</span>
                      {productoPorId(c.producto_id)?.nombre ?? areaLabel[c.area] ?? c.area}
                    </td>
                    <td className="block px-4 sm:table-cell sm:py-3">
                      <span className="eyebrow mr-2 sm:hidden">Crédito</span>
                      {(() => {
                        const e = estadoCredito(c);
                        if (!e) return <span className="text-carbon/60">—</span>;
                        return (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs uppercase tracking-wider",
                              e === "vigente" ? "bg-azul text-blanco" : "bg-marfil text-carbon/75",
                            )}
                          >
                            {e}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="block px-4 tabular-nums sm:table-cell sm:py-3">{formatMoney(c.precio_centavos, c.moneda)}</td>
                    <td className="block px-4 pb-4 sm:table-cell sm:py-3 sm:text-right">
                      <Link href={`/panel/citas?f=${filtro}&cita=${c.id}`} className="link-text inline-block py-1 font-medium">
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <CitaDetalle
          cita={detalle}
          volverA={`/panel/citas?f=${filtro}`}
          documentos={documentos}
          aplicarCredito={aplicarCredito}
          guardarEnlace={guardarEnlace}
        />
      )}
    </>
  );
}
