"use client";

import { useEffect, useRef } from "react";

/**
 * Progreso de lectura (0–1) de un elemento respecto al viewport, escrito como
 * transform en `lineRef` con requestAnimationFrame. No es parallax: solo dibuja
 * una línea. Con prefers-reduced-motion la línea se muestra completa.
 */
export const useScrollProgress = <T extends HTMLElement, L extends HTMLElement>(axis: "x" | "y" | "both" = "both") => {
  const targetRef = useRef<T>(null);
  const lineRef = useRef<L>(null);

  useEffect(() => {
    const target = targetRef.current;
    const line = lineRef.current;
    if (!target || !line) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      line.style.transform = "none";
      return;
    }
    let raf = 0;
    let current = 0;
    const update = () => {
      raf = 0;
      const r = target.getBoundingClientRect();
      const vh = window.innerHeight;
      // Empieza cuando el inicio del bloque cruza el 75 % del viewport y termina cuando el final cruza el 55 %.
      const start = vh * 0.75;
      const end = vh * 0.55;
      const total = r.height + (start - end);
      const progress = Math.min(1, Math.max(0, (start - r.top) / total));
      // Suavizado ligero.
      current += (progress - current) * 0.35;
      const v = Math.abs(current - progress) < 0.002 ? progress : current;
      const sx = axis === "y" ? 1 : v;
      const sy = axis === "x" ? 1 : v;
      line.style.transform = `scale(${sx}, ${sy})`;
      if (v !== progress) raf = requestAnimationFrame(update);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [axis]);

  return { targetRef, lineRef };
};
