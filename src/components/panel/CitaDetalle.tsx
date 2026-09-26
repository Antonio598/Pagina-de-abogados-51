import Link from "next/link";
import { Download, FileText, X } from "lucide-react";
import { formatDateOnly, formatDateTimeLong } from "@/lib/booking";
import type { Appointment, Documento } from "@/lib/db";
import { pesoLegible } from "@/lib/documentos";
import { formatMoney } from "@/lib/pricing";
import { productoPorId, situacionLabel } from "@content/productos";
import { cn } from "@/lib/utils";

// Detalle de la cita con todo lo que el cliente llenó en el formulario, el
// crédito de representación y los documentos que cargó en su portal.
// Es un panel lateral que se abre con un parámetro de la URL: funciona sin JS.

const Fila = ({ label, children }: { label: string; children: React.ReactNode }) =>
  children ? (
    <div className="border-b border-gris py-3 last:border-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-[0.98rem] text-carbon/90">{children}</dd>
    </div>
  ) : null;

/** Estado del crédito. Se deriva, no se almacena: así no puede contradecirse. */
export const estadoCredito = (cita: Appointment) => {
  if (cita.status !== "pagada") return null;
  if (cita.credito_aplicado_at) return "aplicado" as const;
  if (cita.credito_vence_at && cita.credito_vence_at.getTime() < Date.now()) return "vencido" as const;
  return "vigente" as const;
};

const etiquetaCredito: Record<"vigente" | "vencido" | "aplicado", string> = {
  vigente: "Vigente",
  vencido: "Vencido",
  aplicado: "Ya aplicado",
};

