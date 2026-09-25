import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { KeyRound } from "lucide-react";
import { buscarCitaPortal } from "@/lib/portal";
import {
  crearSesionPortal,
  getSesionPortal,
  portalBloqueado,
  portalConfigurado,
  portalFrenoGlobal,
  portalLimpiar,
  portalRegistrarFallo,
} from "@/lib/portal-auth";
import { normalizarTelefono } from "@/lib/seguimiento";
import { dbReady } from "@/lib/db";
import { portal } from "@content/portal";

export const dynamic = "force-dynamic";

const ipDe = async () => {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
};

/**
 * Acceso al portal. Un solo mensaje de error para todos los casos y un suelo de
 * tiempo, para que ni el texto ni la duración distingan "folio inexistente" de
 * "folio correcto con teléfono equivocado": así no se pueden enumerar folios.
 */
async function entrar(formData: FormData) {
  "use server";
  const ip = await ipDe();
  if (!portalConfigurado() || !dbReady) redirect("/portal?e=config");
  if (portalBloqueado(ip) || portalFrenoGlobal()) redirect("/portal?e=bloqueado");

  const telefono = String(formData.get("telefono") ?? "");
  const folio = String(formData.get("folio") ?? "");

  const inicio = Date.now();
  const cita = await buscarCitaPortal(telefono, folio).catch((err) => {
    console.error("[portal/acceso] Error al buscar la cita", err);
    return null;
  });
  // Suelo de 300 ms: la respuesta tarda lo mismo acierte o falle.
  const resto = 300 - (Date.now() - inicio);
  if (resto > 0) await new Promise((r) => setTimeout(r, resto));

  if (!cita) {
    portalRegistrarFallo(ip);
    console.error(`[portal/acceso] fallo ip=${ip}`);
    redirect("/portal?e=1");
  }

  const tel = normalizarTelefono(cita.telefono);
  if (!tel) redirect("/portal?e=1");

  portalLimpiar(ip);
  await crearSesionPortal({ aid: cita.id, tel, folio: cita.folio });
  redirect("/portal/expediente");
}

export default async function PortalAccesoPage({ searchParams }: PageProps<"/portal">) {
  // Si ya hay sesión, no se pide de nuevo.
  if (await getSesionPortal()) redirect("/portal/expediente");

  const sp = await searchParams;
  const e = typeof sp.e === "string" ? sp.e : undefined;
  const a = portal.acceso;

  const mensaje =
    e === "bloqueado" ? a.bloqueado : e === "config" ? a.noConfigurado : e ? a.error : undefined;

  const listo = portalConfigurado() && dbReady;

  return (
    <div className="mx-auto max-w-md">
      <p className="eyebrow">{a.eyebrow}</p>
      <h1 className="font-display type-h2 mt-1 text-azul">{a.title}</h1>
      <p className="mt-3 text-[1.0625rem] text-carbon/85">{a.text}</p>

      {mensaje && (
        <p role="alert" className="mt-6 rounded-brand border border-dorado bg-blanco p-4 text-[0.95rem] text-carbon/90">
          {mensaje}
        </p>
      )}

      {!listo ? (
        <p className="mt-6 rounded-brand border border-gris bg-blanco p-6 text-carbon/85">{a.noConfigurado}</p>
      ) : (
        // Formulario nativo: funciona sin JavaScript.
        <form action={entrar} className="mt-8 space-y-5 rounded-brand border border-gris bg-blanco p-5 sm:p-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="telefono" className="text-[0.95rem] font-medium text-azul">
              {a.telefonoLabel}
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              maxLength={25}
              className="w-full rounded-brand border border-gris bg-blanco px-4 py-3 text-base text-carbon transition-[border-color] focus:border-azul focus:outline-none focus-visible:outline-2 focus-visible:outline-dorado"
            />
            <p className="text-sm text-carbon/70">{a.telefonoHint}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="folio" className="text-[0.95rem] font-medium text-azul">
              {a.folioLabel}
            </label>
            <input
              id="folio"
              name="folio"
              type="text"
              required
              maxLength={12}
              placeholder="VER-XXXXXX"
              autoCapitalize="characters"
              spellCheck={false}
              className="w-full rounded-brand border border-gris bg-blanco px-4 py-3 text-base uppercase tracking-wider text-carbon placeholder:normal-case placeholder:tracking-normal placeholder:text-carbon/40 transition-[border-color] focus:border-azul focus:outline-none focus-visible:outline-2 focus-visible:outline-dorado"
            />
            <p className="text-sm text-carbon/70">{a.folioHint}</p>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-brand bg-azul px-6 text-base font-medium text-blanco transition-colors hover:bg-azul-2"
          >
            <KeyRound className="size-[18px]" strokeWidth={1.75} aria-hidden />
            {a.cta}
          </button>

          <p className="text-sm text-carbon/70">{a.ayuda}</p>
        </form>
      )}
    </div>
  );
}
