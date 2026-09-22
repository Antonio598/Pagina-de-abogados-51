import Link from "next/link";
import { X } from "lucide-react";
import { formatDateTimeLong } from "@/lib/booking";
import type { Appointment } from "@/lib/db";
import { formatMoney } from "@/lib/pricing";

// Detalle de la cita con todo lo que el cliente llenó en el formulario.
// Es un panel lateral que se abre con un parámetro de la URL: funciona sin JS.

const Fila = ({ label, children }: { label: string; children: React.ReactNode }) =>
  children ? (
    <div className="border-b border-gris py-3 last:border-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-[0.98rem] text-carbon/90">{children}</dd>
    </div>
  ) : null;

export const CitaDetalle = ({ cita, volverA }: { cita: Appointment; volverA: string }) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <Link href={volverA} className="absolute inset-0 bg-azul/30 backdrop-blur-[2px]" aria-label="Cerrar detalle" />
    <aside
      aria-label={`Detalle de la cita ${cita.folio}`}
      className="anim-rise relative flex w-full max-w-md flex-col overflow-y-auto border-l border-gris bg-blanco shadow-card-hover [animation-duration:250ms]"
    >
      <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-gris bg-blanco px-6 py-4">
        <div>
          <p className="eyebrow">Folio</p>
          <p className="font-display text-[1.3rem] tabular-nums text-azul">{cita.folio}</p>
        </div>
        <Link href={volverA} className="inline-flex size-10 items-center justify-center rounded-brand text-azul hover:bg-marfil" aria-label="Cerrar">
          <X className="size-5" strokeWidth={1.75} aria-hidden />
        </Link>
      </div>

      <dl className="px-6 pb-10">
        <Fila label="Cuándo">{formatDateTimeLong(new Date(cita.slot_start))}</Fila>
        <Fila label="Estado">{cita.status === "pagada" ? "Pagada y confirmada" : cita.status}</Fila>
        <Fila label="Importe">
          {formatMoney(cita.precio_centavos, cita.moneda)}
          {cita.promo_aplicada && <span className="ml-2 text-sm text-dorado-2">con descuento</span>}
        </Fila>
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
        <Fila label="Fecha próxima relevante">{cita.fecha_proxima}</Fila>
        <Fila label="Lo que nos compartió">
          <span className="whitespace-pre-line">{cita.descripcion}</span>
        </Fila>

        <Fila label="Pago (Stripe)">{cita.stripe_payment_intent}</Fila>
        <Fila label="Pagada el">{cita.paid_at ? formatDateTimeLong(new Date(cita.paid_at)) : null}</Fila>
        <Fila label="Campaña">
          {Object.entries(cita.utm ?? {}).length > 0
            ? Object.entries(cita.utm)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ")
            : null}
        </Fila>
        <Fila label="Consentimiento">
          {cita.consentimiento_at ? `${formatDateTimeLong(new Date(cita.consentimiento_at))} · aviso ${cita.aviso_version ?? "—"}` : null}
        </Fila>
      </dl>
    </aside>
  </div>
);
