import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AlertTriangle, CalendarClock, CalendarX2, Check, Info, KeyRound } from "lucide-react";
import { formatDateTimeLong } from "@/lib/booking";
import { dbReady } from "@/lib/db";
import { Logo } from "@/components/layout/Logo";
import { esc, layout, sendMail } from "@/lib/mailer";
import {
  buscarCitaCliente,
  crearSolicitud,
  solicitudPendiente,
  type CitaMiCita,
} from "@/lib/solicitudes";
import { FOLIO_RE } from "@/lib/portal";
import { productoPorId, situacionLabel } from "@content/productos";
import { miCita } from "@content/portal";
import { site } from "@content/site";

export const dynamic = "force-dynamic";

// No se indexa: se llega con el folio, desde el correo de confirmación.
export const metadata: Metadata = {
  title: "Cancelar o mover tu cita · VERITUM",
  robots: { index: false, follow: false, nocache: true },
};

// --- Límite de intentos (memoria del proceso, igual que el portal) ---------
const intentos = new Map<string, { n: number; hasta: number }>();
const MAX = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

const bloqueado = (ip: string) => {
  const r = intentos.get(ip);
  return Boolean(r && r.n >= MAX && Date.now() < r.hasta);
};
const registrarFallo = (ip: string) => {
  const r = intentos.get(ip) ?? { n: 0, hasta: 0 };
  intentos.set(ip, { n: (Date.now() < r.hasta ? r.n : 0) + 1, hasta: Date.now() + BLOQUEO_MS });
};

const ipDe = async () => {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
};

/** Vive fuera del render: toma la hora actual, y eso no puede ocurrir al pintar. */
const yaOcurrio = (d: Date) => d.getTime() < Date.now();

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");

/**
 * Registra la solicitud. No hay sesión: se vuelve a comprobar teléfono + folio
 * en cada envío, así que el formulario los lleva en campos ocultos y el servidor
 * no confía en ellos más de lo que confiaría en la primera vez.
 */
async function solicitar(formData: FormData) {
  "use server";
  const telefono = String(formData.get("telefono") ?? "");
  const folio = String(formData.get("folio") ?? "");
  const volver = (r: "ok" | "e") =>
    redirect(`/mi-cita?telefono=${encodeURIComponent(telefono)}&f=${encodeURIComponent(folio)}&${r}=1`);

  const ip = await ipDe();
  if (bloqueado(ip) || !dbReady) volver("e");
  const tipo = String(formData.get("tipo") ?? "") === "reprogramar" ? "reprogramar" : "cancelar";
  const motivo = String(formData.get("motivo") ?? "");
  const cuando = String(formData.get("cuando") ?? "");

  const cita = await buscarCitaCliente(telefono, folio);
  if (!cita) {
    registrarFallo(ip);
    volver("e");
    return;
  }

  // Una solicitud pendiente por cita: no se acumulan duplicados.
  if (await solicitudPendiente(cita.id)) volver("ok");

  const slotPropuesto = tipo === "reprogramar" && cuando ? new Date(cuando) : null;
  const creada = await crearSolicitud({
    cita,
    tipo,
    motivo,
    slotPropuesto: slotPropuesto && !Number.isNaN(slotPropuesto.getTime()) ? slotPropuesto : null,
  });
  if (!creada) volver("e");

  // Aviso a VERITUM. Si el correo falla, la solicitud ya quedó registrada y
  // aparece en el panel: no se pierde.
  await sendMail({
    subject: `[VERITUM] Solicitud de ${tipo} · ${cita.folio}`,
    html: layout(
      tipo === "cancelar" ? "Solicitud de cancelación" : "Solicitud de cambio de horario",
      `<p style="margin:0 0 12px">${esc(cita.nombre)} pidió ${tipo === "cancelar" ? "cancelar" : "mover"} su cita.</p>
       <p style="margin:0 0 6px"><strong>Folio:</strong> ${esc(cita.folio)}</p>
       <p style="margin:0 0 6px"><strong>Cita actual:</strong> ${esc(formatDateTimeLong(cita.slot_start))}</p>
       ${slotPropuesto ? `<p style="margin:0 0 6px"><strong>Prefiere:</strong> ${esc(formatDateTimeLong(slotPropuesto))}</p>` : ""}
       ${motivo.trim() ? `<p style="margin:0 0 6px"><strong>Motivo:</strong> ${esc(motivo.trim())}</p>` : ""}
       <p style="margin:16px 0 0"><a href="${siteUrl()}/panel/cancelaciones" style="color:#0D224C">Resolverla en el panel</a></p>
       <p style="margin:12px 0 0;color:#6b6b6b;font-size:12px">El horario sigue reservado hasta que se aplique.</p>`,
    ),
    idempotencyKey: `solicitud-${creada!.id}`,
  });

  volver("ok");
}

