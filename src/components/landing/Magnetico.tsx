"use client";

// Botón magnético: se inclina levemente hacia el dedo o el cursor y vuelve a su
// sitio al soltarlo. Solo escribe variables CSS, así que no re-renderiza React.

import { useRef, type ComponentProps } from "react";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { cn } from "@/lib/utils";

const FUERZA = 10; // píxeles máximos de desplazamiento

export const MagneticLink = ({ className, ...props }: ComponentProps<typeof TrackedLink>) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const caja = useRef<DOMRect | null>(null);

  const medir = () => {
    caja.current = ref.current?.getBoundingClientRect() ?? null;
  };

  const seguir = (x: number, y: number) => {
    const el = ref.current;
    const r = caja.current;
    if (!el || !r) return;
    const dx = ((x - (r.left + r.width / 2)) / (r.width / 2)) * FUERZA;
    const dy = ((y - (r.top + r.height / 2)) / (r.height / 2)) * FUERZA;
    el.style.setProperty("--imx", `${dx.toFixed(1)}px`);
    el.style.setProperty("--imy", `${dy.toFixed(1)}px`);
  };

  const soltar = () => {
    caja.current = null;
    ref.current?.style.setProperty("--imx", "0px");
    ref.current?.style.setProperty("--imy", "0px");
  };

  return (
    <TrackedLink
      ref={ref}
      className={cn("magnetico cta-vivo", className)}
      onPointerEnter={medir}
      onPointerMove={(e) => seguir(e.clientX, e.clientY)}
      onPointerLeave={soltar}
      onPointerCancel={soltar}
      {...props}
    />
  );
};
