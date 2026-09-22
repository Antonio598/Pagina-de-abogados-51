"use client";

// Primitivas de movimiento sin librerías: un IntersectionObserver compartido
// marca data-inview y el CSS (globals.css) hace el fundido, la cascada y la
// línea que se dibuja. Con prefers-reduced-motion todo colapsa a un fundido de
// 150 ms; sin JavaScript, el <noscript> del layout muestra todo de inmediato.

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

const observe = (el: Element, cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  if (!("IntersectionObserver" in window)) {
    cb();
    return () => {};
  }
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            callbacks.get(e.target)?.();
            observer?.unobserve(e.target);
            callbacks.delete(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
  }
  callbacks.set(el, cb);
  observer.observe(el);
  return () => {
    observer?.unobserve(el);
    callbacks.delete(el);
  };
};

const useInView = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Ya visible al montar (p. ej. por encima del pliegue): marcar en el siguiente frame
    // para que la transición se vea, pero sin esperar al scroll.
    return observe(el, () => el.setAttribute("data-inview", ""));
  }, []);
  return ref;
};

type Tag = "div" | "section" | "li" | "ul" | "ol" | "article" | "header" | "p" | "span" | "aside";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: Tag;
  style?: CSSProperties;
};

/** Fundido + desplazamiento ligero al entrar en viewport. */
export const Reveal = ({ children, className, delay = 0, as = "div", style }: RevealProps) => {
  const ref = useInView<HTMLDivElement>();
  const Tag = as as "div";
  return (
    <Tag ref={ref} data-reveal="" className={className} style={{ ...style, ["--reveal-delay" as string]: `${Math.round(delay * 1000)}ms` }}>
      {children}
    </Tag>
  );
};

type StaggerProps = { children: ReactNode; className?: string; as?: Tag; delay?: number };

/** Contenedor que anima a sus hijos <StaggerItem> en cascada (70 ms entre hijos). */
export const Stagger = ({ children, className, as = "div", delay = 0 }: StaggerProps) => {
  const ref = useInView<HTMLDivElement>();
  const Tag = as as "div";
  return (
    <Tag ref={ref} data-stagger="" className={className} style={{ ["--reveal-delay" as string]: `${Math.round(delay * 1000)}ms` }}>
      {children}
    </Tag>
  );
};

/** Hijo de <Stagger>. Recibe su índice para calcular el retardo. */
export const StaggerItem = ({ children, className, as = "div", index }: { children: ReactNode; className?: string; as?: "div" | "li" | "article" | "p"; index?: number }) => {
  const Tag = as as "div";
  return (
    <Tag className={className} style={index !== undefined ? ({ ["--i" as string]: index } as CSSProperties) : undefined}>
      {children}
    </Tag>
  );
};

/** Línea de 1 px que se dibuja de izquierda a derecha (o de arriba abajo). */
export const DrawLine = ({
  className,
  delay = 0,
  vertical = false,
  color = "gold",
}: {
  className?: string;
  delay?: number;
  vertical?: boolean;
  color?: "gold" | "azul" | "blanco";
}) => {
  const ref = useInView<HTMLDivElement>();
  const bg = color === "gold" ? "bg-dorado/40" : color === "azul" ? "bg-azul/20" : "bg-blanco/25";
  return (
    <div
      ref={ref}
      aria-hidden
      data-draw={vertical ? "vertical" : ""}
      className={cn(vertical ? "w-px" : "h-px w-full", bg, className)}
      style={{ ["--reveal-delay" as string]: `${Math.round(delay * 1000)}ms` }}
    />
  );
};