const Campo = ({
  id,
  label,
  hint,
  ...rest
}: { id: string; label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-[0.95rem] font-medium text-azul">
      {label}
    </label>
    <input
      id={id}
      className="w-full rounded-brand border border-gris bg-blanco px-4 py-3 text-base text-carbon transition-[border-color] focus:border-azul focus:outline-none focus-visible:outline-2 focus-visible:outline-dorado"
      {...rest}
    />
    {hint && <p className="text-sm text-carbon/70">{hint}</p>}
  </div>
);

const Cascara = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-dvh flex-col bg-marfil">
    <header className="border-b border-gris bg-marfil/95">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo size="sm" asLink={false} />
        <span className="text-xs uppercase tracking-wider text-carbon/70">Tu cita</span>
      </div>
    </header>
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    <footer className="border-t border-gris px-4 py-6 sm:px-6">
      <p className="mx-auto max-w-2xl text-xs text-carbon/70">{site.legalNotice}</p>
    </footer>
  </div>
);

export default async function MiCitaPage({ searchParams }: PageProps<"/mi-cita">) {
  const sp = await searchParams;
  const a = miCita.acceso;
  const d = miCita.detalle;

  const folioParam = typeof sp.folio === "string" ? sp.folio.trim().toUpperCase() : "";
  const folioPrecargado = FOLIO_RE.test(folioParam) ? folioParam : "";
  const telefono = typeof sp.telefono === "string" ? sp.telefono : "";
  const folio = typeof sp.f === "string" ? sp.f : folioPrecargado;
  const enviado = sp.ok === "1";
  const fallo = sp.e === "1";

  // Si llegan los dos datos por la URL (el formulario de acceso los manda por
  // GET para que funcione sin JavaScript), se muestra la cita.
  let cita: CitaMiCita | null = null;
  let pendiente = false;
  if (dbReady && telefono && folio) {
    const ip = await ipDe();
    if (!bloqueado(ip)) {
      cita = await buscarCitaCliente(telefono, folio);
      if (!cita) registrarFallo(ip);
      else pendiente = Boolean(await solicitudPendiente(cita.id));
    }
  }

  if (!dbReady) {
    return (
      <Cascara>
        <p className="rounded-brand border border-gris bg-blanco p-6 text-carbon/85">{a.noConfigurado}</p>
      </Cascara>
    );
  }

  // --- Pantalla de acceso -------------------------------------------------
  if (!cita) {
    return (
      <Cascara>
        <div className="mx-auto max-w-md">
          <p className="eyebrow">{a.eyebrow}</p>
          <h1 className="font-display type-h2 mt-1 text-azul">{a.title}</h1>
          <p className="mt-3 text-[1.0625rem] text-carbon/85">{a.text}</p>

          {(telefono || folio) && (
            <p role="alert" className="mt-6 rounded-brand border border-dorado bg-blanco p-4 text-[0.95rem] text-carbon/90">
              {a.error}
            </p>
          )}

          {/* GET a propósito: funciona sin JavaScript. */}
          <form method="get" className="mt-8 space-y-5 rounded-brand border border-gris bg-blanco p-5 sm:p-6">
            <Campo
              id="telefono"
              label={a.telefonoLabel}
              hint={a.telefonoHint}
              name="telefono"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              maxLength={25}
            />
            <Campo
              id="f"
              label={a.folioLabel}
              hint={a.folioHint}
              name="f"
              defaultValue={folioPrecargado}
              required
              maxLength={12}
              placeholder="VER-XXXXXX"
              autoCapitalize="characters"
              spellCheck={false}
              className="w-full rounded-brand border border-gris bg-blanco px-4 py-3 text-base uppercase tracking-wider text-carbon placeholder:normal-case placeholder:tracking-normal placeholder:text-carbon/40 focus:border-azul focus:outline-none focus-visible:outline-2 focus-visible:outline-dorado"
            />
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-brand bg-azul px-6 text-base font-medium text-blanco transition-colors hover:bg-azul-2"
            >
              <KeyRound className="size-[18px]" strokeWidth={1.75} aria-hidden />
              {a.cta}
            </button>
          </form>
        </div>
      </Cascara>
    );
  }

  // --- Detalle de la cita -------------------------------------------------
  const producto = productoPorId(cita.producto_id);
  const yaPaso = yaOcurrio(cita.slot_start);

  return (
    <Cascara>
      <p className="eyebrow">{d.eyebrow}</p>
      <h1 className="font-display type-h2 mt-1 text-azul">{d.title}</h1>

      <div className="mt-6 rounded-brand border border-gris bg-blanco p-5">
        <dl className="space-y-3 text-[0.98rem]">
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <dt className="eyebrow">Folio</dt>
            <dd className="font-medium tabular-nums text-azul">{cita.folio}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-gris pt-3">
            <dt className="eyebrow">Cuándo</dt>
            <dd className="flex items-center gap-2 text-carbon/90">
              <CalendarClock className="size-4 text-dorado-2" strokeWidth={1.75} aria-hidden />
              {formatDateTimeLong(cita.slot_start)}
            </dd>
          </div>
          {producto && (
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-gris pt-3">
              <dt className="eyebrow">Servicio</dt>
              <dd className="text-carbon/90">{producto.nombre}</dd>
            </div>
          )}
          {cita.situacion && (
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-gris pt-3">
              <dt className="eyebrow">Situación</dt>
              <dd className="text-carbon/90">{situacionLabel(cita.situacion)}</dd>
            </div>
          )}
        </dl>
      </div>

      {enviado && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-brand border border-azul bg-blanco p-4 text-[0.95rem] text-azul">
          <Check className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          {d.ok}
        </p>
      )}
      {fallo && (
        <p role="alert" className="mt-6 rounded-brand border border-dorado bg-blanco p-4 text-[0.95rem] text-carbon/90">
          {d.errorEnvio}
        </p>
      )}

      {yaPaso ? (
        <p className="mt-6 flex gap-2 rounded-brand border border-gris bg-blanco p-5 text-carbon/85">
          <CalendarX2 className="mt-0.5 size-5 shrink-0 text-carbon/40" strokeWidth={1.5} aria-hidden />
          {d.pasada}
        </p>
      ) : pendiente ? (
        <p className="mt-6 flex gap-2 rounded-brand border border-dorado bg-blanco p-5 text-[0.98rem] text-carbon/90">
          <Info className="mt-0.5 size-5 shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
          {d.yaPendiente}
        </p>
      ) : (
        <>
          <p className="mt-6 flex gap-2 rounded-brand border border-dorado/40 bg-blanco p-4 text-[0.92rem] text-carbon/90">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
            <span>{d.aviso}</span>
          </p>

          {/* Mover la cita */}
          <section className="mt-6 rounded-brand border border-gris bg-blanco p-5">
            <h2 className="font-display type-h3 text-azul">{d.moverTitulo}</h2>
            <p className="mt-2 text-[0.95rem] text-carbon/85">{d.moverTexto}</p>
            <form action={solicitar} className="mt-4 space-y-4">
              <input type="hidden" name="telefono" value={telefono} />
              <input type="hidden" name="folio" value={cita.folio} />
              <input type="hidden" name="tipo" value="reprogramar" />
              <Campo id="cuando" label={d.fechaLabel} name="cuando" type="datetime-local" required />
              <Campo id="motivo-mover" label={d.motivoLabel} hint={d.motivoHint} name="motivo" maxLength={500} />
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-brand bg-azul px-6 text-base font-medium text-blanco hover:bg-azul-2"
              >
                {d.moverCta}
              </button>
            </form>
          </section>

          {/* Cancelar */}
          <section className="mt-6 rounded-brand border border-gris bg-blanco p-5">
            <h2 className="font-display type-h3 text-azul">{d.cancelarTitulo}</h2>
            <p className="mt-2 text-[0.95rem] text-carbon/85">{d.cancelarTexto}</p>
            <form action={solicitar} className="mt-4 space-y-4">
              <input type="hidden" name="telefono" value={telefono} />
              <input type="hidden" name="folio" value={cita.folio} />
              <input type="hidden" name="tipo" value="cancelar" />
              <Campo id="motivo-cancelar" label={d.motivoLabel} hint={d.motivoHint} name="motivo" maxLength={500} />
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-brand border border-azul px-6 text-base font-medium text-azul hover:bg-azul/5"
              >
                {d.cancelarCta}
              </button>
            </form>
          </section>
        </>
      )}

      <p className="mt-8 text-sm">
        <Link href="/contacto" className="link-text inline-flex min-h-10 items-center">
          Escribir a VERITUM
        </Link>
      </p>
    </Cascara>
  );
}
