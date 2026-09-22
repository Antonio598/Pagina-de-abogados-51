"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { landing } from "@content/landing";

// Contador de la promoción. El plazo lo fija el servidor (cookie firmada) y el
// tiempo restante inicial también llega calculado desde el servidor, así que
// aquí no se toma la hora durante el render. Al llegar a cero recargamos: el
// precio sube de verdad y todo el flujo debe reflejarlo.
export const PromoBar = ({ restanteMs, enabled }: { restanteMs: number | null; enabled: boolean }) => {
  const [restante, setRestante] = useState(restanteMs ?? 0);

  useEffect(() => {
    if (!enabled || restanteMs === null || restanteMs <= 0) return;
    const fin = Date.now() + restanteMs;
    const id = window.setInterval(() => {
      const ms = fin - Date.now();
      setRestante(ms);
      if (ms <= 0) {
        window.clearInterval(id);
        window.location.reload();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [enabled, restanteMs]);

  if (!enabled) return null;

  if (restanteMs === null || restante <= 0) {
    return <span className="shrink text-right text-xs leading-tight text-carbon/70">{landing.promoExpirada}</span>;
  }

  const total = Math.max(0, Math.floor(restante / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");

  return (
    // En pantallas estrechas se muestra solo el reloj; la etiqueta aparece desde sm.
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-dorado/50 bg-dorado/10 px-2.5 py-1.5 text-azul sm:gap-2 sm:px-3">
      <Timer className="size-4 shrink-0 text-dorado-2" aria-hidden />
      <span className="hidden text-[0.7rem] uppercase leading-tight tracking-wider text-dorado-2 sm:inline">{landing.promoLabel}</span>
      <span className="font-display tabular-nums text-[0.95rem]">
        {mm}:{ss}
      </span>
      <span className="sr-only">{landing.promoLabel}</span>
    </span>
  );
};
