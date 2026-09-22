"use client";

// Flujo de agenda del sitio (Bloque 6): primero el aviso previo obligatorio y,
// solo después de aceptarlo, el formulario de reserva con pago. El motor de
// horarios y el cobro son los mismos que usa la landing.

import { useState } from "react";
import { AlertCircle, Info } from "lucide-react";
import { agenda, contactForm as cf } from "@content/contact";
import { Button } from "@/components/ui/Button";
import { DrawLine } from "@/components/motion/Reveal";
import { Checkbox } from "./Field";
import { BookingForm, type PrecioVista } from "./BookingForm";
import { cn } from "@/lib/utils";

type Props = {
  defaultAsunto?: string;
  precio: PrecioVista;
  duracionMinutos: number;
  cobroDisponible: boolean;
  cancelado?: boolean;
};

const Pasos = ({ actual }: { actual: number }) => (
  <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" aria-label="Pasos de la reserva">
    {agenda.steps.map((s, i) => (
      <li key={s} className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full border font-display text-xs tabular-nums transition-colors",
            i < actual ? "border-dorado bg-dorado/15 text-azul" : i === actual ? "border-azul bg-azul text-blanco" : "border-gris text-carbon/70",
          )}
          aria-current={i === actual ? "step" : undefined}
        >
          {i + 1}
        </span>
        <span className={cn(i === actual ? "font-medium text-azul" : "text-carbon/70")}>{s}</span>
        {i < agenda.steps.length - 1 && <span className="hidden h-px w-6 bg-gris sm:block" aria-hidden />}
      </li>
    ))}
  </ol>
);

export const AgendaFlow = ({ defaultAsunto, precio, duracionMinutos, cobroDisponible, cancelado }: Props) => {
  const [ack, setAck] = useState(false);
  const [paso, setPaso] = useState<0 | 1>(0);

  return (
    <div className="rounded-brand border border-gris bg-blanco p-5 shadow-card sm:p-6 md:p-10">
      <Pasos actual={paso} />
      <DrawLine className="my-8" />

      {cancelado && paso === 0 && (
        <p role="status" className="mb-6 flex gap-3 rounded-brand border border-dorado/50 bg-dorado/10 p-4 text-[0.95rem] text-carbon/90">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
          El pago se canceló y el horario quedó libre. Puedes elegir otro y volver a intentarlo.
        </p>
      )}

      {paso === 0 && (
        <div className="anim-rise [animation-duration:300ms]">
          <div className="flex gap-4 rounded-brand border border-dorado/40 bg-marfil p-5 md:p-6">
            <Info className="mt-1 size-6 shrink-0 text-dorado-2" strokeWidth={1.5} aria-hidden />
            <p className="text-carbon/90">{agenda.notice}</p>
          </div>
          <Checkbox id="ack" label={agenda.ack} checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-6" />
          <Button className="mt-8" size="lg" arrow disabled={!ack} onClick={() => setPaso(1)}>
            {agenda.continueLabel}
          </Button>
        </div>
      )}

      {paso === 1 &&
        (cobroDisponible ? (
          <BookingForm origen="sitio" precio={precio} defaultAsunto={defaultAsunto} duracionMinutos={duracionMinutos} className="anim-rise [animation-duration:300ms]" />
        ) : (
          <p className="text-carbon/85">{cf.errorText}</p>
        ))}
    </div>
  );
};
