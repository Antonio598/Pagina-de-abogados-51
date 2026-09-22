"use client";

// Primitivas de movimiento. Fundidos y desplazamientos ligeros (150–250 ms por
// elemento) coreografiados al entrar en viewport. Con prefers-reduced-motion
// todo colapsa a un fundido de 150 ms sin desplazamiento.

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export const useBrandVariants = () => {
  const reduced = useReducedMotion();
  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: reduced ? 0.15 : 0.5, ease: EASE } },
  };
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.07, delayChildren: 0.05 } },
  };
  return { item, container, reduced };
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header" | "p" | "span";
  amount?: number;
  once?: boolean;
};

export const Reveal = ({ children, className, delay = 0, as = "div", amount = 0.2, once = true }: RevealProps) => {
  const { item, reduced } = useBrandVariants();
  const Tag = motion[as] as ElementType;
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: "0px 0px -40px 0px" }}
      variants={{
        ...item,
        show: { ...item.show, transition: { duration: reduced ? 0.15 : 0.5, ease: EASE, delay } },
      }}
    >
      {children}
    </Tag>
  );
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
  amount?: number;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">;

/** Contenedor que anima a sus hijos <StaggerItem> en cascada. */
export const Stagger = ({ children, className, as = "div", amount = 0.15, ...rest }: StaggerProps) => {
  const { container } = useBrandVariants();
  const Tag = motion[as] as ElementType;
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: "0px 0px -40px 0px" }}
      variants={container}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export const StaggerItem = ({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "a" | "p";
}) => {
  const { item } = useBrandVariants();
  const Tag = motion[as] as ElementType;
  return (
    <Tag className={className} variants={item}>
      {children}
    </Tag>
  );
};

/** Línea de 1 px que se dibuja de izquierda a derecha al entrar en viewport. */
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
  const reduced = useReducedMotion();
  const bg = color === "gold" ? "bg-dorado/40" : color === "azul" ? "bg-azul/20" : "bg-blanco/25";
  return (
    <motion.div
      aria-hidden
      className={`${vertical ? "w-px" : "h-px w-full"} ${bg} ${className ?? ""}`}
      style={{ transformOrigin: vertical ? "top" : "left" }}
      initial={{ [vertical ? "scaleY" : "scaleX"]: reduced ? 1 : 0, opacity: reduced ? 0 : 1 }}
      whileInView={{ [vertical ? "scaleY" : "scaleX"]: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: reduced ? 0.15 : 0.9, ease: EASE, delay }}
    />
  );
};
