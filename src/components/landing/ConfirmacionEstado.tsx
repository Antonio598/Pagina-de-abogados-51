"use client";

// Tras pagar, Stripe devuelve al visitante aquí. El webhook puede tardar unos
// segundos en llegar, así que consultamos el estado hasta que la cita aparezca
// confirmada (o hasta agotar los reintentos).

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarCheck, CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { landing } from "@content/landing";
import { process as proceso } from "@content/process";
import { track } from "@/lib/analytics";

type Estado = { status?: string; folio?: string; nombre?: string; cuando?: string; encontrada?: boolean };

export const ConfirmacionEstado = ({ sessionId }: { sessionId?: string }) => {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [agotado, setAgotado] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    let intentos = 0;
    let cancelado = false;
    let timer: number;

    const consultar = async () => {
      intentos += 1;
      try {
        const res = await fetch(`/api/reservas/estado?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const json = (await res.json()) as Estado & { ok: boolean };
        if (cancelado) return;
        if (json.ok) setEstado(json);
        if (json.status === "pagada") {
          track("agenda_confirmada", { section: "landing", result: "completado" }, { once: `confirmada_${sessionId}` });
          return;
        }
      } catch {
        // se reintenta
      }
      if (cancelado) return;
      if (intentos >= 12) {
        setAgotado(true);
        return;
      }
      timer = window.setTimeout(consultar, 2500);
    };

    void consultar();
    return () => {
      cancelado = true;
      window.clearTimeout(timer);
    };
  }, [sessionId]);

  const pagada = estado?.status === "pagada";

  if (pagada) {
    return (
      <div className="anim-rise">
        <CheckCircle2 className="size-10 text-azul" strokeWidth={1.5} aria-hidden />
        <h1 className="font-display type-h1 mt-4 text-balance text-azul">{landing.confirmacion.titleOk}</h1>
        <p className="mt-4 text-carbon/85">{landing.confirmacion.textOk}</p>

        <dl className="mt-7 divide-y divide-gris rounded-brand border border-gris bg-blanco">
          <div className="flex items-center justify-between gap-4 p-4">
            <dt className="eyebrow">Folio</dt>
            <dd className="font-display text-[1.15rem] tabular-nums text-azul">{estado?.folio}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-4">
            <dt className="eyebrow">Cuándo</dt>
            <dd className="text-right text-[0.98rem] text-carbon/90">{estado?.cuando}</dd>
          </div>
        </dl>

        <h2 className="font-display type-h3 mt-8 flex items-center gap-2 text-azul">
          <CalendarCheck className="size-5 text-dorado-2" strokeWidth={1.75} aria-hidden />
          {landing.confirmacion.prepararTitle}
        </h2>
        <ul className="mt-4 space-y-2.5">
          {proceso.prepare.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-[0.95rem] text-carbon/90">
              <span className="mt-[0.65em] h-px w-4 shrink-0 bg-dorado" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-brand border-l-2 border-dorado bg-blanco p-4 text-[0.95rem] text-carbon/85">{proceso.note.text}</p>

        <Link href="/" className="link-text mt-8 inline-block py-2 font-medium">
          {landing.confirmacion.volver}
        </Link>
      </div>
    );
  }

  if (agotado || !sessionId) {
    return (
      <div role="alert">
        <TriangleAlert className="size-10 text-dorado-2" strokeWidth={1.5} aria-hidden />
        <h1 className="font-display type-h1 mt-4 text-balance text-azul">{landing.confirmacion.titleError}</h1>
        <p className="mt-4 text-carbon/85">{landing.confirmacion.textError}</p>
        {estado?.folio && <p className="mt-2 text-carbon/85">Folio: <strong>{estado.folio}</strong></p>}
        <Link href="/contacto" className="link-text mt-6 inline-block py-2 font-medium">
          Escribir a VERITUM
        </Link>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite">
      <Loader2 className="size-9 animate-spin text-azul" aria-hidden />
      <h1 className="font-display type-h2 mt-4 text-azul">{landing.confirmacion.titlePendiente}</h1>
      <p className="mt-3 text-carbon/85">{landing.confirmacion.textPendiente}</p>
    </div>
  );
};
