"use client";

// Barra de acción fija. Aparece solo cuando el botón del encabezado ya salió de
// pantalla: así nunca tapa el CTA principal ni muestra dos llamados a la vez.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const BarraFija = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const centinela = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = centinela.current;
    if (!el || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting), { rootMargin: "-120px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Marca dónde termina el encabezado: mientras se ve, la barra no aparece. */}
      <div ref={centinela} aria-hidden className="pointer-events-none absolute top-[70vh] h-px w-full" />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-gris bg-marfil pb-safe transition-[transform,opacity] duration-300 ease-brand",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
        )}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-2.5">{children}</div>
      </div>
    </>
  );
};
