"use client";

// Activa los efectos de aparición escritos como atributos en el marcado.
//
// El CSS deja `[data-reveal]` y `[data-stagger] > *` en opacity 0 hasta que algo
// les pone `data-inview`. Los componentes <Reveal> y <Stagger> lo hacen sobre su
// propia referencia, pero la landing usa los atributos directamente en el JSX,
// y esos nadie los observaba: el texto se quedaba invisible con JavaScript
// activo (sin JS el bloque <noscript> ya lo mostraba todo).
//
// Un solo IntersectionObserver para toda la página. Los elementos que ya están
// en pantalla al cargar se revelan de inmediato, porque el observador entrega su
// estado inicial en cuanto empieza a observarlos.

import { useEffect } from "react";

const SELECTOR = "[data-reveal], [data-stagger]";

export const RevelarSecciones = () => {
  useEffect(() => {
    const nodos = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter(
      (el) => !el.hasAttribute("data-inview"),
    );
    if (nodos.length === 0) return;

    const revelar = (el: Element) => el.setAttribute("data-inview", "");

    // Sin observador, o con movimiento reducido, se muestra todo ya: el
    // contenido nunca depende de que una animación llegue a ejecutarse.
    const sinMovimiento =
      typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sinMovimiento || !("IntersectionObserver" in window)) {
      nodos.forEach(revelar);
      return;
    }

    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          revelar(e.target);
          io.unobserve(e.target);
        }
      },
      // threshold 0 a propósito: un bloque más alto que la pantalla nunca
      // alcanzaría un porcentaje visible mínimo, y se quedaría oculto para
      // siempre. El rootMargin retrasa el disparo hasta el 92 % de la pantalla,
      // que es lo que da la sensación de "entra al llegar".
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    nodos.forEach((el) => io.observe(el));

    // Red de seguridad: si algo impidiera que el observador dispare (una pestaña
    // en segundo plano, un fallo de pintado), el texto no se queda oculto.
    const rescate = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) revelar(el);
      });
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(rescate);
    };
  }, []);

  return null;
};