export const CitaDetalle = ({
  cita,
  volverA,
  documentos = [],
  aplicarCredito,
  guardarEnlace,
}: {
  cita: Appointment;
  volverA: string;
  documentos?: Documento[];
  /** Acción del panel: marcar el crédito como aplicado a un asunto. */
  aplicarCredito?: (formData: FormData) => void | Promise<void>;
  /** Acción del panel: guardar el enlace de la videollamada. */
  guardarEnlace?: (formData: FormData) => void | Promise<void>;
}) => {
  const producto = productoPorId(cita.producto_id);
  const credito = estadoCredito(cita);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <Link href={volverA} className="absolute inset-0 bg-azul/30 backdrop-blur-[2px]" aria-label="Cerrar detalle" />
      <aside
        aria-label={`Detalle de la cita ${cita.folio}`}
        className="anim-rise relative flex w-full max-w-md flex-col overflow-y-auto border-l border-gris bg-blanco shadow-card-hover [animation-duration:250ms]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gris bg-blanco px-6 py-4">
          <div>
            <p className="eyebrow">Folio</p>
            <p className="font-display text-[1.3rem] tabular-nums text-azul">{cita.folio}</p>
          </div>
          <Link
            href={volverA}
            className="inline-flex size-10 items-center justify-center rounded-brand text-azul hover:bg-marfil"
            aria-label="Cerrar"
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>

        <dl className="px-6">
          <Fila label="Cuándo">{formatDateTimeLong(cita.slot_start)}</Fila>
          <Fila label="Estado">{cita.status === "pagada" ? "Pagada y confirmada" : cita.status}</Fila>
          <Fila label="Servicio">{producto?.nombre}</Fila>
          <Fila label="Situación">{situacionLabel(cita.situacion)}</Fila>
          <Fila label="Importe">{formatMoney(cita.precio_centavos, cita.moneda)}</Fila>
          <Fila label="Origen">{cita.origen === "landing" ? "Landing de campaña" : "Sitio web"}</Fila>

          <Fila label="Nombre">{cita.nombre}</Fila>
          <Fila label="Correo">
            <a href={`mailto:${cita.correo}`} className="link-text">
              {cita.correo}
            </a>
          </Fila>
          <Fila label="Teléfono">
            <a href={`tel:${cita.telefono.replace(/[^\d+]/g, "")}`} className="link-text">
              {cita.telefono}
            </a>
          </Fila>
          <Fila label="Área">{cita.area}</Fila>
          <Fila label="Modalidad">{cita.modalidad}</Fila>
          <Fila label="Ubicación">{[cita.municipio, cita.entidad].filter(Boolean).join(", ")}</Fila>
          <Fila label="Fecha próxima relevante">
            {cita.fecha_proxima ? formatDateOnly(cita.fecha_proxima) : null}
          </Fila>
          <Fila label="Lo que nos compartió">
            <span className="whitespace-pre-line">{cita.descripcion}</span>
          </Fila>

          <Fila label="Pago (Stripe)">{cita.stripe_payment_intent}</Fila>
          <Fila label="Pagada el">{cita.paid_at ? formatDateTimeLong(cita.paid_at) : null}</Fila>
          <Fila label="Campaña">
            {Object.entries(cita.utm ?? {}).length > 0
              ? Object.entries(cita.utm)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ")
              : null}
          </Fila>
          <Fila label="Consentimiento">
            {cita.consentimiento_at
              ? `${formatDateTimeLong(cita.consentimiento_at)} · aviso ${cita.aviso_version ?? "—"}`
              : null}
          </Fila>
        </dl>

        {/* Crédito de representación --------------------------------------- */}
        {credito && (
          <section className="mx-6 mt-4 rounded-brand border border-dorado/50 bg-marfil p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="eyebrow">Crédito de representación</p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs uppercase tracking-wider",
                  credito === "vigente" ? "bg-azul text-blanco" : "bg-blanco text-carbon/75",
                )}
              >
                {etiquetaCredito[credito]}
              </span>
            </div>
            <p className="font-display mt-2 text-[1.5rem] leading-none text-azul">
              {formatMoney(cita.precio_centavos, cita.moneda)}
            </p>
            <p className="mt-1 text-sm text-carbon/75">
              {credito === "aplicado"
                ? `Aplicado el ${formatDateTimeLong(cita.credito_aplicado_at!)} · ${cita.credito_asunto}`
                : cita.credito_vence_at
                  ? `Vigente hasta el ${formatDateTimeLong(cita.credito_vence_at)}`
                  : "Sin vigencia registrada"}
            </p>
            {cita.credito_notas && <p className="mt-2 text-sm text-carbon/85">{cita.credito_notas}</p>}

            {credito !== "aplicado" && aplicarCredito && (
              <form action={aplicarCredito} className="mt-4 space-y-2">
                <input type="hidden" name="id" value={cita.id} />
                <label htmlFor={`asunto-${cita.id}`} className="block text-[0.9rem] font-medium text-azul">
                  Aplicar a qué asunto
                </label>
                <input
                  id={`asunto-${cita.id}`}
                  name="asunto"
                  required
                  maxLength={160}
                  placeholder="Expediente, número de caso o descripción"
                  className="w-full rounded-brand border border-gris bg-blanco px-3 py-2 text-[0.95rem] text-carbon focus:border-azul focus:outline-none"
                />
                <input
                  name="notas"
                  maxLength={300}
                  placeholder="Notas (opcional)"
                  className="w-full rounded-brand border border-gris bg-blanco px-3 py-2 text-[0.95rem] text-carbon focus:border-azul focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-brand bg-azul px-4 text-[0.9rem] font-medium text-blanco hover:bg-azul-2"
                >
                  Marcar como aplicado
                </button>
              </form>
            )}
          </section>
        )}

        {/* Enlace de la videollamada -------------------------------------- */}
        {guardarEnlace && (
          <section className="mx-6 mt-4 rounded-brand border border-gris p-4">
            <p className="eyebrow">Enlace de la videollamada</p>
            <form action={guardarEnlace} className="mt-2 space-y-2">
              <input type="hidden" name="id" value={cita.id} />
              <input
                name="enlace"
                type="url"
                defaultValue={cita.enlace_sesion ?? ""}
                maxLength={500}
                placeholder="https://meet.google.com/…"
                className="w-full rounded-brand border border-gris bg-blanco px-3 py-2 text-[0.95rem] text-carbon focus:border-azul focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-brand border border-azul px-4 text-[0.9rem] font-medium text-azul hover:bg-azul/5"
              >
                Guardar enlace
              </button>
            </form>
            <p className="mt-2 text-xs text-carbon/70">
              El cliente lo ve en su portal. Si se deja vacío se usa MEETING_URL, y si tampoco existe el correo dice que el
              enlace se enviará antes de la sesión.
            </p>
          </section>
        )}

        {/* Documentos del portal ------------------------------------------ */}
        <section className="mx-6 mb-10 mt-4">
          <p className="eyebrow flex items-center gap-2">
            <FileText className="size-4 text-dorado-2" strokeWidth={1.75} aria-hidden />
            Documentos ({documentos.length})
          </p>
          {documentos.length === 0 ? (
            <p className="mt-2 text-sm text-carbon/75">El cliente aún no ha cargado documentación en su portal.</p>
          ) : (
            <ul className="mt-2 divide-y divide-gris">
              {documentos.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-[0.95rem] text-carbon/90">{d.nombre_archivo}</span>
                    <span className="block text-xs text-carbon/70">
                      {pesoLegible(d.tamano_bytes)} · {formatDateTimeLong(d.created_at)}
                    </span>
                  </span>
                  <a
                    href={`/api/panel/documentos/${d.id}`}
                    className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-brand border border-gris px-3 text-[0.85rem] text-azul hover:bg-azul/5"
                  >
                    <Download className="size-4" strokeWidth={1.75} aria-hidden />
                    Bajar
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
};
