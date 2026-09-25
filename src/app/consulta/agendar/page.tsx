import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Info } from "lucide-react";
import { landing } from "@content/landing";
import { productoODefecto, situaciones } from "@content/productos";
import { cobroDisponible } from "@/lib/pricing";
import { productosVista } from "@/lib/productos-vista";
import { env } from "@/lib/env";
import { BookingForm } from "@/components/forms/BookingForm";
import { AgenteIaLink } from "@/components/landing/AgenteIaLink";

export const metadata: Metadata = {
  title: "Agenda tu asesoría · VERITUM",
  robots: { index: false, follow: false },
};

// Página de reserva de la landing. Es distinta de la landing y distinta del
// /agenda del sitio, pero usa el mismo motor de horarios y de cobro.
export default async function AgendarPage({ searchParams }: PageProps<"/consulta/agendar">) {
  const sp = await searchParams;
  const cancelado = sp.pago === "cancelado";
  // La landing enlaza cada situación con ?situacion=…, y de ahí se deduce el
  // servicio sugerido; ?producto=… lo sobreescribe si viene explícito.
  const situacionParam = typeof sp.situacion === "string" ? sp.situacion : undefined;
  const situacion = situaciones.find((s) => s.id === situacionParam);
  const productoParam = typeof sp.producto === "string" ? sp.producto : undefined;
  const producto = productoODefecto(productoParam ?? situacion?.productoSugerido);
  const productos = productosVista();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/consulta" className="inline-flex min-h-10 items-center gap-2 text-sm text-azul underline-offset-4 hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        Volver
      </Link>

      <p className="eyebrow mt-6 flex items-center gap-2">
        <span className="h-px w-6 bg-dorado" aria-hidden />
        {landing.agendar.eyebrow}
      </p>
      <h1 className="font-display type-h1 mt-3 text-balance text-azul">{landing.agendar.title}</h1>
      <p className="mt-4 text-carbon/85">{landing.agendar.text}</p>

      {cancelado && (
        <p role="status" className="mt-6 flex gap-3 rounded-brand border border-dorado/50 bg-dorado/10 p-4 text-[0.95rem] text-carbon/90">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
          {landing.agendar.canceladoAviso}
        </p>
      )}

      {/* Aviso previo obligatorio antes de reservar o pagar (Bloque 6) */}
      <details className="mt-6 rounded-brand border border-gris bg-blanco p-4 open:shadow-card" open>
        <summary className="flex cursor-pointer items-center gap-2 text-[0.95rem] font-medium text-azul">
          <Info className="size-4 text-dorado-2" aria-hidden />
          Antes de reservar, lee esto
        </summary>
        <p className="mt-3 text-[0.95rem] text-carbon/85">{landing.agendar.aviso}</p>
      </details>

      {cobroDisponible() ? (
        <div className="mt-8">
          <BookingForm
            origen="landing"
            productos={productos}
            productoInicial={producto.id}
            mostrarSelector
            situacionInicial={situacion?.id}
          />
        </div>
      ) : (
        <p className="mt-8 rounded-brand border border-gris bg-blanco p-5 text-carbon/85">
          La reserva en línea se habilitará muy pronto.{" "}
          <Link href="/contacto" className="link-text !underline">
            Escríbenos
          </Link>{" "}
          y te damos un horario.
        </p>
      )}

      {env.agenteIaUrl && (
        <div className="mt-10 rounded-brand border border-gris bg-blanco p-5">
          <p className="font-display text-[1.1rem] text-azul">{landing.agente.title}</p>
          <p className="mt-2 text-[0.95rem] text-carbon/85">{landing.agente.text}</p>
          <AgenteIaLink href={env.agenteIaUrl} className="mt-4 w-full">
            {landing.agente.cta}
          </AgenteIaLink>
        </div>
      )}
    </div>
  );
}
