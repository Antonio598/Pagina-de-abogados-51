"use client";

// Ventana al intentar salir. Aparece una sola vez por sesión, nunca en el
// formulario ni después de pagar, y se puede cerrar con Esc, con clic fuera o
// con un botón visible. No tapa el contenido al cerrarse.

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Timer, Video, X } from "lucide-react";
import { landing } from "@content/landing";
import { site } from "@content/site";
import { track } from "@/lib/analytics";
import { TrackedLink } from "@/components/ui/TrackedLink";

const CLAVE = "veritum_salida";

export const ExitIntent = ({
  precio,
  precioNormal,
  conDescuento,
  restanteMs,
  libres,
}: {
  precio: string;
  precioNormal: string;
  conDescuento: boolean;
  restanteMs: number | null;
  libres: number;
}) => {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const disparado = useRef(false);

  // Solo en la landing: nunca mientras reserva ni tras pagar.
  const permitido = pathname === "/consulta";

  useEffect(() => {
    if (!permitido) return;
    try {
      if (window.sessionStorage.getItem(CLAVE)) return;
    } catch {
      // sin almacenamiento: se mostrará una vez por carga
    }

    const abrir = () => {
      if (disparado.current) return;
      disparado.current = true;
      try {
        window.sessionStorage.setItem(CLAVE, "1");
      } catch {}
      setAbierto(true);
      track("salida_mostrada", { section: "landing" });
    };

    // Escritorio: el cursor sale por arriba, hacia las pestañas.
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) abrir();
    };
    // Móvil: vuelve a la pestaña tras haberse ido.
    let seFue = false;
    const onVisible = () => {
      if (document.visibilityState === "hidden") seFue = true;
      else if (seFue) abrir();
    };
    // Respaldo: leyó bastante y lleva un rato quieto.
    let quieto: number | undefined;
    const onScroll = () => {
      window.clearTimeout(quieto);
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0 || window.scrollY / max < 0.55) return;
      quieto = window.setTimeout(abrir, 12000);
    };

    document.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(quieto);
    };
  }, [permitido]);

  // Esc, foco atrapado y bloqueo del scroll de fondo mientras está abierta.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
      if (e.key !== "Tab" || !panel.current) return;
      const foco = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (foco.length === 0) return;
      const primero = foco[0];
      const ultimo = foco[foco.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("a, button")?.focus(), 60);
    return () => {
      document.body.style.overflow = previo;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [abierto]);

  if (!abierto) return null;

  const minutos = restanteMs && restanteMs > 0 ? Math.max(1, Math.ceil(restanteMs / 60000)) : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => setAbierto(false)}
        className="absolute inset-0 bg-azul/40 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="salida-titulo"
        className="anim-rise relative m-3 w-full max-w-md rounded-brand border border-gris bg-blanco p-6 shadow-card-hover [animation-duration:280ms] sm:m-0"
      >
        <button
          type="button"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar"
          className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-brand text-azul hover:bg-marfil"
        >
          <X className="size-5" strokeWidth={1.75} aria-hidden />
        </button>

        <p className="eyebrow">{landing.salida.eyebrow}</p>
        <h2 id="salida-titulo" className="font-display type-h2 mt-2 text-balance text-azul">
          {landing.salida.title}
        </h2>
        <p className="mt-3 text-[0.98rem] text-carbon/85">{landing.salida.text}</p>

        <ul className="mt-5 space-y-2.5 text-[0.95rem]">
          <li className="flex items-center gap-3">
            <span className="font-display text-[1.6rem] leading-none text-azul">{precio}</span>
            {conDescuento && <span className="text-sm text-carbon/70 line-through">{precioNormal}</span>}
          </li>
          {minutos !== null && (
            <li className="flex items-center gap-2 text-carbon/85">
              <Timer className="size-4 shrink-0 text-dorado-2" aria-hidden />
              {landing.salida.minutos(minutos)}
            </li>
          )}
          {libres > 0 && (
            <li className="flex items-center gap-2 text-carbon/85">
              <Video className="size-4 shrink-0 text-dorado-2" aria-hidden />
              {landing.salida.cupo(libres)}
            </li>
          )}
        </ul>

        <TrackedLink
          href="/consulta/agendar"
          className="cta-vivo mt-6 w-full"
          size="lg"
          arrow
          event="cta_agenda"
          payload={{ section: "salida", element_id: "exit_intent" }}
          onClick={() => setAbierto(false)}
        >
          {landing.salida.cta}
        </TrackedLink>
        <p className="mt-3 text-center text-xs text-carbon/70">{site.modalidad}</p>
      </div>
    </div>
  );
};
