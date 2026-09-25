import { redirect } from "next/navigation";
import { Check, CircleDot, Download, FileUp, LogOut, Video } from "lucide-react";
import { formatDateTimeLong } from "@/lib/booking";
import { dbReady } from "@/lib/db";
import { listarDocumentos, pesoLegible, TOPE_POR_CLIENTE, TOPE_POR_ENVIO } from "@/lib/documentos";
import { citaDeSesion } from "@/lib/portal";
import { destruirSesionPortal, getSesionPortal } from "@/lib/portal-auth";
import { checklistDe, portal } from "@content/portal";
import { productoPorId } from "@content/productos";

export const dynamic = "force-dynamic";

async function salir() {
  "use server";
  await destruirSesionPortal();
  redirect("/portal");
}

export default async function ExpedientePage({ searchParams }: PageProps<"/portal/expediente">) {
  const sesion = await getSesionPortal();
  if (!sesion) redirect("/portal");

  const sp = await searchParams;
  const ok = typeof sp.ok === "string" ? Number(sp.ok) : 0;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const e = portal.expediente;
  const cita = dbReady ? await citaDeSesion(sesion.aid, sesion.tel).catch(() => null) : null;
  const documentos = dbReady ? await listarDocumentos(sesion.tel) : [];
  const checklist = checklistDe(cita?.situacion);
  const producto = productoPorId(cita?.producto_id);
  const restantes = Math.max(0, TOPE_POR_CLIENTE - documentos.length);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{e.eyebrow}</p>
          <h1 className="font-display type-h2 mt-1 text-azul">{e.title}</h1>
          <p className="mt-2 text-sm text-carbon/75">
            Folio <span className="font-medium tabular-nums text-azul">{sesion.folio}</span>
            {cita?.nombre && <> · {cita.nombre}</>}
          </p>
        </div>
        <form action={salir}>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 rounded-brand border border-gris bg-blanco px-4 text-[0.9rem] text-azul hover:bg-azul/5"
          >
            <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
            {e.salir}
          </button>
        </form>
      </div>

      {ok > 0 && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-brand border border-azul bg-blanco p-4 text-[0.95rem] text-azul">
          <Check className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          {e.ok(ok)}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 rounded-brand border border-dorado bg-blanco p-4 text-[0.95rem] text-carbon/90">
          {e.errores[error] ?? e.errores.generico}
        </p>
      )}

      {/* Tu sesión ------------------------------------------------------- */}
      {cita && (
        <section className="mt-8 rounded-brand border border-gris bg-blanco p-5">
          <h2 className="font-display type-h3 text-azul">{e.sesionTitulo}</h2>
          <p className="mt-2 text-[0.98rem] text-carbon/90">
            {formatDateTimeLong(cita.slot_start)}
            {producto && <> · {producto.nombre}</>}
          </p>
          {cita.enlace_sesion ? (
            <a
              href={cita.enlace_sesion}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-brand bg-azul px-6 text-base font-medium text-blanco transition-colors hover:bg-azul-2"
            >
              <Video className="size-[18px]" strokeWidth={1.75} aria-hidden />
              {e.enlaceCta}
            </a>
          ) : (
            <p className="mt-2 text-sm text-carbon/75">{e.enlacePendiente}</p>
          )}
        </section>
      )}

      {/* Qué documentación hace falta ------------------------------------ */}
      <section className="mt-6 rounded-brand border border-gris bg-blanco p-5">
        <h2 className="font-display type-h3 text-azul">{checklist.titulo}</h2>
        <p className="mt-2 text-[0.98rem] text-carbon/85">{checklist.texto}</p>

        <p className="eyebrow mt-5">Lo necesario</p>
        <ul className="mt-2 space-y-2">
          {checklist.necesario.map((x) => (
            <li key={x} className="flex gap-2.5 text-[0.98rem] text-carbon/90">
              <CircleDot className="mt-1 size-4 shrink-0 text-dorado" strokeWidth={1.75} aria-hidden />
              <span>{x}</span>
            </li>
          ))}
        </ul>

        <p className="eyebrow mt-5">Si lo tienes a mano</p>
        <ul className="mt-2 space-y-2">
          {checklist.util.map((x) => (
            <li key={x} className="flex gap-2.5 text-[0.98rem] text-carbon/80">
              <CircleDot className="mt-1 size-4 shrink-0 text-carbon/40" strokeWidth={1.75} aria-hidden />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cargar --------------------------------------------------------- */}
      <section className="mt-6 rounded-brand border border-gris bg-blanco p-5">
        <h2 className="font-display type-h3 text-azul">{e.cargaTitulo}</h2>
        <p className="mt-2 text-[0.95rem] text-carbon/80">{e.cargaTexto}</p>

        {restantes === 0 ? (
          <p className="mt-4 rounded-brand border border-dorado p-4 text-[0.95rem] text-carbon/90">{e.errores.tope}</p>
        ) : (
          // POST nativo a un Route Handler: funciona sin JavaScript y no está
          // sujeto al tope de 1 MB de las Server Actions.
          <form
            action="/api/portal/documentos"
            method="post"
            encType="multipart/form-data"
            className="mt-4 space-y-4"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="archivos" className="text-[0.95rem] font-medium text-azul">
                Archivos
              </label>
              <input
                id="archivos"
                name="archivos"
                type="file"
                multiple
                required
                accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.docx,.xlsx"
                className="w-full rounded-brand border border-gris bg-blanco px-4 py-3 text-base text-carbon file:mr-4 file:rounded-brand file:border-0 file:bg-azul file:px-4 file:py-2 file:text-sm file:font-medium file:text-blanco hover:file:bg-azul-2 focus:border-azul focus:outline-none focus-visible:outline-2 focus-visible:outline-dorado"
              />
              <p className="text-sm text-carbon/70">
                Hasta {TOPE_POR_ENVIO} archivos por envío. Te quedan {restantes} de {TOPE_POR_CLIENTE}.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-brand bg-azul px-6 text-base font-medium text-blanco transition-colors hover:bg-azul-2 sm:w-auto"
            >
              <FileUp className="size-[18px]" strokeWidth={1.75} aria-hidden />
              {e.cargaCta}
            </button>
          </form>
        )}
      </section>

      {/* Lo que ya envió ------------------------------------------------- */}
      <section className="mt-6 rounded-brand border border-gris bg-blanco p-5">
        <h2 className="font-display type-h3 text-azul">{e.listaTitulo}</h2>
        {documentos.length === 0 ? (
          <p className="mt-3 text-carbon/75">{e.listaVacia}</p>
        ) : (
          <ul className="mt-4 divide-y divide-gris">
            {documentos.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-[0.98rem] text-carbon/90">{d.nombre_archivo}</span>
                  <span className="block text-xs text-carbon/70">
                    {pesoLegible(d.tamano_bytes)} · {formatDateTimeLong(d.created_at)}
                    {d.subido_por === "despacho" && " · enviado por VERITUM"}
                  </span>
                </span>
                <a
                  href={`/api/portal/documentos/${d.id}`}
                  className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-brand border border-gris px-3 text-[0.9rem] text-azul hover:bg-azul/5"
                >
                  <Download className="size-4" strokeWidth={1.75} aria-hidden />
                  {e.descargar}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-sm text-carbon/75">{e.text}</p>
    </>
  );
}
