import Link from "next/link";
import { Download, FileText, FolderOpen } from "lucide-react";
import { formatDateTimeLong } from "@/lib/booking";
import { COLS_DOCUMENTO, db, dbReady, t, type Documento } from "@/lib/db";
import { pesoLegible } from "@/lib/documentos";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Documentos que los clientes cargaron en su portal, agrupados por cliente.
// La columna `contenido` no se toca aquí: solo la lee la ruta de descarga.

type Fila = Documento & { nombre: string | null; folio_cita: string | null };

export default async function ArchivosPage({ searchParams }: PageProps<"/panel/archivos">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const abierto = typeof sp.cliente === "string" ? sp.cliente : undefined;

  if (!dbReady) {
    return (
      <p className="rounded-brand border border-gris bg-blanco p-6 text-carbon/85">
        Falta configurar la base de datos (<code className="text-azul">DATABASE_URL</code>) para ver los archivos.
      </p>
    );
  }

  const sql = db();
  let filas: Fila[] = [];
  try {
    // Se cruza con la cita para poder mostrar el nombre del cliente, que no se
    // duplica en la tabla de documentos.
    // Si la búsqueda no trae suficientes dígitos, no se compara contra el
    // teléfono: un patrón '%%' coincidiría con todos los registros.
    const digitos = q.replace(/\D/g, "");
    const porTelefono = digitos.length >= 3 ? `%${digitos}%` : null;
    const porTexto = q === "" ? null : `%${q.toUpperCase()}%`;
    filas = await sql<Fila[]>`
      select ${sql.unsafe(COLS_DOCUMENTO.split(", ").map((c) => `d.${c}`).join(", "))},
             a.nombre, a.folio as folio_cita
        from ${t("documentos")} d
        left join ${t("appointments")} a on a.id = d.appointment_id
       where d.eliminado_at is null
         and (
           ${porTexto}::text is null
           or (${porTelefono}::text is not null and d.telefono_normalizado like ${porTelefono})
           or upper(coalesce(d.folio, '')) like ${porTexto}
           or upper(coalesce(a.nombre, '')) like ${porTexto}
         )
       order by d.created_at desc
       limit 500`;
  } catch (err) {
    console.error("[panel/archivos]", err);
  }

  // Agrupado por cliente, del más reciente al más antiguo.
  const clientes = new Map<string, { nombre: string | null; folio: string | null; docs: Fila[]; bytes: number }>();
  for (const f of filas) {
    const g = clientes.get(f.telefono_normalizado) ?? { nombre: f.nombre, folio: f.folio_cita ?? f.folio, docs: [], bytes: 0 };
    g.nombre ??= f.nombre;
    g.folio ??= f.folio_cita ?? f.folio;
    g.docs.push(f);
    g.bytes += f.tamano_bytes;
    clientes.set(f.telefono_normalizado, g);
  }

  const total = filas.length;
  const pesoTotal = filas.reduce((n, f) => n + f.tamano_bytes, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Expedientes</p>
          <h1 className="font-display type-h2 mt-1 text-azul">Archivos</h1>
          <p className="mt-2 text-sm text-carbon/75">
            Documentación que los clientes cargaron desde su portal. {total} {total === 1 ? "archivo" : "archivos"} ·{" "}
            {pesoLegible(pesoTotal)}
          </p>
        </div>

        {/* Búsqueda por GET: funciona sin JavaScript. */}
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Teléfono, folio o nombre"
            aria-label="Buscar"
            className="min-h-10 w-56 rounded-brand border border-gris bg-blanco px-3 text-[0.9rem] text-carbon focus:border-azul focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex min-h-10 items-center rounded-brand border border-azul px-4 text-[0.9rem] font-medium text-azul hover:bg-azul/5"
          >
            Buscar
          </button>
        </form>
      </div>

      {clientes.size === 0 ? (
        <div className="mt-8 rounded-brand border border-gris bg-blanco p-10 text-center">
          <FolderOpen className="mx-auto size-8 text-carbon/40" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-carbon/80">
            {q ? "Ningún archivo coincide con esa búsqueda." : "Todavía no hay documentos cargados."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {[...clientes.entries()].map(([tel, g]) => {
            const open = abierto === tel;
            const volverA = `/panel/archivos${q ? `?q=${encodeURIComponent(q)}` : ""}`;
            const href = open ? volverA : `/panel/archivos?${q ? `q=${encodeURIComponent(q)}&` : ""}cliente=${tel}`;
            return (
              <section key={tel} className="overflow-hidden rounded-brand border border-gris bg-blanco">
                <Link
                  href={href}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-marfil/60",
                    open && "border-b border-gris",
                  )}
                >
                  <span>
                    <span className="block font-medium text-azul">{g.nombre ?? "Cliente sin cita asociada"}</span>
                    <span className="block text-sm tabular-nums text-carbon/75">
                      {tel}
                      {g.folio && <> · {g.folio}</>}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-sm text-carbon/75">
                    <FileText className="size-4 text-dorado-2" strokeWidth={1.75} aria-hidden />
                    {g.docs.length} {g.docs.length === 1 ? "archivo" : "archivos"} · {pesoLegible(g.bytes)}
                  </span>
                </Link>

                {open && (
                  <ul className="divide-y divide-gris">
                    {g.docs.map((d) => (
                      <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                        <span className="min-w-0">
                          <span className="block truncate text-[0.95rem] text-carbon/90">{d.nombre_archivo}</span>
                          <span className="block text-xs text-carbon/70">
                            {pesoLegible(d.tamano_bytes)} · {formatDateTimeLong(d.created_at)} ·{" "}
                            {d.subido_por === "despacho" ? "enviado por VERITUM" : "cargado por el cliente"}
                          </span>
                        </span>
                        <a
                          href={`/api/panel/documentos/${d.id}`}
                          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-brand border border-gris px-3 text-[0.9rem] text-azul hover:bg-azul/5"
                        >
                          <Download className="size-4" strokeWidth={1.75} aria-hidden />
                          Descargar
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
