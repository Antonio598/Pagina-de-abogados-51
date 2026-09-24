"use client";

// Efectos de la landing. Todos comparten tres reglas:
//  1. El contenido es legible aunque el efecto no llegue a ejecutarse.
//  2. Nada bloquea el primer pintado.
//  3. Con prefers-reduced-motion no se anima nada (lo apaga globals.css y,
//     donde hace falta, también el propio componente).

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const sinMovimiento = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Observador compartido: un solo IntersectionObserver para toda la página. */
let observador: IntersectionObserver | null = null;
const acciones = new WeakMap<Element, () => void>();

const observar = (el: Element, cb: () => void) => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    cb();
    return () => {};
  }
  observador ??= new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        acciones.get(e.target)?.();
        observador?.unobserve(e.target);
        acciones.delete(e.target);
      }
    },
    { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
  );
  acciones.set(el, cb);
  observador.observe(el);
  return () => {
    observador?.unobserve(el);
    acciones.delete(el);
  };
};

// ---------------------------------------------------------------------------
// Titular que aparece palabra por palabra
// ---------------------------------------------------------------------------
export const WordReveal = ({
  texto,
  className,
  delay = 0,
  as: Tag = "h1",
  brillo,
}: {
  texto: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "p" | "span";
  /** Barrido dorado que recorre el titular tras aparecer. */
  brillo?: "azul" | "claro";
}) => {
  const palabras = texto.split(" ");
  const clase = brillo ? (brillo === "claro" ? "palabra-brillo palabra-brillo-claro" : "palabra-brillo") : "palabra";
  return (
    <Tag className={className}>
      {palabras.map((palabra, i) => (
        <span key={`${palabra}-${i}`} className={clase} style={{ ["--i" as string]: i, ["--d" as string]: `${delay}ms` } as CSSProperties}>
          {palabra}
          {i < palabras.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
};

// ---------------------------------------------------------------------------
// Número que sube contando al entrar en pantalla
// ---------------------------------------------------------------------------
export const CountUp = ({
  hasta,
  prefijo = "",
  sufijo = "",
  duracion = 900,
  className,
  moneda,
}: {
  hasta: number;
  prefijo?: string;
  sufijo?: string;
  duracion?: number;
  className?: string;
  /** Código de moneda (MXN, USD…). Con él, el número se formatea como importe. */
  moneda?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || sinMovimiento() || hasta <= 0) return;
    const formatear = (n: number) =>
      moneda
        ? new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda, minimumFractionDigits: 0 }).format(n)
        : n.toLocaleString("es-MX");

    // Se escribe en el nodo, sin volver a renderizar React: 60 renders por
    // contador bloquearían el hilo principal justo al abrir la página.
    el.textContent = formatear(0);
    let raf = 0;
    const cancelar = observar(el, () => {
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const t = Math.min(1, (ahora - inicio) / duracion);
        el.textContent = formatear(Math.round(hasta * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    });
    return () => {
      cancelar();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hasta, duracion, moneda]);

  const inicial = moneda
    ? new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda, minimumFractionDigits: 0 }).format(hasta)
    : hasta.toLocaleString("es-MX");

  return (
    <>
      {prefijo}
      {/* El valor final ya está en el HTML: si el efecto no corre, el número es correcto. */}
      <span ref={ref} className={cn("tabular-nums", className)}>
        {inicial}
      </span>
      {sufijo}
    </>
  );
};

// ---------------------------------------------------------------------------
// Tarjeta con brillo que sigue al dedo o al cursor
// ---------------------------------------------------------------------------
export const SpotlightCard = ({ children, className }: { children: ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const caja = useRef<DOMRect | null>(null);

  const entrar = () => {
    const el = ref.current;
    // Sin cursor no hay nada que seguir y el dedo taparía la luz.
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // El rectángulo se mide una vez al entrar: medirlo en cada movimiento
    // obligaría al navegador a recalcular la distribución constantemente.
    caja.current = el.getBoundingClientRect();
    el.setAttribute("data-activo", "");
  };

  const mover = (x: number, y: number) => {
    const el = ref.current;
    const r = caja.current;
    if (!el || !r) return;
    el.style.setProperty("--mx", `${((x - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((y - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      ref={ref}
      className={cn("spotlight", className)}
      onPointerEnter={entrar}
      onPointerMove={(e) => mover(e.clientX, e.clientY)}
      onPointerLeave={() => {
        caja.current = null;
        ref.current?.removeAttribute("data-activo");
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Barra de avance de lectura
// ---------------------------------------------------------------------------
export const ReadingProgress = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const actualizar = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      el.style.setProperty("--avance", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(actualizar);
    };
    actualizar();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
      <div ref={ref} className="barra-lectura h-full w-full bg-dorado" />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Íconos cuyo trazo se dibuja al entrar en pantalla
// ---------------------------------------------------------------------------
export const TrazoIcono = ({ children, className, largo = 140 }: { children: ReactNode; className?: string; largo?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observar(el, () => el.setAttribute("data-inview", ""));
  }, []);

  return (
    <span ref={ref} data-trazo="" className={className} style={{ ["--largo" as string]: largo } as CSSProperties}>
      {children}
    </span>
  );
};
